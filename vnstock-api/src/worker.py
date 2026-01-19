import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    force=True
)

import json
import time
import threading
import redis
import socket

# Force timeout for all socket operations (requests, etc) to prevent stuck threads
socket.setdefaulttimeout(30)
from datetime import datetime
from src.config.app_config import AppConfig
from src.services.fetchers.stock_history import StockHistoryFetcher
from src.services.syncers.stock_history import StockHistorySyncer
from src.services.fetchers.stock_news import StockNewsFetcher
from src.services.syncers.stock_news import StockNewsSyncer
from src.services.fetchers.company_profile import CompanyProfileFetcher
from src.services.syncers.company_profile import CompanyProfileSyncer
from src.core.vnstock_client import VnstockClient, RateLimitError

class StockSyncWorker:
    def __init__(self, redis_host='redis', redis_port=6379, queue_names=None):
        self.redis_host = redis_host
        self.redis_port = redis_port
        # Default to both queues if not provided
        self.queue_names = queue_names or ['vnstock_sync_queue', 'vnstock_news_queue', 'vnstock_profile_queue']
        self.client = None
        self.running = False
        self.thread = None
        self.vnstock_client = VnstockClient.get_instance()
        self.semaphore = threading.Semaphore(5) # Limit to 5 concurrent jobs to prevent OOM
        self.job_delay = 1.0 # Initial delay between jobs (adaptive)

    def connect(self):
        try:
            self.client = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                decode_responses=True
            )
            self.client.ping()
            logging.info(f"[Worker] Connected to Redis at {self.redis_host}:{self.redis_port}")
            return True
        except Exception as e:
            logging.error(f"[Worker] Failed to connect to Redis: {e}")
            return False

    def process_news_job(self, symbol, payload):
        logging.info(f"[Worker] Processing NEWS sync job for {symbol}...")
        missing_dates = payload.get('missing_dates', [])
        
        start_time = time.time()
        fetcher = StockNewsFetcher(symbol=symbol)
        syncer = StockNewsSyncer()
        
        # Smart Fetch
        grouped_data = fetcher.fetch_smart(missing_dates)
        
        # Ensure all missing_dates have entries (even empty ones)
        for m_date in missing_dates:
            if m_date not in grouped_data:
                grouped_data[m_date] = []
                
        success = syncer.bulk_sync(symbol, grouped_data)
        
        duration = time.time() - start_time
        duration = time.time() - start_time
        if success:
            logging.info(f"[Worker] SUCCESS: Synced NEWS for {symbol} ({len(grouped_data)} dates) in {duration:.2f}s.")
        else:
            logging.error(f"[Worker] FAILED: Could not save NEWS data for {symbol}")

    def process_profile_job(self, symbol, payload):
        logging.info(f"[Worker] Processing PROFILE sync job for {symbol}...")
        start_time = time.time()
        
        fetcher = CompanyProfileFetcher(symbol=symbol)
        syncer = CompanyProfileSyncer()
        
        data = fetcher.fetch()
        
        if data:
            syncer.sync(data)
            duration = time.time() - start_time
            logging.info(f"[Worker] SUCCESS: Synced PROFILE for {symbol} in {duration:.2f}s.")
        else:
            logging.error(f"[Worker] FAILED: Could not save PROFILE data for {symbol}")

    def process_history_job(self, symbol, payload, source):
        logging.info(f"[Worker] Processing HISTORY sync job for {symbol} (Source: {source})...")
        start_time = time.time()

        fetcher = StockHistoryFetcher(symbol=symbol, interval='1m')
        syncer = StockHistorySyncer()

        date = payload.get('date')
        
        if date:
            # Sync specific date
            logging.info(f"[Worker] Syncing specific date {date} for {symbol}...")
            data = fetcher.fetch(date=date)
            if data:
                success = syncer.sync(data)
                duration = time.time() - start_time
                if success:
                        logging.info(f"[Worker] SUCCESS: Synced {symbol} for {date} in {duration:.2f}s.")
                else:
                        logging.error(f"[Worker] FAILED: Could not save data for {symbol} on {date}")
            else:
                logging.warning(f"[Worker] WARNING: No data found for {symbol} on {date}")
        else:
            # Default: Sync latest available (approx last 30 days lookback)
            logging.info(f"[Worker] Syncing latest available data for {symbol}...")
            data = fetcher.fetch_latest_available(max_lookback_days=30)
            
            if data:
                success = syncer.sync(data)
                duration = time.time() - start_time
                if success:
                    logging.info(f"[Worker] SUCCESS: Synced {symbol} in {duration:.2f}s.")
                else:
                    logging.error(f"[Worker] FAILED: Could not save data for {symbol}")
            else:
                    logging.warning(f"[Worker] WARNING: No data found for {symbol} (or API error)")

    def process_job(self, job_data, queue_source=None):
        try:
            payload = json.loads(job_data)
            symbol = payload.get('symbol')
            source = payload.get('source', 'unknown')
            job_type = payload.get('type', 'history') # Default to history
            
            # Helper for legacy robust routing (if missing_dates present, it's news)
            if 'missing_dates' in payload:
                job_type = 'news'
            
            if not symbol:
                logging.error(f"[Worker] Invalid job data: {job_data}")
                return

            # Route based on Queue Name or Payload content
            if job_type == 'news' or queue_source == 'vnstock_news_queue':
                self.process_news_job(symbol, payload)
            elif job_type == 'profile' or queue_source == 'vnstock_profile_queue' or job_type == 'company_profile':
                self.process_profile_job(symbol, payload)
            else:
                self.process_history_job(symbol, payload, source)
        
        except RateLimitError as e:
            # ADAPTIVE: Slow down job consumption
            old_delay = self.job_delay
            self.job_delay *= 1.1 # Increase by 10%
            logging.warning(f"[Worker] ⏳ Rate Limit Hit (Job). Increasing delay between jobs 10% ({old_delay:.2f}s -> {self.job_delay:.2f}s)")
            
            logging.warning(f"[Worker] Re-queuing job for {symbol} to {queue_source}...")
            # Push back to HEAD of queue to be retried first when unblocked
            self.client.lpush(queue_source, job_data)
            return

        except json.JSONDecodeError:
            logging.error(f"[Worker] Error: Invalid JSON Format - {job_data}")
        except Exception as e:
            logging.error(f"[Worker] Error processing job: {e}")

    # Wraps the actual processing to ensure semaphore release
    def _run_job(self, job_data, queue_name):
        try:
            self.process_job(job_data, queue_name)
        except Exception as e:
            logging.error(f"[Worker] Thread Error: {e}")
        finally:
            self.semaphore.release()

    def _heartbeat_loop(self):
        """Separate thread to log heartbeat every second."""
        while self.running:
            logging.info(f"[Heartbeat] {datetime.now().strftime('%H:%M:%S')}")
            time.sleep(1)

    def run_loop(self):
        logging.info(f"[Worker] Starting queue consumer loop for {self.queue_names}...")
        last_ban_log = 0
        
        while self.running:
            # Check global ban status
            ban_end = self.vnstock_client.is_global_ban_active()
            if ban_end:
                 # Throttle logs
                if time.time() - last_ban_log > 10:
                    wait_remaining = int(ban_end - time.time())
                    logging.warning(f"[Worker] ⏳ Global Rate Limit Active. Paused for {wait_remaining}s...")
                    last_ban_log = time.time()
                time.sleep(1)
                continue

            try:
                if not self.client:
                    if not self.connect():
                        time.sleep(5)
                        continue
                
                # Check semaphore availability BEFORE popping
                # This prevents popping if we can't process it yet (backpressure)
                if not self.semaphore.acquire(blocking=False):
                    # Heartbeat for saturation
                    if time.time() % 10 < 0.5:
                        logging.warning(f"[Worker] ⚠️ Worker Busy (5/5 threads active). Waiting for slots...")
                    time.sleep(1.0) # Wait for a slot
                    continue
                
                # Blocking pop with short timeout
                try:
                    result = self.client.brpop(self.queue_names, timeout=2)
                except:
                    # If pop fails (timeout or error), release the acquired semaphore
                    self.semaphore.release()
                    raise

                if result:
                    queue_name, data = result
                    logging.info(f"[Worker] 📥 Popped job from {queue_name}")
                    
                    # Async processing with Semaphore guard involves passing it to thread
                    # But we acquired it here. We release it in the thread wrapper.
                    t = threading.Thread(target=self._run_job, args=(data, queue_name))
                    t.start()
                    
                    # Small delay to stagger starts (Adaptive)
                    time.sleep(self.job_delay)
                else:
                    # Timeout - no job. Release semaphore.
                    self.semaphore.release()
                    
                    # Heartbeat every 10s (reduced from 60s for visibility)
                    if time.time() % 10 < 2: 
                        sizes = {q: self.client.llen(q) for q in self.queue_names}
                        logging.info(f"[Worker] Idle. Queues: {sizes}")
                
            except redis.exceptions.ConnectionError:
                logging.error("[Worker] Redis connection lost. Reconnecting...")
                self.client = None
                time.sleep(2)
            except Exception as e:
                logging.error(f"[Worker] Loop error: {e}")
                time.sleep(1)
        
        logging.info("[Worker] Loop stopped.")

    def start(self):
        if self.running:
            return
        
        self.running = True
        
        # Start Heartbeat Thread
        self.heartbeat_thread = threading.Thread(target=self._heartbeat_loop, daemon=True, name="HeartbeatWorker")
        self.heartbeat_thread.start()

        self.thread = threading.Thread(target=self.run_loop, daemon=True, name="StockSyncWorker")
        self.thread.start()
        logging.info("[Worker] Background thread started.")

    def stop(self):
        logging.info("[Worker] Stopping...")
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)

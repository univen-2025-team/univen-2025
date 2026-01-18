import json
import time
import threading
import redis
from datetime import datetime
from src.config.app_config import AppConfig
from src.services.fetchers.stock_history import StockHistoryFetcher
from src.services.syncers.stock_history import StockHistorySyncer
from src.services.fetchers.stock_news import StockNewsFetcher
from src.services.syncers.stock_news import StockNewsSyncer

class StockSyncWorker:
    def __init__(self, redis_host='redis', redis_port=6379, queue_names=None):
        self.redis_host = redis_host
        self.redis_port = redis_port
        # Default to both queues if not provided
        self.queue_names = queue_names or ['vnstock_sync_queue', 'vnstock_news_queue']
        self.client = None
        self.running = False
        self.thread = None

    def connect(self):
        try:
            self.client = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                decode_responses=True
            )
            self.client.ping()
            print(f"[Worker] Connected to Redis at {self.redis_host}:{self.redis_port}")
            return True
        except Exception as e:
            print(f"[Worker] Failed to connect to Redis: {e}")
            return False

    def process_news_job(self, symbol, payload):
        print(f"[Worker] Processing NEWS sync job for {symbol}...")
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
        if success:
            print(f"[Worker] SUCCESS: Synced NEWS for {symbol} ({len(grouped_data)} dates) in {duration:.2f}s.")
        else:
            print(f"[Worker] FAILED: Could not save NEWS data for {symbol}")

    def process_history_job(self, symbol, payload, source):
        print(f"[Worker] Processing HISTORY sync job for {symbol} (Source: {source})...")
        start_time = time.time()

        fetcher = StockHistoryFetcher(symbol=symbol, interval='1m')
        syncer = StockHistorySyncer()

        date = payload.get('date')
        
        if date:
            # Sync specific date
            print(f"[Worker] Syncing specific date {date} for {symbol}...")
            data = fetcher.fetch(date=date)
            if data:
                success = syncer.sync(data)
                duration = time.time() - start_time
                if success:
                        print(f"[Worker] SUCCESS: Synced {symbol} for {date} in {duration:.2f}s. Sleeping 10s...")
                        time.sleep(10)
                else:
                        print(f"[Worker] FAILED: Could not save data for {symbol} on {date}")
            else:
                print(f"[Worker] WARNING: No data found for {symbol} on {date}")
        else:
            # Default: Sync latest available (approx last 30 days lookback)
            print(f"[Worker] Syncing latest available data for {symbol}...")
            data = fetcher.fetch_latest_available(max_lookback_days=30)
            
            if data:
                success = syncer.sync(data)
                duration = time.time() - start_time
                if success:
                    print(f"[Worker] SUCCESS: Synced {symbol} in {duration:.2f}s. Sleeping 10s...")
                    time.sleep(10)
                else:
                    print(f"[Worker] FAILED: Could not save data for {symbol}")
            else:
                    print(f"[Worker] WARNING: No data found for {symbol} (or API error)")

    def process_job(self, job_data, queue_source=None):
        try:
            payload = json.loads(job_data)
            symbol = payload.get('symbol')
            source = payload.get('source', 'unknown')
            
            if not symbol:
                print(f"[Worker] Invalid job data: {job_data}")
                return

            # Route based on Queue Name or Payload content
            if queue_source == 'vnstock_news_queue' or 'missing_dates' in payload:
                self.process_news_job(symbol, payload)
            else:
                self.process_history_job(symbol, payload, source)

        except json.JSONDecodeError:
            print(f"[Worker] Error: Invalid JSON Format - {job_data}")
        except Exception as e:
            print(f"[Worker] Error processing job: {e}")

    def run_loop(self):
        print(f"[Worker] Starting queue consumer loop for {self.queue_names}...")
        while self.running:
            try:
                if not self.client:
                    if not self.connect():
                        time.sleep(5)
                        continue
                
                # Blocking pop with timeout from multiple queues
                # brpop returns tuple (queue_name, data) or None
                result = self.client.brpop(self.queue_names, timeout=2)
                
                if result:
                    queue_name, data = result
                    self.process_job(data, queue_source=queue_name)
                
            except redis.exceptions.ConnectionError:
                print("[Worker] Redis connection lost. Reconnecting...")
                self.client = None
                time.sleep(2)
            except Exception as e:
                print(f"[Worker] Unexpected loop error: {e}")
                time.sleep(1)
        
        print("[Worker] Loop stopped.")

    def start(self):
        if self.running:
            return
        
        self.running = True
        self.thread = threading.Thread(target=self.run_loop, daemon=True, name="StockSyncWorker")
        self.thread.start()
        print("[Worker] Background thread started.")

    def stop(self):
        print("[Worker] Stopping...")
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)

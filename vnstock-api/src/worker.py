import json
import time
import threading
import redis
from datetime import datetime
from src.config.app_config import AppConfig
from src.services.fetchers.stock_history import StockHistoryFetcher
from src.services.syncers.stock_history import StockHistorySyncer

class StockSyncWorker:
    def __init__(self, redis_host='redis', redis_port=6379, queue_name='vnstock_sync_queue'):
        self.redis_host = redis_host
        self.redis_port = redis_port
        self.queue_name = queue_name
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

    def process_job(self, job_data):
        try:
            payload = json.loads(job_data)
            symbol = payload.get('symbol')
            source = payload.get('source', 'unknown')
            
            if not symbol:
                print(f"[Worker] Invalid job data: {job_data}")
                return

            print(f"[Worker] Processing sync job for {symbol} (Source: {source})...")
            start_time = time.time()

            # Execute Sync Logic
            # Default to syncing 'latest' / recent history
            # If the job has specific date range, we could support that too
            # payload could have start_date, end_date
            
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

        except json.JSONDecodeError:
            print(f"[Worker] Error: Invalid JSON Format - {job_data}")
        except Exception as e:
            print(f"[Worker] Error processing job: {e}")

    def run_loop(self):
        print(f"[Worker] Starting queue consumer loop for '{self.queue_name}'...")
        while self.running:
            try:
                if not self.client:
                    if not self.connect():
                        time.sleep(5)
                        continue
                
                # Blocking pop with timeout to check self.running occasionally
                # brpop returns tuple (queue_name, data) or None
                result = self.client.brpop(self.queue_name, timeout=2)
                
                if result:
                    _, data = result
                    self.process_job(data)
                
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

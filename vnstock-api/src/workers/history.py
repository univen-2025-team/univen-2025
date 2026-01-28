import logging
import time
import json
from .base import BaseWorker
from src.services.fetchers.stock_history import StockHistoryFetcher
from src.services.syncers.stock_history import StockHistorySyncer

class HistoryWorker(BaseWorker):
    def __init__(self, redis_host='redis-16415.c334.asia-southeast2-1.gce.cloud.redislabs.com', redis_port=16415, redis_password='wLiw6HGNWUzwjwNXMp3kyEH8QZ7SZfgG'):
        # Consume from sync queue
        super().__init__(redis_host, redis_port, redis_password, queue_names=['vnstock_sync_queue'])

    def process_job(self, job_data, queue_source=None):
        try:
            payload = json.loads(job_data)
            symbol = payload.get('symbol')
            source = payload.get('source', 'unknown')
            date = payload.get('date')
            
            # Legacy check: if missing_dates is present, it's a news job that got here by mistake
            # But with separate queues, this should happen less.
            # If it happens, we could log and ignore or re-queue to news queue.
            if 'missing_dates' in payload:
                logging.warning(f"[HistoryWorker] Received News Job for {symbol}. Ignoring.")
                return

            if not symbol:
                logging.error(f"[HistoryWorker] Invalid job data: {job_data}")
                return

            self._process_history_logic(symbol, payload, source, date)

        except json.JSONDecodeError:
            logging.error(f"[HistoryWorker] Error: Invalid JSON Format - {job_data}")

    def _process_history_logic(self, symbol, payload, source, date):
        logging.info(f"[HistoryWorker] Processing HISTORY sync job for {symbol} (Source: {source})...")
        start_time = time.time()

        fetcher = StockHistoryFetcher(symbol=symbol, interval='1m')
        syncer = StockHistorySyncer()

        if date:
            # Sync specific date
            logging.info(f"[HistoryWorker] Syncing specific date {date} for {symbol}...")
            data = fetcher.fetch(date=date)
            if data:
                success = syncer.sync(data)
                duration = time.time() - start_time
                if success:
                    logging.info(f"[HistoryWorker] SUCCESS: Synced {symbol} for {date} in {duration:.2f}s.")
                else:
                    logging.error(f"[HistoryWorker] FAILED: Could not save data for {symbol} on {date}")
            else:
                logging.warning(f"[HistoryWorker] WARNING: No data found for {symbol} on {date}")
        else:
            # Default: Sync latest available
            logging.info(f"[HistoryWorker] Syncing latest available data for {symbol}...")
            data = fetcher.fetch_latest_available(max_lookback_days=30)
            
            if data:
                success = syncer.sync(data)
                duration = time.time() - start_time
                if success:
                    logging.info(f"[HistoryWorker] SUCCESS: Synced {symbol} in {duration:.2f}s.")
                else:
                    logging.error(f"[HistoryWorker] FAILED: Could not save data for {symbol}")
            else:
                logging.warning(f"[HistoryWorker] WARNING: No data found for {symbol} (or API error)")

import logging
import time
import json
from .base import BaseWorker
from src.services.fetchers.company_profile import CompanyProfileFetcher
from src.services.syncers.company_profile import CompanyProfileSyncer

class ProfileWorker(BaseWorker):
    def __init__(self, redis_host='redis-16415.c334.asia-southeast2-1.gce.cloud.redislabs.com', redis_port=16415, redis_password='wLiw6HGNWUzwjwNXMp3kyEH8QZ7SZfgG'):
        # Consume from profile queue
        super().__init__(redis_host, redis_port, redis_password, queue_names=['vnstock_profile_queue'])

    def process_job(self, job_data, queue_source=None):
        try:
            payload = json.loads(job_data)
            symbol = payload.get('symbol')
            
            if not symbol:
                logging.error(f"[ProfileWorker] Invalid job data: {job_data}")
                return

            self._process_profile_logic(symbol)

        except json.JSONDecodeError:
            logging.error(f"[ProfileWorker] Error: Invalid JSON Format - {job_data}")

    def _process_profile_logic(self, symbol):
        logging.info(f"[ProfileWorker] Processing PROFILE sync job for {symbol}...")
        start_time = time.time()
        
        fetcher = CompanyProfileFetcher(symbol=symbol)
        syncer = CompanyProfileSyncer()
        
        data = fetcher.fetch()
        
        if data:
            syncer.sync(data)
            duration = time.time() - start_time
            logging.info(f"[ProfileWorker] SUCCESS: Synced PROFILE for {symbol} in {duration:.2f}s.")
        else:
            logging.error(f"[ProfileWorker] FAILED: Could not save PROFILE data for {symbol}")

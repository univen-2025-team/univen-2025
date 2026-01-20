import logging
import time
import json
from .base import BaseWorker
from src.services.fetchers.stock_news import StockNewsFetcher
from src.services.syncers.stock_news import StockNewsSyncer

class NewsWorker(BaseWorker):
    def __init__(self, redis_host='redis', redis_port=6379):
        # Consume from news queue
        # News/Events come from external sources (Google News, CafeF), so we ignore VNStock API rate limits.
        super().__init__(redis_host, redis_port, queue_names=['vnstock_news_queue'], ignore_global_ban=True)

    def process_job(self, job_data, queue_source=None):
        try:
            payload = json.loads(job_data)
            symbol = payload.get('symbol')
            missing_dates = payload.get('missing_dates', [])
            
            if not symbol:
                logging.error(f"[NewsWorker] Invalid job data: {job_data}")
                return

            self._process_news_logic(symbol, missing_dates)

        except json.JSONDecodeError:
            logging.error(f"[NewsWorker] Error: Invalid JSON Format - {job_data}")

    def _process_news_logic(self, symbol, missing_dates):
        logging.info(f"[NewsWorker] Processing NEWS sync job for {symbol}...")
        
        start_time = time.time()
        fetcher = StockNewsFetcher(symbol=symbol)
        syncer = StockNewsSyncer()
        
        # Smart Fetch - This is where the fix lies
        # fetch_smart will handle fetching basic news AND resolving full content/images
        grouped_data = fetcher.fetch_smart(missing_dates)
        
        # Ensure all missing_dates have entries (even empty ones)
        for m_date in missing_dates:
            if m_date not in grouped_data:
                grouped_data[m_date] = []

        # LOGGING REQUESTED BY USER
        # Log info about title, logo, fullcontent before insertion
        try:
            for date_key, news_list in grouped_data.items():
                for item in news_list:
                    title = item.get('title', 'N/A')
                    img = item.get('image_url', 'N/A')
                    full = item.get('full_content', '')
                    source = item.get('source', 'N/A')
                    
                    logging.info("--------------------------------------------------")
                    logging.info(f"[PRE-INSERT] Symbol: {symbol}")
                    logging.info(f"[PRE-INSERT] Title:  {title}")
                    logging.info(f"[PRE-INSERT] Source: {source}")
                    logging.info(f"[PRE-INSERT] Logo:   {img}")
                    logging.info(f"[PRE-INSERT] Content Length: {len(full)}")
                    # User requested NOT to print fallback content, only Puppeteer.
                    # if full:
                    #     snippet = full[:200].replace('\n', ' ')
                    #     logging.info(f"[PRE-INSERT] Content Snippet: {snippet}...")
                    # else:
                    #      logging.info(f"[PRE-INSERT] Content: (EMPTY)")
                    logging.info("--------------------------------------------------")
        except Exception as e:
            logging.error(f"Error logging news info: {e}")
                
        success = syncer.bulk_sync(symbol, grouped_data)
        
        duration = time.time() - start_time
        if success:
            logging.info(f"[NewsWorker] SUCCESS: Synced NEWS for {symbol} ({len(grouped_data)} dates) in {duration:.2f}s.")
        else:
            logging.error(f"[NewsWorker] FAILED: Could not save NEWS data for {symbol}")

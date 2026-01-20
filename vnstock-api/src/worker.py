import logging
import threading
from src.workers import HistoryWorker, NewsWorker, ProfileWorker

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    force=True
)

class StockSyncWorker:
    """
    Facade worker that manages specific sub-workers.
    This maintains backward compatibility with main.py
    """
    def __init__(self, redis_host='redis', redis_port=6379, queue_names=None):
        self.history_worker = HistoryWorker(redis_host, redis_port)
        self.news_worker = NewsWorker(redis_host, redis_port)
        self.profile_worker = ProfileWorker(redis_host, redis_port)
        self.running = False

    def start(self):
        logging.info("[StockSyncWorker] Starting all sub-workers...")
        self.running = True
        self.history_worker.start()
        self.news_worker.start()
        self.profile_worker.start()
        logging.info("[StockSyncWorker] All sub-workers started.")

    def stop(self):
        logging.info("[StockSyncWorker] Stopping all sub-workers...")
        self.running = False
        self.history_worker.stop()
        self.news_worker.stop()
        self.profile_worker.stop()
        logging.info("[StockSyncWorker] All sub-workers stopped.")



import logging
import threading
from src.workers import HistoryWorker, ProfileWorker, NewsWorker

from src.config.app_config import AppConfig

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
    def __init__(self, redis_host=AppConfig.REDIS_HOST, redis_port=AppConfig.REDIS_PORT, 
                 redis_password=AppConfig.REDIS_PASSWORD, queue_names=None):
        self.history_worker = HistoryWorker(redis_host, redis_port, redis_password)
        self.profile_worker = ProfileWorker(redis_host, redis_port, redis_password)
        self.news_worker = NewsWorker(redis_host, redis_port, redis_password)
        self.running = False

    def start(self):
        logging.info("[StockSyncWorker] Starting all sub-workers...")
        self.running = True
        self.history_worker.start()
        self.profile_worker.start()
        self.news_worker.start()
        logging.info("[StockSyncWorker] All sub-workers started.")

    def stop(self):
        logging.info("[StockSyncWorker] Stopping all sub-workers...")
        self.running = False
        self.history_worker.stop()
        self.profile_worker.stop()
        self.news_worker.stop()
        logging.info("[StockSyncWorker] All sub-workers stopped.")

import logging
import threading
import time
import redis
import socket
from datetime import datetime
from src.core.vnstock_client import VnstockClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    force=True
)

class BaseWorker:
    def __init__(self, redis_host='redis', redis_port=6379, queue_names=None, ignore_global_ban=False):
        self.redis_host = redis_host
        self.redis_port = redis_port
        self.queue_names = queue_names or []
        self.ignore_global_ban = ignore_global_ban
        self.client = None
        self.running = False
        self.thread = None
        self.vnstock_client = VnstockClient.get_instance()
        self.semaphore = threading.Semaphore(5)  # Limit concurrency
        self.job_delay = 1.0

    def connect(self):
        try:
            self.client = redis.Redis(
                host=self.redis_host,
                port=self.redis_port,
                decode_responses=True
            )
            self.client.ping()
            logging.info(f"[{self.__class__.__name__}] Connected to Redis at {self.redis_host}:{self.redis_port}")
            return True
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}] Failed to connect to Redis: {e}")
            return False

    def process_job(self, job_data, queue_source=None):
        raise NotImplementedError("Workers must implement process_job method")

    def _run_job(self, job_data, queue_name):
        try:
            self.process_job(job_data, queue_name)
        except Exception as e:
            logging.error(f"[{self.__class__.__name__}] Thread Error: {e}")
        finally:
            self.semaphore.release()

    def _heartbeat_loop(self):
        while self.running:
            # Only log valid queue sizes
            if self.client:
                try:
                    sizes = {q: self.client.llen(q) for q in self.queue_names}
                    logging.info(f"[Heartbeat-{self.__class__.__name__}] Queues: {sizes}")
                except:
                    pass
            time.sleep(10)

    def run_loop(self):
        logging.info(f"[{self.__class__.__name__}] Starting queue consumer loop for {self.queue_names}...")
        last_ban_log = 0
        
        while self.running:
            # Check global ban status
            # Only check if this worker does NOT ignore the global ban
            if not self.ignore_global_ban:
                ban_end = self.vnstock_client.is_global_ban_active()
                if ban_end:
                    if time.time() - last_ban_log > 10:
                        wait_remaining = int(ban_end - time.time())
                        if wait_remaining > 0:
                            logging.warning(f"[{self.__class__.__name__}] ⏳ Global Rate Limit Active. Paused for {wait_remaining}s...")
                            last_ban_log = time.time()
                            time.sleep(1)
                            continue
                        else:
                            # Ban expired
                            pass

            try:
                if not self.client:
                    if not self.connect():
                        time.sleep(5)
                        continue
                
                if not self.semaphore.acquire(blocking=False):
                    time.sleep(1.0)
                    continue
                
                try:
                    result = self.client.brpop(self.queue_names, timeout=2)
                except:
                    self.semaphore.release()
                    raise # Re-raise to be caught by outer try/except

                if result:
                    queue_name, data = result
                    logging.info(f"[{self.__class__.__name__}] 📥 Popped job from {queue_name}")
                    
                    t = threading.Thread(target=self._run_job, args=(data, queue_name))
                    t.start()
                    
                    time.sleep(self.job_delay)
                else:
                    self.semaphore.release()
                
            except redis.exceptions.ConnectionError:
                logging.error(f"[{self.__class__.__name__}] Redis connection lost. Reconnecting...")
                self.client = None
                time.sleep(2)
            except Exception as e:
                # Log only significant errors, suppress minor timeouts if any
                if "timeout" not in str(e).lower():
                     logging.error(f"[{self.__class__.__name__}] Loop error: {e}")
                time.sleep(1)
        
        logging.info(f"[{self.__class__.__name__}] Loop stopped.")

    def start(self):
        if self.running:
            return
        
        self.running = True
        
        # Start Heartbeat
        self.heartbeat_thread = threading.Thread(
            target=self._heartbeat_loop, 
            daemon=True, 
            name=f"Heartbeat-{self.__class__.__name__}"
        )
        self.heartbeat_thread.start()

        # Start Main Loop
        self.thread = threading.Thread(
            target=self.run_loop, 
            daemon=True, 
            name=f"{self.__class__.__name__}"
        )
        self.thread.start()
        logging.info(f"[{self.__class__.__name__}] Background thread started.")

    def stop(self):
        logging.info(f"[{self.__class__.__name__}] Stopping...")
        self.running = False
        if self.thread:
            self.thread.join(timeout=5)

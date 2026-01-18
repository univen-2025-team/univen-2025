
import time
import threading
from vnstock import Vnstock

class VnstockClient:
    _instance = None
    _lock = threading.Lock()
    _last_call_time = 0
    _delay = 10.0  # 10 seconds delay between calls

    @staticmethod
    def get_instance():
        if VnstockClient._instance is None:
            with VnstockClient._lock:
                if VnstockClient._instance is None:
                    VnstockClient._instance = VnstockClient()
        return VnstockClient._instance

    def stock(self, symbol, source='VCI'):
        """
        Returns the stock object builder. 
        Note: This does NOT call the API yet, just sets up the object.
        """
        return Vnstock().stock(symbol=symbol, source=source)

    def wait_for_rate_limit(self):
        """
        Blocks until the rate limit period has passed since the last call.
        Thread-safe.
        """
        with self._lock:
            now = time.time()
            elapsed = now - self._last_call_time
            if elapsed < self._delay:
                wait_time = self._delay - elapsed
                print(f"[RateLimit] Enforcing delay. Sleeping for {wait_time:.2f}s...")
                time.sleep(wait_time)
            
            # Update last call time
            self._last_call_time = time.time()

    def call(self, func, *args, **kwargs):
        """
        Wrapper to execute an API call with rate limiting.
        Usage: client.call(func, arg1, arg2, kwarg1=...)
        """
        self.wait_for_rate_limit()
        try:
            return func(*args, **kwargs)
        except Exception as e:
            print(f"[VnstockClient] API Call Error: {e}")
            return None


import time
import threading
import os
from vnstock import Vnstock
import itertools

class VnstockClient:
    _instance = None
    _lock = threading.Lock()
    
    # Configuration
    _base_delay = 10.0 # Default seconds per key/slot
    
    def __init__(self):
        # Load delay from env
        try:
            self._base_delay = float(os.getenv('VNSTOCK_RATE_LIMIT_DELAY', '10.0'))
        except:
            self._base_delay = 10.0
            
        # Load API keys from env or use default
        # Support both plural (KEYS) and singular (KEY) naming
        api_keys_str = os.getenv('VNSTOCK_API_KEYS', os.getenv('VNSTOCK_API_KEY', ''))
        self.api_keys = [k.strip() for k in api_keys_str.split(',') if k.strip()]
        
        if not self.api_keys:
            self.api_keys = ['default']
            
        # Initialize slots: {key: last_call_time}
        self._slots = {k: 0.0 for k in self.api_keys}
        
        # Cycle iterator for simple rotation
        self._key_cycle = itertools.cycle(self.api_keys)
        
        print(f"[VnstockClient] Initialized with {len(self.api_keys)} keys. Base delay: {self._base_delay}s")

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
        """
        # Note: stock() builder doesn't trigger API call, so no rate limit needed here.
        # However, if we need to pass a key to Vnstock, we might need to do it here or during call.
        # Vnstock(source='...').stock(...)
        return Vnstock(source=source, symbol=symbol)

    def _get_best_slot(self):
        """
        Finds the best available key (ready now or soonest).
        Returns (key, wait_time)
        """
        now = time.time()
        best_key = None
        min_wait = float('inf')
        
    def _get_best_slot(self):
        """
        Finds the next key in rotation strategy (Round Robin).
        Returns (key, wait_time)
        """
        now = time.time()
        
        # Strict Round Robin: Always pick next key
        # This ensures even distribution and avoids 'stuck on first key' when calls are slow.
        key = next(self._key_cycle)
        
        last_time = self._slots[key]
        elapsed = now - last_time
        wait = max(0, self._base_delay - elapsed)
        
        return key, wait

    def wait_for_rate_limit(self):
        """
        Blocks until a slot is available.
        Returns the key that was reserved.
        """
        with self._lock:
            key, wait_time = self._get_best_slot()
            
            if wait_time > 0:
                print(f"[RateLimit] Slot busy (Key: {key}). Sleeping {wait_time:.2f}s...")
                time.sleep(wait_time)
            else:
                print(f"[RateLimit] Key '{key}' ready. Sleeping 0s.")
            
            # Update last call time for this key
            self._slots[key] = time.time()
            return key

    def call(self, func, *args, **kwargs):
        """
        Wrapper to execute an API call with rate limiting.
        Injects 'api_key' into kwargs if applicable (and if func accepts it).
        """
        key = self.wait_for_rate_limit()
        
        # Optional: Inject key if it's not the default placeholder
        # This depends on if the content of 'func' can accept it.
        # Since 'func' is usually a lambda `lambda: stock.company.news()`, we can't easily inject.
        # But we achieved the timing distribution.
        
        try:
            return func(*args, **kwargs)
        except Exception as e:
            # Unwrap tenacity RetryError if present
            try:
                # Attempt to import tenacity (it's a dependency of vnstock)
                from tenacity import RetryError
                if isinstance(e, RetryError):
                    # Try to get the underlying exception from the last attempt
                    if e.last_attempt:
                        try:
                            # Re-raise the underlying exception to be caught/logged below
                            # or just extract it
                            real_e = e.last_attempt.exception()
                            if real_e:
                                print(f"[VnstockClient] Underlying Error (Key: {key}): {type(real_e).__name__}: {real_e}")
                                # Use the real exception for traceback
                                e = real_e
                        except:
                            pass
            except ImportError:
                pass

            import traceback
            # Only print traceback if it's NOT a standard "No data" or expected error? 
            # For now, print all to debug the AttributeError.
            print(f"[VnstockClient] API Call Error (Key: {key}): {e}")
            # traceback.print_exc() # detailed stack trace
            return None

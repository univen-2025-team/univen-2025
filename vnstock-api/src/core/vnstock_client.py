
import time
import threading
import os
import sys
from vnstock import Vnstock
import itertools

class VnstockClient:
    _instance = None
    _lock = threading.Lock()
    _stats_lock = threading.Lock()  # Separate lock for stats to avoid blocking
    
    # Configuration
    MAX_RETRIES = 20  # Max retries for transient errors
    RETRY_BACKOFF = 2.0  # Seconds to wait between normal retries
    RATE_LIMIT_WAIT = 65  # Seconds to wait when rate limited (vnstock says 60s)
    
    def __init__(self):
        # Load API keys from env or use default
        # Support both plural (KEYS) and singular (KEY) naming
        api_keys_str = os.getenv('VNSTOCK_API_KEYS', os.getenv('VNSTOCK_API_KEY', ''))
        self.api_keys = [k.strip() for k in api_keys_str.split(',') if k.strip()]
        
        if not self.api_keys:
            self.api_keys = ['default']
        
        # Track which keys are in cooldown: {key: cooldown_until_timestamp}
        self._key_cooldowns = {k: 0.0 for k in self.api_keys}
        
        # Request counter per key per minute: {key: {'count': int, 'minute_start': float}}
        self._key_stats = {k: {'count': 0, 'minute_start': time.time()} for k in self.api_keys}
            
        # Cycle iterator for round robin
        self._key_cycle = itertools.cycle(self.api_keys)
        
        print(f"[VnstockClient] Initialized with {len(self.api_keys)} keys. Strategy: Round Robin with Rate Limit Handling (Thread-Safe)")

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
        return Vnstock(source=source, symbol=symbol)

    def _get_next_available_key(self):
        """
        Round Robin: Get next available key.
        If a key is in cooldown, skip to next.
        If all keys are in cooldown, wait for the soonest one.
        MUST be called with self._lock held.
        """
        now = time.time()
        
        # Try to find a ready key (check all keys once)
        for _ in range(len(self.api_keys)):
            key = next(self._key_cycle)
            cooldown_until = self._key_cooldowns.get(key, 0)
            
            if now >= cooldown_until:
                return key, 0  # Ready immediately
        
        # All keys in cooldown - find the one that will be ready soonest
        soonest_key = None
        min_wait = float('inf')
        
        for key, cooldown_until in self._key_cooldowns.items():
            wait = cooldown_until - now
            if wait < min_wait:
                min_wait = wait
                soonest_key = key
        
        return soonest_key, max(0, min_wait)

    def _mark_key_rate_limited(self, key):
        """
        Mark a key as rate limited - put it in cooldown for 65 seconds.
        Thread-safe.
        """
        with self._lock:
            self._key_cooldowns[key] = time.time() + self.RATE_LIMIT_WAIT
            print(f"[VnstockClient] Key {key[:20]}... marked as RATE LIMITED. Cooldown for {self.RATE_LIMIT_WAIT}s")

    def _update_stats_and_log(self, key, attempt):
        """
        Update request counter and print status. Thread-safe.
        """
        with self._stats_lock:
            now = time.time()
            stats = self._key_stats[key]
            if now - stats['minute_start'] >= 60:
                # Reset counter for this key every minute
                stats['count'] = 0
                stats['minute_start'] = now
            stats['count'] += 1
            
            # Build status string for all keys
            key_status = " | ".join([f"{k[:8]}:{self._key_stats[k]['count']}/60" for k in self.api_keys])
            print(f"[VnstockClient] Attempt {attempt}/{self.MAX_RETRIES} | Active: {key[:15]}... | [{key_status}]")

    def _is_rate_limit_error(self, e):
        """
        Check if this exception is a rate limit error from vnstock.
        """
        error_str = str(e).lower()
        rate_limit_indicators = [
            'rate limit',
            'ratelimit',
            'giới hạn api',
            '60/60',
            'ratelimitexceeded',
        ]
        return any(indicator in error_str for indicator in rate_limit_indicators)

    def _is_no_data_error(self, e):
        """
        Check if error indicates "no data available" (should skip, not retry).
        """
        error_str = str(e).lower()
        no_data_indicators = [
            "'nonetype' object has no attribute",
            "no data",
            "empty",
            "not found",
        ]
        return any(indicator in error_str for indicator in no_data_indicators)

    def _unwrap_retry_error(self, e):
        """
        Unwrap tenacity RetryError to get the real exception.
        """
        try:
            from tenacity import RetryError
            if isinstance(e, RetryError):
                if e.last_attempt:
                    real_e = e.last_attempt.exception()
                    if real_e:
                        return real_e
        except ImportError:
            pass
        return e

    def call(self, func, *args, **kwargs):
        """
        Execute API call with round-robin key selection.
        Handles rate limiting by waiting 60s when detected.
        Thread-safe for concurrent job execution.
        """
        attempt = 0
        last_error = None
        
        while attempt < self.MAX_RETRIES:
            # Get next available key - lock held for minimum time
            t_lock_start = time.time()
            with self._lock:
                key, wait_time = self._get_next_available_key()
            t_lock_end = time.time()
            lock_duration = (t_lock_end - t_lock_start) * 1000  # ms
            
            if lock_duration > 100:  # Log if lock took >100ms
                print(f"[VnstockClient] ⚠️ Lock contention detected: {lock_duration:.0f}ms")
            
            if wait_time > 0:
                print(f"[VnstockClient] All keys in cooldown. Waiting {wait_time:.1f}s...")
                time.sleep(wait_time)
            
            attempt += 1
            
            # Update stats (thread-safe)
            self._update_stats_and_log(key, attempt)
            
            # Measure API call time
            t_api_start = time.time()
            
            try:
                result = func(*args, **kwargs)
                if result is not None:
                    return result
                else:
                    # Result is None - could be "no data" situation
                    print(f"[VnstockClient] Call returned None (Key: {key[:20]})")
                    return None  # Don't retry for None results
                    
            except SystemExit as e:
                # vnstock calls sys.exit() on rate limit - catch it!
                print(f"[VnstockClient] Caught SystemExit (likely rate limit): {e}")
                
                if self._is_rate_limit_error(e):
                    self._mark_key_rate_limited(key)
                    # Continue to next iteration (will use different key or wait)
                    continue
                else:
                    # Unknown SystemExit - re-raise
                    raise
                    
            except Exception as e:
                real_e = self._unwrap_retry_error(e)
                last_error = real_e
                
                # Check if rate limited
                if self._is_rate_limit_error(real_e):
                    print(f"[VnstockClient] Rate limit detected (Key: {key[:20]})")
                    self._mark_key_rate_limited(key)
                    continue  # Try with next key
                
                # Check if this is a "no data" error (don't retry)
                if self._is_no_data_error(real_e):
                    print(f"[VnstockClient] No data error (Key: {key[:20]}): {type(real_e).__name__}: {real_e}")
                    return None  # Skip, don't retry
                
                # Transient error - retry with next key
                print(f"[VnstockClient] Transient error (Key: {key[:20]}): {type(real_e).__name__}: {real_e}")
                
                if attempt < self.MAX_RETRIES:
                    print(f"[VnstockClient] Retrying in {self.RETRY_BACKOFF}s...")
                    time.sleep(self.RETRY_BACKOFF)
        
        # Exhausted all retries
        print(f"[VnstockClient] Failed after {self.MAX_RETRIES} attempts. Last error: {last_error}")
        return None

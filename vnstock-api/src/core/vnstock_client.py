
import time
import threading
import os
import sys
from vnstock import Vnstock
import itertools

class VnstockClient:
    _instance = None
    _lock = threading.Lock()
    _stats_lock = threading.Lock()
    
    # Configuration
    MAX_RETRIES = 20
    RETRY_BACKOFF = 2.0
    RATE_LIMIT_WAIT = 65  # Long wait when 429 occurs
    KEY_COOLDOWN = 3.0    # Strict spacing per key: 3 seconds
    
    def __init__(self):
        # Load API keys from env or use default
        api_keys_str = os.getenv('VNSTOCK_API_KEYS', os.getenv('VNSTOCK_API_KEY', ''))
        self.api_keys = [k.strip() for k in api_keys_str.split(',') if k.strip()]
        
        if not self.api_keys:
            self.api_keys = ['default']
        
        # Track when each key was last used: {key: timestamp}
        # Initialized to 0.0 so all keys are ready initially
        self._key_last_used = {k: 0.0 for k in self.api_keys}
        
        # Track which keys are temporarily banned (due to 429): {key: ban_until_ts}
        self._key_bans = {k: 0.0 for k in self.api_keys}
        
        # Request counter per key per minute (for logging)
        self._key_stats = {k: {'count': 0, 'minute_start': time.time()} for k in self.api_keys}
            
        # Determine starting index for round-robin scans to ensure fairness
        self._scan_index = 0
        
        print(f"[VnstockClient] Initialized with {len(self.api_keys)} keys. Strategy: Strict {self.KEY_COOLDOWN}s Spacing.")

    @staticmethod
    def get_instance():
        if VnstockClient._instance is None:
            with VnstockClient._lock:
                if VnstockClient._instance is None:
                    VnstockClient._instance = VnstockClient()
        return VnstockClient._instance

    def stock(self, symbol, source='VCI'):
        return Vnstock(source=source, symbol=symbol)

    def _get_next_available_key(self):
        """
        Find a key that satisfies:
        1. Not banned (due to 429)
        2. Last used > 3s ago
        
        If no key matches #2, calculate wait time for the best candidate.
        If all keys banned, wait for ban to expire.
        
        Returns: (key, wait_time)
        """
        now = time.time()
        
        # 1. Check for ready keys (round-robin scan start)
        n = len(self.api_keys)
        start_idx = self._scan_index
        
        for i in range(n):
            idx = (start_idx + i) % n
            key = self.api_keys[idx]
            
            # Skip if banned
            if now < self._key_bans[key]:
                continue
                
            # Check 3s cooldown
            time_since_last = now - self._key_last_used[key]
            if time_since_last >= self.KEY_COOLDOWN:
                # Key is ready!
                self._scan_index = (idx + 1) % n # Update scan start for fairness
                return key, 0
        
        # 2. No ready keys. Find the one that will be ready soonest.
        soonest_key = None
        min_wait = float('inf')
        
        for key in self.api_keys:
            # Calculate wait based on Ban OR Cooldown
            ban_wait = max(0, self._key_bans[key] - now)
            cooldown_wait = max(0, self.KEY_COOLDOWN - (now - self._key_last_used[key]))
            
            total_wait = max(ban_wait, cooldown_wait)
            
            if total_wait < min_wait:
                min_wait = total_wait
                soonest_key = key
        
        # Return soonest key and how long to wait
        # Caller will sleep this amount
        return soonest_key, min_wait

    def _mark_key_rate_limited(self, key):
        """Mark a key as BANNED for 65s due to 429."""
        with self._lock:
            self._key_bans[key] = time.time() + self.RATE_LIMIT_WAIT
            print(f"[VnstockClient] 🚫 Key {key[:10]}... BANNED for {self.RATE_LIMIT_WAIT}s (Rate Limit Hit)")

    def _update_stats_and_log(self, key, attempt):
        """Update last_used timestamp and stats."""
        # Stats update
        with self._stats_lock:
            now = time.time()
            stats = self._key_stats[key]
            if now - stats['minute_start'] >= 60:
                stats['count'] = 0
                stats['minute_start'] = now
            stats['count'] += 1
            
            # Build status string
            key_status = " | ".join([f"{k[:5]}:{self._key_stats[k]['count']}" for k in self.api_keys])
            print(f"[VnstockClient] Keys: [{key_status}] | Using: {key[:10]}...")

    def _is_rate_limit_error(self, e):
        error_str = str(e).lower()
        return any(x in error_str for x in ['rate limit', '429', 'too many requests', 'giới hạn'])

    def _unwrap_retry_error(self, e):
        try:
            from tenacity import RetryError
            if isinstance(e, RetryError) and e.last_attempt:
                return e.last_attempt.exception() or e
        except:
            pass
        return e

    def call(self, func, *args, **kwargs):
        """
        Execute API call enforcing 3s spacing per key.
        BLOCKING: Waits for a key to be ready (3s rule).
        This ensures we never fire faster than allowed.
        """
        attempt = 0
        
        while attempt < self.MAX_RETRIES:
            wait_time = 0
            key = None
            
            # 1. ACQUIRE KEY
            with self._lock:
                key, wait_time = self._get_next_available_key()
                
                if wait_time > 0:
                    # We must wait. Sleep inside call() to block this thread 
                    # until the key is actually ready.
                    pass 
                else:
                    # Key is ready now. Mark it used immediately so others don't grab it.
                    self._key_last_used[key] = time.time()
            
            # 2. WAIT IF NEEDED (Sleep outside lock ideally, but here we need to ensure flow)
            if wait_time > 0:
                # If we have to wait, sleep then Loop again to re-check readiness
                # (someone else might have grabbed it if we didn't mark used)
                # But to keep simple: simple blocking sleep here
                time.sleep(wait_time)
                # Re-acquire to be safe? Or simple recursion?
                # Let's simple loop again.
                continue
            
            # 3. EXECUTE
            attempt += 1
            self._update_stats_and_log(key, attempt)
            
            try:
                result = func(*args, **kwargs)
                if result is not None:
                    return result
                return None # No data
                    
            except SystemExit as e:
                # Rate limit exit from library
                self._mark_key_rate_limited(key)
                continue
                
            except Exception as e:
                real_e = self._unwrap_retry_error(e)
                
                if self._is_rate_limit_error(real_e):
                    self._mark_key_rate_limited(key)
                    continue

                # Transient error
                print(f"[VnstockClient] Error ({key[:8]}): {real_e}")
                time.sleep(1) # Short retry delay
        
        return None

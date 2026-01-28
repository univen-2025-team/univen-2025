
import io
import contextlib
import re
import time
import threading
import os
import sys
import warnings
import logging
from vnstock import Vnstock
import itertools
from src.config.app_config import AppConfig

# Suppress pandas FutureWarnings (e.g. applymap deprecated)
warnings.simplefilter(action='ignore', category=FutureWarning)

class RateLimitError(Exception):
    def __init__(self, wait_time):
        self.wait_time = wait_time
        super().__init__(f"Rate Limit Exceeded. Backoff {wait_time}s")

class VnstockClient:
    _instance = None
    _stats_lock = threading.Lock()
    
    # Configuration
    MAX_RETRIES = 20
    RETRY_BACKOFF = 2.0
    RATE_LIMIT_WAIT = 65  # Long wait when 429 occurs
    
    def __init__(self):
        # FORCE API KEY FROM CONFIG to ensure library picks it up
        if AppConfig.VNSTOCK_API_KEY:
            os.environ['VNSTOCK_API_KEY'] = AppConfig.VNSTOCK_API_KEY
            logging.info(f"[VnstockClient] Forced VNSTOCK_API_KEY from AppConfig: {AppConfig.VNSTOCK_API_KEY[:5]}...")

        # Load API keys from env or use default
        api_keys_str = os.getenv('VNSTOCK_API_KEYS', os.getenv('VNSTOCK_API_KEY', ''))
        
        # STRICT SINGLE KEY MODE: Only take the first key
        primary_key = api_keys_str.split(',')[0].strip()
        
        if primary_key:
            self.api_keys = [primary_key]
        else:
            self.api_keys = ['default']
        
        # Request counter per key per minute (for logging)
        self._key_stats = {k: {'count': 0, 'minute_start': time.time()} for k in self.api_keys}
        
        # Global Rate Limit Lock
        self._global_ban_until = 0.0
        self._ban_lock = threading.Lock()
            
        logging.info(f"[VnstockClient] Initialized with {len(self.api_keys)} keys. Strategy: Reactive Retry with Global Lock.")

    @staticmethod
    def get_instance():
        if VnstockClient._instance is None:
            VnstockClient._instance = VnstockClient()
        return VnstockClient._instance

    def stock(self, symbol, source='VCI'):
        return Vnstock(source=source, symbol=symbol)

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
            logging.info(f"[VnstockClient] Keys: [{key_status}] | Using: {key[:10]}...")

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

    def is_global_ban_active(self):
        """Check if any ban is active."""
        with self._ban_lock:
             return time.time() < self._global_ban_until
             
    def _check_global_ban(self):
        """Raise error immediately if ban is active."""
        with self._ban_lock:
            now = time.time()
            if now < self._global_ban_until:
                wait_seconds = self._global_ban_until - now
                if wait_seconds > 0:
                     raise RateLimitError(wait_seconds)

    def _set_global_ban(self, seconds):
        """Activate global ban for all threads."""
        with self._ban_lock:
            # Only extend if new ban is longer than existing
            expire_at = time.time() + seconds
            if expire_at > self._global_ban_until:
                self._global_ban_until = expire_at
                logging.warning(f"[VnstockClient] 🛑 Global Ban Activated for {seconds}s.")

    def call(self, func, *args, **kwargs):
        """
        Execute API call with reactive retries.
        No preemptive locking/cooldown.
        """
        attempt = 0
        key = self.api_keys[0] # Always use the single primary key
        
        while attempt < self.MAX_RETRIES:
            # 1. Check Global Ban first - RAISE if blocked
            self._check_global_ban()
            
            attempt += 1
            self._update_stats_and_log(key, attempt)
            
            # Capture stdout and stderr to parse rate limit messages from vnstock
            f_out = io.StringIO()
            f_err = io.StringIO()
            
            try:
                with contextlib.redirect_stdout(f_out), contextlib.redirect_stderr(f_err):
                    result = func(*args, **kwargs)
                
                # Print captured output if any
                output_out = f_out.getvalue()
                output_err = f_err.getvalue()

                # Filter spam/promotional messages
                spam_msgs = [
                    "🚫 Đang bị giới hạn API? Tăng tốc độ gọi API lên 10X với gói Vnstock Insider: https://vnstocks.com/insiders-program"
                ]
                
                for spam in spam_msgs:
                    output_out = output_out.replace(spam, "")
                    output_err = output_err.replace(spam, "")

                if output_out.strip(): logging.info(f"[Vnstock Lib Out] {output_out.strip()}")
                if output_err.strip(): logging.warning(f"[Vnstock Lib Err] {output_err.strip()}")

                if result is not None:
                    return result
                return None # No data
            
            except AttributeError as e:
                # AttributeError usually implies library/data structure mismatch (e.g. NoneType has no attribute items)
                # This is NOT a transient error, so we should NOT retry.
                logging.error(f"[VnstockClient] ⚠️  Library/Data Error ({key[:8]}): {e}. Skipping symbol/job.")
                return None
                    
            except SystemExit as e:
                # Rate limit exit from library
                output = f_out.getvalue() + "\n" + f_err.getvalue()
                logging.warning(f"[VnstockClient] Captured SystemExit Output: {output.strip()}")
                
                wait_time = self.RATE_LIMIT_WAIT # Default fallback
                
                # Strip ANSI colors if any (simple regex)
                ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
                clean_output = ansi_escape.sub('', output)
                
                # Regex to find "Chờ X giây"
                match_vn = re.search(r"Chờ\s+(\d+)\s+giây", clean_output)
                match_en = re.search(r"Wait\s+(\d+)\s+seconds?", clean_output, re.IGNORECASE)
                
                if match_vn:
                    wait_seconds = int(match_vn.group(1))
                    wait_time = wait_seconds
                    logging.warning(f"[VnstockClient] ⏳ Detected Rate Limit (VN). Requested: {wait_time}s.")
                elif match_en:
                    wait_seconds = int(match_en.group(1))
                    wait_time = wait_seconds
                    logging.warning(f"[VnstockClient] ⏳ Detected Rate Limit (EN). Requested: {wait_time}s.")
                else:
                    logging.warning(f"[VnstockClient] 🚫 Rate Limit Hit (SystemExit). Parsing failed, using default {wait_time}s...")
                    logging.debug(f"[VnstockClient] [DEBUG] Output saw: {repr(clean_output[:200])}")
                
                # ADAPTIVE: Add 5% safety buffer
                original_wait = wait_time
                wait_time = int(wait_time * 1.05)
                if wait_time == original_wait: wait_time += 1 # Ensure at least 1s extra
                
                logging.warning(f"[VnstockClient] 🛡️ Adaptive: Increasing wait by 5% -> {wait_time}s")
                
                self._set_global_ban(wait_time)
                # RAISE error to abort this worker job and let it be re-queued
                raise RateLimitError(wait_time)
                
            except RateLimitError:
                 raise # Re-raise self (if caught by Exception below)
                 
            except Exception as e:
                real_e = self._unwrap_retry_error(e)
                
                # Check for NoneType attribute error (common library bug) which might be wrapped
                if isinstance(real_e, AttributeError) and "'NoneType' object has no attribute 'items'" in str(real_e):
                     logging.error(f"[VnstockClient] ⚠️  Library/Data Error ({key[:8]}): {real_e}. Skipping symbol/job.")
                     return None

                if self._is_rate_limit_error(real_e):
                    # ADAPTIVE: Increase default wait time by 5% for future 429s (Cumulative backoff)
                    self.RATE_LIMIT_WAIT = int(self.RATE_LIMIT_WAIT * 1.05)
                    
                    logging.warning(f"[VnstockClient] 🚫 Key {key[:10]}... Rate Limit Hit (429). Waiting {self.RATE_LIMIT_WAIT}s (Adjusted +5%)...")
                    self._set_global_ban(self.RATE_LIMIT_WAIT)
                    raise RateLimitError(self.RATE_LIMIT_WAIT)
                
                # Check for permanent errors (Invalid Symbol, etc) -> Do not retry
                error_str = str(real_e)
                if any(x in error_str for x in ["Mã chứng khoán không hợp lệ", "Invalid symbol", "không tồn tại"]):
                     logging.error(f"[VnstockClient] ❌ Permanent Error ({key[:8]}): {real_e}. Skipping.")
                     return None

                # Transient error
                logging.error(f"[VnstockClient] Error ({key[:8]}): {real_e}")
                time.sleep(1) # Short retry delay
        
        return None

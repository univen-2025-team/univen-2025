import time
import redis
import json
from datetime import datetime, timedelta
from src.services.fetchers.company_profile import CompanyProfileFetcher
from src.services.syncers.company_profile import CompanyProfileSyncer
from src.services.fetchers.stock_symbol import StockSymbolFetcher
from src.services.syncers.stock_symbol import StockSymbolSyncer
from src.services.queue_utils import is_symbol_in_queue
from vnstock import Listing
from src.services.queue_utils import is_symbol_in_queue
from vnstock import Listing
from src.database.mongodb import db
from src.jobs.vn30_history_sync import sync_all_stocks_daily, startup_vn30_sync

def get_latest_completed_trading_date():
    """
    Returns the latest COMPLETED trading date.
    Policy:
    - If Today is Sat (5) -> Fri (Today - 1)
    - If Today is Sun (6) -> Fri (Today - 2)
    - If Today is Mon (0) -> Fri (Today - 3) (User Request: T2 lấy T6)
    - If Today is Tue-Fri (1-4) -> Previous Day (Today - 1)
    """
    now = datetime.now()
    wd = now.weekday()
    
    if wd == 5: # Sat -> Fri
        delta = 1
    elif wd == 6: # Sun -> Fri
        delta = 2
    elif wd == 0: # Mon -> Fri
        delta = 3
    else: # Tue-Fri -> Prev Day
        delta = 1
        
    target = now - timedelta(days=delta)
    return target.strftime('%Y-%m-%d')

def check_startup_sync():
    """
    Checks if data for today is COMPLETE. If not, triggers sync.
    """
    try:
        print("Checking if startup sync is needed...")
        collection = db.get_database()["company_profiles"]
        
        # Get start of today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Count synced items for today
        done_count = collection.count_documents({'updated_at': {'$gte': today_start}})
        
        print(f"Startup Check: Found {done_count} companies synced today.")
        
        # Heuristic: If we have very few records (e.g. < 1000), likely incomplete.
        # Or ideally, compare with total expected (approx 1600-1700)
        # We'll set a threshold. If significantly less than 1600, we trigger sync.
        # The sync job itself will safely skip existing ones, so false positives are cheap.
        EXPECTED_MIN = 1500
        
        if done_count < EXPECTED_MIN:
             print(f"Startup Check: Data incomplete ({done_count}/{EXPECTED_MIN}). Triggering sync/resume...")
             daily_sync_job()
        else:
             print("Startup Check: Data appears complete for today.")
             
        # Also run startup sync for VN30 history (checking availability for TODAY)
        # Also run startup sync for VN30 history (checking availability for LATEST COMPLETED DATE)
        target_date = get_latest_completed_trading_date()
        print(f"Startup Check: Using target date {target_date} for Market sync.")
        sync_all_stocks_daily(target_date)
            
    except Exception as e:
        print(f"Error checking startup sync: {e}")

def sync_stock_symbols():
    """
    Syncs basic stock symbol data (symbols_by_exchange)
    """
    print("Starting Stock Symbol Sync...")
    fetcher = StockSymbolFetcher()
    data = fetcher.fetch()
    if data:
        syncer = StockSymbolSyncer()
        syncer.sync(data)
    print("Stock Symbol Sync Completed.")

def sync_company_profiles():
    """
    Syncs company profiles via Redis Queue.
    """
    try:
        print("Fetching list of companies...")
        
        # Retry listing fetch up to 3 times
        listing_df = None
        for attempt in range(3):
            try:
                lst = Listing(source="VCI", show_log=False)
                listing_df = lst.all_symbols()
                if listing_df is not None and not listing_df.empty:
                    break
            except Exception as e:
                print(f"Listing fetch attempt {attempt+1}/3 failed: {e}")
                time.sleep(5)
        
        if listing_df is None or listing_df.empty:
            print("No companies found to sync after retries.")
            return

        symbols = listing_df['symbol'].tolist()
        total_symbols = len(symbols)
        print(f"Entities to sync: {total_symbols}")

        syncer = CompanyProfileSyncer()
        collection = db.get_database()["company_profiles"]
        
        # Smart Resume
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        done_cursor = collection.find({'updated_at': {'$gte': today_start}}, {'symbol': 1})
        done_symbols = set(doc['symbol'] for doc in done_cursor)
        
        remaining = [s for s in symbols if s not in done_symbols]
        print(f"Already synced today: {len(done_symbols)}. Remaining: {len(remaining)}")
        
        if not remaining:
            print("All symbols already synced today.")
            return
        
        try:
             r = redis.Redis(host='redis', port=6379, decode_responses=True)
        except Exception as e:
             print(f"Redis error: {e}")
             return

        # Enqueue jobs
        skipped_queue = 0
        enqueued = 0
        
        for ticker in remaining:
            # Check 2: Check if already in queue
            if is_symbol_in_queue(r, 'vnstock_profile_queue', ticker, 'company_profile'):
                 skipped_queue += 1
                 continue
                 
            job_data = json.dumps({
                'symbol': ticker,
                'type': 'company_profile',
                'source': 'startup_sync',
                'timestamp': time.time()
            })
            r.lpush('vnstock_profile_queue', job_data)
            enqueued += 1
        
        print(f"[Sync] Enqueued {enqueued} assignments. Skipped (already in queue): {skipped_queue}")
        
        print(f"[Sync] Enqueued {len(remaining)} assignments.")
                
    except Exception as e:
        print(f"Error in sync_company_profiles: {e}")

def daily_sync_job():
    """
    Function to be executed daily at 1 AM.
    Orchestrates the fetching and syncing process.
    """
    print(f"[{datetime.now()}] Starting Daily Sync Job...")
    
    # 1. Sync Stock Symbols
    sync_stock_symbols()

    # 2. Sync Company Profiles
    sync_company_profiles()

    # 3. Sync VN30 History (Market Page Data)
    # 3. Sync Market History (Market Page Data)
    # Use calculated target date to ensure we sync the 'completed' day
    target_date = get_latest_completed_trading_date()
    sync_all_stocks_daily(target_date)
    
    print(f"[{datetime.now()}] Daily Sync Job Completed.")

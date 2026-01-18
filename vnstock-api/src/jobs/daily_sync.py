import time
from datetime import datetime
from src.services.fetchers.company_profile import CompanyProfileFetcher
from src.services.syncers.company_profile import CompanyProfileSyncer
from src.services.fetchers.stock_symbol import StockSymbolFetcher
from src.services.syncers.stock_symbol import StockSymbolSyncer
from vnstock import Listing
from src.database.mongodb import db

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
    Syncs company profiles using controlled concurrency.
    Uses semaphore to limit concurrent jobs.
    """
    import threading
    
    # Limit concurrent jobs to avoid OOM and rate limiting
    MAX_CONCURRENT_JOBS = 6  # 1 per API key roughly
    JOB_INTERVAL = 1.0  # seconds between job starts
    
    semaphore = threading.Semaphore(MAX_CONCURRENT_JOBS)
    
    def process_symbol(ticker, syncer, sem):
        """Process a single symbol with semaphore control."""
        try:
            fetcher = CompanyProfileFetcher(symbol=ticker)
            data = fetcher.fetch()
            
            if data:
                syncer.sync(data)
                print(f"[Sync] ✓ Done: {ticker}")
            else:
                print(f"[Sync] ✗ No data: {ticker}")
        except Exception as e:
            print(f"[Sync] ✗ Error {ticker}: {e}")
        finally:
            sem.release()  # Release slot for next job
    
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
        
        # Controlled concurrency with semaphore
        for ticker in remaining:
            semaphore.acquire()  # Wait for a slot
            print(f"[Sync] Starting: {ticker}")
            threading.Thread(
                target=process_symbol, 
                args=(ticker, syncer, semaphore),
                daemon=True,
                name=f"Sync-{ticker}"
            ).start()
            
            time.sleep(JOB_INTERVAL)
        
        print(f"[Sync] All {len(remaining)} jobs started.")
                
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
    
    print(f"[{datetime.now()}] Daily Sync Job Completed.")

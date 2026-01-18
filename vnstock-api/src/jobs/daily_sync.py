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
    Syncs company profile (overview) for a list of companies.
    Resumes where left off.
    """
    try:
        print("Fetching list of companies...")
        lst = Listing(source="VCI", show_log=False)
        listing_df = lst.all_symbols()
        
        if listing_df is None or listing_df.empty:
            print("No companies found to sync.")
            return

        # Fetch all companies (limit removed)
        symbols = listing_df['symbol'].tolist()
        total_symbols = len(symbols)
        print(f"Entities to sync: {total_symbols}")

        syncer = CompanyProfileSyncer()
        collection = db.get_database()["company_profiles"]
        
        # Smart Resume: Pre-fetch list of already done symbols for today
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        done_cursor = collection.find({'updated_at': {'$gte': today_start}}, {'symbol': 1})
        done_symbols = set(doc['symbol'] for doc in done_cursor)
        
        print(f"Already synced today: {len(done_symbols)}. Remaining: {total_symbols - len(done_symbols)}")
        
        max_retries = 3
        for ticker in symbols:
            # Skip if done
            if ticker in done_symbols:
                continue

            print(f"Processing {ticker}...")
            fetcher = CompanyProfileFetcher(symbol=ticker)
            
            # VnstockClient now handles retries internally
            data = fetcher.fetch()
            
            if data:
                syncer.sync(data)
            else:
                print(f"Skipping {ticker} (No data).")
            
            # Rate limiting is handled inside VnstockClient (global)
            # Remove manual sleep here to rely on client
            # time.sleep(10) # REMOVED
                
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

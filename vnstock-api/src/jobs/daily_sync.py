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
    Checks if data for today exists. If not, triggers sync.
    """
    try:
        print("Checking if startup sync is needed...")
        collection = db.get_database()["company_profiles"]
        # Get latest updated record
        last_record = collection.find_one(sort=[("updated_at", -1)])
        
        should_sync = False
        if not last_record:
            print("Startup Check: No data found.")
            should_sync = True
        else:
            last_update = last_record.get('updated_at')
            if not last_update:
                should_sync = True
            elif isinstance(last_update, datetime):
                # Ensure we sync if the last update was NOT today
                # If last_update is today, we skip.
                if last_update.date() < datetime.utcnow().date():
                    print(f"Startup Check: Data is stale (Last update: {last_update}).")
                    should_sync = True
                else:
                    print(f"Startup Check: Data is up-to-date (Last update: {last_update}).")
            else:
                 # Fallback if type is weird
                 should_sync = True

        if should_sync:
            print("Triggering immediate sync...")
            daily_sync_job()
            
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
        print(f"Entities to sync: {len(symbols)}")

        syncer = CompanyProfileSyncer()
        
        max_retries = 3
        for ticker in symbols:
            print(f"Processing {ticker}...")
            fetcher = CompanyProfileFetcher(symbol=ticker)
            
            # Retry mechanism
            for attempt in range(max_retries):
                data = fetcher.fetch()
                
                if data:
                    syncer.sync(data)
                    break # Success, move to rate limiting
                else:
                    print(f"Attempt {attempt + 1}/{max_retries} failed for {ticker} (No data).")
                    if attempt < max_retries - 1:
                        print(f"Retrying in 10s...")
                        time.sleep(10)
                    else:
                        print(f"Skipping {ticker} after {max_retries} attempts.")
            
            # Rate limiting
            time.sleep(10)
                
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

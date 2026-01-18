
import redis
import json
import time
from datetime import datetime, timedelta
from src.database.mongodb import db
# from vnstock import listing

def get_vn30_symbols():
    try:
        # Use vnstock listing to get VN30 or default to hardcoded list if fails
        # Assuming listing.symbols() or similar. 
        # listing is a module functions in newer vnstock versions? 
        # Or from vnstock import Listing. 
        # Let's use hardcoded list for reliability if API fails, or try simple fetch.
        # But safest is a static list or fetching from own DB `stock_symbols` collection.
        
        # Option 1: Fetch from MongoDB 'stock_symbols' where group is VN30?
        # Option 2: Use vnstock.listing.all_symbols() and filter.
        
        # Let's use DB which we sync daily anyway.
        collection = db.get_database()["stock_symbols"]
        # Assuming we have index info or just get all and filter or typical big caps.
        # For now, let's use a known list of blue chips if DB query is complex 
        # or just "HOSE" top ones.
        
        # Actually simplest: Just sync 'MARKET' and maybe top stocks. 
        # User asked for top 30.
        pass 
    except:
        pass
    
    # Placeholder for VN30
    return [
        'ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GAS', 'GVR', 'HDB', 'HPG', 
        'MBB', 'MSN', 'MWG', 'PLX', 'POW', 'SAB', 'SHB', 'SSB', 'SSI', 'STB', 
        'TCB', 'TPB', 'VCB', 'VHM', 'VIB', 'VIC', 'VJC', 'VNM', 'VPB', 'VRE'
    ]

def check_and_enqueue_news_sync():
    """
    Checks news data for last 30 days for VN30 + MARKET.
    Queues missing dates to Redis.
    """
    print(f"[{datetime.now()}] Starting Daily News Sync Check...")
    
    # 1. Connect Redis
    try:
        r = redis.Redis(host='redis', port=6379, decode_responses=True)
    except Exception as e:
        print(f"Failed to connect Redis: {e}")
        return

    # 2. Target items
    symbols = get_vn30_symbols()
    symbols.append('MARKET')
    
    # 3. Generate last 30 days list
    today = datetime.now().date()
    last_30_days = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]
    
    news_collection = db.get_database()["stock_news"]
    
    for symbol in symbols:
        try:
            # Query existing dates for this symbol
            cursor = news_collection.find(
                {
                    'symbol': symbol,
                    'date': {'$in': last_30_days}
                },
                {'date': 1}
            )
            
            existing_dates = set(doc['date'] for doc in cursor)
            missing_dates = [d for d in last_30_days if d not in existing_dates]
            
            if missing_dates:
                print(f"  - {symbol} missing {len(missing_dates)} dates. Enqueueing...")
                
                job_data = json.dumps({
                    'symbol': symbol,
                    'missing_dates': missing_dates,
                    'source': 'cron_job',
                    'timestamp': time.time()
                })
                
                r.rpush('vnstock_news_queue', job_data)
        except Exception as e:
            print(f"Error checking {symbol}: {e}")
            
    print(f"[{datetime.now()}] Daily News Sync Check Completed.")

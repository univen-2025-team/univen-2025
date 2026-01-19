"""
VN30 Stock History Sync Job

This module provides:
1. Startup sync: ensures VN30 stocks have at least some historical data
2. Daily sync: fetches 1-minute tick data for all VN30 stocks after market close
"""

import time
from datetime import datetime, timedelta
from src.database.mongodb import db
from src.services.fetchers.stock_history import StockHistoryFetcher
from src.services.syncers.stock_history import StockHistorySyncer

# VN30 constituent stocks + VN30 Index itself
VN30_SYMBOLS = [
    'VN30',  # VN30 Index (for intraday chart)
    'ACB', 'BCM', 'BID', 'BVH', 'CTG', 
    'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
    'MBB', 'MSN', 'MWG', 'PLX', 'POW',
    'SAB', 'SHB', 'SSB', 'SSI', 'STB',
    'TCB', 'TPB', 'VCB', 'VHM', 'VIC',
    'VIB', 'VJC', 'VNM', 'VPB', 'VRE'
]


import redis
import json

def startup_vn30_sync():
    """
    Startup sync: ensure all VN30 stocks have at least one record.
    For stocks without data, enqueue a sync job.
    """
    print("=== VN30 Startup Sync ===")
    
    db.connect()
    syncer = StockHistorySyncer()
    
    # helper for redis
    try:
        r = redis.Redis(host='redis', port=6379, decode_responses=True)
    except Exception as e:
        print(f"Redis connect error: {e}")
        return

    missing_symbols = []
    
    for symbol in VN30_SYMBOLS:
        if not syncer.ensure_symbol_exists(symbol):
            missing_symbols.append(symbol)
    
    if not missing_symbols:
        print("All VN30 stocks have data, startup sync complete.")
        return
    
    print(f"Found {len(missing_symbols)} stocks without data. Enqueuing jobs...")
    
    for i, symbol in enumerate(missing_symbols):
        job_data = json.dumps({
            'symbol': symbol,
            'source': 'startup_sync',
            'timestamp': time.time()
        })
        r.lpush('vnstock_sync_queue', job_data)
        print(f"Enqueued startup sync for {symbol}")
    
    print(f"\n=== Startup Sync Enqueued ===")


def sync_vn30_daily(date: str = None):
    """
    Daily sync: Check if data exists for date, if not, enqueue job.
    """
    if not date:
        now = datetime.now()
        wd = now.weekday()
        
        # Rule: Sat(5), Sun(6), Mon(0) => Get Friday
        if wd == 5: # Saturday
            target_date = now - timedelta(days=1)
        elif wd == 6: # Sunday
            target_date = now - timedelta(days=2)
        elif wd == 0: # Monday
            target_date = now - timedelta(days=3)
        else:
            target_date = now
            
        date = target_date.strftime('%Y-%m-%d')
    
    print(f"=== VN30 Daily Sync for {date} ===")
    
    db.connect()
    syncer = StockHistorySyncer()
    
    try:
        r = redis.Redis(host='redis', port=6379, decode_responses=True)
    except Exception as e:
        print(f"Redis connect error: {e}")
        return
    
    enqueued = 0
    skipped = 0
    
    for i, symbol in enumerate(VN30_SYMBOLS):
        try:
            # Check if we already have data for this date
            if syncer.has_data_for_date(symbol, date, '1m'):
                print(f"[{i+1}/{len(VN30_SYMBOLS)}] {symbol}: Data exists, skipping")
                skipped += 1
                continue
            
            # Enqueue
            job_data = json.dumps({
                'symbol': symbol,
                'date': date,
                'source': 'daily_sync',
                'timestamp': time.time()
            })
            r.lpush('vnstock_sync_queue', job_data)
            print(f"[{i+1}/{len(VN30_SYMBOLS)}] {symbol}: Enqueued job")
            enqueued += 1
                
        except Exception as e:
            print(f"  Error checking {symbol}: {e}")
            
    print(f"\n=== Daily Sync Enqueue Complete ===")
    print(f"Enqueued: {enqueued}")
    print(f"Skipped: {skipped}")


def get_stock_price(symbol: str, target_time: str = None, target_date: str = None, interval: str = "1m"):
    """
    API helper: Get stock price at a specific time.
    Automatically falls back to previous trading day if no data for target date.
    
    Args:
        symbol: Stock ticker symbol
        target_time: Time in 'HH:MM' format. If None, returns latest price.
        target_date: Date in 'YYYY-MM-DD' format. Defaults to today.
        interval: Time interval
        
    Returns:
        Price bar dict or None
    """
    db.connect()
    syncer = StockHistorySyncer()
    
    if not target_date:
        target_date = datetime.now().strftime('%Y-%m-%d')
    
    if target_time:
        # Get specific time
        return syncer.get_price_at_time(symbol, target_time, target_date, interval)
    else:
        # Get latest available data
        data = syncer.get_latest_available(symbol, target_date, interval)
        if data and data.get('prices'):
            # Return the last price bar
            return {
                'symbol': data['symbol'],
                'date': data['date'],
                **data['prices'][-1]
            }
        return None


# For manual testing
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'daily':
        date = sys.argv[2] if len(sys.argv) > 2 else None
        sync_vn30_daily(date)
    else:
        startup_vn30_sync()

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

# VN30 constituent stocks (as of 2024)
VN30_SYMBOLS = [
    'ACB', 'BCM', 'BID', 'BVH', 'CTG', 
    'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
    'MBB', 'MSN', 'MWG', 'PLX', 'POW',
    'SAB', 'SHB', 'SSB', 'SSI', 'STB',
    'TCB', 'TPB', 'VCB', 'VHM', 'VIC',
    'VIB', 'VJC', 'VNM', 'VPB', 'VRE'
]


def startup_vn30_sync():
    """
    Startup sync: ensure all VN30 stocks have at least one record.
    For stocks without data, fetch the most recent available trading day.
    
    This runs when the service starts.
    """
    print("=== VN30 Startup Sync ===")
    
    db.connect()
    syncer = StockHistorySyncer()
    
    missing_symbols = []
    
    for symbol in VN30_SYMBOLS:
        if not syncer.ensure_symbol_exists(symbol):
            missing_symbols.append(symbol)
    
    if not missing_symbols:
        print("All VN30 stocks have data, startup sync complete.")
        return
    
    print(f"Found {len(missing_symbols)} stocks without data: {missing_symbols}")
    print("Fetching initial data...")
    
    today = datetime.now().strftime('%Y-%m-%d')
    successful = 0
    
    for i, symbol in enumerate(missing_symbols):
        print(f"\n[{i+1}/{len(missing_symbols)}] Fetching {symbol}...")
        
        try:
            fetcher = StockHistoryFetcher(symbol=symbol, interval='1m')
            data = fetcher.fetch_latest_available(target_date=today, max_lookback_days=7)
            
            if data:
                syncer.sync(data)
                successful += 1
            else:
                print(f"  Could not find data for {symbol}")
                
        except Exception as e:
            print(f"  Error fetching {symbol}: {e}")
        
        # Rate limiting
        if i < len(missing_symbols) - 1:
            print(f"  Waiting 10s for rate limit...")
            time.sleep(10)
    
    print(f"\n=== Startup Sync Complete ===")
    print(f"Initialized {successful}/{len(missing_symbols)} stocks")


def sync_vn30_daily(date: str = None):
    """
    Daily sync: fetch 1-minute tick data for all VN30 stocks for a specific date.
    Skips weekends/holidays (when vnstock returns no data).
    
    Args:
        date: Date string in 'YYYY-MM-DD' format. Defaults to today.
    """
    if not date:
        date = datetime.now().strftime('%Y-%m-%d')
    
    print(f"=== VN30 Daily Sync for {date} ===")
    
    db.connect()
    syncer = StockHistorySyncer()
    
    successful = 0
    skipped = 0
    failed = 0
    
    for i, symbol in enumerate(VN30_SYMBOLS):
        print(f"\n[{i+1}/{len(VN30_SYMBOLS)}] Processing {symbol}...")
        
        try:
            # Check if we already have data for this date
            if syncer.has_data_for_date(symbol, date, '1m'):
                print(f"  Data already exists, skipping")
                skipped += 1
                continue
            
            # Fetch data
            fetcher = StockHistoryFetcher(symbol=symbol, interval='1m')
            data = fetcher.fetch(date)
            
            if data:
                syncer.sync(data)
                successful += 1
            else:
                # No data (weekend/holiday) - this is expected, not an error
                print(f"  No data for {date} (likely weekend/holiday)")
                skipped += 1
                
        except Exception as e:
            print(f"  Error: {e}")
            failed += 1
        
        # Rate limiting
        if i < len(VN30_SYMBOLS) - 1:
            print(f"  Waiting 10s for rate limit...")
            time.sleep(10)
    
    print(f"\n=== Daily Sync Complete ===")
    print(f"Successful: {successful}")
    print(f"Skipped: {skipped}")
    print(f"Failed: {failed}")


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

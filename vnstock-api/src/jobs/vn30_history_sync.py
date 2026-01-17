"""
VN30 Stock History Sync Job

This module provides a cronjob that fetches 1-minute tick data for all VN30 stocks daily.
VN30 is the index of the 30 largest and most liquid stocks on HOSE.
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


def sync_vn30_history_1m(date: str = None):
    """
    Sync 1-minute tick data for all VN30 stocks for a specific date.
    
    Args:
        date: Date string in 'YYYY-MM-DD' format. Defaults to today.
    """
    if not date:
        date = datetime.now().strftime('%Y-%m-%d')
    
    print(f"=== Starting VN30 1-minute history sync for {date} ===")
    
    db.connect()
    syncer = StockHistorySyncer()
    
    total_synced = 0
    successful = 0
    failed = 0
    
    for i, symbol in enumerate(VN30_SYMBOLS):
        print(f"\n[{i+1}/{len(VN30_SYMBOLS)}] Processing {symbol}...")
        
        try:
            # Check if we already have data for this date
            if syncer.has_data_for_date(symbol, date, '1m'):
                print(f"  Data already exists for {symbol} on {date}, skipping...")
                successful += 1
                continue
            
            # Fetch 1-minute data for the date
            fetcher = StockHistoryFetcher(symbol=symbol, interval='1m')
            records = fetcher.fetch(start=date, end=date)
            
            if records:
                count = syncer.sync(records)
                total_synced += count
                successful += 1
                print(f"  ✓ Synced {count} records for {symbol}")
            else:
                print(f"  ✗ No data returned for {symbol}")
                failed += 1
                
        except Exception as e:
            print(f"  ✗ Error processing {symbol}: {e}")
            failed += 1
        
        # Rate limiting: 10 seconds between requests (as per user's vnstock limit)
        if i < len(VN30_SYMBOLS) - 1:
            print(f"  Waiting 10s for rate limit...")
            time.sleep(10)
    
    print(f"\n=== VN30 Sync Complete ===")
    print(f"Total symbols: {len(VN30_SYMBOLS)}")
    print(f"Successful: {successful}")
    print(f"Failed: {failed}")
    print(f"Total records synced: {total_synced}")


def sync_stock_history_on_demand(symbol: str, interval: str = "1D", start: str = None, end: str = None):
    """
    Fetch and sync stock history on demand (for non-VN30 stocks or specific requests).
    Implements caching: checks MongoDB first, fetches from API if not present.
    
    Args:
        symbol: Stock ticker symbol
        interval: Time interval (1m, 5m, 15m, 30m, 1H, 1D, 1W, 1M)
        start: Start date in 'YYYY-MM-DD' format
        end: End date in 'YYYY-MM-DD' format
        
    Returns:
        List of OHLCV records from MongoDB
    """
    db.connect()
    syncer = StockHistorySyncer()
    
    # Set defaults
    if not end:
        end = datetime.now().strftime('%Y-%m-%d')
    if not start:
        if interval in ['1m', '5m', '15m', '30m', '1H']:
            start = end  # Same day for intraday
        else:
            start = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    # Check if we have data in MongoDB
    existing = syncer.get_latest(symbol, interval, limit=1)
    
    if not existing:
        # No data, fetch from API
        print(f"No cached data for {symbol} ({interval}), fetching from API...")
        fetcher = StockHistoryFetcher(symbol=symbol, interval=interval)
        records = fetcher.fetch(start=start, end=end)
        
        if records:
            syncer.sync(records)
    else:
        print(f"Found cached data for {symbol} ({interval})")
    
    # Return data from MongoDB
    return syncer.get_latest(symbol, interval, limit=1000)


# For manual testing
if __name__ == "__main__":
    sync_vn30_history_1m()

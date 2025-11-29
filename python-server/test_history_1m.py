"""
Test vnstock quote.history() with interval='1m' as per documentation.
"""
from vnstock3 import Vnstock
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')

# Test with TCBS source (free)
print("Testing quote.history(interval='1m') with TCBS source...")
print("=" * 60)

stock = Vnstock().stock(symbol='ACB', source='TCBS')

# Get yesterday's date (last trading day)
today = datetime.now()
yesterday = (today - timedelta(days=1)).strftime('%Y-%m-%d')

print(f"\nFetching 1m data for {yesterday}...")

try:
    data = stock.quote.history(
        symbol='ACB',
        start=yesterday,
        end=yesterday,
        interval='1m',
        to_df=True
    )
    
    if data is not None and not data.empty:
        print(f"✓ SUCCESS: Fetched {len(data)} rows")
        print(f"\nColumns: {data.columns.tolist()}")
        print(f"\nFirst 3 rows:")
        print(data.head(3))
        print(f"\nLast 3 rows:")
        print(data.tail(3))
        
        # Check if data has attributes
        if hasattr(data, 'name'):
            print(f"\nSymbol name: {data.name}")
        if hasattr(data, 'category'):
            print(f"Category: {data.category}")
            
    else:
        print("✗ FAILED: No data returned")
        
except Exception as e:
    print(f"✗ ERROR: {e}")
    import traceback
    traceback.print_exc()

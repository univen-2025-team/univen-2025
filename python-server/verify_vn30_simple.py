"""
Simple verification for VN30 minute data.
"""
import logging
from services.data_fetcher import VNStockDataFetcher
from services.data_storage import MarketDataStorage

logging.basicConfig(level=logging.INFO)

print("1. Fetching VN30 intraday directly...")
fetcher = VNStockDataFetcher()
# Direct fetch to test the new logic
vn30_data = fetcher.fetch_intraday_data('VN30')

if vn30_data:
    print(f"✓ Fetched {len(vn30_data)} minute records for VN30")
    print(f"  First: {vn30_data[0]}")
    print(f"  Last: {vn30_data[-1]}")
    
    print("\n2. Saving to MongoDB (simulating fetch_market_overview logic)...")
    # Create pseudo-stock object
    vn30_stock_data = {
        'symbol': 'VN30',
        'date': vn30_data[0]['tradingDate'].split('T')[0],
        'price': vn30_data[-1]['price'],
        'prices': vn30_data,
        'volume': sum(item.get('volume', 0) for item in vn30_data)
    }
    
    storage = MarketDataStorage()
    success = storage.save_stock_data([vn30_stock_data], vn30_stock_data['date'])
    
    if success:
        print("✓ Saved VN30 to stock_data collection")
        
        print("\n3. Retrieving from MongoDB...")
        retrieved = storage.get_stock_data('VN30', vn30_stock_data['date'])
        if retrieved:
            print(f"✓ Retrieved VN30 from MongoDB")
            print(f"  - Prices count: {len(retrieved.get('prices', []))}")
        else:
            print("✗ Failed to retrieve VN30")
    else:
        print("✗ Failed to save VN30")
else:
    print("✗ Failed to fetch VN30 data")

"""
Verify VN30 minute data fetching and storage.
"""
import logging
from services.data_fetcher import VNStockDataFetcher
from services.data_storage import MarketDataStorage

logging.basicConfig(level=logging.INFO)

print("1. Fetching Market Overview (includes VN30 intraday)...")
fetcher = VNStockDataFetcher()
overview = fetcher.fetch_market_overview()

if overview and 'stocks' in overview:
    vn30_stock = next((s for s in overview['stocks'] if s['symbol'] == 'VN30'), None)
    if vn30_stock:
        print(f"✓ Found VN30 in stocks list")
        print(f"  - Prices count: {len(vn30_stock.get('prices', []))}")
        if vn30_stock.get('prices'):
            print(f"  - First: {vn30_stock['prices'][0]}")
            print(f"  - Last: {vn30_stock['prices'][-1]}")
            
            # Test saving
            print("\n2. Saving to MongoDB...")
            storage = MarketDataStorage()
            # We only save the VN30 stock entry for this test
            success = storage.save_stock_data([vn30_stock], vn30_stock['date'])
            
            if success:
                print("✓ Saved VN30 to stock_data collection")
                
                # Verify retrieval
                print("\n3. Retrieving from MongoDB...")
                retrieved = storage.get_stock_data('VN30', vn30_stock['date'])
                if retrieved:
                    print(f"✓ Retrieved VN30 from MongoDB")
                    print(f"  - Prices count: {len(retrieved.get('prices', []))}")
                else:
                    print("✗ Failed to retrieve VN30")
            else:
                print("✗ Failed to save VN30")
    else:
        print("✗ VN30 not found in stocks list")
else:
    print("✗ Failed to fetch market overview")

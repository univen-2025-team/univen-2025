"""
Check if VN30 exists in stock_data collection.
"""
import logging
from dotenv import load_dotenv
import os
from services.data_storage import MarketDataStorage

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)

storage = MarketDataStorage()
if storage.market_collection is None:
    print("MongoDB not connected")
    exit(1)

print("Checking for VN30 in stock_data...")
# Query for VN30
vn30 = storage.stock_collection.find_one({'symbol': 'VN30'})

if vn30:
    print(f"✓ Found VN30 in stock_data")
    print(f"  Date: {vn30.get('date')}")
    print(f"  Prices count: {len(vn30.get('prices', []))}")
else:
    print("✗ VN30 NOT found in stock_data")

# List all symbols to be sure
print("\nListing all symbols in stock_data:")
symbols = storage.stock_collection.distinct('symbol')
print(symbols)

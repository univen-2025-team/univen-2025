"""
Test fetching VN30 index intraday data using the existing fetch_intraday_data method.
"""
import logging
from services.data_fetcher import VNStockDataFetcher

logging.basicConfig(level=logging.INFO)

fetcher = VNStockDataFetcher()

print("Fetching VN30 intraday data...")
# Try fetching with symbol 'VN30'
data = fetcher.fetch_intraday_data('VN30')

if data:
    print(f"✓ Success! Fetched {len(data)} items")
    print(f"First item: {data[0]}")
    print(f"Last item: {data[-1]}")
else:
    print("✗ Failed to fetch VN30 data")

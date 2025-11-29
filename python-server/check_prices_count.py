"""
Check prices array lengths across all stocks in MongoDB.
"""
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(message)s')

from services.data_storage import MarketDataStorage

storage = MarketDataStorage()

# Get latest date's data
date = '2025-11-28'
stocks = storage.get_all_stocks_by_date(date)

print(f"\nChecking prices array for {len(stocks)} stocks on {date}:\n")
print(f"{'Symbol':<10} {'Prices Count':<15} {'First Time':<20} {'Last Time'}")
print("-" * 70)

for stock in stocks:
    symbol = stock['symbol']
    prices = stock.get('prices', [])
    count = len(prices)
    first_time = prices[0]['time'] if prices else 'N/A'
    last_time = prices[-1]['time'] if prices else 'N/A'
    
    print(f"{symbol:<10} {count:<15} {first_time:<20} {last_time}")

# Summary
counts = [len(stock.get('prices', [])) for stock in stocks]
if counts:
    print("\n" + "=" * 70)
    print(f"Min: {min(counts)}, Max: {max(counts)}, Avg: {sum(counts)/len(counts):.1f}")
    print(f"All same count? {len(set(counts)) == 1}")

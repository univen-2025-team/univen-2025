
import sys
import os
from datetime import datetime, timedelta
from src.database.mongodb import db
from src.services.fetchers.stock_news import StockNewsFetcher

if __name__ == "__main__":
    db.connect()
    collection = db.get_database()["stock_news"]
    
    symbols = ['MARKET', 'SSI']
    for symbol in symbols:
        print(f"Fetching manually for {symbol}...")
        fetcher = StockNewsFetcher(symbol)
        
        # We need to simulate 'missing_dates' logic.
        # Just ask for today/tomorrow simulation dates.
        # e.g. 2026-01-19
        missing_dates = ['2026-01-19', '2026-01-18', '2026-01-20'] 
        
        data = fetcher.fetch_smart(missing_dates)
        
        count = 0
        for date_str, news_items in data.items():
            if not news_items:
                continue
                
            # Upsert
            doc = {
                'symbol': symbol,
                'date': date_str,
            }
            update = {
                '$set': {
                    'symbol': symbol,
                    'date': date_str,
                    'has_news': True,
                    'news': news_items,
                    'last_updated': datetime.utcnow()
                }
            }
            collection.update_one(doc, update, upsert=True)
            count += len(news_items)
            
        print(f"[{symbol}] Inserted/Updated {count} news items.")

    print("Done.")

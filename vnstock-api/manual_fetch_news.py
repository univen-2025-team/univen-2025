
import sys
import os
from datetime import datetime, timedelta
from src.database.mongodb import db
from src.services.fetchers.stock_news import StockNewsFetcher

if __name__ == "__main__":
    db.connect()
    collection = db.get_database()["stock_news"]
    
    symbols = ['MARKET', 'SSI', 'FPT']
    for symbol in symbols:
        print(f"Fetching manually for {symbol}...")
        fetcher = StockNewsFetcher(symbol)
        
        # We need to simulate 'missing_dates' logic.
        # Ask for last 30 days to ensure we update everything
        today = datetime.strptime('2026-01-19', '%Y-%m-%d').date()
        missing_dates = [(today - timedelta(days=i)).strftime('%Y-%m-%d') for i in range(30)]
        # Add future dates just in case
        missing_dates.append('2026-01-20') 
        
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

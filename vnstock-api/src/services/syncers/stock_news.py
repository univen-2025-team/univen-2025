
from src.database.mongodb import db
from datetime import datetime

class StockNewsSyncer:
    def __init__(self):
        self.collection = db.get_database()["stock_news"]

    def bulk_sync(self, symbol, grouped_data):
        """
        Syncs grouped news data to MongoDB.
        
        Args:
            symbol (str): Stock symbol.
            grouped_data (dict): {'YYYY-MM-DD': [news_items...]}
        """
        if not grouped_data:
            return

        operations = []
        
        for date_str, news_list in grouped_data.items():
            # Construct document payload
            # Map API fields to Schema fields if necessary
            mapped_news = []
            for item in news_list:
                mapped_news.append({
                    'id': str(item.get('id', '')),
                    'title': item.get('title', ''),
                    'short_content': item.get('short_content', '') or item.get('summary', ''),
                    'full_content': item.get('full_content', '') or item.get('content', ''),
                    'source_link': item.get('source_link', '') or item.get('url', ''),
                    'image_url': item.get('image_url', '') or item.get('thumbnail', ''),
                    'public_date': str(item.get('public_date', '') or item.get('date', '') or item.get('time', '')),
                    'price_change_pct': float(item.get('price_change_pct', 0) or 0)
                })

            doc = {
                'symbol': symbol.upper(),
                'date': date_str,
                'news': mapped_news,
                'has_news': len(mapped_news) > 0,
                'updated_at': datetime.utcnow()
            }
            
            # Upsert operation
            # Using update_one with upsert=True
            from pymongo import UpdateOne
            operations.append(
                UpdateOne(
                    {'symbol': symbol.upper(), 'date': date_str},
                    {'$set': doc},
                    upsert=True
                )
            )

        if operations:
            try:
                result = self.collection.bulk_write(operations)
                print(f"[StockNewsSyncer] Synced {symbol}: {result.upserted_count} inserted, {result.modified_count} updated.")
                return True
            except Exception as e:
                print(f"[StockNewsSyncer] Bulk sync error: {e}")
                return False
        return True

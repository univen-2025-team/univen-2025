from src.database.mongodb import db
from src.models.stock_history import StockHistoryDTO, PriceBar
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from pymongo import UpdateOne

class StockHistorySyncer:
    """
    Syncer for stock price history data to MongoDB.
    New format: one document per symbol+date+interval with prices array.
    """
    
    def __init__(self):
        self.collection_name = "stock_history"
    
    def sync(self, data: Dict[str, Any]) -> bool:
        """
        Sync daily price data to MongoDB using upsert.
        
        Args:
            data: Dictionary with { symbol, date, interval, prices: [...] }
            
        Returns:
            True if synced successfully, False otherwise.
        """
        if not data or not data.get('prices'):
            return False
            
        try:
            collection = db.get_database()[self.collection_name]
            
            # Prepare document
            doc = {
                'symbol': data['symbol'].upper(),
                'date': data['date'],
                'interval': data['interval'],
                'prices': data['prices'],
                'updated_at': datetime.now(timezone.utc)
            }
            
            # Upsert based on symbol + date + interval
            result = collection.update_one(
                {
                    'symbol': doc['symbol'],
                    'date': doc['date'],
                    'interval': doc['interval']
                },
                {'$set': doc},
                upsert=True
            )
            
            synced = result.upserted_id is not None or result.modified_count > 0
            if synced:
                print(f"Synced {len(data['prices'])} price bars for {data['symbol']} on {data['date']}")
            return synced
            
        except Exception as e:
            print(f"Error syncing stock history: {e}")
            return False
    
    def get_by_date(self, symbol: str, date: str, interval: str = "1m") -> Optional[Dict[str, Any]]:
        """
        Get price data for a specific symbol and date.
        
        Args:
            symbol: Stock ticker symbol
            date: Date in 'YYYY-MM-DD' format
            interval: Time interval
            
        Returns:
            Document with prices array, or None if not found.
        """
        try:
            collection = db.get_database()[self.collection_name]
            
            doc = collection.find_one(
                {
                    'symbol': symbol.upper(),
                    'date': date,
                    'interval': interval
                },
                {'_id': 0}
            )
            
            return doc
            
        except Exception as e:
            print(f"Error getting history for {symbol} on {date}: {e}")
            return None
    
    def get_latest_available(self, symbol: str, target_date: str = None, interval: str = "1m") -> Optional[Dict[str, Any]]:
        """
        Get data for target date, or the closest previous date if not available.
        
        Args:
            symbol: Stock ticker symbol
            target_date: Target date in 'YYYY-MM-DD' format. Defaults to today.
            interval: Time interval
            
        Returns:
            Document with prices array from the closest available date.
        """
        try:
            collection = db.get_database()[self.collection_name]
            
            if not target_date:
                target_date = datetime.now().strftime('%Y-%m-%d')
            
            # First try exact date
            doc = self.get_by_date(symbol, target_date, interval)
            if doc:
                return doc
            
            # Fallback: get the most recent date before target_date
            cursor = collection.find(
                {
                    'symbol': symbol.upper(),
                    'interval': interval,
                    'date': {'$lt': target_date}
                },
                {'_id': 0}
            ).sort('date', -1).limit(1)
            
            results = list(cursor)
            if results:
                print(f"Using fallback data from {results[0]['date']} for {symbol}")
                return results[0]
            
            return None
            
        except Exception as e:
            print(f"Error getting latest available for {symbol}: {e}")
            return None
    
    def get_price_at_time(self, symbol: str, target_time: str, target_date: str = None, interval: str = "1m") -> Optional[Dict[str, Any]]:
        """
        Get the price bar at a specific time, with fallback to previous day if needed.
        
        Args:
            symbol: Stock ticker symbol
            target_time: Time in 'HH:MM' or 'HH:MM:SS' format
            target_date: Target date in 'YYYY-MM-DD' format. Defaults to today.
            interval: Time interval
            
        Returns:
            Single price bar matching the time, or None if not found.
        """
        try:
            if not target_date:
                target_date = datetime.now().strftime('%Y-%m-%d')
            
            # Get data (with fallback)
            data = self.get_latest_available(symbol, target_date, interval)
            if not data or not data.get('prices'):
                return None
            
            # Find matching time
            target_hm = target_time[:5]  # Get HH:MM
            for price_bar in data['prices']:
                if price_bar['time'][:5] == target_hm:
                    return {
                        'symbol': data['symbol'],
                        'date': data['date'],
                        **price_bar
                    }
            
            # If exact time not found, return the closest earlier time
            for price_bar in reversed(data['prices']):
                if price_bar['time'][:5] <= target_hm:
                    return {
                        'symbol': data['symbol'],
                        'date': data['date'],
                        **price_bar
                    }
            
            return None
            
        except Exception as e:
            print(f"Error getting price at time for {symbol}: {e}")
            return None
    
    def has_data_for_date(self, symbol: str, date: str, interval: str = "1m") -> bool:
        """Check if we have data for a specific symbol and date."""
        return self.get_by_date(symbol, date, interval) is not None
    
    def ensure_symbol_exists(self, symbol: str) -> bool:
        """
        Ensure a stock symbol has at least one record in the database.
        If not, try to fetch and create it.
        
        Args:
            symbol: Stock ticker symbol
            
        Returns:
            True if data exists or was created, False otherwise.
        """
        try:
            collection = db.get_database()[self.collection_name]
            
            # Check if any record exists for this symbol
            exists = collection.count_documents({'symbol': symbol.upper()}, limit=1) > 0
            
            if exists:
                return True
            
            print(f"No data for {symbol}, will be fetched on first request")
            return False
            
        except Exception as e:
            print(f"Error checking symbol {symbol}: {e}")
            return False

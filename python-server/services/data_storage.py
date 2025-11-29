"""
MongoDB Data Storage Service
Stores and retrieves cached market data in MongoDB.
"""

import logging
from datetime import datetime
from typing import Dict, List, Optional
from db import MongoDB

logger = logging.getLogger(__name__)


class MarketDataStorage:
    """Store and retrieve market data from MongoDB."""

    def __init__(self):
        """Initialize storage service with MongoDB connection."""
        self.mongodb = MongoDB.get_instance()
        
        # Ensure MongoDB is connected
        if not self.mongodb.is_connected():
            self.mongodb.connect()
        
        self.db = self.mongodb.get_db()
        
        if self.db is not None:
            self.market_collection = self.db['market_data']
            self.stock_collection = self.db['stock_data']
            self._ensure_indexes()
        else:
            logger.error("MongoDB not connected, storage service unavailable")
            self.market_collection = None
            self.stock_collection = None

    def _ensure_indexes(self):
        """Create indexes for better query performance."""
        try:
            # Index for market_data collection
            self.market_collection.create_index('date', unique=True)
            self.market_collection.create_index('timestamp')
            
            # Composite index for stock_data collection
            self.stock_collection.create_index([('symbol', 1), ('date', 1)], unique=True)
            self.stock_collection.create_index('date')
            
            logger.info("MongoDB indexes created successfully")
        except Exception as e:
            logger.error(f"Error creating indexes: {str(e)}")

    def save_market_overview(self, market_data: Dict, date: str) -> bool:
        """
        Save market overview data to MongoDB.
        
        Args:
            market_data: Complete market data dictionary
            date: Date in format 'YYYY-MM-DD'
            
        Returns:
            True if successful, False otherwise
        """
        if self.market_collection is None:
            logger.warning("Market collection not available")
            return False
            
        try:
            document = {
                'date': date,
                'timestamp': datetime.now(),
                'vn30Index': market_data.get('vn30Index'),
                'topGainers': market_data.get('topGainers', []),
                'topLosers': market_data.get('topLosers', []),
                'totalStocks': market_data.get('totalStocks', 0),
                'metadata': {
                    'source': 'vnstock3-TCBS',
                    'fetchedAt': datetime.now(),
                }
            }
            
            # Upsert: update if exists, insert if not
            self.market_collection.update_one(
                {'date': date},
                {'$set': document},
                upsert=True
            )
            
            logger.info(f"Market overview saved for {date}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving market overview: {str(e)}")
            return False

    def save_stock_data(self, stocks: List[Dict], date: str) -> bool:
        """
        Save stock data to MongoDB (batch insert).
        
        Args:
            stocks: List of stock data dictionaries
            date: Date in format 'YYYY-MM-DD'
            
        Returns:
            True if successful, False otherwise
        """
        if self.stock_collection is None:
            logger.warning("Stock collection not available")
            return False
            
        try:
            documents = []
            
            for stock in stocks:
                doc = {
                    'symbol': stock['symbol'],
                    'date': date,
                    'companyName': stock.get('companyName', ''),
                    'price': stock.get('price', 0),
                    'prices': stock.get('prices', []), # Save the prices array
                    'change': stock.get('change', 0),
                    'changePercent': stock.get('changePercent', 0),
                    'volume': stock.get('volume', 0),
                    'high': stock.get('high', 0),
                    'low': stock.get('low', 0),
                    'open': stock.get('open', 0),
                    'close': stock.get('close', 0),
                    'previousClose': stock.get('previousClose', 0),
                    'metadata': {
                        'fetchedAt': datetime.now(),
                    }
                }
                documents.append(doc)
            
            if documents:
                # Bulk write with upsert
                from pymongo import UpdateOne
                
                operations = [
                    UpdateOne(
                        {'symbol': doc['symbol'], 'date': doc['date']},
                        {'$set': doc},
                        upsert=True
                    )
                    for doc in documents
                ]
                
                result = self.stock_collection.bulk_write(operations)
                logger.info(f"Saved {len(documents)} stocks for {date} (modified: {result.modified_count}, inserted: {result.upserted_count})")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error saving stock data: {str(e)}")
            return False

    def get_latest_market_data(self) -> Optional[Dict]:
        """
        Get the most recent market overview data.
        
        Returns:
            Market data dictionary or None
        """
        if self.market_collection is None:
            logger.warning("Market collection not available")
            return None
            
        try:
            result = self.market_collection.find_one(
                {},
                sort=[('date', -1)]
            )
            
            if result:
                result.pop('_id', None)  # Remove MongoDB ID
                return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting latest market data: {str(e)}")
            return None

    def get_market_data_by_date(self, date: str) -> Optional[Dict]:
        """
        Get market overview data for a specific date.
        
        Args:
            date: Date in format 'YYYY-MM-DD'
            
        Returns:
            Market data dictionary or None
        """
        if self.market_collection is None:
            logger.warning("Market collection not available")
            return None
            
        try:
            result = self.market_collection.find_one({'date': date})
            
            if result:
                result.pop('_id', None)
                return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting market data for {date}: {str(e)}")
            return None

    def get_stock_data(self, symbol: str, date: str) -> Optional[Dict]:
        """
        Get stock data for a specific symbol and date.
        
        Args:
            symbol: Stock symbol
            date: Date in format 'YYYY-MM-DD'
            
        Returns:
            Stock data dictionary or None
        """
        if self.stock_collection is None:
            logger.warning("Stock collection not available")
            return None
            
        try:
            result = self.stock_collection.find_one({
                'symbol': symbol.upper(),
                'date': date
            })
            
            if result:
                result.pop('_id', None)
                return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting stock data for {symbol} on {date}: {str(e)}")
            return None

    def get_all_stocks_by_date(self, date: str) -> List[Dict]:
        """
        Get all stock data for a specific date.
        
        Args:
            date: Date in format 'YYYY-MM-DD'
            
        Returns:
            List of stock data dictionaries
        """
        if self.stock_collection is None:
            logger.warning("Stock collection not available")
            return []
            
        try:
            results = list(self.stock_collection.find({'date': date}))
            
            # Remove MongoDB IDs
            for result in results:
                result.pop('_id', None)
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting all stocks for {date}: {str(e)}")
            return []

    def get_available_dates(self, limit: int = 30) -> List[str]:
        """
        Get list of available cached dates.
        
        Args:
            limit: Maximum number of dates to return
            
        Returns:
            List of date strings
        """
        if self.market_collection is None:
            logger.warning("Market collection not available")
            return []
            
        try:
            results = self.market_collection.find(
                {},
                {'date': 1, '_id': 0}
            ).sort('date', -1).limit(limit)
            
            return [r['date'] for r in results]
            
        except Exception as e:
            logger.error(f"Error getting available dates: {str(e)}")
            return []

    def delete_old_data(self, days_to_keep: int = 30) -> bool:
        """
        Delete data older than specified days.
        
        Args:
            days_to_keep: Number of days of data to retain
            
        Returns:
            True if successful
        """
        if self.market_collection is None or self.stock_collection is None:
            logger.warning("Collections not available for cleanup")
            return False
            
        try:
            from datetime import timedelta
            
            cutoff_date = (datetime.now() - timedelta(days=days_to_keep)).strftime('%Y-%m-%d')
            
            market_result = self.market_collection.delete_many({'date': {'$lt': cutoff_date}})
            stock_result = self.stock_collection.delete_many({'date': {'$lt': cutoff_date}})
            
            logger.info(f"Deleted old data: {market_result.deleted_count} market records, {stock_result.deleted_count} stock records")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting old data: {str(e)}")
            return False

    def save_intraday_data(self, symbol: str, data: List[Dict]) -> bool:
        """
        Save intraday data to MongoDB.
        
        Args:
            symbol: Stock symbol
            data: List of intraday data points
            
        Returns:
            True if successful
        """
        if self.db is None:
            logger.warning("Database not available")
            return False
            
        try:
            collection = self.db['market_intraday']
            
            # Create index if not exists
            collection.create_index([('symbol', 1), ('time', 1)], unique=True)
            
            from pymongo import UpdateOne
            
            operations = []
            for point in data:
                operations.append(
                    UpdateOne(
                        {'symbol': symbol, 'time': point['time']},
                        {'$set': {
                            'symbol': symbol,
                            'time': point['time'],
                            'open': point['open'],
                            'high': point['high'],
                            'low': point['low'],
                            'close': point['close'],
                            'volume': point['volume'],
                            'updatedAt': datetime.now()
                        }},
                        upsert=True
                    )
                )
            
            if operations:
                result = collection.bulk_write(operations)
                logger.info(f"Saved {len(operations)} intraday points for {symbol}")
                return True
                
            return False
            
        except Exception as e:
            logger.error(f"Error saving intraday data for {symbol}: {str(e)}")
            return False

    def get_intraday_data(self, symbol: str, limit: int = 100) -> List[Dict]:
        """
        Get intraday data for a symbol.
        
        Args:
            symbol: Stock symbol
            limit: Number of points to return
            
        Returns:
            List of intraday data points
        """
        if self.db is None:
            return []
            
        try:
            collection = self.db['market_intraday']
            
            results = collection.find(
                {'symbol': symbol},
                {'_id': 0}
            ).sort('time', 1).limit(limit) # Sort ascending for chart
            
            # If we want the LATEST 'limit' points, we should sort desc, limit, then reverse
            # But usually for charts we want a specific range. 
            # For now let's get the latest 'limit' points
            
            results = collection.find(
                {'symbol': symbol},
                {'_id': 0}
            ).sort('time', -1).limit(limit)
            
            data = list(results)
            data.reverse() # Return in chronological order
            
            return data
            
        except Exception as e:
            logger.error(f"Error getting intraday data for {symbol}: {str(e)}")
            return []

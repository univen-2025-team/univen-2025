import logging
from datetime import datetime
from src.database.mongodb import db
from typing import Dict, List, Optional

class MarketStatsGenerator:
    """
    Generates market statistics (VN30 Index, Top Gainers/Losers)
    from cached stock_history data and saves to market_data collection.
    """
    
    def __init__(self):
        self.db = db.get_database()
        self.stock_collection = self.db['stock_history']
        self.market_collection = self.db['market_data']

    def generate_latest_stats(self) -> bool:
        """
        Finds the latest date in stock_history and generates stats for it.
        """
        try:
            # 1. Find latest date
            latest_doc = self.stock_collection.find_one({}, sort=[('date', -1)])
            if not latest_doc:
                logging.warning("[MarketStats] No stock history found to generate stats.")
                return False
                
            latest_date = latest_doc['date']
            logging.info(f"[MarketStats] Generating stats for latest date: {latest_date}")
            
            return self.generate_stats_for_date(latest_date)
            
        except Exception as e:
            logging.error(f"[MarketStats] Error generating latest stats: {e}")
            return False

    def generate_stats_for_date(self, date: str) -> bool:
        """
        Aggregates data for a specific date and saves to market_data.
        """
        try:
            # 2. Fetch all stocks for this date
            cursor = self.stock_collection.find({'date': date, 'interval': '1m'})
            stocks = list(cursor)
            
            if not stocks:
                logging.warning(f"[MarketStats] No stocks found for date {date}")
                return False
                
            vn30_index = None
            stock_stats = []
            
            for doc in stocks:
                symbol = doc['symbol']
                prices = doc.get('prices', [])
                
                if not prices:
                    continue
                    
                first_bar = prices[0]
                last_bar = prices[-1]
                
                open_price = float(first_bar.get('open', 0))
                close_price = float(last_bar.get('close', 0))
                
                # Handling for division by zero
                change = close_price - open_price
                change_percent = (change / open_price * 100) if open_price > 0 else 0.0
                
                high = max(p.get('high', 0) for p in prices)
                low = min(p.get('low', 0) for p in prices)
                volume = sum(p.get('volume', 0) for p in prices)
                
                stats = {
                    'symbol': symbol,
                    'date': date,
                    'price': close_price,
                    'change': round(change, 2),
                    'changePercent': round(change_percent, 2),
                    'volume': volume,
                    'high': high,
                    'low': low,
                    'open': open_price,
                    'close': close_price
                }
                
                if symbol == 'VN30':
                    vn30_index = {
                        'index': close_price,
                        'change': round(change, 2),
                        'changePercent': round(change_percent, 2)
                    }
                else:
                    stock_stats.append(stats)
            
            # 3. Calculate Top Gainers/Losers
            # Filter out stocks with no volume or 0 price if necessary? 
            # Usually better to keep them but maybe filter 0 volume if required.
            
            # Sort by changePercent desc
            stock_stats.sort(key=lambda x: x['changePercent'], reverse=True)
            
            top_gainers = stock_stats[:5]
            top_losers = sorted(stock_stats, key=lambda x: x['changePercent'])[:5]
            
            # 4. Construct Market Data Document
            # If VN30 is missing from history, we can't report it properly, but we save what we have.
            if not vn30_index:
                 logging.warning(f"[MarketStats] VN30 index missing for {date}")
                 # Dummy default
                 vn30_index = {'index': 0, 'change': 0, 'changePercent': 0}

            market_doc = {
                'date': date,
                'timestamp': datetime.now(),
                'vn30Index': vn30_index,
                'topGainers': top_gainers,
                'topLosers': top_losers,
                'totalStocks': len(stock_stats),
                'metadata': {
                    'source': 'vnstock-api-aggregator',
                    'generatedAt': datetime.now()
                }
            }
            
            # 5. Save to MongoDB
            self.market_collection.update_one(
                {'date': date},
                {'$set': market_doc},
                upsert=True
            )
            
            logging.info(f"[MarketStats] Successfully saved market data for {date}. Total Stocks: {len(stock_stats)}")
            return True

        except Exception as e:
            logging.error(f"[MarketStats] Error generating stats for {date}: {e}")
            return False

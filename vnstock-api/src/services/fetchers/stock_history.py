from src.services.fetchers.base import BaseFetcher
from vnstock import Vnstock
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

class StockHistoryFetcher(BaseFetcher):
    """
    Fetcher for stock price history (OHLCV data) from vnstock.
    Supports various intervals: 1m, 5m, 15m, 30m, 1H, 1D, 1W, 1M
    
    Returns data in daily format: { date, symbol, interval, prices: [...] }
    """
    
    def __init__(self, symbol: str, interval: str = "1m"):
        """
        Initialize the fetcher.
        
        Args:
            symbol: Stock ticker symbol (e.g., 'VNM', 'ACB')
            interval: Time interval for price bars. Options:
                     1m (1 minute), 5m, 15m, 30m, 1H (1 hour)
        """
        self.symbol = symbol.upper()
        self.interval = interval
    
    def fetch(self, date: str = None) -> Optional[Dict[str, Any]]:
        """
        Fetch historical price data for a specific date.
        
        Args:
            date: Date in 'YYYY-MM-DD' format. Defaults to today.
            
        Returns:
            Dictionary with { symbol, date, interval, prices: [...] } or None if no data.
        """
        try:
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            
            # Initialize vnstock
            stock = Vnstock().stock(symbol=self.symbol, source='VCI')
            
            # Fetch history for the date
            df = stock.quote.history(
                start=date,
                end=date,
                interval=self.interval
            )
            
            if df is None or df.empty:
                print(f"No data for {self.symbol} on {date} ({self.interval}) - likely weekend/holiday")
                return None
            
            # Convert DataFrame to price bars array
            prices = []
            for _, row in df.iterrows():
                time_str = row['time']
                # Extract time portion (HH:MM:SS)
                if hasattr(time_str, 'strftime'):
                    time_str = time_str.strftime('%H:%M:%S')
                else:
                    time_str = str(time_str).split('T')[-1][:8] if 'T' in str(time_str) else str(time_str)[-8:]
                
                price_bar = {
                    'time': time_str,
                    'open': float(row['open']),
                    'high': float(row['high']),
                    'low': float(row['low']),
                    'close': float(row['close']),
                    'volume': int(row['volume'])
                }
                prices.append(price_bar)
            
            if not prices:
                print(f"No price bars for {self.symbol} on {date}")
                return None
            
            result = {
                'symbol': self.symbol,
                'date': date,
                'interval': self.interval,
                'prices': prices
            }
            
            print(f"Fetched {len(prices)} price bars for {self.symbol} on {date} ({self.interval})")
            return result
            
        except Exception as e:
            print(f"Error fetching history for {self.symbol}: {e}")
            return None
    
    def fetch_latest_available(self, target_date: str = None, max_lookback_days: int = 7) -> Optional[Dict[str, Any]]:
        """
        Fetch data for target date, or fallback to the most recent trading day.
        Useful for weekends/holidays.
        
        Args:
            target_date: Target date in 'YYYY-MM-DD' format. Defaults to today.
            max_lookback_days: Maximum days to look back for data.
            
        Returns:
            Dictionary with { symbol, date, interval, prices: [...] } from closest trading day.
        """
        if not target_date:
            target_date = datetime.now().strftime('%Y-%m-%d')
        
        # Try the target date first
        result = self.fetch(target_date)
        if result:
            return result
        
        # Fallback to previous days
        for i in range(1, max_lookback_days + 1):
            fallback_date = (datetime.strptime(target_date, '%Y-%m-%d') - timedelta(days=i)).strftime('%Y-%m-%d')
            print(f"Trying fallback date: {fallback_date}")
            result = self.fetch(fallback_date)
            if result:
                print(f"Using data from {fallback_date} as fallback for {target_date}")
                return result
        
        print(f"No data found for {self.symbol} within {max_lookback_days} days")
        return None

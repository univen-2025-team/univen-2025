from src.services.fetchers.base import BaseFetcher
from src.core.vnstock_client import VnstockClient, RateLimitError
from vnstock import Vnstock
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import pandas as pd

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
            interval: Time interval for price bars.
        """
        self.symbol = symbol.upper()
        self.interval = interval
        self.client = VnstockClient.get_instance()
    
    def fetch(self, date: str = None) -> Optional[Dict[str, Any]]:
        """
        Fetch historical price data for a specific date.
        """
        try:
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            
            # Fetch using wrapped client
            def fetch_history():
                 stock = Vnstock().stock(symbol=self.symbol, source='VCI')
                 return stock.quote.history(start=date, end=date, interval=self.interval)

            df = self.client.call(fetch_history)
            
            
            if df is None:
                 print(f"No data for {self.symbol} on {date} (Result is None)")
                 return None

            if not isinstance(df, pd.DataFrame):
                print(f"Invalid data type for {self.symbol}: Expected DataFrame, got {type(df)}")
                return None
            
            if df.empty:
                print(f"No data for {self.symbol} on {date} ({self.interval}) - DataFrame is empty")
                return None
            
            # Validate columns
            required_cols = ['time', 'open', 'high', 'low', 'close', 'volume']
            missing_cols = [col for col in required_cols if col not in df.columns]
            if missing_cols:
                print(f"Missing columns in history data for {self.symbol}: {missing_cols}")
                return None

            # Ensure 'time' is datetime
            if not pd.api.types.is_datetime64_any_dtype(df['time']):
                try:
                    df['time'] = pd.to_datetime(df['time'])
                except Exception as e:
                    print(f"Error converting 'time' column to datetime: {e}")
                    return None

            # IMPORTANT: vnstock may return data spanning multiple days
            # Filter to only include data from the target date
            df['date_str'] = df['time'].dt.strftime('%Y-%m-%d')
            df = df[df['date_str'] == date]
            
            if df.empty:
                print(f"No data for {self.symbol} on {date} after filtering ({self.interval})")
                return None
            
            # Convert DataFrame to price bars array
            prices = []
            for _, row in df.iterrows():
                time_str = row['time'].strftime('%H:%M:%S')
                
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
            
            # Determine unit
            unit = "INDEX" if self.symbol in ['VN30', 'VNINDEX'] else "VND"
            
            result = {
                'symbol': self.symbol,
                'date': date,
                'interval': self.interval,
                'unit': unit,
                'prices': prices
            }
            
            print(f"Fetched {len(prices)} price bars for {self.symbol} on {date} ({self.interval})")
            return result

        except RateLimitError:
            raise # Re-raise to let Worker handle re-queue
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

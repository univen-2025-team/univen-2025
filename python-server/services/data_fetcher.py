"""
VNStock Data Fetcher Service
Fetches market data from vnstock3 API for caching purposes.
"""

import os
import sys
import logging
import pathlib
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# ============================================================
# NOTE: vnai initialization is handled by app.py or checks below.
# We do NOT run _init_vnai() here to avoid circular imports and duplication.
# ============================================================

logger = logging.getLogger(__name__)

# VN30 stock symbols
VN30_SYMBOLS = [
    'ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
    'KDH', 'MBB', 'MSN', 'MWG', 'NVL', 'PDR', 'PLX', 'POW', 'SAB', 'SSI',
    'STB', 'TCB', 'TPB', 'VCB', 'VHM', 'VIB', 'VIC', 'VJC', 'VNM', 'VPB'
]

# Company names mapping
COMPANY_NAMES = {
    'ACB': 'Ngân hàng TMCP Á Châu',
    'BCM': 'Tổng Công ty Đầu tư và Phát triển Công nghiệp',
    'BID': 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    'BVH': 'Tập đoàn Bảo Việt',
    'CTG': 'Ngân hàng TMCP Công thương Việt Nam',
    'FPT': 'Tổng Công ty Cổ phần FPT',
    'GAS': 'Tổng Công ty Khí Việt Nam',
    'GVR': 'Tập đoàn Công nghiệp Cao su Việt Nam',
    'HDB': 'Ngân hàng TMCP Phát triển TP.HCM',
    'HPG': 'Tổng Công ty Cổ phần Tập đoàn Hòa Phát',
    'KDH': 'Công ty Cổ phần Đầu tư và Kinh doanh Nhà Khang Điền',
    'MBB': 'Ngân hàng TMCP Quân đội',
    'MSN': 'Tổng Công ty Cổ phần Dịch vụ Số Viettel',
    'MWG': 'Công ty Cổ phần Đầu tư Thế Giới Di Động',
    'NVL': 'Công ty Cổ phần Tập đoàn Đầu tư Địa ốc No Va',
    'PDR': 'Công ty Cổ phần Phát triển Bất động sản Phát Đạt',
    'PLX': 'Tập đoàn Xăng dầu Việt Nam',
    'POW': 'Tổng Công ty Điện lực Dầu khí Việt Nam',
    'SAB': 'Tổng Công ty Cổ phần Bia - Rượu - Nước giải khát Sài Gòn',
    'SSI': 'Công ty Cổ phần Chứng khoán SSI',
    'STB': 'Ngân hàng TMCP Sài Gòn Thương Tín',
    'TCB': 'Ngân hàng TMCP Kỹ thương Việt Nam',
    'TPB': 'Ngân hàng TMCP Tiên Phong',
    'VCB': 'Ngân hàng TMCP Ngoại thương Việt Nam',
    'VHM': 'Công ty Cổ phần Vinhomes',
    'VIB': 'Ngân hàng TMCP Quốc tế',
    'VIC': 'Tập đoàn Vingroup',
    'VJC': 'Công ty Cổ phần Hàng không Vietjet',
    'VNM': 'Công ty Cổ phần Sữa Việt Nam',
    'VPB': 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
}

# Price multiplier: vnstock API returns prices in thousands VND (e.g. 107 = 107,000 VND)
# Multiply by 1000 to get actual VND values
# NOTE: Do NOT apply to VN30 index - it's measured in points, not price
PRICE_MULTIPLIER = 1000


class VNStockDataFetcher:
    """Fetch market data from vnstock3 API."""

    def __init__(self, source: str = 'VCI'):
        """Initialize data fetcher with source."""
        self.source = source

    def fetch_stock_data(self, symbol: str) -> Optional[Dict]:
        """
        Fetch latest available stock data for a specific symbol.
        
        Args:
            symbol: Stock symbol (e.g., 'VCB')
            
        Returns:
            Dict with stock data or None if failed
        """
        try:
            from vnstock import Vnstock
            
            stock = Vnstock().stock(symbol=symbol, source=self.source)
            
            # Fetch recent data (last 10 days to ensure we get latest)
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d')
            
            quote = stock.quote.history(symbol=symbol, start=start_date, end=end_date)
            
            if quote is None or len(quote) == 0:
                logger.warning(f"No data found for {symbol}")
                return None
            
            # Get the most recent data (last row)
            latest = quote.iloc[-1]
            actual_date = latest['time'].strftime('%Y-%m-%d')
            
            # Get previous close for change calculation
            if len(quote) > 1:
                previous = quote.iloc[-2]
                previous_close = float(previous['close'])
            else:
                previous_close = float(latest['open'])
            
            price = float(latest['close'])
            change = price - previous_close
            change_percent = (change / previous_close * 100) if previous_close > 0 else 0
            
            # Fetch intraday tick data for the prices array
            intraday_data = self.fetch_intraday_data(symbol)
            prices = []
            
            if intraday_data:
                # Tick data already has: { time, price, volume }
                # Apply PRICE_MULTIPLIER to price (VCI returns price in thousands VND)
                for item in intraday_data:
                    prices.append({
                        'time': item['time'],
                        'price': round(item['price'] * PRICE_MULTIPLIER, 0),  # Convert to VND
                        'volume': item['volume']
                    })

            # Multiply all price fields by PRICE_MULTIPLIER to convert from thousands VND to actual VND
            return {
                'symbol': symbol,
                'companyName': COMPANY_NAMES.get(symbol, 'Công ty Cổ phần'),
                'price': round(price * PRICE_MULTIPLIER, 0),
                'prices': prices, # Add the prices array (already in VND)
                'change': round(change * PRICE_MULTIPLIER, 0),
                'changePercent': round(change_percent, 2),
                'volume': int(latest['volume']),
                'high': round(float(latest['high']) * PRICE_MULTIPLIER, 0),
                'low': round(float(latest['low']) * PRICE_MULTIPLIER, 0),
                'open': round(float(latest['open']) * PRICE_MULTIPLIER, 0),
                'close': round(price * PRICE_MULTIPLIER, 0),
                'previousClose': round(previous_close * PRICE_MULTIPLIER, 0),
                'date': actual_date,
            }
            
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {str(e)}")
            return None

    def fetch_all_vn30_stocks(self, storage=None) -> List[Dict]:
        """
        Fetch latest data for all VN30 stocks.
        If storage is provided, saves each stock immediately after fetch.
        
        Args:
            storage: Optional MarketDataStorage instance for immediate save
            
        Returns:
            List of stock data dictionaries
        """
        stocks_data = []
        
        import time
        for symbol in VN30_SYMBOLS:
            logger.info(f"Fetching data for {symbol}...")
            stock_data = self.fetch_stock_data(symbol)
            
            if stock_data:
                stocks_data.append(stock_data)
                
                # Save immediately if storage is provided
                if storage:
                    date = stock_data.get('date')
                    if date:
                        storage.save_single_stock(stock_data, date)
            
            # Add delay to avoid rate limiting (vnstock Guest: 20 req/min)
            # Each stock = 2 API calls (history + intraday)
            # 7s delay = ~17 req/min (2 calls * 30 stocks / 3.5 min), safely under 20/min
            time.sleep(7)
        
        logger.info(f"Successfully fetched {len(stocks_data)}/{len(VN30_SYMBOLS)} stocks")
        return stocks_data

    def fetch_vn30_index(self) -> Optional[Dict]:
        """
        Fetch latest VN30 index data.
        
        Returns:
            Dict with VN30 index data or None if failed
        """
        try:
            from vnstock import Vnstock
            
            stock = Vnstock().stock(symbol='VN30', source=self.source)
            
            end_date = datetime.now().strftime('%Y-%m-%d')
            start_date = (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d')
            
            index_data = stock.quote.history(symbol='VN30', start=start_date, end=end_date)
            
            if index_data is None or len(index_data) == 0:
                logger.warning("No VN30 index data found")
                return None
            
            # Get most recent data
            latest = index_data.iloc[-1]
            
            if len(index_data) > 1:
                previous = index_data.iloc[-2]
                previous_value = float(previous['close'])
            else:
                previous_value = float(latest['open'])
            
            index_value = float(latest['close'])
            change = index_value - previous_value
            change_percent = (change / previous_value * 100) if previous_value > 0 else 0
            
            return {
                'index': round(index_value, 2),
                'change': round(change, 2),
                'changePercent': round(change_percent, 2),
            }
            
        except Exception as e:
            logger.error(f"Error fetching VN30 index: {str(e)}")
            return None

    def fetch_vn30_index_intraday(self) -> List[Dict]:
        """
        Fetch VN30 index intraday tick data.
        Tries multiple sources: TCBS, SSI, VCI
        
        Returns:
            List of tick data points: { time, price, volume }
        """
        try:
            from vnstock import Vnstock
            
            sources_to_try = ['TCBS', 'SSI', 'VCI']
            
            for source in sources_to_try:
                try:
                    logger.info(f"Trying to fetch VN30 intraday from {source}...")
                    
                    # VN30 is an index, use appropriate symbol
                    stock = Vnstock().stock(symbol='VN30', source=source)
                    
                    # Try to get intraday data
                    intraday_df = stock.quote.intraday(symbol='VN30', page_size=10000, show_log=False)
                    
                    if intraday_df is not None and len(intraday_df) > 0:
                        logger.info(f"Successfully fetched {len(intraday_df)} VN30 ticks from {source}")
                        
                        # Process the tick data
                        ticks = self._process_tick_data(intraday_df, 'VN30')
                        if ticks:
                            return ticks
                            
                except Exception as e:
                    logger.warning(f"Failed to fetch VN30 intraday from {source}: {str(e)}")
                    continue
            
            logger.warning("Failed to fetch VN30 intraday from all sources")
            return []
            
        except Exception as e:
            logger.error(f"Error fetching VN30 index intraday: {str(e)}")
            return []


    def fetch_market_overview(self, storage=None) -> Optional[Dict]:
        """
        Fetch complete market overview with latest available data.
        
        Args:
            storage: Optional MarketDataStorage instance for immediate save of each stock
        
        Returns:
            Dict with complete market data or None if failed
        """
        try:
            logger.info("Fetching latest market overview...")
            
            # Fetch VN30 index
            vn30_index = self.fetch_vn30_index()
            if not vn30_index:
                logger.error("Failed to fetch VN30 index")
                return None
            
            # Fetch all stocks (will save each immediately if storage provided)
            stocks = self.fetch_all_vn30_stocks(storage=storage)
            if not stocks:
                logger.error("Failed to fetch stock data")
                return None
            
            # Fetch VN30 intraday data (minute data)
            logger.info("Fetching VN30 index intraday data...")
            vn30_intraday = self.fetch_intraday_data('VN30')
            
            if vn30_intraday:
                # Create a pseudo-stock object for VN30 to store in stock_data collection
                # vn30_intraday now has tick format: { time, price, volume }
                date_str = vn30_intraday[0]['time'].split(' ')[0] if vn30_intraday else datetime.now().strftime('%Y-%m-%d')
                
                vn30_stock_data = {
                    'symbol': 'VN30',
                    'date': date_str,
                    'price': vn30_index.get('index'),
                    'change': vn30_index.get('change'),
                    'changePercent': vn30_index.get('changePercent'),
                    'prices': vn30_intraday,  # Raw tick data: { time, price, volume }
                    'volume': sum(item.get('volume', 0) for item in vn30_intraday),
                    # Calculate high/low from tick prices
                    'high': max(item.get('price', 0) for item in vn30_intraday) if vn30_intraday else 0,
                    'low': min(item.get('price', 0) for item in vn30_intraday) if vn30_intraday else 0,
                    'open': vn30_intraday[0].get('price', 0) if vn30_intraday else 0,
                    'close': vn30_intraday[-1].get('price', 0) if vn30_intraday else 0,
                }
                # Append to stocks list so it gets saved to stock_data collection
                stocks.append(vn30_stock_data)
                logger.info(f"Added VN30 index data with {len(vn30_intraday)} tick records")
            else:
                logger.warning("Failed to fetch VN30 intraday data")
            
            # Get actual date from first stock (all should have same date)
            actual_date = stocks[0]['date'] if stocks else datetime.now().strftime('%Y-%m-%d')
            
            # Calculate top gainers and losers (exclude VN30 index)
            stocks_only = [s for s in stocks if s.get('symbol') != 'VN30']
            
            # Top gainers: only stocks with positive change
            gainers = [s for s in stocks_only if s.get('changePercent', 0) > 0]
            gainers_sorted = sorted(gainers, key=lambda x: x['changePercent'], reverse=True)
            top_gainers = gainers_sorted[:5]
            
            # Top losers: only stocks with negative change
            losers = [s for s in stocks_only if s.get('changePercent', 0) < 0]
            losers_sorted = sorted(losers, key=lambda x: x['changePercent'])  # Ascending (most negative first)
            top_losers = losers_sorted[:5]
            
            return {
                'date': actual_date,
                'vn30Index': vn30_index,
                'stocks': stocks,
                'topGainers': top_gainers,
                'topLosers': top_losers,
                'totalStocks': len(stocks),
                'timestamp': datetime.now().isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Error fetching market overview: {str(e)}")
            return None

    def fetch_intraday_data(self, symbol: str, get_previous_day: bool = False) -> List[Dict]:
        """
        Fetch intraday tick data for a specific symbol using VCI source.
        
        Args:
            symbol: Stock symbol or 'VN30'
            get_previous_day: If True, fetch data for the previous trading day instead of the latest.
            
        Returns:
            List of tick data points: { time, price, volume }
        """
        try:
            from vnstock import Vnstock
            import pandas as pd
            from datetime import datetime, timedelta
            
            logger.info(f"Fetching intraday tick data for {symbol} using VCI source...")
            
            # Initialize stock object with VCI source
            stock = Vnstock().stock(symbol=symbol, source=self.source)
            
            # Fetch tick-level intraday data
            # page_size controls how many ticks to retrieve (max ~10000)
            intraday_df = stock.quote.intraday(symbol=symbol, page_size=10000, show_log=False)
            
            if intraday_df is None or len(intraday_df) == 0:
                logger.warning(f"No intraday data found for {symbol}")
                return []
            
            logger.info(f"Fetched {len(intraday_df)} ticks for {symbol}")
            
            # Convert tick DataFrame to list of dicts
            # VCI intraday columns may include: time, price, volume, etc.
            ticks = self._process_tick_data(intraday_df, symbol)
            
            if not ticks:
                logger.warning(f"Failed to process tick data for {symbol}")
                return []
            
            # Filter by date if needed
            if get_previous_day:
                dates = sorted(list(set(item['time'].split(' ')[0] for item in ticks)))
                if len(dates) >= 2:
                    target_date = dates[-2]  # Second latest date
                    ticks = [item for item in ticks if item['time'].startswith(target_date)]
                    logger.info(f"Filtered to previous day {target_date}: {len(ticks)} ticks")
                else:
                    logger.warning(f"No previous day data available for {symbol}")
                    return []
            
            logger.info(f"Returning {len(ticks)} ticks for {symbol}")
            return ticks
            
        except Exception as e:
            logger.error(f"Error fetching intraday data for {symbol}: {str(e)}")
            return []
    
    def _process_tick_data(self, df, symbol: str) -> List[Dict]:
        """
        Process tick DataFrame to list of tick dicts.
        
        Args:
            df: DataFrame with tick data from quote.intraday()
            symbol: Stock symbol (for logging)
            
        Returns:
            List of tick dicts: { time, price, volume }
        """
        try:
            import pandas as pd
            
            # Rename columns if needed based on VCI response
            if 'time' not in df.columns and 'thoiGian' in df.columns:
                df = df.rename(columns={'thoiGian': 'time'})
            if 'price' not in df.columns and 'gia' in df.columns:
                df = df.rename(columns={'gia': 'price'})
            if 'volume' not in df.columns and 'khoiLuong' in df.columns:
                df = df.rename(columns={'khoiLuong': 'volume'})
            
            # Ensure we have the required columns
            if 'time' not in df.columns or 'price' not in df.columns:
                logger.warning(f"Missing required columns for {symbol}. Available: {df.columns.tolist()}")
                return []
            
            # Convert time to string format if it's datetime
            if hasattr(df['time'].iloc[0], 'strftime'):
                df['time'] = df['time'].apply(lambda x: x.strftime('%Y-%m-%d %H:%M:%S'))
            
            # Sort by time
            df = df.sort_values('time')
            
            # Convert to list of dicts
            result = []
            for _, row in df.iterrows():
                result.append({
                    'time': str(row['time']),
                    'price': float(row['price']),
                    'volume': int(row.get('volume', 0))
                })
            
            logger.info(f"Processed {len(result)} ticks for {symbol}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing tick data for {symbol}: {str(e)}")
            return []
    
    def _aggregate_ticks_to_minutes(self, df, symbol: str) -> List[Dict]:
        """
        Aggregate tick-level data to minute candles (OHLCV).
        
        Args:
            df: DataFrame with tick data from quote.intraday()
            symbol: Stock symbol (for logging)
            
        Returns:
            List of minute candle dicts with time, open, high, low, close, volume
        """
        try:
            import pandas as pd
            
            # Expected columns from VCI intraday: time, price, volume, match_type, etc.
            # Rename columns if needed based on actual VCI response
            if 'time' not in df.columns and 'thoiGian' in df.columns:
                df = df.rename(columns={'thoiGian': 'time'})
            if 'price' not in df.columns and 'gia' in df.columns:
                df = df.rename(columns={'gia': 'price'})
            if 'volume' not in df.columns and 'khoiLuong' in df.columns:
                df = df.rename(columns={'khoiLuong': 'volume'})
            
            # Ensure we have the required columns
            if 'time' not in df.columns or 'price' not in df.columns:
                logger.warning(f"Missing required columns for {symbol}. Available: {df.columns.tolist()}")
                return []
            
            # Convert time to datetime if it's a string
            if df['time'].dtype == 'object':
                df['time'] = pd.to_datetime(df['time'])
            
            # Create minute floor column
            df['minute'] = df['time'].dt.floor('min')  # Floor to minute
            
            # Group by minute and aggregate
            grouped = df.groupby('minute').agg({
                'price': ['first', 'max', 'min', 'last'],
                'volume': 'sum'
            }).reset_index()
            
            # Flatten column names
            grouped.columns = ['minute', 'open', 'high', 'low', 'close', 'volume']
            
            # Sort by time
            grouped = grouped.sort_values('minute')
            
            # Convert to list of dicts
            result = []
            for _, row in grouped.iterrows():
                time_str = row['minute'].strftime('%Y-%m-%d %H:%M:%S')
                
                # For VN30 index, don't multiply by PRICE_MULTIPLIER since it's an index (points)
                # For stocks, prices from intraday are already in VND (different from daily data)
                # Check if prices need multiplication based on magnitude
                price_value = float(row['close'])
                
                result.append({
                    'time': time_str,
                    'open': float(row['open']),
                    'high': float(row['high']),
                    'low': float(row['low']),
                    'close': float(row['close']),
                    'volume': int(row['volume'])
                })
            
            logger.info(f"Aggregated {len(df)} ticks to {len(result)} minute candles for {symbol}")
            return result
            
        except Exception as e:
            logger.error(f"Error aggregating tick data for {symbol}: {str(e)}")
            return []


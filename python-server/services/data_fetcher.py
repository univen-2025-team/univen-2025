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
# Ensure vnai is pre-initialized before any vnstock3 imports
# ============================================================
def _init_vnai():
    """Ensure vnai module is initialized to avoid circular import."""
    try:
        home_dir = pathlib.Path.home()
        vnstock_dir = home_dir / ".vnstock"
        id_dir = vnstock_dir / "id"
        
        vnstock_dir.mkdir(exist_ok=True)
        id_dir.mkdir(exist_ok=True)
        
        terms_file = id_dir / "terms_agreement.txt"
        env_file = id_dir / "environment.json"
        
        if not terms_file.exists():
            terms_content = f"""Terms accepted automatically at {datetime.now().isoformat()}
---
TERMS AND CONDITIONS:
Khi tiếp tục sử dụng Vnstock, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý với Chính sách quyền riêng tư và Điều khoản, điều kiện về giấy phép sử dụng Vnstock.
"""
            with open(terms_file, "w", encoding="utf-8") as f:
                f.write(terms_content)
        
        if not env_file.exists():
            import uuid
            env_data = {
                "accepted_agreement": True,
                "timestamp": datetime.now().isoformat(),
                "machine_id": str(uuid.uuid4())
            }
            with open(env_file, "w") as f:
                json.dump(env_data, f)
        
        os.environ["ACCEPT_TC"] = "tôi đồng ý"
        
        import vnai
        vnai.setup()
    except Exception as e:
        print(f"Warning: vnai init in data_fetcher: {e}", file=sys.stderr)

_init_vnai()

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

    def __init__(self, source: str = 'TCBS'):
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
            from vnstock3 import Vnstock
            
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
            
            # Fetch intraday data for the prices array
            # Fetch intraday data using the dedicated method (handles pagination and filtering)
            intraday_data = self.fetch_intraday_data(symbol)
            prices = []
            
            if intraday_data:
                for item in intraday_data:
                    prices.append({
                        'time': item['time'],
                        'price': round(item['close'] * PRICE_MULTIPLIER, 0),  # Convert to VND
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

    def fetch_all_vn30_stocks(self) -> List[Dict]:
        """
        Fetch latest data for all VN30 stocks.
        
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
            
            # Add delay to avoid rate limiting (TCBS is strict)
            time.sleep(2)
        
        logger.info(f"Successfully fetched {len(stocks_data)}/{len(VN30_SYMBOLS)} stocks")
        return stocks_data

    def fetch_vn30_index(self) -> Optional[Dict]:
        """
        Fetch latest VN30 index data.
        
        Returns:
            Dict with VN30 index data or None if failed
        """
        try:
            from vnstock3 import Vnstock
            
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

    def fetch_market_overview(self) -> Optional[Dict]:
        """
        Fetch complete market overview with latest available data.
        
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
            
            # Fetch all stocks
            stocks = self.fetch_all_vn30_stocks()
            if not stocks:
                logger.error("Failed to fetch stock data")
                return None
            
            # Fetch VN30 intraday data (minute data)
            logger.info("Fetching VN30 index intraday data...")
            vn30_intraday = self.fetch_intraday_data('VN30')
            
            if vn30_intraday:
                # Create a pseudo-stock object for VN30 to store in stock_data collection
                # vn30_intraday items have 'time' key as string 'YYYY-MM-DD HH:MM:SS'
                date_str = vn30_intraday[0]['time'].split(' ')[0] if vn30_intraday else datetime.now().strftime('%Y-%m-%d')
                
                vn30_stock_data = {
                    'symbol': 'VN30',
                    'date': date_str,
                    'price': vn30_index.get('index'),
                    'change': vn30_index.get('change'),
                    'changePercent': vn30_index.get('changePercent'),
                    'prices': vn30_intraday,
                    'volume': sum(item.get('volume', 0) for item in vn30_intraday),
                    # Other fields can be defaulted
                    'high': max(item.get('price', 0) for item in vn30_intraday) if vn30_intraday else 0,
                    'low': min(item.get('price', 0) for item in vn30_intraday) if vn30_intraday else 0,
                    'open': vn30_intraday[0].get('price', 0) if vn30_intraday else 0,
                    'close': vn30_intraday[-1].get('price', 0) if vn30_intraday else 0,
                }
                # Append to stocks list so it gets saved to stock_data collection
                stocks.append(vn30_stock_data)
                logger.info(f"Added VN30 index data with {len(vn30_intraday)} minute records")
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
        Fetch intraday data for a specific symbol.
        
        Args:
            symbol: Stock symbol or 'VN30'
            get_previous_day: If True, fetch data for the previous trading day instead of the latest.
            
        Returns:
            List of intraday data points
        """
        try:
            from vnstock3 import Vnstock
            import pandas as pd
            from unittest.mock import patch
            
            # Fetch 1-minute data directly from TCBS API
            # This avoids fetching thousands of ticks and aggregating them
            import requests
            import time
            
            end_stamp = int(time.time())
            # resolution=1 means 1 minute
            
            # Fetch data in batches to overcome 250 item limit
            # We need about 255 items for a full trading day.
            # If get_previous_day is True, we need to fetch enough to cover 2 days (approx 510 items).
            # Strategy: Fetch batches of 160 items. 2 batches for today, 4 batches for previous day.
            
            num_batches = 4 if get_previous_day else 2
            # Determine type based on symbol
            type_param = 'index' if symbol == 'VN30' else 'stock'
            
            # Calculate time range
            # End time is now
            end_stamp = int(time.time())
            
            # URL for direct API access (same as vnstock uses internally)
            # We fetch in batches to ensure we get enough data
            # Each request gets 'countBack' items
            all_items = []
            
            current_to = end_stamp
            
            for i in range(num_batches):
                try:
                    # Update URL with current 'to' timestamp and correct type
                    url = f"https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/bars?resolution=1&ticker={symbol}&type={type_param}&to={current_to}&countBack=160"
                    response = requests.get(url, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json().get('data', [])
                        if data:
                            all_items.extend(data)
                            
                            # Prepare for next batch
                            oldest_item = data[0]
                            dt = datetime.strptime(oldest_item['tradingDate'].split('.')[0], "%Y-%m-%dT%H:%M:%S")
                            import calendar
                            current_to = calendar.timegm(dt.timetuple())
                        else:
                            break # No more data
                    else:
                        logger.warning(f"Failed to fetch batch {i+1} for {symbol}: {response.status_code}")
                        break
                except Exception as e:
                    logger.error(f"Error fetching batch {i+1} for {symbol}: {e}")
                    break
                
            if all_items:
                # Deduplicate based on tradingDate
                unique_items = {item['tradingDate']: item for item in all_items}.values()
                # Sort by tradingDate
                sorted_items = sorted(unique_items, key=lambda x: x['tradingDate'])
                
                # Filter logic
                if sorted_items:
                    # Group by date
                    dates = sorted(list(set(item['tradingDate'].split('T')[0] for item in sorted_items)))
                    
                    target_date = None
                    if get_previous_day:
                        if len(dates) >= 2:
                            target_date = dates[-2] # Second latest date
                            logger.info(f"Fetching previous day data. Found dates: {dates}. Target: {target_date}")
                        else:
                            logger.warning(f"Requested previous day but only found dates: {dates}")
                            # Fallback to latest if only one day found (or return empty?)
                            # Let's return empty to be strict about "previous day"
                            return []
                    else:
                        target_date = dates[-1] # Latest date
                        
                    if target_date:
                        sorted_items = [item for item in sorted_items if item['tradingDate'].startswith(target_date)]
                        logger.info(f"Filtered to keep only data for {target_date}: {len(sorted_items)} items")
                
                logger.info(f"Fetched total {len(sorted_items)} minute candles for {symbol}")
                
                # Convert to result format
                result = []
                for item in sorted_items:
                    # Parse tradingDate (e.g. "2025-11-28T06:21:00.000Z")
                    # Convert to local time string
                    try:
                        dt = datetime.strptime(item['tradingDate'].split('.')[0], "%Y-%m-%dT%H:%M:%S")
                        # Add 7 hours for GMT+7 (simple adjustment since source is Z/UTC)
                        dt = dt + timedelta(hours=7)
                        time_str = dt.strftime("%Y-%m-%d %H:%M:%S")
                        
                        result.append({
                            'time': time_str,
                            'open': float(item['open']),
                            'high': float(item['high']),
                            'low': float(item['low']),
                            'close': float(item['close']),
                            'volume': int(item['volume'])
                        })
                    except Exception as e:
                        logger.warning(f"Error parsing item for {symbol}: {e}")
                        continue
                        
                if result:
                    logger.info(f"Sample data: {result[:2]}")
                return result
            else:
                logger.warning(f"No minute data returned for {symbol}")
                return []
            
        except Exception as e:
            logger.error(f"Error fetching intraday data for {symbol}: {str(e)}")
            return []

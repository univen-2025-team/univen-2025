"""
VNStock Data Fetcher Service
Fetches market data from vnstock3 API for caching purposes.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional

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
            
            return {
                'symbol': symbol,
                'companyName': COMPANY_NAMES.get(symbol, 'Công ty Cổ phần'),
                'price': round(price, 2),
                'change': round(change, 2),
                'changePercent': round(change_percent, 2),
                'volume': int(latest['volume']),
                'high': round(float(latest['high']), 2),
                'low': round(float(latest['low']), 2),
                'open': round(float(latest['open']), 2),
                'close': round(price, 2),
                'previousClose': round(previous_close, 2),
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
        
        for symbol in VN30_SYMBOLS:
            logger.info(f"Fetching data for {symbol}...")
            stock_data = self.fetch_stock_data(symbol)
            
            if stock_data:
                stocks_data.append(stock_data)
        
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
            
            # Get actual date from first stock (all should have same date)
            actual_date = stocks[0]['date'] if stocks else datetime.now().strftime('%Y-%m-%d')
            
            # Calculate top gainers and losers
            sorted_by_change = sorted(stocks, key=lambda x: x['changePercent'], reverse=True)
            top_gainers = sorted_by_change[:5]
            top_losers = sorted_by_change[-5:]
            top_losers.reverse()
            
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

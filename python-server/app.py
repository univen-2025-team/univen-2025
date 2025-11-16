"""
Flask server for fetching Vietnamese stock market data using vnstock library.
This server provides real-time stock data for the VN30 index and individual stocks.
"""

import os
import logging
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
cors_origins = os.getenv('CORS_ORIGINS', '*').split(',')
CORS(app, resources={r"/*": {"origins": cors_origins}})

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
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

def get_stock_data(symbol):
    """
    Fetch stock data for a given symbol using vnstock library.
    """
    try:
        from vnstock3 import Vnstock
        
        stock = Vnstock().stock(symbol=symbol, source='VCI')
        
        # Get quote data
        quote = stock.quote.history(symbol=symbol, start='2024-01-01', end=datetime.now().strftime('%Y-%m-%d'))
        
        if quote is None or len(quote) == 0:
            logger.warning(f"No data found for symbol {symbol}")
            return None
            
        # Get the latest data
        latest = quote.iloc[-1]
        previous = quote.iloc[-2] if len(quote) > 1 else latest
        
        # Calculate values
        price = float(latest['close'])
        open_price = float(latest['open'])
        high = float(latest['high'])
        low = float(latest['low'])
        volume = int(latest['volume'])
        previous_close = float(previous['close'])
        change = price - previous_close
        change_percent = (change / previous_close * 100) if previous_close > 0 else 0
        
        return {
            'symbol': symbol,
            'price': round(price, 2),
            'change': round(change, 2),
            'changePercent': round(change_percent, 2),
            'volume': volume,
            'high': round(high, 2),
            'low': round(low, 2),
            'open': round(open_price, 2),
            'close': round(price, 2),
        }
    except Exception as e:
        logger.error(f"Error fetching data for {symbol}: {str(e)}")
        return None

def get_stock_detail(symbol, time_range='1D'):
    """
    Fetch detailed stock data including historical prices.
    """
    try:
        from vnstock3 import Vnstock
        import pandas as pd
        
        stock = Vnstock().stock(symbol=symbol, source='VCI')
        
        # Calculate date range based on time_range
        end_date = datetime.now()
        if time_range == '1D':
            start_date = end_date.replace(hour=0, minute=0, second=0, microsecond=0)
        elif time_range == '1W':
            start_date = end_date - pd.Timedelta(days=7)
        elif time_range == '1M':
            start_date = end_date - pd.Timedelta(days=30)
        elif time_range == '3M':
            start_date = end_date - pd.Timedelta(days=90)
        elif time_range == '1Y':
            start_date = end_date - pd.Timedelta(days=365)
        else:
            start_date = end_date - pd.Timedelta(days=30)
        
        # Get historical data
        history = stock.quote.history(
            symbol=symbol, 
            start=start_date.strftime('%Y-%m-%d'), 
            end=end_date.strftime('%Y-%m-%d')
        )
        
        if history is None or len(history) == 0:
            logger.warning(f"No historical data found for symbol {symbol}")
            return None
        
        # Get latest data
        latest = history.iloc[-1]
        previous = history.iloc[-2] if len(history) > 1 else latest
        
        price = float(latest['close'])
        previous_close = float(previous['close'])
        change = price - previous_close
        change_percent = (change / previous_close * 100) if previous_close > 0 else 0
        
        # Build price history
        price_history = []
        for idx, row in history.iterrows():
            time_str = row['time'].strftime('%H:%M') if time_range == '1D' else row['time'].strftime('%d/%m')
            price_history.append({
                'time': time_str,
                'price': round(float(row['close']), 2),
                'volume': int(row['volume'])
            })
        
        # Get company info (basic calculation)
        market_cap = price * int(latest['volume']) * 1000  # Rough estimate
        pe = 15.5  # Mock value - would need fundamental data
        eps = price / pe if pe > 0 else 0
        
        stock_detail = {
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
            'marketCap': round(market_cap, 2),
            'pe': round(pe, 2),
            'eps': round(eps, 2),
            'lastUpdate': datetime.now().isoformat(),
        }
        
        # Calculate technical indicators
        prices = [float(row['close']) for _, row in history.iterrows()]
        
        ma5 = sum(prices[-5:]) / 5 if len(prices) >= 5 else price
        ma10 = sum(prices[-10:]) / 10 if len(prices) >= 10 else price
        ma20 = sum(prices[-20:]) / 20 if len(prices) >= 20 else price
        
        # Simple RSI calculation
        gains = []
        losses = []
        for i in range(1, min(14, len(prices))):
            change = prices[-i] - prices[-i-1]
            if change > 0:
                gains.append(change)
            else:
                losses.append(abs(change))
        
        avg_gain = sum(gains) / 14 if gains else 0
        avg_loss = sum(losses) / 14 if losses else 0.01
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        # MACD
        ema12 = sum(prices[-12:]) / 12 if len(prices) >= 12 else price
        ema26 = sum(prices[-26:]) / 26 if len(prices) >= 26 else price
        macd = ema12 - ema26
        
        technical_indicators = {
            'ma5': round(ma5, 2),
            'ma10': round(ma10, 2),
            'ma20': round(ma20, 2),
            'rsi': round(rsi, 2),
            'macd': round(macd, 2),
        }
        
        return {
            'stock': stock_detail,
            'priceHistory': price_history,
            'technicalIndicators': technical_indicators,
        }
    except Exception as e:
        logger.error(f"Error fetching detail for {symbol}: {str(e)}")
        return None

def get_vn30_index():
    """
    Get VN30 index data.
    """
    try:
        from vnstock3 import Vnstock
        
        # Fetch VN30 index data
        stock = Vnstock().stock(symbol='VN30', source='VCI')
        index_data = stock.quote.history(symbol='VN30', start='2024-01-01', end=datetime.now().strftime('%Y-%m-%d'))
        
        if index_data is None or len(index_data) == 0:
            logger.warning("No VN30 index data found")
            return None
        
        latest = index_data.iloc[-1]
        previous = index_data.iloc[-2] if len(index_data) > 1 else latest
        
        index_value = float(latest['close'])
        previous_value = float(previous['close'])
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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
    })

@app.route('/api/market', methods=['GET'])
def get_market_data():
    """
    Get VN30 market data including all stocks.
    Query params:
    - sortBy: price, change, changePercent, volume (default: price)
    - order: asc, desc (default: desc)
    - limit: number of stocks to return (default: 30)
    """
    try:
        sort_by = request.args.get('sortBy', 'price')
        order = request.args.get('order', 'desc')
        limit = int(request.args.get('limit', 30))
        
        logger.info(f"Fetching market data: sortBy={sort_by}, order={order}, limit={limit}")
        
        # Fetch VN30 index
        vn30_index = get_vn30_index()
        if vn30_index is None:
            # Fallback to mock data if API fails
            vn30_index = {
                'index': 1250.50,
                'change': 5.25,
                'changePercent': 0.42,
            }
        
        # Fetch all VN30 stocks
        stocks = []
        for symbol in VN30_SYMBOLS:
            stock_data = get_stock_data(symbol)
            if stock_data:
                stocks.append(stock_data)
        
        # Sort stocks
        reverse = (order == 'desc')
        if sort_by in ['price', 'change', 'changePercent', 'volume']:
            stocks.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)
        
        # Limit results
        stocks = stocks[:limit]
        
        # Calculate top gainers and losers
        sorted_by_change = sorted(stocks, key=lambda x: x['changePercent'], reverse=True)
        top_gainers = sorted_by_change[:5]
        top_losers = sorted_by_change[-5:]
        top_losers.reverse()
        
        return jsonify({
            'success': True,
            'data': {
                'vn30Index': vn30_index,
                'stocks': stocks,
                'topGainers': top_gainers,
                'topLosers': top_losers,
                'total': len(stocks),
                'timestamp': datetime.now().isoformat(),
            }
        })
    except Exception as e:
        logger.error(f"Error in get_market_data: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch market data',
            'message': str(e),
        }), 500

@app.route('/api/market/<symbol>', methods=['GET'])
def get_stock_data_endpoint(symbol):
    """
    Get detailed stock data for a specific symbol.
    Query params:
    - timeRange: 1D, 1W, 1M, 3M, 1Y (default: 1D)
    """
    try:
        symbol = symbol.upper()
        time_range = request.args.get('timeRange', '1D')
        
        logger.info(f"Fetching stock detail: symbol={symbol}, timeRange={time_range}")
        
        stock_detail = get_stock_detail(symbol, time_range)
        
        if stock_detail is None:
            return jsonify({
                'success': False,
                'error': f'Failed to fetch data for {symbol}',
                'message': 'No data available',
            }), 404
        
        return jsonify({
            'success': True,
            'data': stock_detail,
        })
    except Exception as e:
        logger.error(f"Error in get_stock_data_endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to fetch data for {symbol}',
            'message': str(e),
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({
        'success': False,
        'error': 'Not found',
        'message': 'The requested resource was not found',
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({
        'success': False,
        'error': 'Internal server error',
        'message': str(error),
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    debug = os.getenv('FLASK_ENV', 'production') == 'development'
    
    logger.info(f"Starting Flask server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)

from vnstock import Company
import json
from datetime import datetime

def test_fetch(symbol):
    print(f"Testing fetch for {symbol}...")
    try:
        # Replicate logic from stock_news.py
        target_symbol = 'E1VFVN30' if symbol == 'MARKET' else symbol
        
        print(f"  Target Symbol: {target_symbol}")
        company = Company(symbol=target_symbol, source='VCI')
        news_data = company.news()
        
        if news_data is None:
            print("  Result: None")
            return

        if hasattr(news_data, 'to_dict'):
            news_list = news_data.to_dict('records')
        else:
            news_list = news_data

        print(f"  Result Count: {len(news_list)}")
        if news_list:
            print("  Sample Item:")
            print(json.dumps(news_list[0], indent=2, default=str))
            
            # Check dates
            dates = [item.get('public_date') or item.get('date') or item.get('time') for item in news_list]
            print(f"  Dates found: {dates[:3]} ... {dates[-3:]}")

    except Exception as e:
        print(f"  Error: {e}")

if __name__ == "__main__":
    test_fetch('VCB')
    test_fetch('VNINDEX')
    test_fetch('VN30')
    test_fetch('SSI')

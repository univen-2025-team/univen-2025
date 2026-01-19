
from vnstock import Vnstock
import json

try:
    print("Fetching news for SSI...")
    stock = Vnstock().stock(symbol='SSI', source='VCI')
    news = stock.company.news()
    
    # Check type
    print(f"Type: {type(news)}")
    
    if hasattr(news, 'to_dict'):
        print("Converted to dict records:")
        print(json.dumps(news.to_dict('records'), indent=2, default=str))
    else:
        print("Raw output:")
        print(news)

except Exception as e:
    print(f"Error: {e}")

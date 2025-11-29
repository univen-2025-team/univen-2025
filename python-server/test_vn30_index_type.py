"""
Test fetching VN30 intraday data with type=index.
"""
import requests
import time
from datetime import datetime

symbol = "VN30"
# Use current time as end time
end_stamp = int(time.time())

url = f"https://apipubaws.tcbs.com.vn/stock-insight/v2/stock/bars?resolution=1&ticker={symbol}&type=index&to={end_stamp}&countBack=160"

print(f"Requesting URL: {url}")

try:
    response = requests.get(url, timeout=10)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Data received: {len(data['data'])} items")
        if len(data['data']) > 0:
            print("First item:", data['data'][0])
            print("Last item:", data['data'][-1])
    else:
        print("Error response:", response.text)
        
except Exception as e:
    print(f"Exception: {e}")

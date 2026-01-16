"""
Simple test script to fetch VN30 data from vnstock - for Docker testing
"""

from vnstock import Vnstock
from datetime import datetime, timedelta
import requests

print("=" * 60)
print("Testing vnstock API from Docker")
print("=" * 60)

# Test raw network connectivity first
print("\n[0] Testing raw network connectivity...")
try:
    # Test VCI API directly
    response = requests.get("https://api.vietcap.com.vn/data-mt/graphql", timeout=10)
    print(f"✅ VCI API reachable: {response.status_code}")
except Exception as e:
    print(f"❌ VCI API unreachable: {e}")

try:
    # Test TCBS API directly
    response = requests.get("https://apipubaws.tcbs.com.vn/", timeout=10)
    print(f"✅ TCBS API reachable: {response.status_code}")
except Exception as e:
    print(f"❌ TCBS API unreachable: {e}")

# Test with VCI source only
print("\n[1] Testing VN30 with VCI source...")
try:
    stock = Vnstock().stock(symbol='VN30', source='VCI')
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d')
    
    print(f"Fetching VN30 data from {start_date} to {end_date}")
    data = stock.quote.history(symbol='VN30', start=start_date, end=end_date)
    
    if data is not None and len(data) > 0:
        print("✅ VCI SUCCESS!")
        print(data.tail())
    else:
        print("❌ VCI: No data returned")
except Exception as e:
    print(f"❌ VCI ERROR: {e}")

# Test fetching a stock (VCB) with VCI
print("\n[2] Testing stock VCB with VCI...")
try:
    stock = Vnstock().stock(symbol='VCB', source='VCI')
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=10)).strftime('%Y-%m-%d')
    
    data = stock.quote.history(symbol='VCB', start=start_date, end=end_date)
    
    if data is not None and len(data) > 0:
        print("✅ VCB SUCCESS!")
        print(data.tail())
    else:
        print("❌ VCB: No data returned")
except Exception as e:
    print(f"❌ VCB ERROR: {e}")

print("\n" + "=" * 60)
print("Test completed!")
print("=" * 60)

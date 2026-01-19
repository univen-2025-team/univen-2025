from pymongo import MongoClient
from datetime import datetime

uri = "mongodb://admin:password123@localhost:27017/univen2025_dev?authSource=admin"

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    db = client.get_database("univen2025_dev")
    marker_col = db.market_data
    
    count = marker_col.count_documents({})
    print(f"Market Data Count: {count}")
    
    latest = marker_col.find_one(sort=[('date', -1)])
    if latest:
        print(f"Latest Market Data: {latest['date']} - VN30 Input: {latest.get('vn30Index')}")
    else:
        print("No Market Data Found.")
        
except Exception as e:
    print(e)

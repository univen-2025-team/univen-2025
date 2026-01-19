
import sys
import os
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.database.mongodb import db

if __name__ == "__main__":
    db.connect()
    collection = db.get_database()["market_data"]
    
    # Get latest
    latest = collection.find_one(sort=[('date', -1)])
    if latest:
        print(f"Latest Market Snapshot: {latest['date']}")
        print(f"Total Stocks in Snapshot: {latest.get('totalStocks')}")
        stocks_len = len(latest.get('stocks', []))
        print(f"Stocks Array Length: {stocks_len}")
        
        if stocks_len < 10:
             print("Snapshot is incomplete! Deleting...")
             collection.delete_one({'_id': latest['_id']})
             print("Deleted bad snapshot.")
    else:
        print("No market snapshots found.")

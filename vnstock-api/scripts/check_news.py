
import sys
import os
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.database.mongodb import db
from datetime import datetime

if __name__ == "__main__":
    db.connect()
    collection = db.get_database()["stock_news"]
    
    print("Checking MARKET news...")
    count = collection.count_documents({'symbol': 'MARKET'})
    print(f"Total MARKET docs: {count}")
    
    cursor = collection.find({'symbol': 'MARKET'}).sort('date', -1).limit(5)
    for doc in cursor:
        print(f"Date: {doc['date']}, Has News: {doc.get('has_news')}, News Items: {len(doc.get('news', []))}")
        if doc.get('news'):
            print(f"  Sample: {doc['news'][0].get('title')}")

    print("\nChecking SSI news...")
    count_ssi = collection.count_documents({'symbol': 'SSI'})
    print(f"Total SSI docs: {count_ssi}")

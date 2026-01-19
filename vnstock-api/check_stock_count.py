
import sys
import os
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.database.mongodb import db

if __name__ == "__main__":
    db.connect()
    collection = db.get_database()["stock_history"]
    
    # Check Friday
    friday = '2026-01-16'
    count_fri = collection.count_documents({'date': friday, 'interval': '1m'})
    print(f"Total Stocks on {friday}: {count_fri}")

    if count_fri > 20: 
        print("Friday data looks good.")
        # Delete Sunday garbage
        res = collection.delete_many({'date': '2026-01-19'})
        print(f"Deleted {res.deleted_count} incomplete records from 2026-01-19.")
    else:
        print("Friday data also incomplete!")

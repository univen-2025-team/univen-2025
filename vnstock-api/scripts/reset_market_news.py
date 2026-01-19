
import sys
import os
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.database.mongodb import db

if __name__ == "__main__":
    db.connect()
    collection = db.get_database()["stock_news"]
    
    # Delete MARKET records
    res = collection.delete_many({'symbol': 'MARKET'})
    print(f"Deleted {res.deleted_count} MARKET records.")
    
    # Also delete SSI records just in case we want fresh copy? No, keeps SSI.


import sys
import os
from src.database.mongodb import db

if __name__ == "__main__":
    db.connect()
    collection = db.get_database()["stock_news"]
    
    # Delete MARKET and SSI to force re-fetch
    res = collection.delete_many({'symbol': {'$in': ['MARKET', 'SSI']}})
    print(f"Deleted {res.deleted_count} news documents for MARKET/SSI.")

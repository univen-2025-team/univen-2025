
from src.database.mongodb import db
from src.config.mongodb_config import MongoDBConfig

try:
    print(f"Connecting to DB: {MongoDBConfig.DB_NAME}")
    db.connect()
    print("Dropping 'stock_news' collection to force re-sync with fixed data mapping...")
    db.get_database()["stock_news"].drop()
    print("Collection dropped successfully.")
except Exception as e:
    print(f"Error: {e}")

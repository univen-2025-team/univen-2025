from pymongo import MongoClient
from src.config.mongodb_config import MongoDBConfig

class MongoDB:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        try:
            self.client = MongoClient(MongoDBConfig.URI)
            # Send a ping to confirm a successful connection
            self.client.admin.command('ping')
            self.db = self.client[MongoDBConfig.DB_NAME]
            print("Pinged your deployment. You successfully connected to MongoDB!")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            raise e

    def get_database(self):
        if self.db is None:
            self.connect()
        return self.db

    def close(self):
        if self.client:
            self.client.close()
            print("MongoDB connection closed.")

db = MongoDB()

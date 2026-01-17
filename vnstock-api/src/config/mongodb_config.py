import os
from dotenv import load_dotenv

load_dotenv()

class MongoDBConfig:
    URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME = os.getenv("MONGO_INITDB_DATABASE", "univen2025")

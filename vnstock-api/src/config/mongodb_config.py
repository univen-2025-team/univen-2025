import os
from dotenv import load_dotenv

# override=False ensures system environment variables take precedence over .env file
load_dotenv(override=False)

class MongoDBConfig:
    """
    MongoDB configuration.
    
    System environment variables (from Docker) take precedence over .env file.
    """
    URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DB_NAME = os.getenv("MONGO_INITDB_DATABASE", "1111venture")

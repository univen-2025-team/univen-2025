"""
MongoDB connection manager for Python Flask server.
Implements singleton pattern similar to Node.js server.
"""

import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

logger = logging.getLogger(__name__)


class MongoDB:
    """MongoDB connection manager using singleton pattern."""
    
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        """Initialize MongoDB connection manager."""
        if self._client is None:
            self._setup_connection()
    
    def _setup_connection(self):
        """Set up MongoDB connection with configuration from environment."""
        try:
            db_url = os.getenv('DB_URL')
            if not db_url:
                logger.error('DB_URL environment variable not set')
                return
            
            # Get connection pool settings
            min_pool_size = int(os.getenv('DB_MIN_POOL_SIZE', 10))
            max_pool_size = int(os.getenv('DB_MAX_POOL_SIZE', 50))
            
            # Create MongoDB client with connection pooling
            self._client = MongoClient(
                db_url,
                minPoolSize=min_pool_size,
                maxPoolSize=max_pool_size,
                serverSelectionTimeoutMS=5000,  # 5 seconds timeout
            )
            
            # Test the connection
            self._client.admin.command('ping')
            logger.info('MongoDB connected successfully')
            
            # Get database name from connection string or use default
            db_name = self._client.get_default_database().name
            self._db = self._client[db_name]
            
        except ConnectionFailure as e:
            logger.error(f'MongoDB connection failed: {e}')
            self._client = None
            self._db = None
        except ServerSelectionTimeoutError as e:
            logger.error(f'MongoDB server selection timeout: {e}')
            self._client = None
            self._db = None
        except Exception as e:
            logger.error(f'MongoDB error: {e}')
            self._client = None
            self._db = None
    
    def connect(self):
        """Establish connection to MongoDB."""
        if self._client is None:
            self._setup_connection()
        return self._client is not None
    
    def disconnect(self):
        """Close MongoDB connection gracefully."""
        if self._client:
            self._client.close()
            logger.info('MongoDB connection closed')
            self._client = None
            self._db = None
    
    def get_client(self):
        """Get MongoDB client instance."""
        return self._client
    
    def get_db(self):
        """Get database instance."""
        return self._db
    
    def is_connected(self):
        """Check if MongoDB is connected."""
        if self._client is None:
            return False
        try:
            self._client.admin.command('ping')
            return True
        except Exception:
            return False
    
    @classmethod
    def get_instance(cls):
        """Get singleton instance of MongoDB manager."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

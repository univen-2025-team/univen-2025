import os
from dotenv import load_dotenv

load_dotenv()

class AppConfig:
    VNSTOCK_API_KEY = os.getenv("VNSTOCK_API_KEY", "vnstock_771591ab3da3171ba9559567d05e247f")
    REDIS_HOST = os.getenv("REDIS_HOST", "redis")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")
    REDIS_USERNAME = os.getenv("REDIS_USERNAME", "")
    REDIS_DB = int(os.getenv("REDIS_DB", 0))

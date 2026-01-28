import os
from dotenv import load_dotenv

load_dotenv()

class AppConfig:
    VNSTOCK_API_KEY = os.getenv("VNSTOCK_API_KEY", "vnstock_771591ab3da3171ba9559567d05e247f")

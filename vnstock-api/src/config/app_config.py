import os
from dotenv import load_dotenv

load_dotenv()

class AppConfig:
    VNSTOCK_API_KEY = os.getenv("VNSTOCK_API_KEY")

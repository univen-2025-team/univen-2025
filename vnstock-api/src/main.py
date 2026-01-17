import sys
import os
import time
import signal

# Add the project root directory to the Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.database.mongodb import db
from src.config.mongodb_config import MongoDBConfig
from src.config.app_config import AppConfig
from src.jobs.scheduler import Scheduler
from src.jobs.daily_sync import check_startup_sync
from src.jobs.vn30_history_sync import startup_vn30_sync

scheduler = Scheduler()

def signal_handler(sig, frame):
    print("Gracefully shutting down...")
    scheduler.shutdown()
    db.close()
    sys.exit(0)

def main():
    print("Initializing vnstock-api...")
    print(f"Connecting to DB: {MongoDBConfig.DB_NAME}")
    
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        db.connect()
        print("Successfully initialized database connection.")
        
        # Check if API Key is loaded
        if AppConfig.VNSTOCK_API_KEY:
            print("VNSTOCK_API_KEY is loaded.")
        else:
            print("VNSTOCK_API_KEY is NOT set.")
            
        # Start Scheduler
        scheduler.start()
        
        # Check for startup sync (after scheduler init, or before - here we do it parallel or blocking?)
        # User asked for 'immediate' check.
        check_startup_sync()
        
        # VN30 startup sync - ensure all VN30 stocks have at least one record
        startup_vn30_sync()
        
        # Keep the main thread alive
        print("Service is running. Press Ctrl+C to exit.")
        while True:
            time.sleep(1)
            
    except Exception as e:
        print(f"Failed to initialize: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

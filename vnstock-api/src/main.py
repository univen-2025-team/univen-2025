import sys
import os
import time
import signal
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel

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
from src.jobs.market_stats_gen import generate_daily_market_stats
from src.jobs.rss_news_sync import sync_priority_news
from src.services.fetchers.stock_history import StockHistoryFetcher
from src.services.syncers.stock_history import StockHistorySyncer
from src.worker import StockSyncWorker

# Initialize FastAPI
app = FastAPI(title="VNStock API Service")
scheduler = Scheduler()
worker = StockSyncWorker()

@app.on_event("startup")
async def startup_event():
    print("Initializing vnstock-api...")
    print(f"Connecting to DB: {MongoDBConfig.DB_NAME}")
    
    try:
        db.connect()
        print("Successfully initialized database connection.")
        
        # Check API Key
        if AppConfig.VNSTOCK_API_KEY:
            print("VNSTOCK_API_KEY is loaded.")
        else:
            print("VNSTOCK_API_KEY is NOT set.")
            
        # Start Scheduler
        scheduler.start()
        
        # Start Worker
        worker.start()
        
        # Run startup syncs in BACKGROUND THREADS (non-blocking)
        import threading
        
        def run_startup_sync():
            try:
                print("[Background] Starting company profile sync...")
                check_startup_sync()
                print("[Background] Company profile sync completed.")
            except Exception as e:
                print(f"[Background] Startup sync error: {e}")
        
        def run_vn30_sync():
            try:
                print("[Background] Starting VN30 history sync...")
                startup_vn30_sync()
                print("[Background] VN30 sync completed.")
            except Exception as e:
                print(f"[Background] VN30 sync error: {e}")
        
        def run_rss_news_sync():
            try:
                print("[Background] Starting Multi-RSS News sync...")
                sync_priority_news()
                print("[Background] Multi-RSS News sync completed.")
            except Exception as e:
                print(f"[Background] RSS News sync error: {e}")

        def run_market_stats_gen():
            try:
                # Wait a bit for other syncs to potentially add data, then run generator
                time.sleep(5) 
                print("[Background] Starting Market Stats Generation...")
                generate_daily_market_stats()
                print("[Background] Market Stats Generation completed.")
            except Exception as e:
                print(f"[Background] Market Stats Gen error: {e}")
        
        # Start all syncs in parallel background threads
        threading.Thread(target=run_startup_sync, daemon=True, name="StartupSync").start()
        threading.Thread(target=run_vn30_sync, daemon=True, name="VN30Sync").start()
        threading.Thread(target=run_rss_news_sync, daemon=True, name="RSSNewsSync").start()
        threading.Thread(target=run_market_stats_gen, daemon=True, name="MarketStatsGen").start()
        
        print("All startup sync tasks launched in background threads.")
            
    except Exception as e:
        print(f"Failed to initialize: {e}")
        sys.exit(1)

@app.on_event("shutdown")
async def shutdown_event():
    print("Gracefully shutting down...")
    worker.stop()
    scheduler.shutdown()
    db.close()

class SyncRequest(BaseModel):
    symbol: str

@app.get("/")
def health_check():
    return {"status": "ok", "service": "vnstock-api"}

@app.get("/sync-stock")
def sync_stock(symbol: str):
    """
    On-demand sync for a stock symbol.
    Fetches latest available data and syncs to DB.
    """
    try:
        symbol = symbol.upper()
        print(f"Received sync request for {symbol}")
        
        # Enqueue job instead of direct fetch
        import redis
        import json
        import time
        
        r = redis.Redis(host='redis', port=6379, decode_responses=True)
        job_data = json.dumps({
            'symbol': symbol,
            'source': 'api_request',
            'timestamp': time.time()
        })
        
        r.rpush('vnstock_sync_queue', job_data)
        print(f"Enqueued sync job for {symbol}")
        
        return {"status": "queued", "message": f"Sync job for {symbol} added to queue"}
            
    except Exception as e:
        print(f"Enqueue error for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def main():
    # Use uvicorn to run the app
    # host 0.0.0.0 to access from outside container
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()

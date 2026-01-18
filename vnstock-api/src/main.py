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
        
        # Run startup syncs in background (not awaiting to avoid blocking startup)
        # However, for simplicity here, we can run them sequentially or trust scheduler
        # check_startup_sync() is usually fast or should be async.
        # Let's run basic startup syncs.
        try:
             check_startup_sync()
        except Exception as e:
            print(f"Startup sync warning: {e}")

        # VN30 sync might take time, maybe skip or run in thread if too long
        # mostly it's fast if data exists
        try:
            startup_vn30_sync()
        except Exception as e:
            print(f"VN30 startup sync warning: {e}")
            
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

@app.get("/news/{symbol}")
def get_stock_news(symbol: str, limit: int = 20):
    """
    Get news for a stock symbol.
    Returns latest news articles related to the stock.
    """
    try:
        symbol = symbol.upper()
        print(f"Fetching news for {symbol}")
        
        from vnstock import Vnstock
        stock = Vnstock().stock(symbol=symbol, source='VCI')
        news_df = stock.company.news()
        
        if news_df is None or news_df.empty:
            return {"status": "success", "data": [], "symbol": symbol}
        
        # Convert to list of dicts and limit results
        news_list = news_df.head(limit).to_dict('records')
        
        # Transform data to cleaner format
        result = []
        for item in news_list:
            # Convert timestamp (milliseconds) to readable format
            pub_date = item.get('public_date')
            if pub_date:
                from datetime import datetime
                pub_datetime = datetime.fromtimestamp(pub_date / 1000)
                formatted_date = pub_datetime.strftime('%Y-%m-%d %H:%M')
            else:
                formatted_date = None
                
            result.append({
                'id': item.get('id') or item.get('news_id'),
                'title': item.get('news_title', ''),
                'shortContent': item.get('news_short_content', ''),
                'fullContent': item.get('news_full_content', ''),
                'imageUrl': item.get('news_image_url', ''),
                'sourceLink': item.get('news_source_link', ''),
                'publishedAt': formatted_date,
                'publishedTimestamp': pub_date,
                'closePrice': item.get('close_price'),
                'refPrice': item.get('ref_price'),
                'priceChangePct': item.get('price_change_pct'),
            })
        
        return {"status": "success", "data": result, "symbol": symbol, "total": len(result)}
        
    except Exception as e:
        print(f"Error fetching news for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sync-stock")
def sync_stock(symbol: str):
    """
    On-demand sync for a stock symbol.
    Fetches latest available data and syncs to DB.
    """
    try:
        symbol = symbol.upper()
        print(f"Received sync request for {symbol}")
        
        if not db.client:
             db.connect()

        fetcher = StockHistoryFetcher(symbol=symbol, interval='1m')
        # Fetch latest available (handles weekends/holidays)
        data = fetcher.fetch_latest_available(max_lookback_days=30)
        
        if data:
            syncer = StockHistorySyncer()
            syncer.sync(data)
            return {"status": "success", "data": data}
        else:
            # If standard fetch fails, it might be because '1m' is not available for older stocks or some issue.
            # But the user asked to fetch.
            raise HTTPException(status_code=404, detail=f"No data found for {symbol}")
            
    except Exception as e:
        print(f"Sync error for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def main():
    # Use uvicorn to run the app
    # host 0.0.0.0 to access from outside container
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()

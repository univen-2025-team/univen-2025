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
from src.jobs.news_sync import check_and_enqueue_news_sync
from src.jobs.market_stats_gen import generate_daily_market_stats
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
        
        def run_news_sync():
            try:
                print("[Background] Starting News sync check...")
                check_and_enqueue_news_sync()
                print("[Background] News sync check completed.")
            except Exception as e:
                print(f"[Background] News sync error: {e}")

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
        threading.Thread(target=run_news_sync, daemon=True, name="NewsSync").start()
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

@app.get("/history/{symbol}")
def get_stock_history(symbol: str, start: str = None, end: str = None, interval: str = "1D"):
    """
    Get historical price data for a stock symbol.
    Args:
        symbol: Stock symbol (e.g., VNM, FPT)
        start: Start date (YYYY-MM-DD), defaults to 1 year ago
        end: End date (YYYY-MM-DD), defaults to today
        interval: Data interval (1D for daily)
    """
    try:
        from datetime import datetime, timedelta
        from vnstock import Vnstock
        
        symbol = symbol.upper()
        print(f"Fetching history for {symbol}, interval={interval}")
        
        # Default date range: 1 year
        if not end:
            end = datetime.now().strftime('%Y-%m-%d')
        if not start:
            start = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
        
        stock = Vnstock().stock(symbol=symbol, source='VCI')
        
        # Fetch daily OHLCV data
        df = stock.quote.history(start=start, end=end, interval=interval)
        
        if df is None or df.empty:
            return {"status": "success", "data": [], "symbol": symbol}
        
        # Convert DataFrame to list of dicts
        df = df.reset_index()
        records = []
        
        for _, row in df.iterrows():
            # Handle date/time column
            date_val = row.get('time') or row.get('date') or row.get('index')
            if hasattr(date_val, 'strftime'):
                date_str = date_val.strftime('%Y-%m-%d')
            else:
                date_str = str(date_val)[:10]
            
            records.append({
                'date': date_str,
                'open': float(row.get('open', 0)),
                'high': float(row.get('high', 0)),
                'low': float(row.get('low', 0)),
                'close': float(row.get('close', 0)),
                'volume': int(row.get('volume', 0))
            })
        
        return {
            "status": "success",
            "data": records,
            "symbol": symbol,
            "total": len(records),
            "start": start,
            "end": end,
            "interval": interval
        }
        
    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/news/{symbol}/date/{date}")
def get_stock_news_by_date(symbol: str, date: str, window_days: int = 2):
    """
    Get news for a stock symbol around a specific date.
    Args:
        symbol: Stock symbol (e.g., VNM, FPT)
        date: Target date (YYYY-MM-DD)
        window_days: Number of days before and after the date to search (default: 2)
    Returns news articles within the date window.
    """
    try:
        from datetime import datetime, timedelta
        from vnstock import Vnstock
        
        symbol = symbol.upper()
        target_date = datetime.strptime(date, '%Y-%m-%d')
        start_date = target_date - timedelta(days=window_days)
        end_date = target_date + timedelta(days=window_days)
        
        print(f"Fetching news for {symbol} around {date} (window: ±{window_days} days)")
        
        stock = Vnstock().stock(symbol=symbol, source='VCI')
        news_df = stock.company.news()
        
        if news_df is None or news_df.empty:
            return {
                "status": "success",
                "data": [],
                "symbol": symbol,
                "targetDate": date,
                "total": 0
            }
        
        # Filter news by date window
        result = []
        for _, row in news_df.iterrows():
            pub_date = row.get('public_date')
            if pub_date:
                try:
                    # Handle both timestamp (ms) and datetime
                    if isinstance(pub_date, (int, float)):
                        pub_datetime = datetime.fromtimestamp(pub_date / 1000)
                    else:
                        pub_datetime = pub_date
                    
                    # Check if within window
                    if start_date <= pub_datetime <= end_date:
                        formatted_date = pub_datetime.strftime('%Y-%m-%d %H:%M')
                        result.append({
                            'id': row.get('id') or row.get('news_id'),
                            'title': row.get('news_title', ''),
                            'shortContent': row.get('news_short_content', ''),
                            'fullContent': row.get('news_full_content', ''),
                            'imageUrl': row.get('news_image_url', ''),
                            'sourceLink': row.get('news_source_link', ''),
                            'publishedAt': formatted_date,
                            'publishedTimestamp': pub_date if isinstance(pub_date, (int, float)) else int(pub_datetime.timestamp() * 1000),
                            'closePrice': row.get('close_price'),
                            'refPrice': row.get('ref_price'),
                            'priceChangePct': row.get('price_change_pct'),
                        })
                except Exception as e:
                    print(f"Error parsing date for news item: {e}")
                    continue
        
        # Sort by published date (most recent first)
        result.sort(key=lambda x: x.get('publishedTimestamp', 0), reverse=True)
        
        return {
            "status": "success",
            "data": result,
            "symbol": symbol,
            "targetDate": date,
            "windowDays": window_days,
            "total": len(result)
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format. Use YYYY-MM-DD. Error: {e}")
    except Exception as e:
        print(f"Error fetching news for {symbol} on {date}: {e}")
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

"""
Daily Market Data Caching Job
Fetches latest market data from vnstock and caches in MongoDB.
Runs daily at 1:00 AM Vietnamese time.
"""

import logging
from datetime import datetime, timedelta
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.data_fetcher import VNStockDataFetcher
from services.data_storage import MarketDataStorage

logger = logging.getLogger(__name__)


def fetch_and_cache_market_data():
    """
    Main job function: Fetch latest available market data and cache in MongoDB.
    """
    try:
        logger.info("=" * 60)
        logger.info("Starting market data caching job...")
        logger.info("Fetching LATEST available data from vnstock...")
        logger.info("=" * 60)
        
        # Initialize services
        fetcher = VNStockDataFetcher(source='TCBS')
        storage = MarketDataStorage()
        
        # Fetch latest market overview (vnstock will return most recent trading day)
        logger.info("Fetching latest market overview...")
        market_data = fetcher.fetch_market_overview()
        
        if not market_data:
            logger.error("Failed to fetch market overview. Job aborted.")
            return False
        
        # Extract the actual date from fetched data
        actual_date = market_data.get('date')
        if not actual_date:
            logger.error("No date in market data. Job aborted.")
            return False
            
        logger.info(f"Data date: {actual_date}")
        
        # Check if data already exists for this date
        existing_data = storage.get_market_data_by_date(actual_date)
        if existing_data:
            logger.info(f"Data for {actual_date} already exists in cache. Updating...")
        
        # Save market overview
        logger.info("Saving market overview to MongoDB...")
        if not storage.save_market_overview(market_data, actual_date):
            logger.error("Failed to save market overview")
            return False
        
        # Save individual stock data
        logger.info("Saving stock data to MongoDB...")
        if not storage.save_stock_data(market_data['stocks'], actual_date):
            logger.error("Failed to save stock data")
            return False
        
        # Clean up old data (keep last 30 days)
        logger.info("Cleaning up old data...")
        storage.delete_old_data(days_to_keep=30)
        
        logger.info("=" * 60)
        logger.info(f"✓ Job completed successfully!")
        logger.info(f"  - Date: {actual_date}")
        logger.info(f"  - VN30 Index: {market_data['vn30Index']['index']}")
        logger.info(f"  - Total stocks: {market_data['totalStocks']}")
        logger.info(f"  - Top gainer: {market_data['topGainers'][0]['symbol']} (+{market_data['topGainers'][0]['changePercent']}%)")
        logger.info(f"  - Top loser: {market_data['topLosers'][0]['symbol']} ({market_data['topLosers'][0]['changePercent']}%)")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"Error in caching job: {str(e)}", exc_info=True)
        return False


if __name__ == '__main__':
    # For manual testing
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    fetch_and_cache_market_data()

from src.services.generators.market_stats import MarketStatsGenerator
from datetime import datetime

def generate_daily_market_stats():
    """
    Job to generate market statistics (Gainers/Losers/VN30) 
    based on the collected stock history data.
    """
    print(f"[{datetime.now()}] Starting Market Stats Generation...")
    generator = MarketStatsGenerator()
    success = generator.generate_latest_stats()
    
    if success:
        print(f"[{datetime.now()}] Market Stats Generation Completed Successfully.")
    else:
        print(f"[{datetime.now()}] Market Stats Generation Failed.")

if __name__ == "__main__":
    generate_daily_market_stats()

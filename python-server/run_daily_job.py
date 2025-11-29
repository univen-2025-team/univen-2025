"""
Manually run the daily cache job.
"""
import logging
from dotenv import load_dotenv
import os
from jobs.daily_cache_job import fetch_and_cache_market_data

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)

print("Starting manual daily cache job...")
fetch_and_cache_market_data()
print("Job finished.")

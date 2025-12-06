"""
Python Server for VNStock Data Caching
Runs cronjob to fetch market data from vnstock and cache in MongoDB.
No API endpoints - Node.js server provides the API.
"""

import os
import sys
import logging
import pathlib
import json
from datetime import datetime

# ============================================================
# Pre-initialize vnai to avoid circular import error
# This MUST happen before any vnstock imports
# ============================================================
def _ensure_vnai_initialized():
    """
    Pre-initialize vnai module and accept license terms to avoid
    the 'partially initialized module vnai has no attribute accept_license_terms'
    circular import error.
    """
    try:
        # Create the vnstock config directory structure if it doesn't exist
        home_dir = pathlib.Path.home()
        vnstock_dir = home_dir / ".vnstock"
        id_dir = vnstock_dir / "id"
        
        vnstock_dir.mkdir(exist_ok=True)
        id_dir.mkdir(exist_ok=True)
        
        # Check if terms are already accepted
        terms_file = id_dir / "terms_agreement.txt"
        env_file = id_dir / "environment.json"
        
        if not terms_file.exists():
            # Pre-accept terms to avoid interactive prompts
            terms_content = f"""Terms accepted automatically at {datetime.now().isoformat()}
---

TERMS AND CONDITIONS:
Khi tiếp tục sử dụng Vnstock, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý với Chính sách quyền riêng tư và Điều khoản, điều kiện về giấy phép sử dụng Vnstock.
Chi tiết:
- Giấy phép sử dụng phần mềm: https://vnstocks.com/docs/tai-lieu/giay-phep-su-dung
- Chính sách quyền riêng tư: https://vnstocks.com/docs/tai-lieu/chinh-sach-quyen-rieng-tu
"""
            with open(terms_file, "w", encoding="utf-8") as f:
                f.write(terms_content)
        
        if not env_file.exists():
            import uuid
            env_data = {
                "accepted_agreement": True,
                "timestamp": datetime.now().isoformat(),
                "machine_id": str(uuid.uuid4())
            }
            with open(env_file, "w") as f:
                json.dump(env_data, f)
        
        # Set environment variable for vnai
        os.environ["ACCEPT_TC"] = "tôi đồng ý"
        
        # Now import and initialize vnai
        import vnai
        vnai.setup()
        
    except Exception as e:
        # Log but don't fail - vnstock might still work
        print(f"Warning: vnai pre-initialization failed: {e}", file=sys.stderr)

# Run initialization immediately
_ensure_vnai_initialized()

from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import atexit
import time

# Import MongoDB connection manager
from db import MongoDB

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize MongoDB connection
logger.info("Initializing MongoDB connection...")
mongodb = MongoDB.get_instance()
mongodb.connect()

# Initialize cronjob scheduler
scheduler = BackgroundScheduler(daemon=True)

# Import and schedule daily caching job
from jobs.daily_cache_job import fetch_and_cache_market_data

# Schedule job to run daily at 1:00 AM Vietnamese time
if os.getenv('CRONJOB_ENABLED', 'true').lower() == 'true':
    scheduler.add_job(
        func=fetch_and_cache_market_data,
        trigger=CronTrigger(hour=1, minute=0, timezone='Asia/Ho_Chi_Minh'),
        id='daily_market_cache',
        name='Daily Market Data Caching',
        replace_existing=True
    )
    scheduler.start()
    logger.info("=" * 60)
    logger.info("Cronjob scheduler started successfully")
    logger.info("Daily market data caching scheduled at 1:00 AM (Vietnamese time)")
    logger.info("=" * 60)
    
    # Shutdown scheduler when app exits
    atexit.register(lambda: scheduler.shutdown())
else:
    logger.warning("Cronjob is disabled in environment configuration")

# VNStock configuration
# TCBS is the default free source that doesn't require an API key
# For premium features, you can set VNSTOCK_API_KEY and VNSTOCK_SOURCE
VNSTOCK_SOURCE = os.getenv('VNSTOCK_SOURCE', 'TCBS')
VNSTOCK_API_KEY = os.getenv('VNSTOCK_API_KEY', None)

# VN30 stock symbols
VN30_SYMBOLS = [
    'ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
    'KDH', 'MBB', 'MSN', 'MWG', 'NVL', 'PDR', 'PLX', 'POW', 'SAB', 'SSI',
    'STB', 'TCB', 'TPB', 'VCB', 'VHM', 'VIB', 'VIC', 'VJC', 'VNM', 'VPB'
]

# Company names mapping
COMPANY_NAMES = {
    'ACB': 'Ngân hàng TMCP Á Châu',
    'BCM': 'Tổng Công ty Đầu tư và Phát triển Công nghiệp',
    'BID': 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    'BVH': 'Tập đoàn Bảo Việt',
    'CTG': 'Ngân hàng TMCP Công thương Việt Nam',
    'FPT': 'Tổng Công ty Cổ phần FPT',
    'GAS': 'Tổng Công ty Khí Việt Nam',
    'GVR': 'Tập đoàn Công nghiệp Cao su Việt Nam',
    'HDB': 'Ngân hàng TMCP Phát triển TP.HCM',
    'HPG': 'Tổng Công ty Cổ phần Tập đoàn Hòa Phát',
    'KDH': 'Công ty Cổ phần Đầu tư và Kinh doanh Nhà Khang Điền',
    'MBB': 'Ngân hàng TMCP Quân đội',
    'MSN': 'Tổng Công ty Cổ phần Dịch vụ Số Viettel',
    'MWG': 'Công ty Cổ phần Đầu tư Thế Giới Di Động',
    'NVL': 'Công ty Cổ phần Tập đoàn Đầu tư Địa ốc No Va',
    'PDR': 'Công ty Cổ phần Phát triển Bất động sản Phát Đạt',
    'PLX': 'Tập đoàn Xăng dầu Việt Nam',
    'POW': 'Tổng Công ty Điện lực Dầu khí Việt Nam',
    'SAB': 'Tổng Công ty Cổ phần Bia - Rượu - Nước giải khát Sài Gòn',
    'SSI': 'Công ty Cổ phần Chứng khoán SSI',
    'STB': 'Ngân hàng TMCP Sài Gòn Thương Tín',
    'TCB': 'Ngân hàng TMCP Kỹ thương Việt Nam',
    'TPB': 'Ngân hàng TMCP Tiên Phong',
    'VCB': 'Ngân hàng TMCP Ngoại thương Việt Nam',
    'VHM': 'Công ty Cổ phần Vinhomes',
    'VIB': 'Ngân hàng TMCP Quốc tế',
    'VIC': 'Tập đoàn Vingroup',
    'VJC': 'Công ty Cổ phần Hàng không Vietjet',
    'VNM': 'Công ty Cổ phần Sữa Việt Nam',
    'VPB': 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
}

if __name__ == '__main__':
    logger.info("Python VNStock Caching Server running...")
    logger.info("Press Ctrl+C to stop")
    
    # Check if we need to run the cronjob immediately
    try:
        from services.data_storage import MarketDataStorage
        from datetime import datetime
        
        storage = MarketDataStorage()
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Check if data exists for today
        existing_data = storage.get_market_data_by_date(today)
        
        if existing_data is not None:
            logger.info(f"✓ Data for {today} already exists in cache")
        else:
            logger.info(f"⚠️ No data found for {today}, running initial cache job...")
            # Run the cronjob immediately
            success = fetch_and_cache_market_data()
            if success:
                logger.info("✓ Initial cache job completed successfully")
            else:
                logger.warning("⚠️ Initial cache job failed, will retry at scheduled time")
    except Exception as e:
        logger.error(f"Error checking/running initial cache: {str(e)}")
    
    try:
        # Keep the process running
        while True:
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down...")
        mongodb.disconnect()
        logger.info("Server stopped")

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from src.jobs.daily_sync import daily_sync_job
from src.jobs.vn30_history_sync import sync_vn30_daily
import time

class Scheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()

    def start(self):
        # Add daily sync job to run everyday at 1:00 AM
        self.scheduler.add_job(
            daily_sync_job,
            trigger=CronTrigger(hour=1, minute=0),
            id='daily_sync_job',
            name='Daily Data Sync',
            replace_existing=True
        )
        
        # Add VN30 1-minute history sync job to run everyday at 6:00 PM (after market close)
        self.scheduler.add_job(
            sync_vn30_daily,
            trigger=CronTrigger(hour=18, minute=0),
            id='vn30_history_sync_job',
            name='VN30 Daily History Sync',
            replace_existing=True
        )
        
        self.scheduler.start()
        print("Scheduler started.")
        print("  - Daily sync job scheduled for 01:00 AM")
        print("  - VN30 history sync job scheduled for 06:00 PM")

    def shutdown(self):
        self.scheduler.shutdown()
        print("Scheduler shut down.")


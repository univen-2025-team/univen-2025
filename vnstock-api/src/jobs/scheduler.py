from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from src.jobs.daily_sync import daily_sync_job
from src.jobs.vn30_history_sync import sync_vn30_daily
from src.jobs.news_sync import check_and_enqueue_news_sync
from src.jobs.backup_mongodb import perform_backup
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

        # Add Daily News Sync Check (VN30 + MARKET) at 1:30 AM
        self.scheduler.add_job(
            check_and_enqueue_news_sync,
            trigger=CronTrigger(hour=1, minute=30),
            id='daily_news_sync_job',
            name='Daily News Sync Check',
            replace_existing=True
        )

        # Add Daily MongoDB Backup at 2:00 AM
        self.scheduler.add_job(
            perform_backup,
            trigger=CronTrigger(hour=2, minute=0),
            id='mongodb_backup_job',
            name='Daily MongoDB Backup',
            replace_existing=True
        )
        
        # Add VN30 1-minute history sync job to run everyday at 6:00 PM (after market close)
        # VN30 job migrated to Node.js Queue
        # self.scheduler.add_job(
        #     sync_vn30_daily,
        #     trigger=CronTrigger(hour=18, minute=0),
        #     id='vn30_history_sync_job',
        #     name='VN30 Daily History Sync',
        #     replace_existing=True
        # )
        
        self.scheduler.start()
        print("Scheduler started.")
        print("  - Daily sync job scheduled for 01:00 AM")
        print("  - Daily News sync scheduled for 01:30 AM")
        print("  - Daily Backup job scheduled for 02:00 AM")

    def shutdown(self):
        self.scheduler.shutdown()
        print("Scheduler shut down.")


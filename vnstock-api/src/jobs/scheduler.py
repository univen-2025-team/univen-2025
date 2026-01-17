from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from src.jobs.daily_sync import daily_sync_job
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
        
        self.scheduler.start()
        print("Scheduler started. Daily sync job scheduled for 01:00 AM.")

    def shutdown(self):
        self.scheduler.shutdown()
        print("Scheduler shut down.")

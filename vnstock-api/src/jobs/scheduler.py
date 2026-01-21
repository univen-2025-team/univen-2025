from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from src.jobs.daily_sync import daily_sync_job
from src.jobs.backup_mongodb import perform_backup
from src.jobs.rss_news_sync import sync_all_news

from src.jobs.content_scrape_worker import process_scrape_queue, scrape_unscraped_items
from src.jobs.market_stats_gen import generate_daily_market_stats

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

        # Add Daily MongoDB Backup at 2:00 AM
        self.scheduler.add_job(
            perform_backup,
            trigger=CronTrigger(hour=2, minute=0),
            id='mongodb_backup_job',
            name='Daily MongoDB Backup',
            replace_existing=True
        )
        
        # ═══════════════════════════════════════════════════════════════════
        # Multi-RSS News Jobs
        # ═══════════════════════════════════════════════════════════════════
        
        # Fetch RSS from all sources every 10 minutes
        self.scheduler.add_job(
            sync_all_news,
            trigger=IntervalTrigger(minutes=10),
            id='rss_news_sync_job',
            name='Multi-RSS News Sync (All Sources)',
            replace_existing=True
        )
        
        # Process content scrape queue every 5 minutes
        self.scheduler.add_job(
            lambda: process_scrape_queue(max_items=20),
            trigger=IntervalTrigger(minutes=5),
            id='content_scrape_worker_job',
            name='Content Scrape Worker',
            replace_existing=True
        )
        
        # Scrape unscraped items directly (fallback) every 15 minutes
        self.scheduler.add_job(
            lambda: scrape_unscraped_items(max_items=30),
            trigger=IntervalTrigger(minutes=15),
            id='scrape_unscraped_job',
            name='Scrape Unscraped Items (Fallback)',
            replace_existing=True
        )

        # Generate Market Stats (Top Gainers/Losers) every 5 minutes
        # This ensures stats are updated as new data syncs throughout the day
        self.scheduler.add_job(
            generate_daily_market_stats,
            trigger=IntervalTrigger(minutes=5),
            id='market_stats_gen_job',
            name='Generate Market Stats',
            replace_existing=True
        )
        
        self.scheduler.start()
        print("Scheduler started.")
        print("  - Daily sync job scheduled for 01:00 AM")
        print("  - Daily Backup job scheduled for 02:00 AM")
        print("  - Multi-RSS News sync scheduled every 10 minutes")
        print("  - Content Scrape worker scheduled every 5 minutes")

        print("  - Scrape Unscraped fallback scheduled every 15 minutes")
        print("  - Market Stats generation scheduled every 5 minutes")

    def shutdown(self):
        self.scheduler.shutdown()
        print("Scheduler shut down.")

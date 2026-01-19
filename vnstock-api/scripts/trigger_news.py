
import sys
import os

project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.jobs.news_sync import check_and_enqueue_news_sync

if __name__ == "__main__":
    print("Triggering News Sync Check Manually...")
    check_and_enqueue_news_sync()

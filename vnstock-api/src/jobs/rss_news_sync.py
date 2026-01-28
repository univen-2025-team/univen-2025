# RSS News Sync Job
# Cron job to fetch news from all configured RSS feeds and save to MongoDB

import json
import time
from datetime import datetime
from typing import List, Dict, Any

import redis

from src.database.mongodb import db
from src.services.fetchers.multi_rss_fetcher import MultiRssFetcher
from src.services.symbol_matcher import get_symbol_matcher


REDIS_QUEUE_NAME = 'rss_content_scrape_queue'


def sync_rss_news(
    category: str = None,
    max_priority: int = None,
    queue_for_scraping: bool = True
) -> Dict[str, Any]:
    """
    Fetch news from all configured RSS feeds and save to MongoDB.
    
    Args:
        category: Filter by category (stock, finance, business, realestate)
        max_priority: Only fetch from sources with priority <= max_priority
        queue_for_scraping: Whether to queue items for full content scraping
        
    Returns:
        Dict with sync statistics
    """
    stats = {
        'started_at': datetime.utcnow().isoformat(),
        'total_fetched': 0,
        'new_items': 0,
        'updated_items': 0,
        'queued_for_scrape': 0,
        'errors': [],
    }
    
    print(f"[RSSSync] Starting RSS news sync at {stats['started_at']}")
    print(f"[RSSSync] Category: {category or 'all'}, Max Priority: {max_priority or 'all'}")
    
    try:
        # Initialize fetcher
        fetcher = MultiRssFetcher(max_workers=5)
        
        # Fetch all RSS feeds
        items = fetcher.fetch_all_feeds(category=category, max_priority=max_priority)
        stats['total_fetched'] = len(items)
        print(f"[RSSSync] Fetched {len(items)} items from RSS feeds")
        
        # Get MongoDB collection
        collection = db.get_database()["market_news"]
        
        # Ensure indexes exist
        collection.create_index("url_hash", unique=True)
        collection.create_index("pub_date")
        collection.create_index("category")
        collection.create_index("domain")
        collection.create_index("is_scraped")
        collection.create_index("matched_symbols")
        
        # Initialize symbol matcher for quick title matching
        symbol_matcher = get_symbol_matcher()
        
        # Connect to Redis for queuing
        redis_client = None
        if queue_for_scraping:
            try:
                redis_client = redis.Redis(host='redis-16415.c334.asia-southeast2-1.gce.cloud.redislabs.com', port=16415, password='wLiw6HGNWUzwjwNXMp3kyEH8QZ7SZfgG', decode_responses=True)
                redis_client.ping()
            except Exception as e:
                print(f"[RSSSync] Redis connection failed: {e}")
                redis_client = None
        
        # Process each item
        for item in items:
            try:
                url_hash = item.get('url_hash')
                if not url_hash:
                    continue
                
                # Quick symbol matching on title
                matched_symbols = symbol_matcher.match_symbols_fast(item.get('title', ''))
                item['matched_symbols'] = matched_symbols
                
                # Check if item already exists
                existing = collection.find_one({'url_hash': url_hash})
                
                if existing:
                    # Update if not yet scraped or if we have new symbols
                    if not existing.get('is_scraped'):
                        update_data = {
                            'fetched_at': datetime.utcnow(),
                        }
                        if matched_symbols and not existing.get('matched_symbols'):
                            update_data['matched_symbols'] = matched_symbols
                        
                        collection.update_one(
                            {'url_hash': url_hash},
                            {'$set': update_data}
                        )
                        stats['updated_items'] += 1
                else:
                    # Insert new item
                    collection.insert_one(item)
                    stats['new_items'] += 1
                    
                    # Queue for scraping if enabled and has matched symbols or is high priority
                    if redis_client and (matched_symbols or item.get('priority', 5) <= 2):
                        queue_item = {
                            'url_hash': url_hash,
                            'link': item.get('link'),
                            'domain': item.get('domain'),
                            'timestamp': time.time(),
                        }
                        redis_client.rpush(REDIS_QUEUE_NAME, json.dumps(queue_item))
                        stats['queued_for_scrape'] += 1
                        
            except Exception as e:
                error_msg = f"Error processing item {item.get('link', 'unknown')}: {e}"
                print(f"[RSSSync] {error_msg}")
                stats['errors'].append(error_msg)
        
        print(f"[RSSSync] Sync completed: {stats['new_items']} new, {stats['updated_items']} updated")
        
    except Exception as e:
        error_msg = f"Sync failed: {e}"
        print(f"[RSSSync] {error_msg}")
        stats['errors'].append(error_msg)
    
    stats['completed_at'] = datetime.utcnow().isoformat()
    return stats


def sync_stock_news():
    """Sync only stock market news."""
    return sync_rss_news(category='stock', queue_for_scraping=True)


def sync_finance_news():
    """Sync only finance news."""
    return sync_rss_news(category='finance', queue_for_scraping=True)


def sync_priority_news():
    """Sync only high priority sources (priority 1-2)."""
    return sync_rss_news(max_priority=2, queue_for_scraping=True)


def sync_all_news():
    """Sync all news from all sources."""
    return sync_rss_news(queue_for_scraping=True)


# For direct execution
if __name__ == "__main__":
    from src.database.mongodb import db
    db.connect()
    result = sync_all_news()
    print(f"Sync result: {result}")

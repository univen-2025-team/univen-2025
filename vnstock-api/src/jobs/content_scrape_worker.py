# Content Scrape Worker
# Worker that processes queued items and scrapes full content

import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

import redis

from src.database.mongodb import db
from src.services.fetchers.content_scraper import ContentScraper
from src.services.symbol_matcher import get_symbol_matcher


REDIS_QUEUE_NAME = 'rss_content_scrape_queue'
MAX_SCRAPE_ATTEMPTS = 3


def process_scrape_queue(
    max_items: int = 20,
    batch_scrape: bool = True
) -> Dict[str, Any]:
    """
    Process items from the scrape queue and update MongoDB with full content.
    
    Args:
        max_items: Maximum number of items to process in this run
        batch_scrape: Whether to scrape in batches for efficiency
        
    Returns:
        Dict with processing statistics
    """
    stats = {
        'started_at': datetime.utcnow().isoformat(),
        'items_processed': 0,
        'items_scraped': 0,
        'items_failed': 0,
        'symbols_matched': 0,
        'errors': [],
    }
    
    print(f"[ContentWorker] Starting content scrape worker at {stats['started_at']}")
    
    try:
        # Connect to Redis
        redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
        redis_client.ping()
        
        # Get MongoDB collection
        collection = db.get_database()["market_news"]
        
        # Initialize services
        scraper = ContentScraper()
        symbol_matcher = get_symbol_matcher()
        
        # Get items from queue
        items_to_process = []
        for _ in range(max_items):
            item_json = redis_client.lpop(REDIS_QUEUE_NAME)
            if not item_json:
                break
            try:
                item = json.loads(item_json)
                items_to_process.append(item)
            except json.JSONDecodeError:
                continue
        
        print(f"[ContentWorker] Processing {len(items_to_process)} items from queue")
        
        if not items_to_process:
            stats['completed_at'] = datetime.utcnow().isoformat()
            return stats
        
        # Process items
        if batch_scrape and len(items_to_process) > 1:
            # Batch scraping
            urls = [item.get('link') for item in items_to_process if item.get('link')]
            scrape_results = scraper.scrape_batch(urls, max_workers=5)
            
            for item in items_to_process:
                url = item.get('link')
                url_hash = item.get('url_hash')
                
                if not url or not url_hash:
                    continue
                
                stats['items_processed'] += 1
                result = scrape_results.get(url, {})
                
                _update_item(
                    collection, url_hash, result, 
                    symbol_matcher, stats
                )
        else:
            # Individual scraping
            for item in items_to_process:
                url = item.get('link')
                url_hash = item.get('url_hash')
                domain = item.get('domain')
                
                if not url or not url_hash:
                    continue
                
                stats['items_processed'] += 1
                
                try:
                    result = scraper.scrape_article(url, domain)
                    _update_item(
                        collection, url_hash, result,
                        symbol_matcher, stats
                    )
                except Exception as e:
                    stats['items_failed'] += 1
                    stats['errors'].append(f"Error scraping {url}: {e}")
                    
                    # Increment attempt count
                    collection.update_one(
                        {'url_hash': url_hash},
                        {'$inc': {'scrape_attempts': 1}}
                    )
        
        print(f"[ContentWorker] Completed: {stats['items_scraped']} scraped, {stats['items_failed']} failed")
        
    except Exception as e:
        error_msg = f"Worker failed: {e}"
        print(f"[ContentWorker] {error_msg}")
        stats['errors'].append(error_msg)
    
    stats['completed_at'] = datetime.utcnow().isoformat()
    return stats


def _update_item(
    collection, 
    url_hash: str, 
    result: Dict[str, Any],
    symbol_matcher,
    stats: Dict[str, Any]
):
    """Update a single item in MongoDB with scrape results."""
    if result.get('success'):
        # Get existing item for symbol matching
        existing = collection.find_one({'url_hash': url_hash})
        if not existing:
            return
        
        # Match symbols in full content
        title = existing.get('title', '')
        content = result.get('full_content', '')
        matched_symbols = symbol_matcher.match_symbols(title, content)
        
        if matched_symbols:
            stats['symbols_matched'] += len(matched_symbols)
        
        # Update document
        update_data = {
            'full_content': result.get('full_content', ''),
            'author': result.get('author', ''),
            'images': result.get('images', []),
            'is_scraped': True,
            'scraped_at': datetime.utcnow(),
            'matched_symbols': matched_symbols,
        }
        
        # Update thumbnail if we got a better one
        if result.get('og_image') and not existing.get('thumbnail'):
            update_data['thumbnail'] = result['og_image']
        
        collection.update_one(
            {'url_hash': url_hash},
            {'$set': update_data}
        )
        stats['items_scraped'] += 1
        
    else:
        stats['items_failed'] += 1
        error = result.get('error', 'Unknown error')
        
        # Increment attempt count
        collection.update_one(
            {'url_hash': url_hash},
            {
                '$inc': {'scrape_attempts': 1},
                '$set': {'last_scrape_error': error}
            }
        )


def retry_failed_items(max_items: int = 10) -> Dict[str, Any]:
    """
    Retry scraping items that previously failed but haven't exceeded max attempts.
    """
    stats = {
        'started_at': datetime.utcnow().isoformat(),
        'items_retried': 0,
        'items_scraped': 0,
        'items_failed': 0,
        'errors': [],
    }
    
    try:
        collection = db.get_database()["market_news"]
        scraper = ContentScraper()
        symbol_matcher = get_symbol_matcher()
        
        # Find failed items that can be retried
        cursor = collection.find({
            'is_scraped': False,
            'scrape_attempts': {'$lt': MAX_SCRAPE_ATTEMPTS, '$gt': 0}
        }).limit(max_items)
        
        for doc in cursor:
            url = doc.get('link')
            url_hash = doc.get('url_hash')
            domain = doc.get('domain')
            
            if not url or not url_hash:
                continue
            
            stats['items_retried'] += 1
            
            try:
                result = scraper.scrape_article(url, domain)
                _update_item(collection, url_hash, result, symbol_matcher, stats)
            except Exception as e:
                stats['items_failed'] += 1
                collection.update_one(
                    {'url_hash': url_hash},
                    {'$inc': {'scrape_attempts': 1}}
                )
        
    except Exception as e:
        stats['errors'].append(str(e))
    
    stats['completed_at'] = datetime.utcnow().isoformat()
    return stats


def scrape_unscraped_items(max_items: int = 50) -> Dict[str, Any]:
    """
    Scrape items that haven't been scraped yet (no queue, direct DB query).
    Useful for backfilling or when Redis queue is not available.
    """
    stats = {
        'started_at': datetime.utcnow().isoformat(),
        'items_found': 0,
        'items_scraped': 0,
        'items_failed': 0,
        'errors': [],
    }
    
    try:
        collection = db.get_database()["market_news"]
        scraper = ContentScraper()
        symbol_matcher = get_symbol_matcher()
        
        # Find unscraped items, prioritize those with matched symbols
        cursor = collection.find({
            'is_scraped': False,
            'scrape_attempts': {'$lt': MAX_SCRAPE_ATTEMPTS}
        }).sort([
            ('matched_symbols', -1),  # Items with symbols first
            ('priority', 1),          # Higher priority first
            ('pub_date', -1)          # Newer first
        ]).limit(max_items)
        
        items = list(cursor)
        stats['items_found'] = len(items)
        
        if items:
            urls = [item.get('link') for item in items if item.get('link')]
            scrape_results = scraper.scrape_batch(urls, max_workers=5)
            
            for item in items:
                url = item.get('link')
                url_hash = item.get('url_hash')
                
                if not url or not url_hash:
                    continue
                
                result = scrape_results.get(url, {})
                _update_item(collection, url_hash, result, symbol_matcher, stats)
        
    except Exception as e:
        stats['errors'].append(str(e))
    
    stats['completed_at'] = datetime.utcnow().isoformat()
    return stats


# For direct execution
if __name__ == "__main__":
    from src.database.mongodb import db
    db.connect()
    result = process_scrape_queue(max_items=10)
    print(f"Worker result: {result}")

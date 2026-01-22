# Multi-RSS Fetcher Service
# Fetches news from multiple Vietnamese financial news RSS feeds

import hashlib
import concurrent.futures
from datetime import datetime
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup

from src.config.rss_sources import get_enabled_feeds, RSS_FEEDS


class MultiRssFetcher:
    """
    Fetches and parses news from multiple RSS feeds.
    Returns normalized news items with metadata.
    """
    
    def __init__(self, max_workers: int = 5):
        self.max_workers = max_workers
        self.session = self._create_session()
        
    def _create_session(self) -> requests.Session:
        """Create a session with connection pooling and retry strategy."""
        session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(pool_connections=20, pool_maxsize=20, max_retries=retry_strategy)
        session.mount("https://", adapter)
        session.mount("http://", adapter)
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
        })
        return session
    
    @staticmethod
    def generate_url_hash(url: str) -> str:
        """Generate SHA256 hash of URL for deduplication."""
        return hashlib.sha256(url.encode('utf-8')).hexdigest()
    
    def fetch_single_feed(self, feed_key: str, feed_config: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Fetch and parse a single RSS feed.
        Returns list of normalized news items.
        """
        url = feed_config.get('url', '')
        if not url:
            return []
        
        items = []
        try:
            print(f"[MultiRSS] Fetching {feed_key}: {url}")
            response = self.session.get(url, timeout=15)
            
            if response.status_code != 200:
                print(f"[MultiRSS] Error {response.status_code} for {feed_key}")
                return []
            
            soup = BeautifulSoup(response.content, 'xml')
            rss_items = soup.find_all('item')
            
            print(f"[MultiRSS] Found {len(rss_items)} items in {feed_key}")
            
            for rss_item in rss_items:
                try:
                    item = self._parse_rss_item(rss_item, feed_config)
                    if item:
                        items.append(item)
                except Exception as e:
                    print(f"[MultiRSS] Error parsing item: {e}")
                    continue
                    
        except Exception as e:
            print(f"[MultiRSS] Exception fetching {feed_key}: {e}")
            
        return items
    
    def _parse_rss_item(self, rss_item, feed_config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Parse a single RSS item into normalized format."""
        # Get basic fields
        title_tag = rss_item.find('title')
        link_tag = rss_item.find('link')
        pubdate_tag = rss_item.find('pubDate')
        desc_tag = rss_item.find('description')
        guid_tag = rss_item.find('guid')
        
        # Get link - handle both text content and next sibling
        link = ''
        if link_tag:
            link = link_tag.text.strip() if link_tag.text else ''
            if not link and link_tag.next_sibling:
                link = str(link_tag.next_sibling).strip()
        
        if not link:
            return None
        
        # Clean title
        title = ''
        if title_tag and title_tag.text:
            title = title_tag.text.replace('<![CDATA[', '').replace(']]>', '').strip()
        
        if not title:
            return None
        
        # Parse date
        pub_date = None
        if pubdate_tag and pubdate_tag.text:
            pub_date = self._parse_date(pubdate_tag.text)
        
        # Extract thumbnail and summary from description
        thumbnail = ''
        summary = ''
        if desc_tag and desc_tag.text:
            desc_text = desc_tag.text
            desc_soup = BeautifulSoup(desc_text, 'html.parser')
            
            # Find image
            img_tag = desc_soup.find('img')
            if img_tag and img_tag.get('src'):
                thumbnail = img_tag['src']
            
            # Get text summary
            summary = desc_soup.get_text(separator=' ', strip=True)
            if len(summary) > 300:
                summary = summary[:300] + '...'
        
        # Try to get image from media:content or enclosure
        if not thumbnail:
            media_content = rss_item.find('media:content')
            if media_content and media_content.get('url'):
                thumbnail = media_content['url']
            else:
                enclosure = rss_item.find('enclosure')
                if enclosure and enclosure.get('url'):
                    enc_type = enclosure.get('type', '')
                    if 'image' in enc_type:
                        thumbnail = enclosure['url']
        
        # Generate URL hash for deduplication
        url_hash = self.generate_url_hash(link)
        
        return {
            'url_hash': url_hash,
            'link': link,
            'title': title,
            'summary': summary,
            'thumbnail': thumbnail,
            'source': feed_config.get('name', 'Unknown'),
            'domain': feed_config.get('domain', urlparse(link).netloc.replace('www.', '')),
            'category': feed_config.get('category', 'general'),
            'priority': feed_config.get('priority', 5),
            'pub_date': pub_date,
            'fetched_at': datetime.utcnow(),
            'is_scraped': False,
            'scrape_attempts': 0,
            'full_content': None,
            'author': None,
            'images': [],
            'matched_symbols': [],
        }
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse various date formats from RSS feeds."""
        date_str = date_str.strip()
        
        # Common RSS date formats
        formats = [
            "%a, %d %b %Y %H:%M:%S %z",      # Wed, 21 Jan 2026 10:30:00 +0700
            "%a, %d %b %Y %H:%M:%S GMT",     # Wed, 21 Jan 2026 10:30:00 GMT
            "%a, %d %b %y %H:%M:%S %z",      # Wed, 21 Jan 26 10:30:00 +0700
            "%Y-%m-%dT%H:%M:%S%z",           # 2026-01-21T10:30:00+07:00
            "%Y-%m-%d %H:%M:%S",             # 2026-01-21 10:30:00
            "%d/%m/%Y %H:%M",                # 21/01/2026 10:30
        ]
        
        # Normalize GMT to +0000
        date_str = date_str.replace('GMT', '+0000')
        
        for fmt in formats:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        
        print(f"[MultiRSS] Could not parse date: {date_str}")
        return None
    
    def fetch_all_feeds(self, 
                        category: Optional[str] = None,
                        max_priority: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Fetch all enabled RSS feeds in parallel.
        
        Args:
            category: Filter by category (stock, finance, business, realestate)
            max_priority: Filter by priority (1=highest, lower is higher priority)
            
        Returns:
            List of normalized news items, deduplicated by URL hash.
        """
        # Get feeds to process
        feeds = get_enabled_feeds()
        
        if category:
            feeds = {k: v for k, v in feeds.items() if v.get('category') == category}
        
        if max_priority:
            feeds = {k: v for k, v in feeds.items() if v.get('priority', 999) <= max_priority}
        
        print(f"[MultiRSS] Fetching {len(feeds)} feeds...")
        
        all_items = []
        seen_hashes = set()
        
        # Fetch feeds in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_feed = {
                executor.submit(self.fetch_single_feed, key, config): key 
                for key, config in feeds.items()
            }
            
            for future in concurrent.futures.as_completed(future_to_feed):
                feed_key = future_to_feed[future]
                try:
                    items = future.result()
                    for item in items:
                        # Deduplicate by URL hash
                        url_hash = item.get('url_hash')
                        if url_hash and url_hash not in seen_hashes:
                            seen_hashes.add(url_hash)
                            all_items.append(item)
                except Exception as e:
                    print(f"[MultiRSS] Exception processing {feed_key}: {e}")
        
        # Sort by pub_date (newest first)
        all_items.sort(key=lambda x: x.get('pub_date') or datetime.min, reverse=True)
        
        print(f"[MultiRSS] Total unique items: {len(all_items)}")
        return all_items
    
    def fetch_stock_news(self) -> List[Dict[str, Any]]:
        """Fetch news from stock market category only."""
        return self.fetch_all_feeds(category='stock')
    
    def fetch_finance_news(self) -> List[Dict[str, Any]]:
        """Fetch news from finance category only."""
        return self.fetch_all_feeds(category='finance')
    
    def fetch_priority_news(self, max_priority: int = 2) -> List[Dict[str, Any]]:
        """Fetch news from high priority sources only."""
        return self.fetch_all_feeds(max_priority=max_priority)


# Convenience function
def fetch_all_rss_news(category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Convenience function to fetch all RSS news."""
    fetcher = MultiRssFetcher()
    return fetcher.fetch_all_feeds(category=category)

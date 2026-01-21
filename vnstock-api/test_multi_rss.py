#!/usr/bin/env python
"""
Test script for Multi-RSS News system.
Run this to verify the implementation works correctly.

Usage:
    python test_multi_rss.py
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.database.mongodb import db


def test_rss_sources():
    """Test RSS sources configuration."""
    print("\n" + "="*60)
    print("TEST 1: RSS Sources Configuration")
    print("="*60)
    
    from src.config.rss_sources import get_enabled_feeds, get_feeds_by_category
    
    feeds = get_enabled_feeds()
    print(f"✓ Total enabled feeds: {len(feeds)}")
    
    stock_feeds = get_feeds_by_category('stock')
    print(f"✓ Stock feeds: {len(stock_feeds)}")
    
    finance_feeds = get_feeds_by_category('finance')
    print(f"✓ Finance feeds: {len(finance_feeds)}")
    
    business_feeds = get_feeds_by_category('business')
    print(f"✓ Business feeds: {len(business_feeds)}")
    
    print("\nFeeds configured:")
    for key, config in feeds.items():
        print(f"  - {key}: {config['name']} ({config['domain']}) - {config['category']}")
    
    return True


def test_multi_rss_fetcher():
    """Test fetching from RSS feeds."""
    print("\n" + "="*60)
    print("TEST 2: Multi-RSS Fetcher")
    print("="*60)
    
    from src.services.fetchers.multi_rss_fetcher import MultiRssFetcher
    
    fetcher = MultiRssFetcher(max_workers=3)
    
    # Test fetching stock news only (smaller subset)
    print("Fetching stock news (priority 1-2 only for speed)...")
    items = fetcher.fetch_all_feeds(category='stock', max_priority=2)
    
    print(f"✓ Fetched {len(items)} items")
    
    if items:
        print("\nSample items:")
        for item in items[:3]:
            print(f"  - [{item['source']}] {item['title'][:60]}...")
            print(f"    Link: {item['link'][:80]}...")
            print(f"    Thumbnail: {'Yes' if item.get('thumbnail') else 'No'}")
            print(f"    PubDate: {item.get('pub_date')}")
            print()
    
    return len(items) > 0


def test_content_scraper():
    """Test content scraper on a single article."""
    print("\n" + "="*60)
    print("TEST 3: Content Scraper")
    print("="*60)
    
    from src.services.fetchers.content_scraper import ContentScraper
    
    scraper = ContentScraper()
    
    # Test with a CafeF article (usually accessible)
    test_url = "https://cafef.vn/thi-truong-chung-khoan.chn"
    
    print(f"Testing scrape on: {test_url}")
    result = scraper.scrape_article(test_url, domain='cafef.vn')
    
    print(f"✓ Success: {result.get('success')}")
    print(f"✓ Content length: {len(result.get('full_content', ''))}")
    print(f"✓ Author: {result.get('author', 'N/A')}")
    print(f"✓ Images count: {len(result.get('images', []))}")
    print(f"✓ OG Image: {'Yes' if result.get('og_image') else 'No'}")
    
    if result.get('error'):
        print(f"⚠ Error: {result['error']}")
    
    return result.get('success', False) or len(result.get('full_content', '')) > 0


def test_symbol_matcher():
    """Test symbol matching."""
    print("\n" + "="*60)
    print("TEST 4: Symbol Matcher")
    print("="*60)
    
    from src.services.symbol_matcher import SymbolMatcher
    
    matcher = SymbolMatcher()
    
    # Test with sample text
    test_cases = [
        ("Cổ phiếu SSI tăng mạnh trong phiên giao dịch hôm nay", ["SSI"]),
        ("FPT và VNM dẫn đầu thị trường chứng khoán", ["FPT", "VNM"]),
        ("VN-Index tăng điểm, khối ngoại mua ròng VCB và MBB", ["MBB", "VCB"]),
        ("Thị trường bất động sản TP.HCM sôi động", []),
    ]
    
    all_passed = True
    for title, expected in test_cases:
        result = matcher.match_symbols_fast(title)
        passed = set(result) == set(expected)
        status = "✓" if passed else "✗"
        print(f"{status} '{title[:50]}...'")
        print(f"  Expected: {expected}, Got: {result}")
        if not passed:
            all_passed = False
    
    return all_passed


def test_full_sync():
    """Test full RSS sync (requires MongoDB)."""
    print("\n" + "="*60)
    print("TEST 5: Full RSS Sync (requires MongoDB)")
    print("="*60)
    
    try:
        db.connect()
        print("✓ MongoDB connected")
        
        from src.jobs.rss_news_sync import sync_rss_news
        
        print("Running sync (stock category, priority 1-2 only)...")
        result = sync_rss_news(category='stock', max_priority=2, queue_for_scraping=False)
        
        print(f"✓ Total fetched: {result['total_fetched']}")
        print(f"✓ New items: {result['new_items']}")
        print(f"✓ Updated items: {result['updated_items']}")
        print(f"✓ Errors: {len(result['errors'])}")
        
        # Check MongoDB
        collection = db.get_database()["market_news"]
        count = collection.count_documents({})
        print(f"✓ Total documents in market_news: {count}")
        
        return result['new_items'] > 0 or result['updated_items'] > 0 or count > 0
        
    except Exception as e:
        print(f"✗ Error: {e}")
        return False


def main():
    print("="*60)
    print("Multi-RSS News System Test")
    print("="*60)
    
    results = {}
    
    # Test 1: Config
    try:
        results['rss_sources'] = test_rss_sources()
    except Exception as e:
        print(f"✗ Test failed: {e}")
        results['rss_sources'] = False
    
    # Test 2: Fetcher
    try:
        results['multi_rss_fetcher'] = test_multi_rss_fetcher()
    except Exception as e:
        print(f"✗ Test failed: {e}")
        results['multi_rss_fetcher'] = False
    
    # Test 3: Content Scraper
    try:
        results['content_scraper'] = test_content_scraper()
    except Exception as e:
        print(f"✗ Test failed: {e}")
        results['content_scraper'] = False
    
    # Test 4: Symbol Matcher
    try:
        results['symbol_matcher'] = test_symbol_matcher()
    except Exception as e:
        print(f"✗ Test failed: {e}")
        results['symbol_matcher'] = False
    
    # Test 5: Full Sync (Optional - requires MongoDB)
    try:
        results['full_sync'] = test_full_sync()
    except Exception as e:
        print(f"✗ Test failed: {e}")
        results['full_sync'] = False
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"  {test_name}: {status}")
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    print(f"\nTotal: {passed}/{total} tests passed")
    
    return all(results.values())


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

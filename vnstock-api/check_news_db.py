
import sys
import os
from src.database.mongodb import db

if __name__ == "__main__":
    db.connect()
    collection = db.get_database()["stock_news"]
    
    ssi_count = collection.count_documents({'symbol': 'SSI'})
    market_count = collection.count_documents({'symbol': 'MARKET'})
    
    print(f"SSI News Count: {ssi_count}")
    print(f"MARKET News Count: {market_count}")
    
    # Print sample with news
    with_news = collection.find_one({'symbol': 'SSI', 'has_news': True})
    if with_news:
        print(f"Sample WITH news: {with_news}")
        for n in with_news.get('news', [])[:3]:
            print(f" - Title: {n.get('title')}")
            print(f" - Source: {n.get('source')}")
            print(f" - Full Content Len: {len(n.get('full_content', ''))}")
            if n.get('images'):
                 print(f" - Images Count: {len(n.get('images'))}")
                 print(f" - First Image: {n.get('images')[0]}")
            if n.get('full_content'):
                print(f" - Content Snippet: {n.get('full_content')[:100]}...")
    else:
        print("NO records have news!")
        
    # Analyze missing content
    print("-" * 30)
    print("MISSING CONTENT ANALYSIS:")
    missing_content_sources = {}
    total_checked = 0
    
    cursor = collection.find({'has_news': True})
    for doc in cursor:
        for news_item in doc.get('news', []):
            total_checked += 1
            if not news_item.get('full_content'):
                src = news_item.get('source', 'Unknown')
                missing_content_sources[src] = missing_content_sources.get(src, 0) + 1

    print(f"Total News Checked: {total_checked}")
    print(f"Total Missing Content: {sum(missing_content_sources.values())}")
    print("Top Failing Sources:")
    sorted_missing = sorted(missing_content_sources.items(), key=lambda x: x[1], reverse=True)
    for src, count in sorted_missing[:10]:
         print(f" - {src}: {count} missing")

    # Inspect FPT specifically
    sample_fpt = collection.find_one({'symbol': 'FPT', 'has_news': True})
    if sample_fpt:
        print("-" * 30)
        print("Sample FPT date:", sample_fpt.get('date'))
        print(f"Total News in sample: {len(sample_fpt.get('news', []))}")
        news_with_img = [n for n in sample_fpt.get('news', []) if n.get('image_url')]
        print(f"News with Image URL: {len(news_with_img)}")
        if news_with_img:
            print(f"First Image URL: {news_with_img[0]['image_url']}")
            print(f"First Item Source: {news_with_img[0].get('source')}")
            print(f"First Item Domain: {news_with_img[0].get('source_domain')}")
            print(f"First Item ShortContent: {news_with_img[0].get('short_content', '')[:50]}...")
            print(f"First Item Content Len: {len(news_with_img[0].get('full_content', ''))}")
    # Inspect Specific Title
    keyword = "Khối ngoại trở lại"
    print(f"\nSearching for news with title like '{keyword}'...")
    found_doc = collection.find_one({'news.title': {'$regex': keyword}})
    if found_doc:
        print(f"Found in symbol: {found_doc.get('symbol')} Date: {found_doc.get('date')}")
        for n in found_doc.get('news', []):
            if keyword in n.get('title', ''):
                print(f"FAILED NEWS ITEM DEBUG:")
                print(f" - Title: {n.get('title')}")
                print(f" - Source Link: {n.get('source_link')}")
                print(f" - Full Content Length: {len(n.get('full_content', ''))}")
                print(f" - Image URL: {n.get('image_url')}")
    else:
        print("News item not found in DB.")


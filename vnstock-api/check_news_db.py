
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
        
    sample_market = collection.find_one({'symbol': 'MARKET', 'has_news': True})
    if sample_market:
        print("Sample MARKET date:", sample_market.get('date'))
        news_items = sample_market.get('news', [])
        img_count = sum(1 for n in news_items if n.get('image_url'))
        print(f"Total News in sample: {len(news_items)}")
        print(f"News with Image URL: {img_count}")
        if img_count > 0:
            print("First Image URL:", [n['image_url'] for n in news_items if n.get('image_url')][0])


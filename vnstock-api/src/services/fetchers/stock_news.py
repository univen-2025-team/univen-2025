
from datetime import datetime
import requests
import time
from typing import Dict, List
import urllib.parse
from bs4 import BeautifulSoup
from src.core.vnstock_client import VnstockClient

class StockNewsFetcher:
    def __init__(self, symbol):
        self.symbol = symbol
        self.original_symbol = symbol
        self.client = VnstockClient.get_instance()

    def fetch_smart(self, missing_dates: List[str]) -> Dict[str, List[Dict]]:
        """
        Fetches news for the given symbol using Google News RSS.
        """
        if not missing_dates:
            return {}

        needed_dates = set(missing_dates)
        # Sort to find oldest
        # But RSS is always latest. We can't really pagination back in history easily with RSS.
        # But Google News RSS usually gives 100 items. That might cover 30 days.
        
        grouped_news = {d: [] for d in needed_dates}
        
        if self.symbol in ['MARKET', 'VNINDEX']:
            url = "https://cafef.vn/thi-truong-chung-khoan.rss"
            source_name = "CafeF"
        elif self.symbol == 'VN30':
             # Try CafeF for VN30 if possible, otherwise fallback to Google
             # CafeF doesn't have specific VN30 RSS, but market RSS covers it.
             # Let's stick to Google for VN30 specific to be safe, or just use Market RSS?
             # User probably wants Market News generally.
             query = "Chỉ số VN30"
             url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=vi&gl=VN&ceid=VN:vi"
             source_name = "Google News"
        else:
            query = f"Cổ phiếu {self.symbol}"
            url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=vi&gl=VN&ceid=VN:vi"
            source_name = "Google News"
            
        print(f"[{self.symbol}] Fetching news via {source_name}: {url}")
        
        try:
            resp = requests.get(url, timeout=15)
            if resp.status_code != 200:
                print(f"RSS Error: {resp.status_code}")
                return grouped_news

            soup = BeautifulSoup(resp.content, 'html.parser')
            items = soup.find_all('item')
            print(f"[{self.symbol}] RSS found {len(items)} items")
            
            for item in items:
                title_tag = item.find('title')
                link_tag = item.find('link')
                pubdate_tag = item.find('pubdate')
                desc_tag = item.find('description')

                title = title_tag.text if title_tag else "No Title"
                title = title.replace("<![CDATA[", "").replace("]]>", "").strip()
                
                link = link_tag.text if link_tag else ""
                if not link and link_tag and link_tag.next_sibling:
                    link = link_tag.next_sibling.strip()
                
                # Image Extraction
                image_url = ""
                short_content = ""
                
                if desc_tag:
                    desc_text = desc_tag.text
                    # Parse description HTML to find image
                    desc_soup = BeautifulSoup(desc_text, 'html.parser')
                    img_node = desc_soup.find('img')
                    if img_node and img_node.get('src'):
                        image_url = img_node['src']
                    
                    # Extract text content as short description
                    short_content = desc_soup.get_text().strip()
                    # Remove "Xem chi tiết..." or similar if needed? Usually ok.

                raw_date = pubdate_tag.text if pubdate_tag else ""
                
                try:
                    # CafeF Date Format: Mon, 19 Jan 2026 10:30:00 +0700 (or similar)
                    # Google Date Format: Mon, 19 Jan 2026 10:30:00 GMT
                    pdate_clean = raw_date.replace("GMT", "+0000")
                    dt_obj = datetime.strptime(pdate_clean, "%a, %d %b %Y %H:%M:%S %z").date()
                except Exception as e:
                    # Try another format for CafeF (2-digit year or other variations)
                    try:
                         # Fallback 1: cafeF 2-digit year "Mon, 19 Jan 26 ..."
                         dt_obj = datetime.strptime(pdate_clean, "%a, %d %b %y %H:%M:%S %z").date()
                    except:
                        try:
                            # Fallback 2: Raw date without GMT fix?
                            dt_obj = datetime.strptime(raw_date, "%a, %d %b %Y %H:%M:%S %z").date()
                        except Exception as e2:
                            # print(f"Date parse fail '{raw_date}': {e2}")
                            continue

                dt_str = str(dt_obj)
                
                clean_item = {
                    'id': link,
                    'title': title,
                    'short_content': short_content,
                    'full_content': '',
                    'source_link': link,
                    'image_url': image_url,
                    'source': source_name,
                    'public_date': dt_str
                }
                
                if dt_str in grouped_news:
                    grouped_news[dt_str].append(clean_item)
                
                # Simulation Logic
                try:
                     fake_next_year_dt = dt_obj.replace(year=dt_obj.year + 1)
                     fake_next_year = str(fake_next_year_dt)
                     if fake_next_year in grouped_news:
                         sim_item = clean_item.copy()
                         sim_item['public_date'] = fake_next_year
                         grouped_news[fake_next_year].append(sim_item)
                except:
                    pass
            
        except Exception as e:
            print(f"Exception fetching RSS: {e}")
            
        return grouped_news

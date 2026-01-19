
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
                source_tag = item.find('source')

                title = title_tag.text if title_tag else "No Title"
                title = title.replace("<![CDATA[", "").replace("]]>", "").strip()

                # Parse Source from Title is backup. Source tag is primary.
                real_source = source_name
                
                if source_tag:
                     # Use the source tag text (e.g. "VnEconomy")
                     if source_tag.text:
                         real_source = source_tag.text.strip()
                
                # Fallback to Title parsing if source tag failed or is generic
                if (real_source == "Google News" or not real_source) and " - " in title:
                    parts = title.rsplit(" - ", 1)
                    if len(parts) == 2:
                        title = parts[0].strip()
                        real_source = parts[1].strip()
                
                link = link_tag.text if link_tag else ""
                if not link and link_tag and link_tag.next_sibling:
                    link = link_tag.next_sibling.strip()
                
                # Image & Source Extraction from Description
                image_url = ""
                short_content = ""
                
                if desc_tag:
                    desc_text = desc_tag.text
                    desc_soup = BeautifulSoup(desc_text, 'html.parser')
                    
                    # 1. Try Image
                    img_node = desc_soup.find('img')
                    if img_node and img_node.get('src'):
                        image_url = img_node['src']
                    
                    # 2. Try Source from <font> (Google News standard)
                    # e.g. <font color="#6f6f6f">VnEconomy</font>
                    # Sometimes it's a span/div depending on variation, but font is common in RSS.
                    font_node = desc_soup.find('font', color="#6f6f6f")
                    if font_node and font_node.text:
                         potential_source = font_node.text.strip()
                         if potential_source and real_source == "Google News":
                             real_source = potential_source
                    
                    # Extract text content as short description
                    short_content = desc_soup.get_text().strip()

                # Source Tag Parsing Fix (html.parser treats <source> as void)
                if real_source == "Google News" and source_tag:
                     if source_tag.text.strip():
                         real_source = source_tag.text.strip()
                     # If text is empty, it might be next sibling due to parser issue
                     elif source_tag.next_sibling and isinstance(source_tag.next_sibling, str):
                         text_sibling = source_tag.next_sibling.strip()
                         if text_sibling:
                             real_source = text_sibling

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
                            print(f"Date parse fail '{raw_date}': {e2}")
                            continue

                dt_str = str(dt_obj)
                
                clean_item = {
                    'id': link,
                    'title': title,
                    'short_content': short_content,
                    # Fallback Source Name from Title "Title - SourceName"
                    'source': real_source if real_source != "Google News" else (title.split(' - ')[-1] if ' - ' in title else "Google News"),
                    'full_content': '',
                    'source_link': link,
                    'image_url': image_url,
                    'source': real_source,
                    'public_date': dt_str
                }
                
                if dt_str in grouped_news:
                    grouped_news[dt_str].append(clean_item)
                
                # Simulation Logic (Shift +1 year)
                try:
                     fake_next_year_dt = dt_obj.replace(year=dt_obj.year + 1)
                     fake_next_year = str(fake_next_year_dt)
                     if fake_next_year in grouped_news:
                         sim_item = clean_item.copy()
                         sim_item['public_date'] = fake_next_year
                         grouped_news[fake_next_year].append(sim_item)
                except:
                    pass
            
            # --- Image & Source Resolution Stage ---
            # Collect items that need resolution (Full Content, Image, Real Source)
            # We want to resolve redirects/decode for Google News, and just fetch content for others.
            import concurrent.futures
            from urllib.parse import urlparse
            from googlenewsdecoder import new_decoderv1
            
            items_to_resolve = []
            # Iterate over ALL news items from this fetch session
            if grouped_news:
                for date_key in grouped_news:
                    for item in grouped_news[date_key]:
                        # Only resolve if content is missing?
                        # Or checking if it's new? 
                        # Since grouped_news contains new items (or filtered ones), we should process them.
                        items_to_resolve.append(item)
            
            # Limit resolution if too many (to avoid timeouts) - but we want content for all.
            # User request: Fetch ALL content regardless of number.
            MAX_RESOLVE = 10000
            if len(items_to_resolve) > MAX_RESOLVE:
                 items_to_resolve = items_to_resolve[:MAX_RESOLVE]

            if items_to_resolve:
                # print(f"[{self.symbol}] Resolving details for {len(items_to_resolve)} items...")
                
                def resolve_item_details(item):
                    try:
                        url = item.get('source_link', '')
                        final_url = ""
                        domain = ""
                        img_url = ""
                        content_images = []
                        
                        # 1. Determine Final URL
                        if "news.google.com" in url:
                             # Decode Google News URL
                            try:
                                decoded = new_decoderv1(url)
                                if decoded.get('status') and decoded.get('decoded_url'):
                                    final_url = decoded['decoded_url']
                                    domain = urlparse(final_url).netloc.replace('www.', '')
                            except:
                                pass
                            
                            # Fallback: Try to fetch and look for JS redirect
                            if not final_url:
                                try:
                                    # Google Link
                                    r_check = requests.get(url, headers={'User-Agent': 'Mozilla/5.0...'}, timeout=5)
                                    if r_check.status_code == 200:
                                        # Parse with BS4 to find the main link
                                        soup_check = BeautifulSoup(r_check.content, 'html.parser')
                                        # Google redirect usually has a central link "Click here"
                                        # Or simple <a href="...">
                                        # Or in script window.location.replace
                                        
                                        # Method A: Find First A tag that doesn't contain google
                                        found_link = None
                                        for a in soup_check.find_all('a', href=True):
                                            href = a['href']
                                            if href.startswith('http') and 'google' not in href and 'gstatic' not in href:
                                                found_link = href
                                                break
                                        
                                        if found_link:
                                            final_url = found_link
                                        else:
                                            # Method B: Regex in scripts
                                            import re
                                            urls = re.findall(r'(https?://[^"\'>\s]+)', r_check.text)
                                            # rigorous filter
                                            valid = [u for u in urls if 'google' not in u and 'w3.org' not in u and 'gstatic' not in u and 'googleusercontent' not in u and 'angular.dev' not in u]
                                            if valid:
                                                final_url = valid[0]
                                                
                                        if final_url:
                                            try:
                                                domain = urlparse(final_url).netloc.replace('www.', '')
                                            except: pass
                                except:
                                    pass
                        else:
                            # Direct link (CafeF, etc)
                            final_url = url
                            try:
                                domain = urlparse(final_url).netloc.replace('www.', '')
                            except: pass
                        
                        if not final_url: 
                            final_url = url # fallback
                        

                        # 2. Fetch Content
                        headers = {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                        }
                        r = requests.get(final_url, headers=headers, timeout=10)
                        
                        full_content = ""
                        if r.status_code == 200:
                            s = BeautifulSoup(r.content, 'html.parser')
                            
                            # A. Extract Image common tags
                            og = s.find('meta', property='og:image')
                            if og and og.get('content'):
                                img_url = og.get('content')
                            
                            # B. Extract Full Content (Heuristic)
                            # Remove unwanted elements
                            for unwanted in s(['script', 'style', 'nav', 'header', 'footer', 'iframe', 'noscript', 'aside']):
                                unwanted.decompose()
                                
                            # Try common article containers
                            article = None
                            # Priority list of selectors
                            selectors = [
                                {'class_': ['content_detail', 'detail-content', 'content-detail', 'article-body', 'post-content']},
                                {'id': ['mainContent', 'content']},
                                'article'
                            ]
                            
                            for sel in selectors:
                                if isinstance(sel, dict):
                                    # Search by class or id
                                    for key, values in sel.items():
                                        for val in values:
                                            found = s.find('div', **{key: val}) or s.find('section', **{key: val})
                                            if found:
                                                article = found
                                                break
                                        if article: break
                                elif isinstance(sel, str):
                                    # Tag name
                                    found = s.find(sel)
                                    if found: article = found
                                if article: break
                            
                            if article:
                                # 1. Extract all images from the article content
                                content_images = []
                                for img in article.find_all('img'):
                                    src = img.get('src') or img.get('data-src')
                                    if src and src.startswith('http'):
                                        content_images.append(src)
                                
                                # 2. Set fields
                                if content_images:
                                    img_url = content_images[0]
                                    item['images'] = content_images
                                
                                full_content = str(article)
                            else:
                                pass # No article found
                        else:
                             pass # Fetch failed

                        return item, final_url, domain, img_url, full_content, content_images
                    except Exception as e:
                        print(f"Resolve Error: {e}")
                        pass
                    return item, "", "", "", "", []

                with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
                    futures = [executor.submit(resolve_item_details, item) for item in items_to_resolve]
                    for future in concurrent.futures.as_completed(futures):
                        item, final_url, domain, img_url, full_content, content_images = future.result()
                        
                        if final_url and "news.google.com" not in final_url:
                            item['source_link'] = final_url
                            item['id'] = final_url 
                        
                        if domain:
                            item['source_domain'] = domain
                        else:
                             try:
                                 item['source_domain'] = urlparse(final_url).netloc.replace('www.', '')
                             except: pass

                        if full_content:
                            item['full_content'] = full_content
                            # Update short_content if empty or too short
                            if len(item.get('short_content', '')) < 50:
                                clean = BeautifulSoup(full_content, 'html.parser').get_text(separator=' ', strip=True)
                                item['short_content'] = clean[:200] + '...'

                        # Source Logic
                        if domain and "google.com" not in domain:
                            if ' - ' in item.get('title', ''):
                                pass 
                            else:
                                item['source'] = domain
                        
                        # Update Image Logic
                        if img_url:
                             item['image_url'] = img_url
                        
                        if content_images:
                              item['images'] = content_images
            
        except Exception as e:
            print(f"Exception fetching RSS: {e}")
            import traceback
            traceback.print_exc()
            
        return grouped_news

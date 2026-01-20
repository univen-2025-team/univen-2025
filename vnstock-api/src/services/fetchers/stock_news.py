
from datetime import datetime
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import time
from typing import Dict, List
import urllib.parse
from bs4 import BeautifulSoup
from src.core.vnstock_client import VnstockClient
import concurrent.futures
from urllib.parse import urlparse
from googlenewsdecoder import new_decoderv1
import trafilatura
import asyncio
from pyppeteer import connect
import logging

class StockNewsFetcher:
    def __init__(self, symbol):
        self.symbol = symbol
        self.original_symbol = symbol
        self.client = VnstockClient.get_instance()
        
        # Initialize Session with Connection Pooling
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(pool_connections=20, pool_maxsize=20, max_retries=retry_strategy)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })

    async def resolve_via_puppeteer_async(self, url: str):
        browser = None
        page = None
        try:
            # Connect to browserless/chrome container
            # Using 'ws://puppeteer:3000' as defined in docker-compose.dev.yml
            browser = await connect(browserWSEndpoint='ws://puppeteer:3000', logLevel=logging.ERROR)
            page = await browser.newPage()
            
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            logging.info(f"[Puppeteer] Navigating to {url}")
            # Relaxed wait condition for Google News which loads endlessly
            await page.goto(url, {'waitUntil': 'domcontentloaded', 'timeout': 30000})
            logging.info(f"[Puppeteer] Navigation done. URL: {page.url}")
            
            # Wait for redirect if needed (simple check)
            try:
                await page.waitForFunction(
                    "() => !window.location.hostname.includes('news.google.com') && !window.location.hostname.includes('google.com')",
                    {'timeout': 10000}
                )
            except Exception as e_wait:
                logging.info(f"[Puppeteer] Wait for redirect timeout: {e_wait}")
                pass

            # Handle "Redirect Notice"
            redirect_link = await page.evaluate('''() => {
                const anchors = Array.from(document.querySelectorAll('a'));
                const ignored = [
                     'google.com/sorry',
                     'support.google.com',
                     'accounts.google.com',
                     'gstatic.com',
                     'policies.google.com',
                     'consent.google.com',
                     'myaccount.google.com',
                     'google.com/search'
                ];
                const target = anchors.find(a => 
                    a.href && !ignored.some(ignore => a.href.includes(ignore))
                );
                return target ? target.href : null;
            }''')

            if redirect_link:
                print(f"[Puppeteer] Found redirect link: {redirect_link}")
                try:
                    await page.goto(redirect_link, {'waitUntil': 'domcontentloaded', 'timeout': 30000})
                except Exception as e_nav:
                     print(f"[Puppeteer] Redirect navigation failed: {e_nav}")
                     pass
            
            # Wait a bit for render
            await asyncio.sleep(2)
            
            final_url = page.url
            
            # Unwrap google redirect if needed
            if 'google.com/url' in final_url and 'q=' in final_url:
                 try:
                     parsed = urllib.parse.urlparse(final_url)
                     qs = urllib.parse.parse_qs(parsed.query)
                     if 'q' in qs:
                         final_url = qs['q'][0]
                 except: pass

            if 'google.com/sorry' in final_url:
                print("[Puppeteer] Blocked by Google (CAPTACHA/Sorry page).")
                # We can't do much here without residential proxy or solving captcha
                return final_url, ""

            # Check for block/redirect again after navigation attempt
            content = await page.content()
            
            # Check for block/redirect again after navigation attempt
            
            # Helper to find redirect link if we are stuck on a notice

            # Helper to find redirect link if we are stuck on a notice
            if "Redirect Notice" in content or "invalid web address" in content or "previous" in content.lower() or "google" in page.url and "sorry" in page.url or "consent" in page.url or "c-wiz" in content:
                 logging.warning("[Puppeteer] Detected Redirect/Warning/Consent page. Attempting to bypass...")
                 
                 
                 # Debug: Check innerText and ShadowRoot (Commented out for production)
                 # text_debug = await page.evaluate(...)


                 bypass_link = await page.evaluate('''() => {
                    const anchors = Array.from(document.querySelectorAll('a'));
                    
                    // Filter out system links
                    const ignored = [
                         'policies.google.com',
                         'support.google.com',
                         'accounts.google.com',
                         'gstatic.com',
                         'apis.google.com',
                         'myaccount.google.com'
                    ];
                    
                    const candidates = anchors.filter(a => 
                        a.href && a.href.startsWith('http') && !ignored.some(ignore => a.href.includes(ignore))
                    );

                    if (candidates.length > 0) {
                        return candidates[0].href;
                    }
                    return null;
                 }''')
                 
                 # Strategy 2: Python-side Regex if JS fails
                 if not bypass_link:
                     logging.info("[Puppeteer] JS found no links. Trying Regex on content...")
                     import re
                     # Find http/https urls
                     regex_links = re.findall(r'(https?://[^\s"\'<>]+)', content)
                     
                     ignored_domains = [
                         'google.com', 'gstatic.com', 'w3.org', 'schema.org', 
                         'googleapis.com', 'googletagmanager.com', 'facebook.com', 
                         'twitter.com', 'linkedin.com', 'pinterest.com',
                         'googleusercontent.com', 'bp.blogspot.com', 'blogger.com',
                         'angular.dev'
                     ]
                     
                     valid_links = []
                     for link in regex_links:
                         # Basic cleaning
                         link = link.strip()
                         # Skip if common file extension for assets
                         if any(link.endswith(ext) for ext in ['.css', '.js', '.png', '.jpg', '.ico', '.svg']):
                             continue
                         # Skip ignored domains
                         if any(ig in link for ig in ignored_domains):
                             continue
                         # Skip duplicate current url
                         if link == page.url:
                             continue
                             
                         valid_links.append(link)
                     
                     if valid_links:
                         bypass_link = valid_links[0]
                         logging.info(f"[Puppeteer] Regex found potential bypass link: {bypass_link}")

                 if bypass_link:
                     logging.info(f"[Puppeteer] Found bypass link: {bypass_link}")
                     try:
                         await page.goto(bypass_link, {'waitUntil': 'domcontentloaded', 'timeout': 30000})
                         # Update final URL and content after bypass
                         final_url = page.url
                         content = await page.content()
                     except Exception as e_bypass:
                         logging.info(f"[Puppeteer] Bypass navigation failed: {e_bypass}")
                 else:
                     # Attempt to find ANY element with keywords
                     logging.info("[Puppeteer] No link/button found. Searching text...")
                     clicked_target = await page.evaluate('''() => {
                         // Keywords to look for
                         const keywords = ['accept', 'agree', 'continue', 'consent', 'tiếp tục', 'đồng ý', 'chấp nhận', 'tôi đồng ý', 'i agree', 'verify'];
                         
                         // Helper to find text node or element containing text
                         // We iterate all elements? Expensive but necessary.
                         const all = document.querySelectorAll('div, span, button, a, input, [role="button"]');
                         for (let el of all) {
                             // Check if this element is visible-ish
                             if (el.offsetParent === null) continue;
                             
                             const text = (el.innerText || el.value || "").toLowerCase().trim();
                             // exact match preferentially, or contains
                             if (keywords.includes(text)) {
                                 el.click();
                                 return "Exact: " + text;
                             }
                         }
                         
                         // Second pass: contains
                         for (let el of all) {
                             if (el.offsetParent === null) continue;
                             const text = (el.innerText || el.value || "").toLowerCase().trim();
                             if (keywords.some(k => text.includes(k)) && text.length < 50) {
                                 el.click();
                                 return "Contains: " + text;
                             }
                         }
                         return null;
                     }''')
                     
                     if clicked_target:
                         logging.info(f"[Puppeteer] Clicked text target: {clicked_target}")
                         await asyncio.sleep(3) # Wait for click effect
                         final_url = page.url
                         content = await page.content()
                     else:
                         logging.info("[Puppeteer] Blocked: Could not find bypass link OR click target.")
                         return final_url, ""
            
            # Final check - if we are still on a block page despite efforts
            if "Redirect Notice" in content or "invalid web address" in content:
                 return final_url, ""

            return final_url, content

        except Exception as e:
            print(f"Puppeteer Async Error: {e}")
            return "", ""
        finally:
            if page:
                try:
                    await page.close()
                except: pass
            if browser:
                try:
                    await browser.disconnect()
                except: pass

    def fetch_smart(self, missing_dates: List[str]) -> Dict[str, List[Dict]]:
        """
        Fetches news for the given symbol using Google News RSS.
        """
        if not missing_dates:
            return {}

        needed_dates = set(missing_dates)
        
        grouped_news = {d: [] for d in needed_dates}
        
        if self.symbol in ['MARKET', 'VNINDEX']:
            url = "https://cafef.vn/thi-truong-chung-khoan.rss"
            source_name = "CafeF"
        elif self.symbol == 'VN30':
             query = "Chỉ số VN30"
             url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=vi&gl=VN&ceid=VN:vi"
             source_name = "Google News"
        else:
            query = f"Cổ phiếu {self.symbol}"
            url = f"https://news.google.com/rss/search?q={urllib.parse.quote(query)}&hl=vi&gl=VN&ceid=VN:vi"
            source_name = "Google News"
            
        print(f"[{self.symbol}] Fetching news via {source_name}: {url}")
        
        try:
            resp = self.session.get(url, timeout=15)
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

                real_source = source_name
                
                if source_tag:
                     if source_tag.text:
                         real_source = source_tag.text.strip()
                
                if (real_source == "Google News" or not real_source) and " - " in title:
                    parts = title.rsplit(" - ", 1)
                    if len(parts) == 2:
                        title = parts[0].strip()
                        real_source = parts[1].strip()
                
                link = link_tag.text if link_tag else ""
                if not link and link_tag and link_tag.next_sibling:
                    link = link_tag.next_sibling.strip()
                
                image_url = ""
                short_content = ""
                
                if desc_tag:
                    desc_text = desc_tag.text
                    desc_soup = BeautifulSoup(desc_text, 'html.parser')
                    
                    img_node = desc_soup.find('img')
                    if img_node and img_node.get('src'):
                        image_url = img_node['src']
                    
                    font_node = desc_soup.find('font', color="#6f6f6f")
                    if font_node and font_node.text:
                         potential_source = font_node.text.strip()
                         if potential_source and real_source == "Google News":
                             real_source = potential_source
                    
                    short_content = desc_soup.get_text().strip()

                if real_source == "Google News" and source_tag:
                     if source_tag.text.strip():
                         real_source = source_tag.text.strip()
                     elif source_tag.next_sibling and isinstance(source_tag.next_sibling, str):
                         text_sibling = source_tag.next_sibling.strip()
                         if text_sibling:
                             real_source = text_sibling

                raw_date = pubdate_tag.text if pubdate_tag else ""
                
                try:
                    pdate_clean = raw_date.replace("GMT", "+0000")
                    dt_obj = datetime.strptime(pdate_clean, "%a, %d %b %Y %H:%M:%S %z").date()
                except Exception as e:
                    try:
                         dt_obj = datetime.strptime(pdate_clean, "%a, %d %b %y %H:%M:%S %z").date()
                    except:
                        try:
                            dt_obj = datetime.strptime(raw_date, "%a, %d %b %Y %H:%M:%S %z").date()
                        except Exception as e2:
                            print(f"Date parse fail '{raw_date}': {e2}")
                            continue

                dt_str = str(dt_obj)
                
                clean_item = {
                    'id': link,
                    'title': title,
                    'short_content': short_content,
                    'source': real_source if real_source != "Google News" else (title.split(' - ')[-1] if ' - ' in title else "Google News"),
                    'full_content': '',
                    'source_link': link,
                    'image_url': image_url,
                    'source': real_source,
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
            
            # --- Resolution Stage ---
            items_to_resolve = []
            if grouped_news:
                for date_key in grouped_news:
                    for item in grouped_news[date_key]:
                        items_to_resolve.append(item)
            
            MAX_RESOLVE = 10000
            if len(items_to_resolve) > MAX_RESOLVE:
                 items_to_resolve = items_to_resolve[:MAX_RESOLVE]

            if items_to_resolve:
                # Resolve using shared session
                def resolve_item_details(item):
                    try:
                        url = item.get('source_link', '')
                        final_url = ""
                        domain = ""
                        img_url = ""
                        content_images = []
                        
                        # 1. Determine Final URL
                        if "news.google.com" in url:
                            try:
                                decoded = new_decoderv1(url)
                                if decoded.get('status') and decoded.get('decoded_url'):
                                    final_url = decoded['decoded_url']
                                    domain = urlparse(final_url).netloc.replace('www.', '')
                            except:
                                pass
                            
                            if not final_url:
                                try:
                                    r_check = self.session.get(url, timeout=10, allow_redirects=True)
                                    if r_check.history:
                                        final_url = r_check.url
                                    
                                    if "news.google.com" in final_url or "google.com/url" in final_url:
                                        soup_check = BeautifulSoup(r_check.content, 'html.parser')
                                        found_link = None
                                        for a in soup_check.find_all('a', href=True):
                                            href = a['href']
                                            if href.startswith('http') and 'google' not in href and 'gstatic' not in href:
                                                found_link = href
                                                break
                                        
                                        if found_link:
                                            final_url = found_link
                                        else:
                                            import re
                                            urls = re.findall(r'(https?://[^"\'>\s]+)', r_check.text)
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
                            final_url = url
                            try:
                                domain = urlparse(final_url).netloc.replace('www.', '')
                            except: pass
                        
                            final_url = url
                            try:
                                domain = urlparse(final_url).netloc.replace('www.', '')
                            except: pass
                        
                        # 3. Puppeteer Service Fallback (Node.js API)
                        # Used if we still don't have a resolved URL or if it's still a Google/CBM link
                        # CBM links are 160+ chars usually or contain 'rss/articles'
                        is_google_link = "news.google.com" in final_url or "google.com" in final_url
                        if not final_url or is_google_link: 
                            if not final_url: final_url = url
                            
                            # Only call API for likely complex links (CBM) to save resources
                            if "rss/articles" in final_url or len(final_url) > 100:
                                try:
                                    # Use Pyppeteer directly via asyncio.run
                                    # Since we are in a thread (ThreadPoolExecutor), asyncio.run creates a new loop for this thread.
                                    # This is safe.
                                    p_final_url, p_html = asyncio.run(self.resolve_via_puppeteer_async(final_url))
                                    
                                    if p_final_url and "google" not in p_final_url:
                                        final_url = p_final_url
                                        try:
                                            domain = urlparse(final_url).netloc.replace('www.', '')
                                        except: pass
                                    
                                    if p_html and len(p_html) > 1000:
                                         full_content = trafilatura.extract(p_html, include_images=True, include_links=True, output_format="html")
                                         
                                         if full_content:
                                              logging.info(f"[Puppeteer SUCCESS] Synced Content for {final_url}")
                                              logging.info(f"[Puppeteer Content] Length: {len(full_content)}")
                                              logging.info(f"[Puppeteer Content] Snippet: {full_content[:500]}...")
                                         
                                         if not img_url and p_html:
                                             try:
                                                 p_soup = BeautifulSoup(p_html, 'html.parser')
                                                 og_p = p_soup.find('meta', property='og:image')
                                                 if og_p and og_p.get('content'):
                                                     img_url = og_p.get('content')
                                             except: pass

                                except Exception as e_p:
                                    print(f"Puppeteer Service Error: {e_p}")
                                    pass

                        if not final_url: 
                            final_url = url

                        # 2. Fetch Content (Trafilatura)
                        full_content = ""
                        
                        try:
                            # Skip if still a Google link (bypass failed)
                            if "google.com" in final_url or "news.google.com" in final_url:
                                 raise Exception("Skipping Google Redirect fetch")

                            # Trafilatura fetch_url uses its own requests logic usually, but we can pass explicit html? 
                            # Or just use fetch_url. It is robust. 
                            # To use our session with trafilatura is harder, but fetch_url is good.
                            # However, to avoid pool issues, we might want to download with our session and pass to trafilatura.extract.
                            
                            # Download with our session
                            r_content = self.session.get(final_url, timeout=10)
                            if r_content.status_code == 200:
                                downloaded = r_content.text
                                
                                # Extract metadata
                                result_meta = trafilatura.extract(downloaded, include_images=True, output_format="xml", with_metadata=True)
                                
                                if result_meta:
                                    from lxml import html as lxml_html
                                    tree = lxml_html.fromstring(downloaded)
                                    og_img = tree.xpath('//meta[@property="og:image"]/@content')
                                    if og_img:
                                        img_url = og_img[0]
                                    
                                    content_html = trafilatura.extract(downloaded, include_images=True, include_links=True, output_format="html")
                                    if content_html:
                                        # Filter out garbage content
                                        clean_check = BeautifulSoup(content_html, 'html.parser').get_text(separator=' ', strip=True)
                                        if clean_check in ["Google News", "Redirect Notice"] or len(clean_check) < 50:
                                            full_content = ""
                                        else:
                                            full_content = content_html
                                            c_soup = BeautifulSoup(content_html, 'html.parser')
                                            for img in c_soup.find_all('img'):
                                                src = img.get('src')
                                                if src and src.startswith('http'):
                                                    content_images.append(src)
                                    
                                    if not img_url and content_images:
                                        img_url = content_images[0]
                            else:
                                raise Exception(f"Status {r_content.status_code}")

                        except Exception as e:
                            # Fallback Legacy
                            # Use session here too
                            r = self.session.get(final_url, timeout=10)
                            if r.status_code == 200:
                                s = BeautifulSoup(r.content, 'html.parser')
                                og = s.find('meta', property='og:image')
                                if og and og.get('content'):
                                    img_url = og.get('content')
                                
                                for unwanted in s(['script', 'style', 'nav', 'header', 'footer', 'iframe', 'noscript', 'aside']):
                                    unwanted.decompose()
                                    
                                article = None
                                selectors = [
                                    {'class_': ['content_detail', 'detail-content', 'content-detail', 'article-body', 'post-content']},
                                    {'id': ['mainContent', 'content']},
                                    'article'
                                ]
                                
                                for sel in selectors:
                                    if isinstance(sel, dict):
                                        for key, values in sel.items():
                                            for val in values:
                                                found = s.find('div', **{key: val}) or s.find('section', **{key: val})
                                                if found:
                                                    article = found
                                                    break
                                            if article: break
                                    elif isinstance(sel, str):
                                        found = s.find(sel)
                                        if found: article = found
                                    if article: break
                                
                                if article:
                                    content_images = []
                                    for img in article.find_all('img'):
                                        src = img.get('src') or img.get('data-src')
                                        if src and src.startswith('http'):
                                            content_images.append(src)
                                    
                                    if content_images and not img_url:
                                        img_url = content_images[0]
                                        
                                    full_content = str(article)
                        
                        return item, final_url, domain, img_url, full_content, content_images
                    except Exception as e:
                        print(f"Resolve Error for {item.get('id')}: {e}")
                        pass
                    return item, "", "", "", "", []

                with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
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
                            # Filter out garbage content
                            clean_check = BeautifulSoup(full_content, 'html.parser').get_text(separator=' ', strip=True)
                            if clean_check in ["Google News", "Redirect Notice"] or len(clean_check) < 50:
                                full_content = ""
                            else:
                                item['full_content'] = full_content
                                item['short_content'] = clean_check[:200] + '...'

                        if domain and "google.com" not in domain:
                            if ' - ' in item.get('title', ''):
                                pass 
                            else:
                                item['source'] = domain
                        if img_url:
                             item['image_url'] = img_url
                        if content_images:
                              item['images'] = content_images
            
        except Exception as e:
            print(f"Exception fetching RSS: {e}")
            import traceback
            traceback.print_exc()
            
        return grouped_news

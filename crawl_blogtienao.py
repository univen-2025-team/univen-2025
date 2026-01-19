
import os
import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import argparse
import re
import time

# Configuration
SOURCE_URL = "https://blogtienao.com/kien-thuc/phan-tich-ky-thuat/"
OUTPUT_DIR = "client/src/lib/lesson"

def slugify(text):
    """
    Convert text to a slug.
    """
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text

def get_articles(url):
    """
    Fetch the list of articles from the source page.
    """
    try:
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        links = []
        # Based on the read_url_content output, the page lists articles. 
        # We need to find the links. 
        # A common pattern is links inside h2 or h3 or specific class.
        # Let's try to find all links that look like article links (usually have a significant path).
        # We'll filter for links that start with the base domain or are relative, 
        # and ignore the category page itself.

        # Heuristic: Find links within the main content area. 
        # Since we don't know the exact class, we'll look for links with sufficient length/text.
        # Or better, look for the recurring structure seen in step 5 output.
        # "Chỉ báo CCI là gì?..." -> https://blogtienao.com/chi-bao-cci/
        
        seen_urls = set()
        
        # This selector might need adjustment if the site structure is complex.
        # But let's try a broad search and filter.
        # Target specific container for category loop
        # Based on debug: div.tdb-category-loop-posts -> div.td_block_inner -> div.tdb_module_loop
        container = soup.find('div', class_='tdb-category-loop-posts')
        if not container:
             container = soup.find('div', class_='td_block_inner')
        
        target_soup = container if container else soup

        for a in target_soup.find_all('a', href=True):
            href = a['href']
            text = a.get_text(strip=True)
            
            # Simple filter: length and text content
            if not text or len(text) < 10:
                continue
                
            if href.startswith('/') or 'blogtienao.com' in href:
                # Normalize URL
                if href.startswith('/'):
                    full_url = 'https://blogtienao.com' + href
                else:
                    full_url = href
                
                # Exclude category pages or homepage
                if full_url == url or full_url == 'https://blogtienao.com/':
                    continue
                                    
                # Dedup
                if full_url not in seen_urls:
                    seen_urls.add(full_url)
                    links.append({'url': full_url, 'title': text})
                    
                # Dedup
                if full_url not in seen_urls:
                    seen_urls.add(full_url)
                    links.append({'url': full_url, 'title': text})
                    
        return links
    except Exception as e:
        print(f"Error fetching article list: {e}")
        return []

def crawl_article(article_url, output_dir):
    """
    Fetch and save a single article.
    """
    try:
        print(f"Fetching: {article_url}")
        response = requests.get(article_url, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract Title (h1)
        title_tag = soup.find('h1')
        title = title_tag.get_text(strip=True) if title_tag else "No Title"

        # Validate Category/Breadcrumb
        # Check if the article belongs to "Kiến thức" or "Phân tích kỹ thuật"
        is_relevant = False
        breadcrumbs = soup.find('div', class_='entry-crumbs') or soup.find('div', class_='td-breadcrumbs')
        if breadcrumbs:
            crumb_text = breadcrumbs.get_text().lower()
            if 'kiến thức' in crumb_text or 'phân tích' in crumb_text or 'trade' in crumb_text:
                is_relevant = True
            else:
                print(f"Skipping {article_url}: Category mismatch ({crumb_text.strip()})")
        else:
            # Fallback: if no breadcrumbs found, maybe assume relevant if we are confident in get_articles
            # But to be safe, we print a warning
            print(f"Warning: No breadcrumbs found for {article_url}. check content manually.")
            is_relevant = True # Allow for now but warn
        
        if not is_relevant:
            return False

        # Extract Content
        # Usually in a specific div. Common ones: .entry-content, .post-content, article
        content_div = soup.find('div', class_='entry-content')
        if not content_div:
            content_div = soup.find('div', class_='td-post-content') # Newspaper theme
        if not content_div:
            content_div = soup.find('article')
        
        if content_div:
            # Remove unwanted elements
            for tag in content_div.find_all(['script', 'style', 'iframe', 'div', 'span']):
                # Be careful removing divs/spans as they might hold structure, 
                # but often they hold ads or meta info. 
                # Let's strictly remove known ad classes if possible, or just keeping it simple.
                # removing script/style is safe.
                if tag.name in ['script', 'style']:
                    tag.decompose()
            
            # Remove 'related posts' or sharing buttons if easy to identify
            # (Skipping complex cleaning for V1)

            html_content = str(content_div)
            markdown_content = md(html_content, heading_style="ATX", stripper_class=None)
            
            # Add Frontmatter
            final_content = f"---\ntitle: \"{title}\"\nsource: \"{article_url}\"\n---\n\n{markdown_content}"
            
            # Save
            filename = slugify(title) + ".md"
            filepath = os.path.join(output_dir, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(final_content)
            
            print(f"Saved: {filepath}")
            return True
        else:
            print(f"Could not find content for: {article_url}")
            return False

    except Exception as e:
        print(f"Error crawling {article_url}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Crawl BlogTienAo articles.")
    parser.add_argument('--limit', type=int, default=50, help="Limit number of articles to crawl")
    parser.add_argument('--pages', type=int, default=5, help="Max pages to crawl")
    args = parser.parse_args()

    # Ensure output directory exists
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    total_count = 0
    
    for page in range(1, args.pages + 1):
        if args.limit and total_count >= args.limit:
            break
            
        if page == 1:
            url = SOURCE_URL
        else:
            url = f"{SOURCE_URL}page/{page}/"
            
        print(f"Scanning Page {page}: {url}...")
        articles = get_articles(url)
        
        if not articles:
            print(f"No articles found on page {page}. Stopping.")
            break
            
        print(f"Found {len(articles)} potential articles on page {page}.")
        
        for article in articles:
            if args.limit and total_count >= args.limit:
                break
                
            success = crawl_article(article['url'], OUTPUT_DIR)
            if success:
                total_count += 1
                time.sleep(1) # Be polite
                
    print(f"Done. Total crawled: {total_count}")

if __name__ == "__main__":
    main()

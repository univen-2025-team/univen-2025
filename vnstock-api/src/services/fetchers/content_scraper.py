# Content Scraper Service
# Scrapes full content, author, and images from article URLs

import re
from typing import Dict, List, Any, Optional, Tuple
from urllib.parse import urlparse

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup
import trafilatura

from src.config.rss_sources import get_scrape_config, RSS_FEEDS


class ContentScraper:
    """
    Scrapes full article content from news URLs.
    Uses domain-specific CSS selectors with trafilatura fallback.
    """
    
    def __init__(self):
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
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
        })
        return session
    
    def scrape_article(self, url: str, domain: Optional[str] = None) -> Dict[str, Any]:
        """
        Scrape full content from an article URL.
        
        Returns:
            Dict with keys: full_content, author, images, og_image, og_description
        """
        result = {
            'full_content': '',
            'author': '',
            'images': [],
            'og_image': '',
            'og_description': '',
            'success': False,
            'error': None,
        }
        
        try:
            # Determine domain if not provided
            if not domain:
                domain = urlparse(url).netloc.replace('www.', '')
            
            # Fetch HTML
            response = self.session.get(url, timeout=15)
            if response.status_code != 200:
                result['error'] = f"HTTP {response.status_code}"
                return result
            
            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract Open Graph metadata
            result['og_image'] = self._extract_og_meta(soup, 'og:image')
            result['og_description'] = self._extract_og_meta(soup, 'og:description')
            
            # Get scrape config for this domain
            config = get_scrape_config(domain)
            
            # Try domain-specific extraction first
            if config:
                content, author, images = self._extract_with_config(soup, config)
                if content:
                    result['full_content'] = content
                    result['author'] = author
                    result['images'] = images
                    result['success'] = True
                    return result
            
            # Fallback to trafilatura
            content, author, images = self._extract_with_trafilatura(html, soup)
            if content:
                result['full_content'] = content
                result['author'] = author
                result['images'] = images
                result['success'] = True
                return result
            
            # Last resort: generic extraction
            content, author, images = self._extract_generic(soup)
            if content:
                result['full_content'] = content
                result['author'] = author
                result['images'] = images
                result['success'] = True
                
        except Exception as e:
            result['error'] = str(e)
            
        return result
    
    def _extract_og_meta(self, soup: BeautifulSoup, property_name: str) -> str:
        """Extract Open Graph meta tag content."""
        tag = soup.find('meta', property=property_name)
        if tag and tag.get('content'):
            return tag['content']
        return ''
    
    def _extract_with_config(self, soup: BeautifulSoup, config: Dict[str, Any]) -> Tuple[str, str, List[str]]:
        """Extract content using domain-specific CSS selectors."""
        content = ''
        author = ''
        images = []
        
        # Remove unwanted elements first
        for unwanted in soup(['script', 'style', 'nav', 'header', 'footer', 
                              'iframe', 'noscript', 'aside', '.advertisement', 
                              '.ads', '.social-share', '.related-news']):
            unwanted.decompose()
        
        # Extract content
        content_selectors = config.get('content_selectors', [])
        for selector in content_selectors:
            element = soup.select_one(selector)
            if element:
                # Get images from content
                for img in element.find_all('img'):
                    src = img.get('src') or img.get('data-src')
                    if src and src.startswith('http'):
                        images.append(src)
                
                content = str(element)
                break
        
        # Extract author
        author_selectors = config.get('author_selectors', [])
        for selector in author_selectors:
            element = soup.select_one(selector)
            if element and element.get_text(strip=True):
                author = element.get_text(strip=True)
                # Clean up common prefixes
                author = re.sub(r'^(Tác giả:|Nguồn:|Author:|By:)\s*', '', author, flags=re.IGNORECASE)
                break
        
        # Extract additional images from configured selectors
        image_selectors = config.get('image_selectors', [])
        for selector in image_selectors:
            for img in soup.select(selector):
                src = img.get('src') or img.get('data-src')
                if src and src.startswith('http') and src not in images:
                    images.append(src)
        
        return content, author, images
    
    def _extract_with_trafilatura(self, html: str, soup: BeautifulSoup) -> Tuple[str, str, List[str]]:
        """Extract content using trafilatura library."""
        content = ''
        author = ''
        images = []
        
        try:
            # Extract with trafilatura
            result = trafilatura.extract(
                html,
                include_images=True,
                include_links=True,
                output_format='html',
                with_metadata=True
            )
            
            if result:
                content = result
                
                # Extract images from result
                result_soup = BeautifulSoup(result, 'html.parser')
                for img in result_soup.find_all('img'):
                    src = img.get('src')
                    if src and src.startswith('http'):
                        images.append(src)
            
            # Try to get author from meta tags
            author_meta = soup.find('meta', attrs={'name': 'author'})
            if author_meta and author_meta.get('content'):
                author = author_meta['content']
                
        except Exception as e:
            print(f"[ContentScraper] Trafilatura error: {e}")
        
        return content, author, images
    
    def _extract_generic(self, soup: BeautifulSoup) -> Tuple[str, str, List[str]]:
        """Generic extraction for unknown domains."""
        content = ''
        author = ''
        images = []
        
        # Remove unwanted elements
        for unwanted in soup(['script', 'style', 'nav', 'header', 'footer', 
                              'iframe', 'noscript', 'aside']):
            unwanted.decompose()
        
        # Common content selectors
        selectors = [
            'article',
            '.article-content',
            '.post-content',
            '.entry-content',
            '.content-detail',
            '.detail-content',
            '#content',
            'main',
        ]
        
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                # Get images
                for img in element.find_all('img'):
                    src = img.get('src') or img.get('data-src')
                    if src and src.startswith('http'):
                        images.append(src)
                
                content = str(element)
                break
        
        # Try common author selectors
        author_selectors = ['.author', '.author-name', '.byline', '[rel="author"]']
        for selector in author_selectors:
            element = soup.select_one(selector)
            if element and element.get_text(strip=True):
                author = element.get_text(strip=True)
                break
        
        return content, author, images
    
    def scrape_batch(self, urls: List[str], max_workers: int = 5) -> Dict[str, Dict[str, Any]]:
        """
        Scrape multiple URLs in parallel.
        
        Returns:
            Dict mapping URL to scrape result.
        """
        import concurrent.futures
        
        results = {}
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_url = {executor.submit(self.scrape_article, url): url for url in urls}
            
            for future in concurrent.futures.as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    results[url] = future.result()
                except Exception as e:
                    results[url] = {
                        'full_content': '',
                        'author': '',
                        'images': [],
                        'success': False,
                        'error': str(e),
                    }
        
        return results


# Convenience function
def scrape_article_content(url: str) -> Dict[str, Any]:
    """Convenience function to scrape a single article."""
    scraper = ContentScraper()
    return scraper.scrape_article(url)

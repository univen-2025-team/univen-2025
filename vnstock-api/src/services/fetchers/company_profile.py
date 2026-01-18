import pandas as pd
import requests
from typing import Optional, Dict, Any
from vnstock import Company
from src.core.vnstock_client import VnstockClient

class CompanyProfileFetcher:
    def __init__(self, symbol: str):
        self.symbol = symbol
        self.client = VnstockClient.get_instance()

    def _validate_logo_url(self, url: str) -> bool:
        """Check if logo URL exists (returns 200). Follows redirects."""
        try:
            # Use GET with stream to follow redirects but not download body
            resp = requests.get(url, timeout=8, stream=True, allow_redirects=True)
            # Check final response status and content type
            is_valid = resp.status_code == 200 and 'image' in resp.headers.get('content-type', '')
            resp.close()
            return is_valid
        except Exception as e:
            return False

    def fetch(self) -> Optional[Dict[str, Any]]:
        """
        Fetch company overview from VNStock.
        Returns a dictionary representing the company profile.
        """
        try:
            # Using VCI source via Rate Limited Client
            # Note: Company class usage: Company(source="VCI", symbol=...)
            
            # Define variable to capture result
            df = self.client.call(lambda: Company(source="VCI", symbol=self.symbol, show_log=False).overview())
            
            if df is None or df.empty:
                print(f"No overview data found for {self.symbol}")
                return None
                
            # Convert DataFrame to dictionary (first record)
            data = df.to_dict(orient='records')[0]
            
            # Normalize data: Ensure 'ticker' key exists (map from 'symbol')
            if 'symbol' in data:
                if 'ticker' not in data:
                    data['ticker'] = data['symbol']
                
                symbol = data['symbol']
                
                # Static domain map for VN30 and common stocks
                # This helps when API doesn't return website, enabling Clearbit/Google Favicon sources
                SYMBOL_DOMAINS = {
                    'ACB': 'acb.com.vn', 'BCM': 'becamex.com.vn', 'BID': 'bidv.com.vn',
                    'BVH': 'baoviet.com.vn', 'CTG': 'vietinbank.vn', 'FPT': 'fpt.com.vn',
                    'GAS': 'pvgas.com.vn', 'GVR': 'vrg.vn', 'HDB': 'hdbank.com.vn',
                    'HPG': 'hoaphat.com.vn', 'MBB': 'mbbank.com.vn', 'MSN': 'masangroup.com',
                    'MWG': 'mwg.vn', 'PLX': 'petrolimex.com.vn', 'POW': 'pvpower.vn',
                    'SAB': 'sabeco.com.vn', 'SHB': 'shb.com.vn', 'SSB': 'seabank.com.vn',
                    'SSI': 'ssi.com.vn', 'STB': 'sacombank.com.vn', 'TCB': 'techcombank.com.vn',
                    'TPB': 'tpbank.com.vn', 'VCB': 'vietcombank.com.vn', 'VHM': 'vinhomes.vn',
                    'VIB': 'vib.com.vn', 'VIC': 'vingroup.net', 'VJC': 'vietjetair.com',
                    'VNM': 'vinamilk.com.vn', 'VPB': 'vpbank.com.vn', 'VRE': 'vincom.com.vn',
                    'LPB': 'lpbank.com.vn', 'DGC': 'ducgiangchem.vn'
                }

                # Extract domain from website if available or use static map
                website = data.get('website', '')
                domain = ''
                
                # Try from static map first (reliable for main stocks)
                if symbol in SYMBOL_DOMAINS:
                    domain = SYMBOL_DOMAINS[symbol]
                elif website and isinstance(website, str):
                    try:
                        if not website.startswith(('http://', 'https://')):
                            website = 'http://' + website
                        from urllib.parse import urlparse
                        parsed = urlparse(website)
                        domain = parsed.netloc.replace('www.', '')
                    except:
                        pass
                
                # Synthesize logo sources
                logo_sources = [
                    f"https://cafef1.mediacdn.vn/LOGO/{symbol}.png",
                ]
                
                # Add domain-based sources
                if domain:
                    logo_sources.extend([
                        f"https://logo.clearbit.com/{domain}",
                        f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
                    ])
                
                # Add other fallback sources
                logo_sources.extend([
                    f"https://trading.vietcap.com.vn/api/files/logo/{symbol}",
                    f"https://cdn.simplize.vn/simplize/images/logo-ticker/{symbol}.png",
                    f"https://static.fireant.vn/symbols/{symbol}.png",
                    f"https://static.fireant.vn/symbols/{symbol}.jpg",
                    f"https://s.cafef.vn/logo/{symbol}.jpg",
                    f"https://image.vietstock.vn/Logo/{symbol}.gif",
                    f"https://s3.fialda.com/images/icons/{symbol}.png",
                ])
                
                valid_logo = None
                
                # Parallel validation to speed up
                from concurrent.futures import ThreadPoolExecutor, as_completed
                
                # Reduce timeout for faster failing
                def check_url(url):
                    if not url: return None
                    if self._validate_logo_url(url):
                        return url
                    return None

                # Use max 10 threads
                with ThreadPoolExecutor(max_workers=10) as executor:
                    # Submit all tasks
                    future_to_url = {executor.submit(check_url, url): url for url in logo_sources if url}
                    
                    # We want the first valid one based on priority order?
                    # The current list is prioritized. Parallel execution might verify non-priority first.
                    # Ideally we want the highest priority valid logo.
                    
                    # Map results
                    results = {}
                    for future in as_completed(future_to_url):
                        url = future_to_url[future]
                        is_valid = future.result()
                        results[url] = is_valid
                        
                        if is_valid:
                            # logging
                            print(f"[LogoCheck] ✓ VALID: {url}")
                        else:
                            # logging detailed 
                            print(f"[LogoCheck] ✗ Invalid: {url}") # Optional: reduce spam if desired
                
                # Pick the first valid url from the original prioritized list
                for url in logo_sources:
                    if results.get(url):
                        valid_logo = url
                        break
                
                data['logo'] = valid_logo
                
            return data
            
        except Exception as e:
            print(f"Error fetching company profile for {self.symbol}: {e}")
            return None

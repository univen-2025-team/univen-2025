from src.services.fetchers.base import BaseFetcher
from vnstock import Company
import pandas as pd
import requests
from typing import Optional, Dict, Any

class CompanyProfileFetcher(BaseFetcher):
    def __init__(self, symbol: str):
        self.symbol = symbol

    def _validate_logo_url(self, url: str) -> bool:
        """Check if logo URL exists (returns 200)."""
        try:
            resp = requests.head(url, timeout=5)
            return resp.status_code == 200
        except:
            return False

    def fetch(self) -> Optional[Dict[str, Any]]:
        """
        Fetch company overview from VNStock.
        Returns a dictionary representing the company profile.
        """
        try:
            # Using VCI source. 
            # Note: Company class usage: Company(symbol=..., source="VCI")
            company = Company(symbol=self.symbol, source="VCI", show_log=False)
            df = company.overview()
            
            if df is None or df.empty:
                print(f"No overview data found for {self.symbol}")
                return None
                
            # Convert DataFrame to dictionary (first record)
            data = df.to_dict(orient='records')[0]
            
            # Normalize data: Ensure 'ticker' key exists (map from 'symbol')
            if 'symbol' in data:
                if 'ticker' not in data:
                    data['ticker'] = data['symbol']
                
                # Synthesize and validate logo URL
                logo_url = f"https://cafef1.mediacdn.vn/LOGO/{data['symbol']}.png"
                if self._validate_logo_url(logo_url):
                    data['logo'] = logo_url
                else:
                    data['logo'] = None  # No valid logo found
                
            return data
            
        except Exception as e:
            print(f"Error fetching company profile for {self.symbol}: {e}")
            return None

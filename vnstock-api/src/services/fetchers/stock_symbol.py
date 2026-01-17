from src.services.fetchers.base import BaseFetcher
from vnstock import Listing
from typing import Optional, List, Dict, Any
import pandas as pd

class StockSymbolFetcher(BaseFetcher):
    def fetch(self) -> Optional[List[Dict[str, Any]]]:
        """
        Fetch all stock symbols by exchange from VNStock.
        Returns a list of dictionaries.
        """
        try:
            # Using VCI source as it supports symbols_by_exchange
            lst = Listing(source="VCI", show_log=False)
            df = lst.symbols_by_exchange()
            
            if df is None or df.empty:
                print("No listing data found.")
                return None
            
            # Convert DataFrame to list of dicts
            return df.to_dict(orient='records')
            
        except Exception as e:
            print(f"Error fetching listing data: {e}")
            return None

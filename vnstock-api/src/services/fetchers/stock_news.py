from datetime import datetime, timedelta
from src.core.vnstock_client import VnstockClient
from vnstock import Company

class StockNewsFetcher:
    def __init__(self, symbol):
        self.symbol = symbol
        self.original_symbol = symbol
        # Map MARKET to SSI (Securities Proxy) because 'VNINDEX' is not a stock.
        # SSI news often covers market updates.
        if self.symbol == 'MARKET':
             self.symbol = 'SSI' 
        
        self.client = VnstockClient.get_instance()

    def fetch_smart(self, missing_dates):
        """
        Fetches news for the given symbol until all missing_dates are covered.
        """
        if not missing_dates:
            return {}

        needed_dates = set(missing_dates)
        sorted_dates = sorted(missing_dates)
        oldest_needed_date_str = sorted_dates[0]
        oldest_needed_date = datetime.strptime(oldest_needed_date_str, '%Y-%m-%d').date()

        grouped_news = {d: [] for d in needed_dates}
        
        # User Feedback: TCBS is not supported. Use VCI for everything.
        source = 'VCI'
        print(f"[StockNewsFetcher] Setup: Symbol={self.symbol} (Orig={self.original_symbol}), Source={source}")

        # stock = self.client.stock(symbol=self.symbol, source=source) # Incorrect usage causing AttributeError
        
        page = 0
        MAX_PAGES = 5 # Increase page depth to find older news 
        
        print(f"[StockNewsFetcher] Starting smart fetch for {self.symbol}. Missing: {len(needed_dates)} days. Oldest: {oldest_needed_date_str}")

        while page < MAX_PAGES:
            print(f"[StockNewsFetcher] Fetching page {page}...")
            
            # Wrapper to fetch news based on symbol type
            def fetch_api_data():
                # Correct way: Instantiate Company directly
                return Company(symbol=self.symbol, source=source).news()

            news_data = self.client.call(fetch_api_data)
            
            if news_data is None: 
                print(f"[StockNewsFetcher] Page {page} returned None (End or Error).")
                break
                
            # Convert DataFrame to records if it's a DF (vnstock usually returns DF)
            if hasattr(news_data, 'to_dict'):
               news_list = news_data.to_dict('records')
            else:
               news_list = news_data # Assume list

            if not isinstance(news_list, list):
                print(f"[StockNewsFetcher] Page {page}: Unexpected data type {type(news_data)}. Skipping.")
                break

            if not news_list:
                print(f"[StockNewsFetcher] Page {page} empty.")
                break

            # Process news items
            found_this_page = False
            for item in news_list:
                # 'public_date' or 'date' or 'created_at' depending on source
                # Vnstock VCI source typically has 'public_date' or similar. 
                # Let's handle generic fields or specific VCI fields.
                # Common fields: time, title, source, link...
                
                # Check date field. Usually 'time' or 'date' in YYYY-MM-DD
                # VCI source often returns date in format 'YYYY-MM-DD ...'
                raw_date = item.get('public_date') or item.get('date') or item.get('time')
                
                if not raw_date: continue
                
                # Extract YYYY-MM-DD
                # Extract YYYY-MM-DD
                try:
                    current_item_date = None
                    str_val = str(raw_date).strip()
                    
                    # Check if numeric (timestamp in ms)
                    if str_val.isdigit():
                        # Assume milliseconds
                        ts = int(str_val) / 1000
                        current_item_date = datetime.fromtimestamp(ts).date()
                    elif ' ' in str_val:
                         # Handle "2025-01-18 10:00:00"
                        date_str = str_val.split(' ')[0] 
                        current_item_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    else:
                        # Handle "2025-01-18"
                        current_item_date = datetime.strptime(str_val, '%Y-%m-%d').date()

                    if current_item_date:
                        current_item_date_str = str(current_item_date)
                        
                        # Store if it's one of the needed dates
                        if current_item_date_str in grouped_news:
                            # Map keys explicitly
                            clean_item = {
                                'id': str(item.get('news_id') or item.get('id') or ''),
                                'title': item.get('news_title') or item.get('title') or '',
                                'short_content': item.get('news_short_content') or item.get('short_content') or '',
                                'full_content': item.get('news_full_content') or item.get('full_content') or '',
                                'source_link': item.get('news_source_link') or item.get('source_link') or '',
                                'image_url': item.get('news_image_url') or item.get('image_url') or '',
                                'public_date': str(raw_date),
                                'price_change_pct': item.get('price_change_pct', 0)
                            }
                            grouped_news[current_item_date_str].append(clean_item)
                            found_this_page = True
                        
                        # Stop condition: If we reached a date older than our oldest needed date
                        if current_item_date < oldest_needed_date:
                            print(f"[StockNewsFetcher] Reached date {current_item_date_str} which is older than limit {oldest_needed_date_str}. Stopping.")
                            return grouped_news

                except Exception as e:
                    # print(f"Date parse error: {e} for {raw_date}")
                    continue

            # If the entire page has dates NEWER than what we look for? No, pages go new -> old.
            # So if we process a page and the last item is still NEWER than our newest needed date (rare if missing dates are recent), we continue.
            # If the last item is OLDER than our oldest needed date, handled above.
            
            # What if we found some data for some dates but not all?
            # We continue to next page.
            
            page += 1
            
        return grouped_news

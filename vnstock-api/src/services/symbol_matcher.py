# Symbol Matcher Service
# Matches news articles with stock symbols mentioned in content

import re
from typing import List, Set, Optional
from functools import lru_cache

from src.database.mongodb import db


class SymbolMatcher:
    """
    Matches news articles with stock symbols mentioned in title and content.
    Uses regex patterns to detect stock symbols in text.
    """
    
    # Common VN30 and blue chip symbols for quick matching
    VN30_SYMBOLS = [
        'ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
        'MBB', 'MSN', 'MWG', 'PLX', 'POW', 'SAB', 'SHB', 'SSB', 'SSI', 'STB',
        'TCB', 'TPB', 'VCB', 'VHM', 'VIB', 'VIC', 'VJC', 'VNM', 'VPB', 'VRE'
    ]
    
    # Index symbols to exclude from matching
    INDEX_SYMBOLS = ['VNINDEX', 'VN30', 'HNX', 'HNXINDEX', 'UPCOM', 'VN100']
    
    def __init__(self):
        self._all_symbols: Optional[Set[str]] = None
        self._symbol_names: dict = {}  # Maps symbol to company name for better matching
    
    def _load_symbols_from_db(self) -> Set[str]:
        """Load all stock symbols from MongoDB."""
        try:
            collection = db.get_database()["stock_symbols"]
            cursor = collection.find({}, {'symbol': 1, 'name': 1})
            
            symbols = set()
            for doc in cursor:
                symbol = doc.get('symbol', '').upper()
                if symbol and symbol not in self.INDEX_SYMBOLS:
                    symbols.add(symbol)
                    # Store company name for potential matching
                    name = doc.get('name', '')
                    if name:
                        self._symbol_names[symbol] = name
            
            print(f"[SymbolMatcher] Loaded {len(symbols)} symbols from DB")
            return symbols
            
        except Exception as e:
            print(f"[SymbolMatcher] Error loading symbols: {e}")
            # Fallback to VN30 + common symbols
            return set(self.VN30_SYMBOLS)
    
    @property
    def all_symbols(self) -> Set[str]:
        """Get all symbols, loading from DB if needed."""
        if self._all_symbols is None:
            self._all_symbols = self._load_symbols_from_db()
        return self._all_symbols
    
    def refresh_symbols(self):
        """Refresh symbols from database."""
        self._all_symbols = self._load_symbols_from_db()
    
    def match_symbols(self, title: str, content: str = '', 
                      use_strict_mode: bool = True) -> List[str]:
        """
        Find stock symbols mentioned in title and content.
        
        Args:
            title: Article title
            content: Article content (can be HTML or plain text)
            use_strict_mode: If True, require context clues for common words
            
        Returns:
            List of matched stock symbols (uppercase)
        """
        # Combine and normalize text
        text = f"{title} {content}".upper()
        
        # Remove HTML tags if present
        text = re.sub(r'<[^>]+>', ' ', text)
        
        matched = set()
        
        for symbol in self.all_symbols:
            if self._is_symbol_mentioned(symbol, text, use_strict_mode):
                matched.add(symbol)
        
        return sorted(list(matched))
    
    def _is_symbol_mentioned(self, symbol: str, text: str, strict_mode: bool) -> bool:
        """Check if a symbol is mentioned in text."""
        # Common word symbols that need context
        common_words = {'GAS', 'POW', 'SAB', 'VIC', 'HAG', 'DHG', 'DIG', 'REE'}
        
        # Vietnamese context patterns
        context_patterns = [
            rf'\bCỔ PHIẾU\s+{symbol}\b',
            rf'\bMÃ\s+{symbol}\b',
            rf'\b{symbol}\s+CỦA\b',
            rf'\b{symbol}\s+TĂNG\b',
            rf'\b{symbol}\s+GIẢM\b',
            rf'\b{symbol}\s+LÊN\b',
            rf'\b{symbol}\s+XUỐNG\b',
            rf'\bCP\s+{symbol}\b',
            rf'\bCỔ\s+ĐÔNG\s+{symbol}\b',
            rf'\bHĐQT\s+{symbol}\b',
            rf'\bLÃNH ĐẠO\s+{symbol}\b',
            rf'\bCTCP\s+{symbol}\b',
            rf'\bCÔNG TY.*{symbol}\b',
        ]
        
        # For strict mode and common words, require context
        if strict_mode and symbol in common_words:
            for pattern in context_patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return True
            # Also check for stock-related context nearby
            symbol_pattern = rf'.{{0,50}}{symbol}.{{0,50}}'
            matches = re.findall(symbol_pattern, text, re.IGNORECASE)
            for match in matches:
                stock_keywords = ['CỔ PHIẾU', 'CHỨNG KHOÁN', 'GIAO DỊCH', 'GIÁ', 
                                  'KHỐI LƯỢNG', 'VN-INDEX', 'HNX', 'HOSE', 'UPCOM',
                                  'TĂNG', 'GIẢM', 'MUA', 'BÁN', 'SÀN']
                if any(kw in match.upper() for kw in stock_keywords):
                    return True
            return False
        
        # For other symbols, simple word boundary match
        simple_pattern = rf'\b{symbol}\b'
        if re.search(simple_pattern, text):
            return True
        
        # Check context patterns for any symbol
        for pattern in context_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        
        return False
    
    def match_symbols_fast(self, title: str) -> List[str]:
        """
        Fast matching using only title and VN30 symbols.
        Use for quick filtering before full content scraping.
        """
        text = title.upper()
        matched = set()
        
        for symbol in self.VN30_SYMBOLS:
            if re.search(rf'\b{symbol}\b', text):
                matched.add(symbol)
        
        return sorted(list(matched))
    
    def get_company_name(self, symbol: str) -> str:
        """Get company name for a symbol."""
        if symbol in self._symbol_names:
            return self._symbol_names[symbol]
        
        # Try to load from DB
        try:
            collection = db.get_database()["stock_symbols"]
            doc = collection.find_one({'symbol': symbol.upper()})
            if doc:
                name = doc.get('name', '')
                self._symbol_names[symbol] = name
                return name
        except:
            pass
        
        return ''


# Singleton instance
_matcher_instance: Optional[SymbolMatcher] = None


def get_symbol_matcher() -> SymbolMatcher:
    """Get singleton SymbolMatcher instance."""
    global _matcher_instance
    if _matcher_instance is None:
        _matcher_instance = SymbolMatcher()
    return _matcher_instance


def match_symbols(title: str, content: str = '') -> List[str]:
    """Convenience function to match symbols."""
    matcher = get_symbol_matcher()
    return matcher.match_symbols(title, content)

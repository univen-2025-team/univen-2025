from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PriceBar(BaseModel):
    """Single price bar (OHLCV) for a specific time."""
    time: str = Field(..., description="Time in HH:MM:SS format")
    open: float = Field(..., description="Opening price")
    high: float = Field(..., description="Highest price")
    low: float = Field(..., description="Lowest price")
    close: float = Field(..., description="Closing price")
    volume: int = Field(..., description="Trading volume")


class StockHistoryDTO(BaseModel):
    """
    Data Transfer Object for Stock Price History.
    Each record represents a full trading day with all price bars.
    
    New format: one document per symbol+date+interval containing array of all price bars.
    """
    symbol: str = Field(..., description="Stock ticker symbol")
    date: str = Field(..., description="Trading date in YYYY-MM-DD format")
    interval: str = Field(..., description="Time interval (1m, 5m, 15m, 30m, 1H)")
    prices: List[PriceBar] = Field(default_factory=list, description="Array of price bars for the day")
    updated_at: Optional[datetime] = Field(default=None, description="Last update timestamp")
    
    class Config:
        extra = "allow"
        populate_by_name = True

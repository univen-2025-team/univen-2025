export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

export interface VN30Index {
  index: number;
  change: number;
  changePercent: number;
}

export interface MarketData {
  vn30Index: VN30Index;
  stocks: StockData[];
  topGainers: StockData[];
  topLosers: StockData[];
  total: number;
  timestamp: string;
}

export interface IndexHistoryPoint {
  time: string;
  index: number;
}


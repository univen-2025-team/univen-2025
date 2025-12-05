export type TimeRange =
    | '15s'
    | '1m'
    | '3m'
    | '5m'
    | '15m'
    | '30m'
    | '1h'
    | '6h'
    | '12h'
    | '1D'
    | '1W'
    | '1M'
    | '3M'
    | '1Y';

export interface StockDetailData {
    symbol: string;
    companyName: string;
    price: number;
    prices?: Array<{
        time: string;
        price: number;
        volume: number;
    }>;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
    previousClose: number;
    marketCap: number;
    pe: number;
    eps: number;
    lastUpdate: string;
}

export interface PriceHistoryPoint {
    time: string;
    price: number;
    volume: number;
    open?: number;
    close?: number;
    high?: number;
    low?: number;
}

export interface TechnicalIndicator {
    ma5: number;
    ma10: number;
    ma20: number;
    rsi: number;
    macd: number;
}

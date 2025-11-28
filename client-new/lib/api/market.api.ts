import axiosInstance from "../axios";

export interface VN30Index {
    index: number;
    change: number;
    changePercent: number;
}

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

export interface MarketData {
    vn30Index: VN30Index;
    stocks: StockData[];
    topGainers: StockData[];
    topLosers: StockData[];
    timestamp: string;
}

export interface StockDetail {
    stock: StockData;
    timestamp: string;
}

export interface PriceHistoryPoint {
    time: string;
    price: number;
    open?: number;
    close?: number;
    high?: number;
    low?: number;
    volume?: number;
}

export interface StockHistory {
    symbol: string;
    data: PriceHistoryPoint[];
    startDate: string;
    endDate: string;
    timestamp: string;
}

export const marketApi = {
    // Get market overview data
    getMarketData: async (): Promise<MarketData> => {
        const response = await axiosInstance.get("/market");
        return response.data.metadata;
    },

    // Get stock detail
    getStockDetail: async (symbol: string): Promise<StockDetail> => {
        const response = await axiosInstance.get(`/market/stock/${symbol}`);
        return response.data.metadata;
    },

    // Get stock historical data
    getStockHistory: async (
        symbol: string,
        startDate?: string,
        endDate?: string
    ): Promise<StockHistory> => {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);

        const queryString = params.toString();
        const url = `/market/stock/${symbol}/history${queryString ? `?${queryString}` : ""}`;

        const response = await axiosInstance.get(url);
        return response.data.metadata;
    },
};


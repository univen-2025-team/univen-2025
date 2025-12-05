import { MarketData } from '@/lib/types/market';
import {
    PriceHistoryPoint,
    StockDetailData,
    TechnicalIndicator,
    TimeRange
} from '@/lib/types/stock-detail';

export type MarketSortField = 'price' | 'change' | 'changePercent' | 'volume';
export type MarketSortOrder = 'asc' | 'desc';

export interface FetchMarketDataParams {
    sortBy?: MarketSortField;
    order?: MarketSortOrder;
    limit?: number;
    signal?: AbortSignal;
}

export interface MarketApiResponse {
    success: boolean;
    data?: MarketData;
    error?: string;
    message?: string;
}

export interface FetchStockDetailParams {
    symbol: string;
    timeRange?: TimeRange;
    signal?: AbortSignal;
}

export interface StockDetailApiResponse {
    success: boolean;
    data?: {
        stock: StockDetailData;
        priceHistory: PriceHistoryPoint[];
        technicalIndicators: TechnicalIndicator;
    };
    error?: string;
    message?: string;
}

// Helper function to convert stock data to StockDetailData
const convertToStockDetailData = (stock: {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
}): StockDetailData => {
    return {
        symbol: stock.symbol,
        companyName: stock.symbol, // Use symbol as fallback
        price: stock.price,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        high: stock.high,
        low: stock.low,
        open: stock.open,
        close: stock.close,
        previousClose: stock.close - stock.change, // Calculate from change
        marketCap: 0, // Not available
        pe: 0, // Not available
        eps: 0, // Not available
        lastUpdate: new Date().toISOString()
    };
};

// Note: Helper functions for date range and price history conversion removed
// as they are no longer needed since we're using Socket.IO instead of REST API

export const fetchMarketDataService = async (
    params?: FetchMarketDataParams
): Promise<MarketApiResponse> => {
    try {
        const searchParams = new URLSearchParams();
        if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
        if (params?.order) searchParams.set('order', params.order);
        if (params?.limit) searchParams.set('limit', String(params.limit));

        // Call Node.js backend directly
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1/api';
        const response = await fetch(
            `${apiBaseUrl}/market${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                cache: 'no-store',
                signal: params?.signal
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch market data (${response.status})`);
        }

        const result = await response.json();

        // Handle Node.js backend response format: { statusCode, message, metadata }
        if (result.statusCode === 200 && result.metadata) {
            // Fetch all stocks
            const stocksResponse = await fetch(
                `${apiBaseUrl}/market/stocks?date=${result.metadata.date}`,
                {
                    headers: { 'Content-Type': 'application/json' },
                    cache: 'no-store'
                }
            );

            const stocksResult = await stocksResponse.json();
            const allStocks =
                stocksResult.statusCode === 200 && stocksResult.metadata?.stocks
                    ? stocksResult.metadata.stocks
                    : [];

            return {
                success: true,
                data: {
                    vn30Index: result.metadata.vn30Index,
                    stocks: allStocks,
                    topGainers: result.metadata.topGainers || [],
                    topLosers: result.metadata.topLosers || [],
                    total: result.metadata.totalStocks || allStocks.length,
                    timestamp: result.metadata.timestamp || new Date().toISOString()
                }
            };
        }

        return {
            success: false,
            error: result.message || 'Failed to fetch market data'
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Network error: Unable to fetch market data';
        return {
            success: false,
            error: message
        };
    }
};

export const fetchStockDetail = async (
    params: FetchStockDetailParams
): Promise<StockDetailApiResponse> => {
    try {
        const { symbol, timeRange = '1m', signal } = params;

        // Call Node.js backend directly
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1/api';
        const response = await fetch(
            `${apiBaseUrl}/market/stock/${symbol}?timeRange=${encodeURIComponent(timeRange)}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                cache: 'no-store',
                signal
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch stock data (${response.status})`);
        }

        const result = await response.json();

        // Handle Node.js backend response format: { statusCode, message, metadata }
        if (result.statusCode === 200 && result.metadata) {
            return {
                success: true,
                data: result.metadata
            };
        }

        return {
            success: false,
            error: result.message || 'Failed to fetch stock data'
        };
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Network error: Unable to fetch stock data';
        return {
            success: false,
            error: message
        };
    }
};

/**
 * Market Cache API Service
 * Fetches cached market data from Node.js server
 */

import { API_URL } from "@/src/config/app";

const API_BASE_URL = API_URL;
console.log({ API_BASE_URL });

export interface CachedMarketData {
    date: string;
    timestamp: Date;
    vn30Index: {
        index: number;
        change: number;
        changePercent: number;
    };
    topGainers: Array<{
        symbol: string;
        companyName: string;
        price: number;
        change: number;
        changePercent: number;
        volume: number;
    }>;
    topLosers: Array<{
        symbol: string;
        companyName: string;
        price: number;
        change: number;
        changePercent: number;
        volume: number;
    }>;
    topStocksByPrice?: Array<{
        symbol: string;
        companyName: string;
        price: number;
        change: number;
        changePercent: number;
        volume: number;
    }>;
    totalStocks: number;
}

export interface StockPriceData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface CachedStockData {
    symbol: string;
    date: string;
    companyName: string;
    price: number;
    prices?: StockPriceData[];
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
    previousClose: number;
}

/**
 * Get latest cached market data
 */
export async function getLatestMarketData(): Promise<CachedMarketData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/market`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch market data:', response.statusText);
            return null;
        }

        const result = await response.json();
        return result.metadata || null;
    } catch (error) {
        console.error('Error fetching market data:', error);
        return null;
    }
}

/**
 * Get cached market data for specific date
 */
export async function getMarketDataByDate(date: string): Promise<CachedMarketData | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/market?date=${date}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch market data:', response.statusText);
            return null;
        }

        const result = await response.json();
        return result.metadata || null;
    } catch (error) {
        console.error('Error fetching market data:', error);
        return null;
    }
}

/**
 * Get cached stock data
 */
export async function getStockData(symbol: string, date?: string): Promise<CachedStockData | null> {
    try {
        // Đảm bảo symbol là uppercase (VCB, VNM, etc.)
        const upperSymbol = symbol.toUpperCase().trim();

        const url = date
            ? `${API_BASE_URL}/market/stock/${upperSymbol}?date=${date}`
            : `${API_BASE_URL}/market/stock/${upperSymbol}`;

        console.log(`📊 Fetching stock data from: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'no-store' // Đảm bảo không cache để lấy data mới nhất
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Failed to fetch stock data for ${upperSymbol}:`, {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            return null;
        }

        const result = await response.json();

        // Kiểm tra response format theo API_ENDPOINTS.md: { statusCode, message, metadata }
        if (result.statusCode === 200 && result.metadata) {
            console.log(`✅ Stock data fetched for ${upperSymbol}:`, result.metadata);
            return result.metadata;
        } else {
            console.warn(`⚠️ Unexpected response format for ${upperSymbol}:`, result);
            return result.metadata || null;
        }
    } catch (error) {
        console.error(`❌ Error fetching stock data for ${symbol}:`, error);
        return null;
    }
}

/**
 * Get all stocks for a specific date
 */
export async function getAllStocksByDate(date: string): Promise<CachedStockData[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/market/stocks?date=${date}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch stocks:', response.statusText);
            return [];
        }

        const result = await response.json();
        return result.metadata?.stocks || [];
    } catch (error) {
        console.error('Error fetching stocks:', error);
        return [];
    }
}

/**
 * Get all stocks from latest date (without specifying date)
 */
export async function getAllStocks(): Promise<CachedStockData[]> {
    try {
        // First get available dates
        const dates = await getAvailableDates(1);
        if (dates.length === 0) {
            console.error('No available dates found');
            return [];
        }
        
        // Fetch stocks from the latest date
        return await getAllStocksByDate(dates[0]);
    } catch (error) {
        console.error('Error fetching all stocks:', error);
        return [];
    }
}

/**
 * Get available cached dates
 */
export async function getAvailableDates(limit: number = 30): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/market/dates?limit=${limit}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch available dates:', response.statusText);
            return [];
        }

        const result = await response.json();
        return result.metadata?.dates || [];
    } catch (error) {
        console.error('Error fetching available dates:', error);
        return [];
    }
}

/**
 * Get VN30 history
 */
export async function getVN30History(
    limit: number = 30,
    type: 'daily' | 'intraday' = 'daily'
): Promise<Array<{ time: string; index: number }>> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/market/history/vn30?limit=${limit}&type=${type}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) {
            console.error('Failed to fetch VN30 history:', response.statusText);
            return [];
        }

        const result = await response.json();
        return result.metadata?.history || [];
    } catch (error) {
        console.error('Error fetching VN30 history:', error);
        return [];
    }
}

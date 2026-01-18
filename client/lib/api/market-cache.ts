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

export interface CachedStockData {
    symbol: string;
    date: string;
    companyName: string;
    price: number;
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
        console.log('🔍 getLatestMarketData: Fetching from', `${API_BASE_URL}/market`);
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
        console.log('🔍 getLatestMarketData: Result received, metadata exists:', !!result.metadata);
        if (result.metadata) {
            console.log('🔍 getLatestMarketData: topGainers:', result.metadata.topGainers?.length || 0);
            console.log('🔍 getLatestMarketData: topLosers:', result.metadata.topLosers?.length || 0);
            console.log('🔍 getLatestMarketData: topStocksByPrice:', result.metadata.topStocksByPrice?.length || 0);
        }
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

/**
 * Get all stocks from latest market data
 * Combines topGainers, topLosers, and topStocksByPrice
 */
export async function getAllStocks(): Promise<CachedStockData[]> {
    try {
        console.log('🔍 getAllStocks: Fetching market data...');
        const marketData = await getLatestMarketData();
        console.log('🔍 getAllStocks: marketData received:', marketData ? 'Yes' : 'No');
        
        if (!marketData) {
            console.error('No market data available');
            return [];
        }
        
        console.log('🔍 getAllStocks: topStocksByPrice count:', marketData.topStocksByPrice?.length || 0);
        console.log('🔍 getAllStocks: topGainers count:', marketData.topGainers?.length || 0);
        console.log('🔍 getAllStocks: topLosers count:', marketData.topLosers?.length || 0);

        // Combine all stocks from different sources
        const allStocksMap = new Map<string, CachedStockData>();
        
        // Add from topStocksByPrice first (has most complete data)
        if (marketData.topStocksByPrice) {
            marketData.topStocksByPrice.forEach((stock: any) => {
                if (stock.symbol && stock.symbol !== 'VNINDEX') {
                    allStocksMap.set(stock.symbol, {
                        symbol: stock.symbol,
                        date: stock.date || marketData.date,
                        companyName: stock.companyName || stock.symbol,
                        price: stock.price || stock.close || 0,
                        change: stock.change || 0,
                        changePercent: stock.changePercent || 0,
                        volume: stock.volume || 0,
                        high: stock.high || stock.price || 0,
                        low: stock.low || stock.price || 0,
                        open: stock.open || stock.price || 0,
                        close: stock.close || stock.price || 0,
                        previousClose: stock.previousClose || (stock.price - stock.change) || 0
                    });
                }
            });
        }

        // Add from topGainers
        if (marketData.topGainers) {
            marketData.topGainers.forEach((stock: any) => {
                if (stock.symbol && !allStocksMap.has(stock.symbol)) {
                    allStocksMap.set(stock.symbol, {
                        symbol: stock.symbol,
                        date: marketData.date,
                        companyName: stock.companyName || stock.symbol,
                        price: stock.price || 0,
                        change: stock.change || 0,
                        changePercent: stock.changePercent || 0,
                        volume: stock.volume || 0,
                        high: stock.price || 0,
                        low: stock.price || 0,
                        open: stock.price || 0,
                        close: stock.price || 0,
                        previousClose: stock.price - (stock.change || 0)
                    });
                }
            });
        }

        // Add from topLosers
        if (marketData.topLosers) {
            marketData.topLosers.forEach((stock: any) => {
                if (stock.symbol && !allStocksMap.has(stock.symbol)) {
                    allStocksMap.set(stock.symbol, {
                        symbol: stock.symbol,
                        date: marketData.date,
                        companyName: stock.companyName || stock.symbol,
                        price: stock.price || 0,
                        change: stock.change || 0,
                        changePercent: stock.changePercent || 0,
                        volume: stock.volume || 0,
                        high: stock.price || 0,
                        low: stock.price || 0,
                        open: stock.price || 0,
                        close: stock.price || 0,
                        previousClose: stock.price - (stock.change || 0)
                    });
                }
            });
        }

        // Convert to array and sort by symbol
        const stocks = Array.from(allStocksMap.values())
            .sort((a, b) => a.symbol.localeCompare(b.symbol));
        
        console.log(`📊 getAllStocks: Found ${stocks.length} stocks`);
        return stocks;
    } catch (error) {
        console.error('Error fetching all stocks:', error);
        return [];
    }
}

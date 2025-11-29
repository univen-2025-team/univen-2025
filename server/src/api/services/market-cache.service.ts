/**
 * Market Cache Service for Node.js Server
 * Queries cached market data from MongoDB using Mongoose models.
 */

import LoggerService from './logger.service';
import MarketDataModel from '@/models/market-data.model';
import StockDataModel from '@/models/stock-data.model';

// Lean types (without Document methods)
type MarketDataLean = {
    date: string;
    timestamp: Date;
    vn30Index: {
        index: number;
        change: number;
        changePercent: number;
    };
    topGainers: any[];
    topLosers: any[];
    totalStocks: number;
    metadata: {
        source: string;
        fetchedAt: Date;
    };
};

type StockDataLean = {
    symbol: string;
    date: string;
    companyName: string;
    price: number;
    prices: Array<{
        time: string;
        open: number;
        high: number;
        low: number;
        close: number;
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
    metadata: {
        fetchedAt: Date;
    };
};

export default class MarketCacheService {
    private static logger = LoggerService.getInstance();

    /**
     * Get latest cached market data
     */
    static async getLatestMarketData(): Promise<MarketDataLean | null> {
        try {
            const result = await MarketDataModel.findOne({}).sort({ date: -1 }).lean().exec();

            return result as MarketDataLean | null;
        } catch (error) {
            this.logger.error('Error getting latest market data', error as any);
            return null;
        }
    }

    /**
     * Get market data for specific date
     */
    static async getMarketDataByDate(date: string): Promise<MarketDataLean | null> {
        try {
            const result = await MarketDataModel.findOne({ date }).lean().exec();

            return result as MarketDataLean | null;
        } catch (error) {
            this.logger.error(`Error getting market data for ${date}`, error as any);
            return null;
        }
    }

    /**
     * Get stock data for specific symbol and date
     */
    static async getStockData(symbol: string, date: string): Promise<StockDataLean | null> {
        try {
            const result = await StockDataModel.findOne({
                symbol: symbol.toUpperCase(),
                date
            })
                .lean()
                .exec();

            return result as StockDataLean | null;
        } catch (error) {
            this.logger.error(`Error getting stock data for ${symbol}`, error as any);
            return null;
        }
    }

    /**
     * Get latest stock data for a symbol
     */
    static async getLatestStockData(symbol: string): Promise<StockDataLean | null> {
        try {
            const result = await StockDataModel.findOne({ symbol: symbol.toUpperCase() })
                .sort({ date: -1 })
                .lean()
                .exec();

            return result as StockDataLean | null;
        } catch (error) {
            this.logger.error(`Error getting latest stock data for ${symbol}`, error as any);
            return null;
        }
    }

    /**
     * Get all stocks for a specific date
     */
    static async getAllStocksByDate(date: string): Promise<StockDataLean[]> {
        try {
            const results = await StockDataModel.find({ date }).lean().exec();

            return results as StockDataLean[];
        } catch (error) {
            this.logger.error(`Error getting all stocks for ${date}`, error as any);
            return [];
        }
    }

    /**
     * Get list of available cached dates
     */
    static async getAvailableDates(limit: number = 30): Promise<string[]> {
        try {
            const results = await MarketDataModel.find({})
                .select('date')
                .sort({ date: -1 })
                .limit(limit)
                .lean()
                .exec();

            return results.map((r: any) => r.date);
        } catch (error) {
            this.logger.error('Error getting available dates', error as any);
            return [];
        }
    }

    /**
     * Get VN30 Index history
     */
    static async getVN30History(limit: number = 30): Promise<any[]> {
        try {
            // If limit is small (e.g., 1 for 1D), we might want intraday data
            // But the current API design uses 'limit' as days for history
            // Let's check if we should fetch intraday based on a convention or separate method
            // For now, let's keep this for daily history

            const results = await MarketDataModel.find({})
                .select('date vn30Index timestamp')
                .sort({ date: 1 }) // Sort ascending for chart
                .limit(limit)
                .lean()
                .exec();

            return results.map((r: any) => ({
                time: r.date, // Use date as time label for now
                index: r.vn30Index.index
            }));
        } catch (error) {
            this.logger.error('Error getting VN30 history', error as any);
            return [];
        }
    }

    /**
     * Get VN30 Intraday data
     */

    static async getVN30Intraday(limit: number = 300): Promise<any[]> {
        try {
            // Query StockDataModel for VN30 symbol
            // This leverages the unified storage where VN30 is treated as a stock
            const result = await StockDataModel.findOne({ symbol: 'VN30' })
                .sort({ date: -1 }) // Get latest date
                .lean()
                .exec();

            if (!result || !result.prices) {
                return [];
            }

            // The prices array is already in chronological order (09:15 -> 15:00)
            // We just need to map it to the expected format

            let prices = result.prices;

            // Filter by time duration (limit is treated as minutes)
            if (limit > 0 && prices.length > 0) {
                // Get the timestamp of the last data point
                const lastPoint = prices[prices.length - 1];
                // Handle "YYYY-MM-DD HH:MM:SS" format
                const lastTime = new Date(lastPoint.time).getTime();

                if (!isNaN(lastTime)) {
                    const durationMs = limit * 60 * 1000; // Convert minutes to ms
                    const cutoffTime = lastTime - durationMs;

                    prices = prices.filter((p: any) => {
                        const pTime = new Date(p.time).getTime();
                        return pTime >= cutoffTime;
                    });
                } else {
                    // Fallback to slice if date parsing fails
                    if (limit < prices.length) {
                        prices = prices.slice(-limit);
                    }
                }
            }

            return prices.map((p: any) => ({
                time: p.time,
                index: p.close, // Use close price as index value
                volume: p.volume
            }));
        } catch (error) {
            this.logger.error('Error getting VN30 intraday', error as any);
            return [];
        }
    }
}

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
     * Get top stocks by price from the latest trading day
     * Returns top N stocks sorted by price descending
     */
    static async getTopStocksByPrice(limit: number = 10): Promise<StockDataLean[]> {
        try {
            // Get all stocks from the latest date, sorted by price descending
            const results = await StockDataModel.find({ symbol: { $ne: 'VN30' } }) // Exclude VN30 index
                .sort({ date: -1, price: -1 })
                .limit(limit * 2) // Get extra to filter by latest date
                .lean()
                .exec();

            if (results.length === 0) {
                return [];
            }

            // Get the latest date from results
            const latestDate = (results[0] as any).date;

            // Filter to only include stocks from the latest date and sort by price
            const latestDateStocks = (results as StockDataLean[])
                .filter((s) => s.date === latestDate)
                .sort((a, b) => b.price - a.price)
                .slice(0, limit);

            return latestDateStocks;
        } catch (error) {
            this.logger.error('Error getting top stocks by price', error as any);
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
     * Logic:
     * 1. Get current time (HH:MM in Vietnam timezone)
     * 2. Filter data from latest trading day that is <= current time HH:MM
     * 3. Return the last N points from filtered data
     *
     * Example: Current time is 11:00, limit is 10
     * - Returns data points from ~10:50 to 11:00 of latest trading day
     * - If no data exists before 11:00 (e.g., market hasn't opened), returns empty
     */
    static async getVN30Intraday(limit: number = 300): Promise<any[]> {
        try {
            // Query StockDataModel for VN30 symbol
            const result = await StockDataModel.findOne({ symbol: 'VN30' })
                .sort({ date: -1 }) // Get latest date
                .lean()
                .exec();

            if (!result || !result.prices || result.prices.length === 0) {
                return [];
            }

            const prices = result.prices as any[];

            // Get current time in Vietnam timezone (UTC+7)
            const now = new Date();
            const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000); // Add 7 hours for UTC+7
            const currentHour = vietnamTime.getUTCHours();
            const currentMinute = vietnamTime.getUTCMinutes();

            // Build current time string for comparison (HH:MM format)
            const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(
                currentMinute
            ).padStart(2, '0')}`;

            // Log first and last data points for debugging
            const firstPrice = prices[0];
            const lastPrice = prices[prices.length - 1];
            this.logger.info(
                `VN30 Intraday: currentTime=${currentTimeStr}, limit=${limit}, totalPrices=${prices.length}, dataDate=${result.date}`
            );
            this.logger.info(
                `VN30 Intraday: firstDataTime=${firstPrice?.time}, lastDataTime=${lastPrice?.time}`
            );

            // Extract HH:MM from data points for comparison
            const getTimeOnly = (timeStr: string) => {
                // timeStr format: "YYYY-MM-DD HH:MM:SS"
                if (timeStr.includes(' ')) {
                    return timeStr.split(' ')[1].substring(0, 5); // Get "HH:MM"
                }
                return timeStr;
            };

            // Filter data that is BEFORE or AT current time HH:MM
            // This ensures we NEVER return data from the future (relative to current time of day)
            const dataBeforeOrAtCurrentTime = prices.filter((p: any) => {
                const pTime = getTimeOnly(p.time);
                return pTime <= currentTimeStr;
            });

            this.logger.info(
                `VN30 Intraday: found ${dataBeforeOrAtCurrentTime.length} points before/at ${currentTimeStr}`
            );

            // Log sample of filtered data for debugging
            if (dataBeforeOrAtCurrentTime.length > 0) {
                const lastFiltered =
                    dataBeforeOrAtCurrentTime[dataBeforeOrAtCurrentTime.length - 1];
                this.logger.info(`VN30 Intraday: lastFilteredPoint time=${lastFiltered?.time}`);
            }

            // If we have data before current time, return the last N points
            if (dataBeforeOrAtCurrentTime.length > 0) {
                let resultPrices = dataBeforeOrAtCurrentTime;
                if (limit > 0 && limit < dataBeforeOrAtCurrentTime.length) {
                    resultPrices = dataBeforeOrAtCurrentTime.slice(-limit);
                }

                return resultPrices.map((p: any) => ({
                    time: p.time,
                    index: p.close,
                    volume: p.volume
                }));
            }

            // No data before current time (e.g., it's 8:00 AM and market opens at 9:15)
            // Return empty - chart will show "no data" message
            this.logger.info(`VN30 Intraday: no data before ${currentTimeStr}, returning empty`);
            return [];
        } catch (error) {
            this.logger.error('Error getting VN30 intraday', error as any);
            return [];
        }
    }
}

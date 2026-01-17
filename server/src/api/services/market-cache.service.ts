/**
 * Market Cache Service for Node.js Server
 * Queries cached market data from MongoDB using Mongoose models.
 */

import LoggerService from './logger.service';
import MarketDataModel from '@/models/market-data.model';
import StockDataModel from '@/models/stock-data.model';
import StockTicksModel from '@/models/stock-ticks.model';

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
    tickCount?: number;  // Count of ticks stored in separate collection
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
            // Get latest N records (sort desc to get most recent, then reverse for chart)
            const results = await MarketDataModel.find({})
                .select('date vn30Index timestamp')
                .sort({ date: -1 }) // Sort descending to get latest
                .limit(limit)
                .lean()
                .exec();

            // Reverse to get ascending order for chart display
            const reversed = results.reverse();

            return reversed.map((r: any) => ({
                time: r.date,
                index: r.vn30Index?.index || 0
            }));
        } catch (error) {
            this.logger.error('Error getting VN30 history', error as any);
            return [];
        }
    }

    /**
     * Get VN30 Intraday data from separate ticks collection
     * Queries stock_ticks collection for efficient tick-level data retrieval
     * Falls back to VCB proxy or daily history if no VN30 ticks available
     */
    static async getVN30Intraday(limit: number = 300): Promise<any[]> {
        try {
            // First, try to find VN30 in stock_data
            let latestStock = await StockDataModel.findOne({ symbol: 'VN30' })
                .sort({ date: -1 })
                .select('date tickCount')
                .lean()
                .exec();

            // If VN30 not found, use VCB (or any stock) to get the latest date
            if (!latestStock) {
                this.logger.info('VN30 Intraday: No VN30 in stock_data, using VCB for date');
                latestStock = await StockDataModel.findOne({ symbol: 'VCB' })
                    .sort({ date: -1 })
                    .select('date tickCount')
                    .lean()
                    .exec();
            }

            if (!latestStock) {
                this.logger.info('VN30 Intraday: No stock data found at all, falling back to daily history');
                return this.getVN30History(limit);
            }

            const latestDate = (latestStock as any).date;
            const tickCount = (latestStock as any).tickCount || 0;

            this.logger.info(
                `VN30 Intraday: fetching ticks for date=${latestDate}, tickCount=${tickCount}, limit=${limit}`
            );

            // Query VN30 ticks from separate collection
            const ticks = await StockTicksModel.find({
                symbol: 'VN30',
                date: latestDate
            })
                .sort({ time: 1 }) // Sort ascending for chart
                .lean()
                .exec();

            // If no VN30 ticks available, fall back to daily history
            // Don't use stock prices as proxy - they have different scales
            if (!ticks || ticks.length === 0) {
                this.logger.info(
                    'VN30 Intraday: No VN30 ticks found, falling back to daily history'
                );
                return this.getVN30History(limit);
            }

            this.logger.info(`VN30 Intraday: found ${ticks.length} ticks for ${latestDate}`);

            // Apply limit (return last N ticks)
            let resultTicks = ticks;
            if (limit > 0 && limit < ticks.length) {
                resultTicks = ticks.slice(-limit);
            }

            // Return in chart format
            return resultTicks.map((t: any) => ({
                time: t.time,
                index: t.price,
                volume: t.volume
            }));
        } catch (error) {
            this.logger.error('Error getting VN30 intraday', error as any);
            // Fall back to daily history on error
            return this.getVN30History(limit);
        }
    }
}
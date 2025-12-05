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
}

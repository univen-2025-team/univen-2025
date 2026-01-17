/**
 * Market Cache Service for Node.js Server
 * Queries cached market data from MongoDB.
 * Uses stock_history collection (synced from vnstock-api).
 */

import LoggerService from './logger.service';
import MarketDataModel from '@/models/market-data.model';
import StockHistoryModel, { IPriceBar } from '@/models/stock-history.model';
import CompanyProfileModel from '@/models/company-profile.model';
import StockSymbolModel from '@/models/stock-symbol.model';
import axios from 'axios';
import { VNSTOCK_API_URL } from '@/configs/vnstock.config';
import QueueService from './queue.service';
import { eachDayOfInterval, format } from 'date-fns';

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

type StockHistoryLean = {
    symbol: string;
    date: string;
    interval: string;
    unit: string;
    prices: IPriceBar[];
    updated_at: Date;
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
     * Get stock history for specific symbol and date
     */
    static async getStockHistory(symbol: string, date: string, interval: string = '1m'): Promise<StockHistoryLean | null> {
        try {
            const result = await StockHistoryModel.findOne({
                symbol: symbol.toUpperCase(),
                date,
                interval
            }).lean().exec();
            return result as StockHistoryLean | null;
        } catch (error) {
            this.logger.error(`Error getting stock history for ${symbol}`, error as any);
            return null;
        }
    }

    /**
     * Get latest stock history with Queue fallback support
     * For "Latest" request, we still try synchronous fetch for UX, 
     * but we could fallback to Queue if sync fails.
     */
    static async getLatestStockHistory(symbol: string, interval: string = '1m'): Promise<StockHistoryLean | null> {
        try {
            const result = await StockHistoryModel.findOne({
                symbol: symbol.toUpperCase(),
                interval
            })
                .sort({ date: -1 })
                .lean()
                .exec();

            if (result) return result as StockHistoryLean;

            // Cache miss - Use Queue or Direct? 
            // User 'filter change' implies historical. 'Latest' implies current.
            // For current price, fast direct sync is better.
            this.logger.info(`Cache miss for ${symbol}, attempting on-demand sync...`);
            try {
                await axios.get(`${VNSTOCK_API_URL}/sync-stock?symbol=${symbol}`);

                const retryResult = await StockHistoryModel.findOne({
                    symbol: symbol.toUpperCase(),
                    interval
                })
                    .sort({ date: -1 })
                    .lean()
                    .exec();

                if (retryResult) return retryResult as StockHistoryLean;
            } catch (error) {
                this.logger.error(`Direct sync failed, queuing job for ${symbol}`, error as any);
                // Queue for later retry
                QueueService.getInstance().addStockSyncJob(symbol);
            }

            return null;
        } catch (error) {
            this.logger.error(`Error getting latest stock history for ${symbol}`, error as any);
            return null;
        }
    }

    /**
     * Sync missing dates for a range via Queue
     */
    /**
     * Sync missing dates for a range via Queue
     * Pushes individual daily sync jobs to the queue.
     */
    static async queueMissingDates(symbol: string, startDate: string, endDate: string) {
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Generate all dates in range
            const dates = eachDayOfInterval({ start, end });

            // Check needing sync
            // Optimization: We could check DB first, but for now we trust the queue worker 
            // to be efficient or we just push everything if requested.
            // User requirement: "if user changes filter... put MISSING days into queue"
            // So we should ideally filter.

            const existingRecords = await StockHistoryModel.find({
                symbol: symbol.toUpperCase(),
                interval: '1m', // Assuming 1m for now, or pass as param
                date: {
                    $gte: format(start, 'yyyy-MM-dd'),
                    $lte: format(end, 'yyyy-MM-dd')
                }
            }).select('date').lean();

            const existingDates = new Set(existingRecords.map(r => r.date));
            const queueService = QueueService.getInstance();
            let queuedCount = 0;

            for (const dateObj of dates) {
                const dateStr = format(dateObj, 'yyyy-MM-dd');
                if (!existingDates.has(dateStr)) {
                    // Missing date, push to queue
                    await queueService.addStockSyncJob(symbol, dateStr);
                    queuedCount++;
                }
            }

            if (queuedCount > 0) {
                this.logger.info(`Queued ${queuedCount} missing days for ${symbol} from ${startDate} to ${endDate}`);
            }
        } catch (error) {
            this.logger.error(`Error queuing missing dates for ${symbol}`, error as any);
        }
    }

    /**
     * Get stock history with fallback to previous date if not found
     */
    static async getStockHistoryWithFallback(symbol: string, targetDate: string, interval: string = '1m'): Promise<StockHistoryLean | null> {
        try {
            let result = await this.getStockHistory(symbol, targetDate, interval);
            if (result) return result;

            const fallback = await StockHistoryModel.findOne({
                symbol: symbol.toUpperCase(),
                interval,
                date: { $lt: targetDate }
            })
                .sort({ date: -1 })
                .lean()
                .exec();

            if (fallback) {
                this.logger.info(`Using fallback data from ${(fallback as any).date} for ${symbol}`);
            }
            return fallback as StockHistoryLean | null;
        } catch (error) {
            this.logger.error(`Error getting stock history with fallback for ${symbol}`, error as any);
            return null;
        }
    }

    /**
     * Get price at a specific time for a symbol
     */
    static async getPriceAtTime(symbol: string, targetTime: string, targetDate?: string, interval: string = '1m'): Promise<IPriceBar | null> {
        try {
            const date = targetDate || new Date().toISOString().split('T')[0];
            const history = await this.getStockHistoryWithFallback(symbol, date, interval);

            if (!history || !history.prices || history.prices.length === 0) {
                return null;
            }

            const targetHM = targetTime.substring(0, 5);
            const exactMatch = history.prices.find(p => p.time.substring(0, 5) === targetHM);
            if (exactMatch) return exactMatch;

            const earlier = [...history.prices].filter(p => p.time.substring(0, 5) <= targetHM).pop();
            return earlier || null;
        } catch (error) {
            this.logger.error(`Error getting price at time for ${symbol}`, error as any);
            return null;
        }
    }

    /**
     * Get all stocks for a specific date
     */
    static async getAllStocksByDate(date: string, interval: string = '1m'): Promise<StockHistoryLean[]> {
        try {
            const results = await StockHistoryModel.find({ date, interval }).lean().exec();
            return results as StockHistoryLean[];
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
            const results = await MarketDataModel.find({})
                .select('date vn30Index timestamp')
                .sort({ date: -1 })
                .limit(limit)
                .lean()
                .exec();

            return results.reverse().map((r: any) => ({
                time: r.date,
                index: r.vn30Index?.index || 0
            }));
        } catch (error) {
            this.logger.error('Error getting VN30 history', error as any);
            return [];
        }
    }

    /**
     * Get VN30 Intraday data from stock_history collection
     */
    static async getVN30Intraday(limit: number = 300): Promise<any[]> {
        try {
            const vn30History = await this.getLatestStockHistory('VN30', '1m');

            if (!vn30History || !vn30History.prices || vn30History.prices.length === 0) {
                this.logger.info('VN30 Intraday: No VN30 data, falling back to daily history');
                return this.getVN30History(limit);
            }

            this.logger.info(`VN30 Intraday: found ${vn30History.prices.length} ticks for ${vn30History.date}`);

            let resultPrices = vn30History.prices;
            if (limit > 0 && limit < vn30History.prices.length) {
                resultPrices = vn30History.prices.slice(-limit);
            }

            return resultPrices.map((p: IPriceBar) => ({
                time: p.time,
                index: p.close,
                volume: p.volume
            }));
        } catch (error) {
            this.logger.error('Error getting VN30 intraday', error as any);
            return this.getVN30History(limit);
        }
    }

    /**
     * Get stock data for specific symbol and date (legacy compatibility)
     */
    static async getStockData(symbol: string, date: string): Promise<any | null> {
        try {
            const history = await this.getStockHistory(symbol, date, '1m');
            if (!history || !history.prices || history.prices.length === 0) {
                return null;
            }

            const prices = history.prices;
            const latestPrice = prices[prices.length - 1];
            const firstPrice = prices[0];
            const change = latestPrice.close - firstPrice.open;
            const changePercent = firstPrice.open > 0 ? (change / firstPrice.open) * 100 : 0;

            return {
                symbol: history.symbol,
                date: history.date,
                price: latestPrice.close,
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                volume: prices.reduce((acc, p) => acc + p.volume, 0),
                high: Math.max(...prices.map(p => p.high)),
                low: Math.min(...prices.filter(p => p.low > 0).map(p => p.low)),
                open: firstPrice.open,
                close: latestPrice.close
            };
        } catch (error) {
            this.logger.error(`Error getting stock data for ${symbol}`, error as any);
            return null;
        }
    }

    /**
     * Get latest stock data for a symbol (legacy compatibility)
     */
    static async getLatestStockData(symbol: string): Promise<any | null> {
        try {
            const history = await this.getLatestStockHistory(symbol, '1m');
            if (!history || !history.prices || history.prices.length === 0) {
                return null;
            }

            const prices = history.prices;
            const latestPrice = prices[prices.length - 1];
            const firstPrice = prices[0];
            const change = latestPrice.close - firstPrice.open;
            const changePercent = firstPrice.open > 0 ? (change / firstPrice.open) * 100 : 0;

            return {
                symbol: history.symbol,
                date: history.date,
                price: latestPrice.close,
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2)),
                volume: prices.reduce((acc, p) => acc + p.volume, 0),
                high: Math.max(...prices.map(p => p.high)),
                low: Math.min(...prices.filter(p => p.low > 0).map(p => p.low)),
                open: firstPrice.open,
                close: latestPrice.close
            };
        } catch (error) {
            this.logger.error(`Error getting latest stock data for ${symbol}`, error as any);
            return null;
        }
    }

    /**
     * Get top stocks by price from the latest trading day
     */
    static async getTopStocksByPrice(limit: number = 10): Promise<any[]> {
        try {
            // Get all stocks from the latest date
            const stocks = await StockHistoryModel.find({ interval: '1m' })
                .sort({ date: -1 })
                .limit(100)
                .lean()
                .exec();

            if (stocks.length === 0) return [];

            // Get the latest date
            const latestDate = (stocks[0] as any).date;

            // Filter to only include stocks from latest date and calculate price
            const latestDateStocks = stocks
                .filter((s: any) => s.date === latestDate && s.symbol !== 'VN30')
                .map((s: any) => {
                    const prices = s.prices || [];
                    if (prices.length === 0) return null;

                    const latestPrice = prices[prices.length - 1];
                    const firstPrice = prices[0];
                    const change = latestPrice.close - firstPrice.open;
                    const changePercent = firstPrice.open > 0 ? (change / firstPrice.open) * 100 : 0;

                    return {
                        symbol: s.symbol,
                        date: s.date,
                        price: latestPrice.close,
                        change: parseFloat(change.toFixed(2)),
                        changePercent: parseFloat(changePercent.toFixed(2)),
                        volume: prices.reduce((acc: number, p: any) => acc + (p.volume || 0), 0),
                        high: Math.max(...prices.map((p: any) => p.high || 0)),
                        low: Math.min(...prices.filter((p: any) => p.low > 0).map((p: any) => p.low)),
                        open: firstPrice.open,
                        close: latestPrice.close
                    };
                })
                .filter((s: any) => s !== null)
                .sort((a: any, b: any) => b.price - a.price)
                .slice(0, limit);

            return latestDateStocks;
        } catch (error) {
            this.logger.error('Error getting top stocks by price', error as any);
            return [];
        }
    }
    /**
     * Get aggregated stock details (Profile + Symbol + Latest Price)
     */
    static async getStockDetails(symbol: string): Promise<any | null> {
        try {
            const upperSymbol = symbol.toUpperCase();

            // 1. Get Company Profile
            const profile = await CompanyProfileModel.findOne({ ticker: upperSymbol }).lean().exec();

            // 2. Get Stock Symbol Details (Exchange etc.)
            const symbolInfo = await StockSymbolModel.findOne({ symbol: upperSymbol }).lean().exec();

            // 3. Get Latest Price Data
            const priceData = await this.getLatestStockData(upperSymbol);

            if (!profile && !symbolInfo && !priceData) {
                return null;
            }

            return {
                symbol: upperSymbol,
                profile: profile || null,
                info: symbolInfo || null,
                marketData: priceData || null
            };
        } catch (error) {
            this.logger.error(`Error getting stock details for ${symbol}`, error as any);
            return null;
        }
    }

    /**
     * Get stock Intraday data
     */
    /**
     * Get stock Intraday data
     * Fetches multiple days back to satisfy the limit or time range.
     * Triggers sync if data is stale.
     */
    static async getStockIntraday(symbol: string, limit: number = 300, start?: string, end?: string): Promise<any[]> {
        try {
            const query: any = {
                symbol: symbol.toUpperCase(),
                interval: '1m'
            };

            // Date filtering
            if (start) {
                let startDateVal = start;
                const startDateObj = new Date(start);
                if (!isNaN(startDateObj.getTime())) {
                    startDateVal = format(startDateObj, 'yyyy-MM-dd');
                }

                query.date = { $gte: startDateVal };

                if (end) {
                    let endDateVal = end;
                    const endDateObj = new Date(end);
                    if (!isNaN(endDateObj.getTime())) {
                        endDateVal = format(endDateObj, 'yyyy-MM-dd');
                    }
                    query.date.$lte = endDateVal;
                }
            }

            // docLimit: if date range set, possibly fetch more. 
            // 7 days is usually enough for "Intraday" default, but if user asks for specific range, they might ask for old data.
            const docLimit = start ? 100 : 7;

            const historyDocs = await StockHistoryModel.find(query)
                .sort({ date: -1 })
                .limit(docLimit)
                .lean()
                .exec();

            // Check Freshness (only if default "latest" behavior)
            const today = format(new Date(), 'yyyy-MM-dd');
            if (!start) {
                const latestDoc = historyDocs[0];
                const dayOfWeek = new Date().getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                if (!latestDoc || ((latestDoc as any).date < today && !isWeekend)) {
                    this.logger.info(`StockIntraday: Data stale for ${symbol}. Queuing sync...`);
                    QueueService.getInstance().addStockSyncJob(symbol);
                }
            }

            if (!historyDocs || historyDocs.length === 0) {
                return [];
            }

            let aggregatedPrices: IPriceBar[] = [];
            for (let i = historyDocs.length - 1; i >= 0; i--) {
                const doc = historyDocs[i] as any;
                if (doc.prices) {
                    aggregatedPrices = aggregatedPrices.concat(doc.prices);
                    // Attach date to each price for frontend usage if tricky
                    // But we will map it below using doc.date
                    // Wait, logic below uses `(p as any).date`.
                    // Does `prices` have `date`? No, doc has `date`.
                    // We need to inject date into price object here or below.
                    // The map below `(p as any).date` assumes `p` has date.
                    // Original price object `IPriceBar` likely doesn't have date.
                    // In previous code `(p as any).date` might have been undefined? 
                    // No, previous code didn't have `date` map. I added it in Step 2345 (which failed) then Step 2352 (which succeeded).
                    // In current view (Step 2371 Line 541), it has `date: (p as any).date`.
                    // `p` comes from `doc.prices`. Does `doc.prices` elements have `date`?
                    // Typically NO, unless Mongoose schema defines it?
                    // If not, we should assign it from `doc.date`.
                }
            }

            // Re-aggregate with date injection
            aggregatedPrices = [];
            for (let i = historyDocs.length - 1; i >= 0; i--) {
                const doc = historyDocs[i] as any;
                if (doc.prices) {
                    const datedPrices = doc.prices.map((p: any) => ({
                        ...p,
                        date: doc.date
                    }));
                    aggregatedPrices = aggregatedPrices.concat(datedPrices);
                }
            }

            // Trace back limit
            let resultPrices = aggregatedPrices;
            if (!start && limit > 0 && limit < aggregatedPrices.length) {
                resultPrices = aggregatedPrices.slice(-limit);
            }

            return resultPrices.map((p: any) => ({
                time: p.time,
                price: p.close,
                volume: p.volume,
                date: p.date
            }));
        } catch (error) {
            this.logger.error(`Error getting stock intraday for ${symbol}`, error as any);
            return [];
        }
    }
}
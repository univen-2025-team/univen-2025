/**
 * Price Analysis Service
 * Analyzes historical price data and detects abnormal movements
 */

import axios from 'axios';
import { subDays, format, parseISO } from 'date-fns';
import LoggerService from './logger.service';
import { VNSTOCK_API_URL } from '@/configs/vnstock.config';
import type { 
    DailyPriceData, 
    PriceChangeData, 
    AbnormalPriceEvent 
} from '@/types/learn-product.types';

// Configurable defaults
const CONFIG = {
    DEFAULT_THRESHOLD_PERCENT: 3,
    DEFAULT_LOOKBACK_DAYS: 365,
    API_TIMEOUT: 30000
};

export default class PriceAnalysisService {
    private static logger = LoggerService.getInstance();

    /**
     * Fetch daily price history from vnstock-api
     */
    static async fetchDailyPrices(
        symbol: string,
        lookbackDays: number = CONFIG.DEFAULT_LOOKBACK_DAYS
    ): Promise<DailyPriceData[]> {
        const endDate = new Date();
        const startDate = subDays(endDate, lookbackDays);

        try {
            // Try vnstock-api history endpoint
            const response = await axios.get(`${VNSTOCK_API_URL}/history/${symbol}`, {
                params: {
                    start: format(startDate, 'yyyy-MM-dd'),
                    end: format(endDate, 'yyyy-MM-dd'),
                    interval: '1D'
                },
                timeout: CONFIG.API_TIMEOUT
            });

            if (response.data?.data && Array.isArray(response.data.data)) {
                return this.normalizePriceData(response.data.data);
            }
        } catch (error) {
            this.logger.warn(`Primary API failed for ${symbol}, trying fallback`);
        }

        // Fallback: fetch from MongoDB cache
        return this.fetchFromMongoCache(symbol, lookbackDays);
    }

    /**
     * Fallback: fetch from MongoDB stock_history collection
     */
    private static async fetchFromMongoCache(
        symbol: string,
        lookbackDays: number
    ): Promise<DailyPriceData[]> {
        try {
            const StockHistoryModel = (await import('@/models/stock-history.model')).default;
            const endDate = new Date();
            const startDate = subDays(endDate, lookbackDays);

            const docs = await StockHistoryModel.find({
                symbol: symbol.toUpperCase(),
                date: {
                    $gte: format(startDate, 'yyyy-MM-dd'),
                    $lte: format(endDate, 'yyyy-MM-dd')
                },
                interval: { $in: ['1D', 'D', 'daily'] }
            })
            .sort({ date: 1 })
            .lean()
            .exec();

            return docs.map((doc: any) => {
                // Get last price bar or use doc fields directly
                const price = doc.prices?.[doc.prices.length - 1] || doc;
                return {
                    date: doc.date,
                    open: Number(price.open) || 0,
                    high: Number(price.high) || 0,
                    low: Number(price.low) || 0,
                    close: Number(price.close) || 0,
                    volume: Number(price.volume) || 0
                };
            });
        } catch (error) {
            this.logger.error(`MongoDB fallback failed for ${symbol}`, error as Error);
            return [];
        }
    }

    /**
     * Normalize price data from various API formats
     */
    private static normalizePriceData(rawData: any[]): DailyPriceData[] {
        return rawData
            .map(item => ({
                date: item.date || item.time || format(new Date(item.timestamp), 'yyyy-MM-dd'),
                open: Number(item.open) || 0,
                high: Number(item.high) || 0,
                low: Number(item.low) || 0,
                close: Number(item.close) || 0,
                volume: Number(item.volume) || 0
            }))
            .filter(item => item.close > 0)
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Calculate daily price changes
     */
    static calculatePriceChanges(
        prices: DailyPriceData[],
        thresholdPercent: number = CONFIG.DEFAULT_THRESHOLD_PERCENT
    ): PriceChangeData[] {
        if (prices.length < 2) return [];

        const changes: PriceChangeData[] = [];

        for (let i = 1; i < prices.length; i++) {
            const current = prices[i];
            const previous = prices[i - 1];

            if (previous.close <= 0) continue;

            const changePercent = ((current.close - previous.close) / previous.close) * 100;
            const roundedChange = Math.round(changePercent * 100) / 100;

            changes.push({
                date: current.date,
                closePrice: current.close,
                previousClose: previous.close,
                changePercent: roundedChange,
                volume: current.volume,
                isAbnormal: Math.abs(roundedChange) >= thresholdPercent
            });
        }

        return changes;
    }

    /**
     * Extract abnormal events from price changes
     */
    static extractAbnormalEvents(
        symbol: string,
        priceChanges: PriceChangeData[],
        prices: DailyPriceData[]
    ): Omit<AbnormalPriceEvent, 'relatedNews'>[] {
        const priceMap = new Map(prices.map(p => [p.date, p]));

        return priceChanges
            .filter(change => change.isAbnormal)
            .map(change => {
                const dayData = priceMap.get(change.date);
                return {
                    symbol: symbol.toUpperCase(),
                    eventDate: change.date,
                    priceChangePercent: change.changePercent,
                    priceData: {
                        open: dayData?.open || 0,
                        high: dayData?.high || 0,
                        low: dayData?.low || 0,
                        close: dayData?.close || change.closePrice,
                        volume: dayData?.volume || change.volume
                    }
                };
            })
            .sort((a, b) => b.eventDate.localeCompare(a.eventDate));
    }

    /**
     * Main entry: analyze symbol for abnormal price movements
     */
    static async analyze(
        symbol: string,
        options: {
            thresholdPercent?: number;
            lookbackDays?: number;
        } = {}
    ): Promise<Omit<AbnormalPriceEvent, 'relatedNews'>[]> {
        const {
            thresholdPercent = CONFIG.DEFAULT_THRESHOLD_PERCENT,
            lookbackDays = CONFIG.DEFAULT_LOOKBACK_DAYS
        } = options;

        this.logger.info(
            `Analyzing ${symbol}: threshold=${thresholdPercent}%, lookback=${lookbackDays} days`
        );

        const prices = await this.fetchDailyPrices(symbol, lookbackDays);

        if (prices.length < 2) {
            this.logger.warn(`Insufficient price data for ${symbol}: ${prices.length} records`);
            return [];
        }

        const priceChanges = this.calculatePriceChanges(prices, thresholdPercent);
        const abnormalEvents = this.extractAbnormalEvents(symbol, priceChanges, prices);

        this.logger.info(
            `Found ${abnormalEvents.length} abnormal events for ${symbol} ` +
            `out of ${priceChanges.length} trading days`
        );

        return abnormalEvents;
    }
}

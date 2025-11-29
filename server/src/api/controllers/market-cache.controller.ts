/**
 * Market Cache Controller for Node.js Server
 * Provides API endpoints to query cached market data from MongoDB.
 */

import { Request, Response, NextFunction } from 'express';
import { OkResponse } from '@/response/success.response';
import { NotFoundErrorResponse, BadRequestErrorResponse } from '@/response/error.response';
import MarketCacheService from '@/services/market-cache.service';

export default class MarketCacheController {
    /**
     * GET /api/cached/market
     * Get latest cached market data or data for specific date
     */
    static async getMarketData(req: Request, res: Response, next: NextFunction) {
        try {
            const { date } = req.query;

            let marketData;
            if (date) {
                // Get data for specific date
                marketData = await MarketCacheService.getMarketDataByDate(date as string);
            } else {
                // Get latest data
                marketData = await MarketCacheService.getLatestMarketData();
            }

            if (!marketData) {
                throw new NotFoundErrorResponse({
                    message: date
                        ? `No cached data found for date: ${date}`
                        : 'No cached market data available'
                });
            }
            new OkResponse({
                message: 'Market data retrieved successfully',
                metadata: {
                    ...marketData,
                    isCached: true
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/cached/stock/:symbol
     * Get cached data for specific stock
     */
    static async getStockData(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol } = req.params;
            const { date } = req.query;

            if (!symbol) {
                throw new BadRequestErrorResponse({
                    message: 'Stock symbol is required'
                });
            }

            let stockData;
            if (date) {
                stockData = await MarketCacheService.getStockData(symbol, date as string);
            } else {
                stockData = await MarketCacheService.getLatestStockData(symbol);
            }

            if (!stockData) {
                throw new NotFoundErrorResponse({
                    message: `No cached data found for stock: ${symbol}`
                });
            }

            new OkResponse({
                message: 'Stock data retrieved successfully',
                metadata: {
                    ...stockData,
                    isCached: true
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/cached/stocks
     * Get all cached stocks for a specific date
     */
    static async getAllStocks(req: Request, res: Response, next: NextFunction) {
        try {
            const { date } = req.query;

            if (!date) {
                throw new BadRequestErrorResponse({
                    message: 'Date parameter is required'
                });
            }

            const stocks = await MarketCacheService.getAllStocksByDate(date as string);

            new OkResponse({
                message: 'Stocks data retrieved successfully',
                metadata: {
                    date,
                    stocks,
                    total: stocks.length,
                    isCached: true
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/cached/dates
     * Get list of available cached dates
     */
    static async getAvailableDates(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 30;

            const dates = await MarketCacheService.getAvailableDates(limit);

            new OkResponse({
                message: 'Available dates retrieved successfully',
                metadata: {
                    dates,
                    total: dates.length
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
}

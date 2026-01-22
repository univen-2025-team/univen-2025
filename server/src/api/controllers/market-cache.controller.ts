/**
 * Market Cache Controller for Node.js Server
 * Provides API endpoints to query cached market data from MongoDB.
 */

import { Request, Response, NextFunction } from 'express';
import { OkResponse } from '@/response/success.response';
import { NotFoundErrorResponse, BadRequestErrorResponse } from '@/response/error.response';
import MarketCacheService from '@/services/market-cache.service';
import StockNewsService from '@/services/stock-news.service';
import NewsSummaryService from '@/services/news-summary.service';

export default class MarketCacheController {
    /**
     * GET /api/cached/market
     * Get latest cached market data or data for specific date
     */
    static async getMarketData(req: Request, res: Response, next: NextFunction) {
        try {
            const { date } = req.query;

            let marketData;
            let vn30History: any[] = [];
            let topStocksByPrice: any[] = [];

            if (date) {
                // Get data for specific date
                marketData = await MarketCacheService.getMarketDataByDate(date as string);
            } else {
                // Get latest data
                marketData = await MarketCacheService.getLatestMarketData();
                // Get intraday history for chart (default 10 minutes to match UI default)
                vn30History = await MarketCacheService.getVN30Intraday(10);
                // Get top 10 stocks by price from latest trading day
                topStocksByPrice = await MarketCacheService.getTopStocksByPrice(10);
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
                    vn30History,
                    topStocksByPrice,
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

            const symbolStr = Array.isArray(symbol) ? symbol[0] : symbol;
            if (!symbolStr) {
                throw new BadRequestErrorResponse({
                    message: 'Stock symbol is required'
                });
            }

            let stockData;
            if (date) {
                stockData = await MarketCacheService.getStockData(symbolStr, date as string);
            } else {
                stockData = await MarketCacheService.getLatestStockData(symbolStr);
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

    /**
     * GET /api/cached/history/vn30
     * Get VN30 index history
     */
    static async getVN30History(req: Request, res: Response, next: NextFunction) {
        try {
            const limit = parseInt(req.query.limit as string) || 30;
            const type = req.query.type as string; // 'daily' or 'intraday'

            let history;
            if (type === 'intraday') {
                // For intraday, limit is number of points (minutes)
                // 1H = 60, 1D = ~240 (trading minutes)
                history = await MarketCacheService.getVN30Intraday(limit);
            } else {
                history = await MarketCacheService.getVN30History(limit);
            }

            new OkResponse({
                message: 'VN30 history retrieved successfully',
                metadata: {
                    history,
                    total: history.length
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/cached/details/:symbol
     * Get aggregated stock details
     */
    static async getStockDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol } = req.params;

            const symbolStr = Array.isArray(symbol) ? symbol[0] : symbol;
            if (!symbolStr) {
                throw new BadRequestErrorResponse({
                    message: 'Stock symbol is required'
                });
            }

            const details = await MarketCacheService.getStockDetails(symbolStr);

            if (!details) {
                throw new NotFoundErrorResponse({
                    message: `No details found for stock: ${symbolStr}`
                });
            }

            new OkResponse({
                message: 'Stock details retrieved successfully',
                metadata: details
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/cached/stock/:symbol/intraday
     * Get stock intraday data
     */
    static async getStockIntraday(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol } = req.params;
            const filter = req.query.filter as string;
            const start = req.query.start as string;
            const end = req.query.end as string;
            const refresh = req.query.refresh === 'true';

            const symbolStr = Array.isArray(symbol) ? symbol[0] : symbol;
            if (!symbolStr) {
                throw new BadRequestErrorResponse({
                    message: 'Stock symbol is required'
                });
            }

            const history = await MarketCacheService.getStockIntraday(symbolStr, filter, start, end, refresh);

            new OkResponse({
                message: 'Stock intraday data retrieved successfully',
                metadata: {
                    symbol: symbolStr.toUpperCase(),
                    history,
                    total: history.length
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/market/news/:symbol/date/:date
     * Get stock news by specific date
     */
    static async getStockNewsByDate(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol, date } = req.params;

            const symbolStr = Array.isArray(symbol) ? symbol[0] : symbol;
            const dateStr = Array.isArray(date) ? date[0] : date;

            if (!symbolStr) {
                throw new BadRequestErrorResponse({
                    message: 'Stock symbol is required'
                });
            }

            if (!dateStr) {
                throw new BadRequestErrorResponse({
                    message: 'Date parameter is required'
                });
            }

            const news = await StockNewsService.getInstance().getNewsByDate(symbolStr, dateStr);

            new OkResponse({
                message: 'Stock news retrieved successfully',
                metadata: {
                    symbol: symbolStr.toUpperCase(),
                    date: dateStr,
                    news,
                    total: news.length
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/cached/news/:symbol
     * Get stock news
     */
    static async getStockNews(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol } = req.params;

            const symbolStr = Array.isArray(symbol) ? symbol[0] : symbol;
            if (!symbolStr) {
                throw new BadRequestErrorResponse({
                    message: 'Stock symbol is required'
                });
            }

            const news = await StockNewsService.getInstance().getNews(symbolStr);

            new OkResponse({
                message: 'Stock news retrieved successfully',
                metadata: {
                    symbol: symbolStr.toUpperCase(),
                    news,
                    total: news.length
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/market/news/summarize
     * Fetch content from URL or use provided content and summarize using AI
     */
    static async summarizeNews(req: Request, res: Response, next: NextFunction) {
        try {
            const { url, title, content } = req.body;

            // URL is required if content is not provided
            if (!content && (!url || typeof url !== 'string')) {
                throw new BadRequestErrorResponse({
                    message: 'Either URL or content is required'
                });
            }

            // If URL is provided, validate it
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                throw new BadRequestErrorResponse({
                    message: 'Invalid URL format'
                });
            }

            // Use provided content or fetch from URL
            const summary = await NewsSummaryService.getInstance().summarizeNews(
                url || '', 
                title, 
                content
            );

            new OkResponse({
                message: 'News summarized successfully',
                metadata: {
                    summary,
                    url: url || null,
                    title: title || null,
                    usedProvidedContent: !!content
                }
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
}

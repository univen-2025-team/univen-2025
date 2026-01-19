/**
 * Market Cache Routes
 * API endpoints for querying cached market data from MongoDB
 */

import express from 'express';
import MarketCacheController from '@/controllers/market-cache.controller';

const router = express.Router();

// GET /api/market - Get latest or specific date market data
router.get('/', MarketCacheController.getMarketData);

// GET /api/market/stock/:symbol - Get stock data
router.get('/stock/:symbol', MarketCacheController.getStockData);

// GET /api/market/stocks - Get all stocks for a date
router.get('/stocks', MarketCacheController.getAllStocks);

// GET /api/cached/dates - Get available cached dates
router.get('/dates', MarketCacheController.getAvailableDates);

// GET /api/cached/history/vn30 - Get VN30 history
router.get('/history/vn30', MarketCacheController.getVN30History);

// GET /api/cached/details/:symbol - Get aggregated stock details
router.get('/details/:symbol', MarketCacheController.getStockDetails);

// GET /api/cached/stock/:symbol/intraday - Get stock intraday data
router.get('/stock/:symbol/intraday', MarketCacheController.getStockIntraday);

// GET /api/market/news/:symbol/date/:date - Get stock news by specific date (must be before /news/:symbol)
router.get('/news/:symbol/date/:date', MarketCacheController.getStockNewsByDate);

// GET /api/market/news/:symbol - Get stock news
router.get('/news/:symbol', MarketCacheController.getStockNews);

export default router;

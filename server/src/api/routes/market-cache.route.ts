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

export default router;

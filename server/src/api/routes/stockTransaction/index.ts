import express from 'express';
import StockTransactionController from '../../controllers/transaction.controller.js';

const router = express.Router();

// Create a new stock transaction
router.post('/transactions', StockTransactionController.createTransaction);
router.get('/transactions/:userId', StockTransactionController.getTransactionHistory);
router.get('/transactions/:transactionId', StockTransactionController.getTransactionById);
router.put('/transactions/:transactionId/cancel', StockTransactionController.cancelTransaction);
router.get('/transactions/:userId/stats', StockTransactionController.getUserStats);
router.get('/ranking', StockTransactionController.getUserRanking);
export default router;

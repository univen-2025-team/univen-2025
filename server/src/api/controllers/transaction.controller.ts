import { OkResponse } from '@/response/success.response.js';
import { NotFoundErrorResponse, BadRequestErrorResponse } from '@/response/error.response.js';
import { RequestHandler } from 'express';
import TransactionService from '@/services/transaction.service.js';

export default class StockTransactionController {
    public static createTransaction: RequestHandler = async (req, res, _) => {
        try {
            const transaction = await TransactionService.createTransaction(req.body);

            new OkResponse({
                message: 'Transaction created successfully',
                metadata: {
                    transaction_id: transaction._id,
                    stock_code: transaction.stock_code,
                    stock_name: transaction.stock_name,
                    quantity: transaction.quantity,
                    price_per_unit: transaction.price_per_unit,
                    total_amount: transaction.total_amount,
                    transaction_type: transaction.transaction_type,
                    balance_before: transaction.balance_before,
                    balance_after: transaction.balance_after,
                    executed_at: transaction.executed_at
                }
            }).send(res);
        } catch (error) {
            console.error('createTransaction error:', error);
            throw error;
        }
    };

    public static getTransactionHistory: RequestHandler = async (req, res, _) => {
        try {
            const { userId } = req.params;
            const { transaction_type, stock_code, status, page, limit } = req.query;

            const filters = {
                transaction_type: transaction_type as 'BUY' | 'SELL' | undefined,
                stock_code: stock_code as string | undefined,
                status: status as string | undefined
            };

            const pagination = {
                page: page ? parseInt(page as string) : 1,
                limit: limit ? parseInt(limit as string) : 10
            };

            const result = await TransactionService.getTransactionHistory(
                userId,
                filters,
                pagination
            );

            new OkResponse({
                message: 'Get transaction history successfully',
                metadata: result
            }).send(res);
        } catch (error) {
            console.error('getTransactionHistory error:', error);
            throw error;
        }
    };

    public static getTransactionById: RequestHandler = async (req, res, _) => {
        try {
            const { transactionId } = req.params;
            const userId = (req as any).user?.id;

            if (!userId) {
                throw new BadRequestErrorResponse({
                    message: 'User ID not found in request'
                });
            }

            const transaction = await TransactionService.getTransactionById(transactionId, userId);

            new OkResponse({
                message: 'Get transaction successfully',
                metadata: transaction
            }).send(res);
        } catch (error) {
            console.error('getTransactionById error:', error);
            throw error;
        }
    };

    public static cancelTransaction: RequestHandler = async (req, res, _) => {
        try {
            const { transactionId } = req.params;
            const { reason } = req.body;
            const userId = (req as any).user?.id;

            if (!userId) {
                throw new BadRequestErrorResponse({
                    message: 'User ID not found in request'
                });
            }

            const transaction = await TransactionService.cancelTransaction(
                transactionId,
                userId,
                reason
            );

            new OkResponse({
                message: 'Transaction cancelled successfully',
                metadata: transaction
            }).send(res);
        } catch (error) {
            console.error('cancelTransaction error:', error);
            throw error;
        }
    };

    public static getUserStats: RequestHandler = async (req, res, _) => {
        try {
            const userId = (req as any).user?.id;

            if (!userId) {
                throw new BadRequestErrorResponse({
                    message: 'User ID not found in request'
                });
            }

            const stats = await TransactionService.getUserTransactionStats(userId);

            new OkResponse({
                message: 'Get user transaction stats successfully',
                metadata: stats
            }).send(res);
        } catch (error) {
            console.error('getUserStats error:', error);
            throw error;
        }
    };

    public static getUserRanking: RequestHandler = async (req, res, _) => {
        try {
            const { limit = 10, page = 1 } = req.query;

            const pageNum = Math.max(1, parseInt(page as string) || 1);
            const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
            const offset = (pageNum - 1) * limitNum;

            const result = await TransactionService.getUserRanking(limitNum, offset);

            // Format ranking data - only include rank, user_fullName, user_avatar, total_profit
            const formattedRanking = result.ranking.map(user => ({
                rank: user.rank,
                user_fullName: user.user_fullName,
                total_profit: user.total_profit
            }));

            new OkResponse({
                message: 'Get user ranking by profit successfully',
                metadata: {
                    ranking: formattedRanking,
                    pagination: result.pagination
                }
            }).send(res);
        } catch (error) {
            console.error('getUserRanking error:', error);
            throw error;
        }
    };

    public static getUserHoldings: RequestHandler = async (req, res, _) => {
        try {
            const { userId } = req.params;

            const holdings = await TransactionService.getAllUserHoldings(userId);

            new OkResponse({
                message: 'Get user holdings successfully',
                metadata: {
                    holdings
                }
            }).send(res);
        } catch (error) {
            console.error('getUserHoldings error:', error);
            throw error;
        }
    };
}

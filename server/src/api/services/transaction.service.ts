import {
    stockTransactionModel,
    STOCK_TRANSACTION_MODEL_NAME
} from '@/models/stockTransaction.model.js';
import { userModel } from '@/models/user.model.js';
import StockDataModel from '@/models/stock-data.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import { Types } from 'mongoose';
import VNStockService from './vnstock.service.js';

interface CreateTransactionPayload {
    userId: string;
    stock_code: string;
    stock_name: string;
    quantity: number;
    price_per_unit: number;
    transaction_type: 'BUY' | 'SELL';
    notes?: string;
}

export default class TransactionService {
    /* -------------------- Create Transaction -------------------- */
    public static createTransaction = async (payload: CreateTransactionPayload) => {
        const { userId, stock_code, stock_name, quantity, price_per_unit, transaction_type, notes } =
            payload;

        // Validation
        this.validateTransactionInput(quantity, price_per_unit, transaction_type);

        // Check user exists and get current balance
        const user = await userModel.findById(userId);
        if (!user) {
            throw new NotFoundErrorResponse({
                message: 'User not found'
            });
        }

        const total_amount = quantity * price_per_unit;
        const balance_before = user.balance;

        // Validate balance for BUY transaction
        if (transaction_type === 'BUY' && balance_before < total_amount) {
            throw new BadRequestErrorResponse({
                message: `Insufficient balance. Required: ${total_amount}, Available: ${balance_before}`
            });
        }

        // Calculate balance after
        let balance_after: number;
        if (transaction_type === 'BUY') {
            balance_after = balance_before - total_amount;
        } else {
            balance_after = balance_before + total_amount;
        }

        // Create transaction record
        const transaction = new stockTransactionModel({
            user_id: new Types.ObjectId(userId),
            stock_code,
            stock_name,
            quantity,
            price_per_unit,
            total_amount,
            transaction_type,
            balance_before,
            balance_after,
            notes,
            transaction_status: 'COMPLETED',
            executed_at: new Date()
        });

        // Save transaction
        await transaction.save();

        // Update user balance
        user.balance = balance_after;
        await user.save();

        return transaction;
    };

    /* -------------------- Get Transaction History -------------------- */
    public static getTransactionHistory = async (
        userId: string,
        filters?: {
            transaction_type?: 'BUY' | 'SELL';
            stock_code?: string;
            status?: string;
        },
        pagination?: {
            page?: number;
            limit?: number;
        }
    ) => {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new NotFoundErrorResponse({
                message: 'User not found'
            });
        }

        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        const skip = (page - 1) * limit;

        // Build query
        const query: any = { user_id: new Types.ObjectId(userId) };
        if (filters?.transaction_type) query.transaction_type = filters.transaction_type;
        if (filters?.stock_code) query.stock_code = filters.stock_code;
        if (filters?.status) query.transaction_status = filters.status;

        // Get total count
        const total = await stockTransactionModel.countDocuments(query);

        // Get transactions
        const transactions = await stockTransactionModel
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return {
            transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    };

    /* -------------------- Get Transaction By ID -------------------- */
    public static getTransactionById = async (transactionId: string, userId: string) => {
        const transaction = await stockTransactionModel.findById(transactionId);

        if (!transaction) {
            throw new NotFoundErrorResponse({
                message: 'Transaction not found'
            });
        }

        // Verify ownership
        if (transaction.user_id.toString() !== userId) {
            throw new BadRequestErrorResponse({
                message: 'Unauthorized access to this transaction'
            });
        }

        return transaction;
    };

    /* -------------------- Cancel Transaction -------------------- */
    public static cancelTransaction = async (
        transactionId: string,
        userId: string,
        reason?: string
    ) => {
        const transaction = await stockTransactionModel.findById(transactionId);

        if (!transaction) {
            throw new NotFoundErrorResponse({
                message: 'Transaction not found'
            });
        }

        // Verify ownership
        if (transaction.user_id.toString() !== userId) {
            throw new BadRequestErrorResponse({
                message: 'Unauthorized access to this transaction'
            });
        }

        // Check if already cancelled or failed
        if (['CANCELLED', 'FAILED'].includes(transaction.transaction_status)) {
            throw new BadRequestErrorResponse({
                message: 'Cannot cancel a completed or already cancelled transaction'
            });
        }

        // Get user
        const user = await userModel.findById(userId);
        if (!user) {
            throw new NotFoundErrorResponse({
                message: 'User not found'
            });
        }

        // Refund logic
        // Update user balance back to the value before the transaction
        user.balance = transaction.balance_before;
        await user.save();

        // Update transaction
        transaction.transaction_status = 'CANCELLED';
        transaction.cancelled_at = new Date();
        transaction.cancellation_reason = reason || 'User requested cancellation';
        await transaction.save();

        return transaction;
    };

    /* -------------------- Get User Statistics -------------------- */
    public static getUserTransactionStats = async (userId: string) => {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new NotFoundErrorResponse({
                message: 'User not found'
            });
        }

        const stats = await stockTransactionModel.aggregate([
            { $match: { user_id: new Types.ObjectId(userId), transaction_status: 'COMPLETED' } },
            {
                $group: {
                    _id: '$transaction_type',
                    count: { $sum: 1 },
                    total_amount: { $sum: '$total_amount' },
                    avg_price: { $avg: '$price_per_unit' }
                }
            }
        ]);

        return {
            current_balance: user.balance,
            transaction_stats: stats
        };
    };

    /* -------------------- Validate Transaction Input -------------------- */
    private static validateTransactionInput = (
        quantity: number,
        price_per_unit: number,
        transaction_type: string
    ) => {
        if (!quantity || quantity <= 0) {
            throw new BadRequestErrorResponse({
                message: 'Invalid quantity'
            });
        }

        if (price_per_unit === undefined || price_per_unit < 0) {
            throw new BadRequestErrorResponse({
                message: 'Invalid price per unit'
            });
        }

        if (!['BUY', 'SELL'].includes(transaction_type)) {
            throw new BadRequestErrorResponse({
                message: 'Invalid transaction type. Must be BUY or SELL'
            });
        }
    };

    /* -------------------- Get User Ranking by Profit -------------------- */
    public static getUserRanking = async (limit: number = 10, offset: number = 0) => {
        try {
            // Get all users with their transactions
            const users = await userModel.find({}).select('_id user_fullName user_avatar').lean();

            // Get both BUY and SELL completed transactions
            const allTransactions = await stockTransactionModel
                .find({
                    transaction_type: { $in: ['BUY', 'SELL'] },
                    transaction_status: 'COMPLETED'
                })
                .lean();

            console.log(`[Ranking] Found ${allTransactions.length} transactions from ${users.length} users`);

            // Separate BUY and SELL transactions
            const buyTransactions = allTransactions.filter(t => t.transaction_type === 'BUY');
            const sellTransactions = allTransactions.filter(t => t.transaction_type === 'SELL');

            // Get unique stock codes and fetch latest prices once from stock_data
            const uniqueStockCodes = [...new Set(allTransactions.map(t => t.stock_code))];
            console.log(`[Ranking] Unique stock codes: ${uniqueStockCodes.join(', ')}`);

            const stockPriceMap = new Map<string, number>();

            // Fetch latest stock prices from stock_data collection
            for (const stockCode of uniqueStockCodes) {
                try {
                    // Get the latest stock data for this symbol (sorted by date descending)
                    const stockData = await StockDataModel.findOne({
                        symbol: stockCode.toUpperCase()
                    })
                        .sort({ date: -1 })
                        .lean();

                    if (stockData && stockData.price) {
                        // Multiply by 1000 to convert from database format to actual price
                        const actualPrice = stockData.price * 1000;
                        stockPriceMap.set(stockCode, actualPrice);
                        console.log(`[Ranking] Got price for ${stockCode} from stock_data: ${stockData.price} → ${actualPrice} (date: ${stockData.date})`);
                    } else {
                        console.warn(`[Ranking] No stock_data found for ${stockCode}`);
                    }
                } catch (error) {
                    console.warn(`[Ranking] Error fetching stock_data for ${stockCode}:`, error);
                }
            }

            console.log(`[Ranking] Final stockPriceMap size: ${stockPriceMap.size}/${uniqueStockCodes.length}`);

            // Calculate profit for each user
            const userProfits = users.map((user) => {
                const userBuyTransactions = buyTransactions.filter(
                    t => t.user_id.toString() === user._id.toString()
                );
                const userSellTransactions = sellTransactions.filter(
                    t => t.user_id.toString() === user._id.toString()
                );

                let totalProfit = 0;
                const stockDetails: any[] = [];

                // Calculate profit for BUY transactions
                // Profit = (current_price - buy_price) * quantity
                for (const transaction of userBuyTransactions) {
                    const currentPrice = stockPriceMap.get(transaction.stock_code);

                    if (currentPrice !== undefined) {
                        const buyPrice = transaction.price_per_unit;
                        const quantity = transaction.quantity;

                        const profit = (currentPrice - buyPrice) * quantity;
                        totalProfit += profit;

                        stockDetails.push({
                            stock_code: transaction.stock_code,
                            stock_name: transaction.stock_name,
                            quantity: quantity,
                            transaction_type: 'BUY',
                            purchase_price: buyPrice,
                            current_price: currentPrice,
                            profit_per_share: currentPrice - buyPrice,
                            total_profit: profit
                        });
                    } else {
                        stockDetails.push({
                            stock_code: transaction.stock_code,
                            stock_name: transaction.stock_name,
                            quantity: transaction.quantity,
                            transaction_type: 'BUY',
                            purchase_price: transaction.price_per_unit,
                            current_price: null,
                            profit_per_share: null,
                            total_profit: null,
                            note: 'Current price data not available in stock_data'
                        });
                    }
                }

                // Calculate profit for SELL transactions
                // Profit = (sell_price - current_price) * quantity
                for (const transaction of userSellTransactions) {
                    const currentPrice = stockPriceMap.get(transaction.stock_code);

                    if (currentPrice !== undefined) {
                        const sellPrice = transaction.price_per_unit;
                        const quantity = transaction.quantity;

                        const profit = (sellPrice - currentPrice) * quantity;
                        totalProfit += profit;

                        stockDetails.push({
                            stock_code: transaction.stock_code,
                            stock_name: transaction.stock_name,
                            quantity: quantity,
                            transaction_type: 'SELL',
                            sell_price: sellPrice,
                            current_price: currentPrice,
                            profit_per_share: sellPrice - currentPrice,
                            total_profit: profit
                        });
                    } else {
                        stockDetails.push({
                            stock_code: transaction.stock_code,
                            stock_name: transaction.stock_name,
                            quantity: transaction.quantity,
                            transaction_type: 'SELL',
                            sell_price: transaction.price_per_unit,
                            current_price: null,
                            profit_per_share: null,
                            total_profit: null,
                            note: 'Current price data not available in stock_data'
                        });
                    }
                }

                return {
                    user_id: user._id,
                    user_fullName: user.user_fullName,
                    user_avatar: user.user_avatar,
                    total_profit: totalProfit,
                    buy_count: userBuyTransactions.length,
                    sell_count: userSellTransactions.length,
                    total_transactions: userBuyTransactions.length + userSellTransactions.length,
                    stock_details: stockDetails
                };
            });

            // Sort by total profit (descending)
            const rankedUsers = userProfits
                .sort((a, b) => b.total_profit - a.total_profit)
                .slice(offset, offset + limit)
                .map((user, index) => ({
                    rank: offset + index + 1,
                    ...user
                }));

            // Calculate total for pagination
            const totalUsers = userProfits.length;
            const totalPages = Math.ceil(totalUsers / limit);

            console.log(`[Ranking] Returning ${rankedUsers.length} users (page ${Math.floor(offset / limit) + 1})`);

            return {
                ranking: rankedUsers,
                pagination: {
                    current_page: Math.floor(offset / limit) + 1,
                    limit,
                    total_users: totalUsers,
                    total_pages: totalPages,
                    offset
                }
            };
        } catch (error) {
            console.error('Error calculating user ranking:', error);
            throw error;
        }
    };
}

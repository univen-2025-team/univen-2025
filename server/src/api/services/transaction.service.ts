import {
    stockTransactionModel,
    STOCK_TRANSACTION_MODEL_NAME
} from '@/models/stockTransaction.model.js';
import { userModel } from '@/models/user.model.js';
import StockDataModel from '@/models/stock-data.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import { Types } from 'mongoose';
import VNStockService from './vnstock.service.js';
import { USER_INIT_BALANCE } from '@/configs/user.config.js';

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
        const {
            userId,
            stock_code,
            stock_name,
            quantity,
            price_per_unit,
            transaction_type,
            notes
        } = payload;

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

        // Validate holdings for SELL transaction
        if (transaction_type === 'SELL') {
            // Calculate current holdings for this stock
            const holdings = await this.getUserStockHoldings(userId, stock_code);

            if (holdings < quantity) {
                throw new BadRequestErrorResponse({
                    message: `Insufficient holdings. You have ${holdings} shares of ${stock_code}, but trying to sell ${quantity}`
                });
            }
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

    /* -------------------- Get User Stock Holdings -------------------- */
    /**
     * Calculate current holdings for a specific stock
     * Holdings = SUM(BUY quantities) - SUM(SELL quantities)
     */
    public static getUserStockHoldings = async (
        userId: string,
        stockCode: string
    ): Promise<number> => {
        const result = await stockTransactionModel.aggregate([
            {
                $match: {
                    user_id: new Types.ObjectId(userId),
                    stock_code: stockCode,
                    transaction_status: 'COMPLETED'
                }
            },
            {
                $group: {
                    _id: '$transaction_type',
                    total_quantity: { $sum: '$quantity' }
                }
            }
        ]);

        let buyQuantity = 0;
        let sellQuantity = 0;

        for (const item of result) {
            if (item._id === 'BUY') {
                buyQuantity = item.total_quantity;
            } else if (item._id === 'SELL') {
                sellQuantity = item.total_quantity;
            }
        }

        return buyQuantity - sellQuantity;
    };

    /* -------------------- Get All User Holdings -------------------- */
    /**
     * Get holdings for all stocks owned by a user
     */
    public static getAllUserHoldings = async (
        userId: string
    ): Promise<
        {
            stock_code: string;
            stock_name: string;
            quantity: number;
            average_buy_price: number;
        }[]
    > => {
        const result = await stockTransactionModel.aggregate([
            {
                $match: {
                    user_id: new Types.ObjectId(userId),
                    transaction_status: 'COMPLETED'
                }
            },
            {
                $group: {
                    _id: {
                        stock_code: '$stock_code',
                        stock_name: '$stock_name',
                        transaction_type: '$transaction_type'
                    },
                    total_quantity: { $sum: '$quantity' },
                    total_amount: { $sum: '$total_amount' }
                }
            }
        ]);

        // Group by stock and calculate net holdings
        const stockMap = new Map<
            string,
            {
                stock_name: string;
                buyQuantity: number;
                sellQuantity: number;
                buyAmount: number;
            }
        >();

        for (const item of result) {
            const stockCode = item._id.stock_code;
            const stockName = item._id.stock_name;

            if (!stockMap.has(stockCode)) {
                stockMap.set(stockCode, {
                    stock_name: stockName,
                    buyQuantity: 0,
                    sellQuantity: 0,
                    buyAmount: 0
                });
            }

            const stock = stockMap.get(stockCode)!;
            if (item._id.transaction_type === 'BUY') {
                stock.buyQuantity += item.total_quantity;
                stock.buyAmount += item.total_amount;
            } else if (item._id.transaction_type === 'SELL') {
                stock.sellQuantity += item.total_quantity;
            }
        }

        // Calculate final holdings
        const holdings: {
            stock_code: string;
            stock_name: string;
            quantity: number;
            average_buy_price: number;
        }[] = [];

        for (const [stockCode, stock] of stockMap) {
            const netQuantity = stock.buyQuantity - stock.sellQuantity;
            if (netQuantity > 0) {
                holdings.push({
                    stock_code: stockCode,
                    stock_name: stock.stock_name,
                    quantity: netQuantity,
                    average_buy_price:
                        stock.buyQuantity > 0 ? stock.buyAmount / stock.buyQuantity : 0
                });
            }
        }

        return holdings;
    };

    /* -------------------- Get User Ranking by Profit -------------------- */
    public static getUserRanking = async (limit: number = 10, offset: number = 0) => {
        try {
            const INITIAL_BALANCE = USER_INIT_BALANCE;

            // 1. Get all users with their current cash balance (excluding guests)
            const users = await userModel
                .find({ $or: [{ isGuest: false }, { isGuest: { $exists: false } }] })
                .select('_id user_fullName user_avatar balance')
                .lean();
            const userMap = new Map(users.map((u) => [u._id.toString(), u]));

            // 2. Calculate net holdings for all users using aggregation
            // Group by User + Stock to get net quantity (BUY - SELL)
            const holdings = await stockTransactionModel.aggregate([
                {
                    $match: {
                        transaction_status: 'COMPLETED',
                        transaction_type: { $in: ['BUY', 'SELL'] }
                    }
                },
                {
                    $group: {
                        _id: {
                            user_id: '$user_id',
                            stock_code: '$stock_code'
                        },
                        net_quantity: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$transaction_type', 'BUY'] },
                                    '$quantity',
                                    { $multiply: ['$quantity', -1] }
                                ]
                            }
                        }
                    }
                },
                {
                    $match: {
                        net_quantity: { $gt: 0 } // Only keep positive holdings
                    }
                }
            ]);

            // 3. Get unique stock codes to fetch prices
            const uniqueStockCodes = [...new Set(holdings.map((h) => h._id.stock_code))];
            console.log(`[Ranking] Found ${uniqueStockCodes.length} active stocks held by users`);

            // 4. Fetch latest stock prices
            const stockPriceMap = new Map<string, number>();
            for (const stockCode of uniqueStockCodes) {
                try {
                    const stockData = await StockDataModel.findOne({
                        symbol: stockCode.toUpperCase()
                    })
                        .sort({ date: -1 })
                        .lean();

                    if (stockData && stockData.price) {
                        // Convert from thousand VND to VND if needed (assuming API returns thousands)
                        // Based on previous context, we multiply by 1000
                        const actualPrice = stockData.price * 1000;
                        stockPriceMap.set(stockCode, actualPrice);
                    }
                } catch (error) {
                    console.warn(`[Ranking] Error fetching price for ${stockCode}`, error);
                }
            }

            // 5. Calculate Total Asset Value and Profit for each user
            const userProfits = users.map((user) => {
                const userId = user._id.toString();

                // Calculate value of stock holdings
                let stockHoldingsValue = 0;
                const userHoldings = holdings.filter((h) => h._id.user_id.toString() === userId);

                for (const holding of userHoldings) {
                    const price = stockPriceMap.get(holding._id.stock_code) || 0;
                    stockHoldingsValue += holding.net_quantity * price;
                }

                // Total Asset Value = Cash Balance + Stock Holdings Value
                const totalAssetValue = user.balance + stockHoldingsValue;

                // Total Profit = Total Asset Value - Initial Balance
                const totalProfit = totalAssetValue - INITIAL_BALANCE;

                return {
                    user_id: user._id,
                    user_fullName: user.user_fullName,
                    user_avatar: user.user_avatar,
                    total_profit: totalProfit,
                    // Optional: include details if needed for debugging or future use
                    current_balance: user.balance,
                    stock_value: stockHoldingsValue
                };
            });

            // 6. Sort and Paginate
            const rankedUsers = userProfits
                .sort((a, b) => b.total_profit - a.total_profit)
                .slice(offset, offset + limit)
                .map((user, index) => ({
                    rank: offset + index + 1,
                    user_fullName: user.user_fullName,
                    total_profit: user.total_profit
                    // Additional fields can be added if the interface supports them
                }));

            const totalUsers = userProfits.length;
            const totalPages = Math.ceil(totalUsers / limit);

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

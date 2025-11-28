import {
    stockTransactionModel,
    STOCK_TRANSACTION_MODEL_NAME
} from '@/models/stockTransaction.model.js';
import { userModel } from '@/models/user.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import { Types } from 'mongoose';

interface CreateTransactionPayload {
    userId: string;
    stock_code: string;
    stock_name: string;
    quantity: number;
    price_per_unit: number;
    transaction_type: 'BUY' | 'SELL';
    fee_amount?: number;
    commission_amount?: number;
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
            fee_amount = 0,
            commission_amount = 0,
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
        const total_cost = total_amount + fee_amount + commission_amount;
        const balance_before = user.balance;

        // Validate balance for BUY transaction
        if (transaction_type === 'BUY' && balance_before < total_cost) {
            throw new BadRequestErrorResponse({
                message: `Insufficient balance. Required: ${total_cost}, Available: ${balance_before}`
            });
        }

        // Calculate balance after
        let balance_after: number;
        if (transaction_type === 'BUY') {
            balance_after = balance_before - total_cost;
        } else {
            // SELL: cộng tiền bán trừ phí
            balance_after = balance_before + total_amount - fee_amount - commission_amount;
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
            fee_amount,
            commission_amount,
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
        let refundAmount = 0;
        if (transaction.transaction_type === 'BUY') {
            refundAmount =
                transaction.total_amount + transaction.fee_amount + transaction.commission_amount;
        } else {
            refundAmount = -(
                transaction.total_amount -
                transaction.fee_amount -
                transaction.commission_amount
            );
        }

        // Update user balance
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

        const totalFees = await stockTransactionModel.aggregate([
            { $match: { user_id: new Types.ObjectId(userId), transaction_status: 'COMPLETED' } },
            {
                $group: {
                    _id: null,
                    total_fees: { $sum: { $add: ['$fee_amount', '$commission_amount'] } }
                }
            }
        ]);

        return {
            current_balance: user.balance,
            transaction_stats: stats,
            total_fees: totalFees[0]?.total_fees || 0
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
}

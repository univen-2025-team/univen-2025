import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { required, timestamps } from '@/configs/mongoose.config.js';
import { USER_MODEL_NAME } from './user.model.js';

export const STOCK_TRANSACTION_MODEL_NAME = 'StockTransaction';
export const STOCK_TRANSACTION_COLLECTION_NAME = 'stock_transactions';

const stockTransactionSchema = new Schema<model.stockTransaction.StockTransactionSchema>(
    {
        /* ---------------------- User Info ---------------------- */
        user_id: { type: ObjectId, required, ref: USER_MODEL_NAME, index: true },

        /* -------------------- Transaction Info -------------------- */
        transaction_type: {
            type: String,
            required,
            enum: ['BUY', 'SELL'],
            index: true
        },

        /* -------------------- Stock Details -------------------- */
        stock_code: { type: String, required, index: true }, // Mã cổ phiếu (e.g., "VNM", "FPT")
        stock_name: { type: String, required }, // Tên cổ phiếu
        quantity: { type: Number, required, min: 1 }, // Số lượng cổ phiếu giao dịch
        price_per_unit: { type: Number, required, min: 0 }, // Giá một cổ phiếu tại thời điểm giao dịch
        total_amount: { type: Number, required, min: 0 }, // Tổng giá trị giao dịch (quantity * price_per_unit)

        /* -------------------- Transaction Status -------------------- */
        transaction_status: {
            type: String,
            required,
            enum: ['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'],
            default: 'PENDING',
            index: true
        },

        /* -------------------- Fee & Commission -------------------- */
        fee_amount: { type: Number, default: 0, min: 0 }, // Phí giao dịch
        commission_amount: { type: Number, default: 0, min: 0 }, // Hoa hồng (nếu có)

        /* -------------------- Balance Impact -------------------- */
        balance_before: { type: Number, required }, // Số dư trước giao dịch
        balance_after: { type: Number }, // Số dư sau giao dịch

        /* -------------------- Additional Info -------------------- */
        notes: { type: String }, // Ghi chú thêm
        order_id: { type: ObjectId, sparse: true }, // Reference đến order nếu liên quan

        /* -------------------- Timestamps -------------------- */
        executed_at: { type: Date }, // Thời gian giao dịch được thực thi
        cancelled_at: { type: Date }, // Thời gian hủy (nếu có)
        cancellation_reason: { type: String } // Lý do hủy
    },
    {
        collection: STOCK_TRANSACTION_COLLECTION_NAME,
        timestamps
    }
);

// Create indexes for efficient querying
stockTransactionSchema.index({ user_id: 1, transaction_type: 1 });
stockTransactionSchema.index({ user_id: 1, stock_code: 1 });
stockTransactionSchema.index({ user_id: 1, createdAt: -1 });
stockTransactionSchema.index({ stock_code: 1, createdAt: -1 });

export const stockTransactionModel = model(STOCK_TRANSACTION_MODEL_NAME, stockTransactionSchema);

import type mongoose from 'mongoose';

declare global {
    namespace model {
        namespace stockTransaction {
            type TransactionType = 'BUY' | 'SELL';
            type TransactionStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

            type StockTransactionSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    /* ---------------------- User Info ---------------------- */
                    user_id: mongoose.Types.ObjectId;

                    /* -------------------- Transaction Info -------------------- */
                    transaction_type: TransactionType;

                    /* -------------------- Stock Details -------------------- */
                    stock_code: string; // Mã cổ phiếu (e.g., "VNM", "FPT")
                    stock_name: string; // Tên cổ phiếu
                    quantity: number; // Số lượng cổ phiếu
                    price_per_unit: number; // Giá một cổ phiếu
                    total_amount: number; // Tổng giá trị giao dịch

                    /* -------------------- Transaction Status -------------------- */
                    transaction_status: TransactionStatus;

                    /* -------------------- Fee & Commission -------------------- */

                    /* -------------------- Balance Impact -------------------- */
                    balance_before: number; // Số dư trước giao dịch
                    balance_after?: number; // Số dư sau giao dịch

                    /* -------------------- Additional Info -------------------- */
                    notes?: string;
                    order_id?: mongoose.Types.ObjectId;

                    /* -------------------- Timestamps -------------------- */
                    executed_at?: Date; // Thời gian thực thi
                    cancelled_at?: Date; // Thời gian hủy
                    cancellation_reason?: string; // Lý do hủy
                },
                isModel,
                isDoc,
                {
                    _id: string;
                }
            >;
        }
    }
}


import type { FC } from 'react';

import type { TransactionHistoryItem } from '@/lib/types/transactions';
import { formatCurrency } from '../utils/format';

interface HistoryBalanceCardsProps {
    availableBalance: number;
    pendingAmount: number;
}

export const HistoryBalanceCards: FC<HistoryBalanceCardsProps> = ({
    availableBalance,
    pendingAmount,
}) => {
    const total = availableBalance + pendingAmount;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-primary-foreground/80 text-sm font-medium">Tổng giá trị</span>
                    <svg className="w-8 h-8 text-primary-foreground/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(total)}</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-success shadow-md">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-medium">Khả dụng</span>
                    <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(availableBalance)}</p>
                <p className="text-sm text-success mt-1">Sẵn sàng giao dịch</p>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-warning shadow-md">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-medium">Đang chờ khớp</span>
                    <svg className="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                    </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                <p className="text-sm text-warning mt-1">Lệnh đang xử lý</p>
            </div>
        </div>
    );
};



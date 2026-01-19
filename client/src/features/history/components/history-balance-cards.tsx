import type { FC } from 'react';

import type { TransactionHistoryItem } from '@/lib/types/transactions';
import { formatCurrency } from '../utils/format';

interface HistoryBalanceCardsProps {
    availableBalance: number;
    pendingAmount: number;
}

export const HistoryBalanceCards: FC<HistoryBalanceCardsProps> = ({
    availableBalance,
    pendingAmount
}) => {
    const total = availableBalance + pendingAmount;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Value Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl p-6 text-white shadow-2xl ring-1 ring-white/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm font-medium">Tổng giá trị</span>
                        <svg
                            className="w-8 h-8 text-white/80"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <p className="text-3xl font-bold drop-shadow-md">{formatCurrency(total)}</p>
                </div>
            </div>

            {/* Available Balance Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl p-6 border border-emerald-500/20 shadow-2xl ring-1 ring-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-medium">Khả dụng</span>
                        <svg
                            className="w-8 h-8 text-emerald-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold text-white drop-shadow-md">
                        {formatCurrency(availableBalance)}
                    </p>
                    <p className="text-sm text-emerald-400 mt-1">Sẵn sàng giao dịch</p>
                </div>
            </div>

            {/* Pending Amount Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl p-6 border border-amber-500/20 shadow-2xl ring-1 ring-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm font-medium">Đang chờ khớp</span>
                        <svg
                            className="w-8 h-8 text-amber-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <p className="text-2xl font-bold text-white drop-shadow-md">
                        {formatCurrency(pendingAmount)}
                    </p>
                    <p className="text-sm text-amber-400 mt-1">Lệnh đang xử lý</p>
                </div>
            </div>
        </div>
    );
};

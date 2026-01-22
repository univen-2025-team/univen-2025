import type { FC } from 'react';

import { Wallet, CheckCircle2, Clock } from 'lucide-react';
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
                <div className="relative bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#2D5BDE]/30 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[#718096] text-sm font-medium">Tổng giá trị</span>
                        <div className="bg-[#F0F4FF] rounded-lg p-3">
                            <Wallet className="w-6 h-6 text-[#2D5BDE]" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#2D3748] mt-2">{formatCurrency(total)}</p>
                </div>
            </div>

            {/* Available Balance Card */}
            <div className="relative group">
                <div className="relative bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#2D5BDE]/30 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[#718096] text-sm font-medium">Khả dụng</span>
                        <div className="bg-emerald-50 rounded-lg p-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#2D3748] mt-2">
                        {formatCurrency(availableBalance)}
                    </p>
                    <p className="text-sm text-emerald-600 mt-1">Sẵn sàng giao dịch</p>
                </div>
            </div>

            {/* Pending Amount Card */}
            <div className="relative group">
                <div className="relative bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md hover:border-[#2D5BDE]/30 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[#718096] text-sm font-medium">Đang chờ khớp</span>
                        <div className="bg-amber-50 rounded-lg p-3">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-[#2D3748] mt-2">
                        {formatCurrency(pendingAmount)}
                    </p>
                    <p className="text-sm text-amber-600 mt-1">Lệnh đang xử lý</p>
                </div>
            </div>
        </div>
    );
};

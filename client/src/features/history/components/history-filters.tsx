import type { FC } from 'react';

import type { TransactionStatus, TransactionType } from '@/lib/types/transactions';

type FilterType = TransactionType | 'ALL';
type FilterStatus = TransactionStatus | 'ALL';

interface HistoryFiltersProps {
    filterType: FilterType;
    filterStatus: FilterStatus;
    onChangeType: (value: FilterType) => void;
    onChangeStatus: (value: FilterStatus) => void;
}

export const HistoryFilters: FC<HistoryFiltersProps> = ({
    filterType,
    filterStatus,
    onChangeType,
    onChangeStatus
}) => {
    return (
        <div className="relative group/filters">
            <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#2D5BDE]/30 transition-all duration-200">
                <h3 className="text-lg font-bold text-[#2D3748] mb-4">Bộ lọc</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#718096] mb-2">
                            Loại giao dịch
                        </label>
                        <select
                            value={filterType}
                            onChange={(event) => onChangeType(event.target.value as FilterType)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#2D5BDE]/50 focus:border-[#2D5BDE] transition-all"
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="BUY">Mua</option>
                            <option value="SELL">Bán</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#718096] mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(event) => onChangeStatus(event.target.value as FilterStatus)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-[#2D3748] focus:outline-none focus:ring-2 focus:ring-[#2D5BDE]/50 focus:border-[#2D5BDE] transition-all"
                        >
                            <option value="ALL">Tất cả</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="PENDING">Đang xử lý</option>
                            <option value="FAILED">Thất bại</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

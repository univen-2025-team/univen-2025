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
    onChangeStatus,
}) => {
    return (
        <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bộ lọc</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại giao dịch</label>
                    <select
                        value={filterType}
                        onChange={(event) => onChangeType(event.target.value as FilterType)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                        <option value="ALL">Tất cả</option>
                        <option value="BUY">Mua</option>
                        <option value="SELL">Bán</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                        value={filterStatus}
                        onChange={(event) => onChangeStatus(event.target.value as FilterStatus)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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
    );
};



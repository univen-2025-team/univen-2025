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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/30 to-blue-500/30 rounded-2xl blur opacity-20 group-hover/filters:opacity-30 transition duration-500"></div>
            <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/10 ring-1 ring-white/5">
                <h3 className="text-lg font-bold text-white mb-4">Bộ lọc</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Loại giao dịch
                        </label>
                        <select
                            value={filterType}
                            onChange={(event) => onChangeType(event.target.value as FilterType)}
                            className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                        >
                            <option value="ALL" className="bg-[#0F111A]">
                                Tất cả
                            </option>
                            <option value="BUY" className="bg-[#0F111A]">
                                Mua
                            </option>
                            <option value="SELL" className="bg-[#0F111A]">
                                Bán
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Trạng thái
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(event) => onChangeStatus(event.target.value as FilterStatus)}
                            className="w-full px-4 py-2 border border-white/10 rounded-xl bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                        >
                            <option value="ALL" className="bg-[#0F111A]">
                                Tất cả
                            </option>
                            <option value="COMPLETED" className="bg-[#0F111A]">
                                Hoàn thành
                            </option>
                            <option value="PENDING" className="bg-[#0F111A]">
                                Đang xử lý
                            </option>
                            <option value="FAILED" className="bg-[#0F111A]">
                                Thất bại
                            </option>
                            <option value="CANCELLED" className="bg-[#0F111A]">
                                Đã hủy
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

import type { FC } from 'react';

interface HistoryPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startItem: number;
    endItem: number;
    onPrev: () => void;
    onNext: () => void;
}

export const HistoryPagination: FC<HistoryPaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    startItem,
    endItem,
    onPrev,
    onNext
}) => {
    if (!totalItems) return null;

    return (
        <div className="relative group/pagination">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-500/20 to-violet-500/20 rounded-2xl blur opacity-20 group-hover/pagination:opacity-30 transition duration-500"></div>
            <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl border border-white/10 ring-1 ring-white/5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-slate-400">
                        Hiển thị{' '}
                        <span className="font-semibold text-white">
                            {startItem}-{endItem}
                        </span>{' '}
                        trong tổng số <span className="font-semibold text-white">{totalItems}</span>{' '}
                        giao dịch
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onPrev}
                            className="px-4 py-2 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 hover:border-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            disabled={currentPage === 1}
                        >
                            Trước
                        </button>
                        <span className="px-4 py-2 border border-violet-500/30 rounded-xl text-sm font-semibold text-white bg-violet-500/10">
                            Trang {currentPage}/{Math.max(totalPages, 1)}
                        </span>
                        <button
                            type="button"
                            onClick={onNext}
                            className="px-4 py-2 border border-white/10 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 hover:border-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            disabled={currentPage >= totalPages || totalPages === 0}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
    onNext,
}) => {
    if (!totalItems) return null;

    return (
        <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-gray-600">
                    Hiển thị{' '}
                    <span className="font-semibold">
                        {startItem}-{endItem}
                    </span>{' '}
                    trong tổng số <span className="font-semibold">{totalItems}</span> giao dịch
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onPrev}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentPage === 1}
                    >
                        Trước
                    </button>
                    <span className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700">
                        Trang {currentPage}/{Math.max(totalPages, 1)}
                    </span>
                    <button
                        type="button"
                        onClick={onNext}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentPage >= totalPages || totalPages === 0}
                    >
                        Sau
                    </button>
                </div>
            </div>
        </div>
    );
};



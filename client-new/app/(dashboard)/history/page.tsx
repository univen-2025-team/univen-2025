'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { transactionApi } from '@/lib/api/transaction.api';
import { useProfile } from '@/lib/hooks/useProfile';
import { selectUser } from '@/lib/store/authSlice';
import { useAppSelector } from '@/lib/store/hooks';
import type { TransactionHistoryItem, TransactionStatus, TransactionType } from '@/lib/types/transactions';
import { HistoryBalanceCards } from '@/features/history/components/history-balance-cards';
import { HistoryFilters } from '@/features/history/components/history-filters';
import { HistoryTable } from '@/features/history/components/history-table';
import { HistoryPagination } from '@/features/history/components/history-pagination';

type FilterType = TransactionType | 'ALL';
type FilterStatus = TransactionStatus | 'ALL';

const PAGE_SIZE = 10;

export default function HistoryPage() {
    const user = useAppSelector(selectUser);
    const userId = user?._id;
    const { profile } = useProfile(true);

    const [filterType, setFilterType] = useState<FilterType>('ALL');
    const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
    const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
    const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(
        async (pageToLoad: number) => {
            if (!userId) return;

            setIsLoading(true);
            setError(null);

            try {
                const response = await transactionApi.getTransactionHistory(userId, {
                    filters: {
                        transaction_type: filterType === 'ALL' ? undefined : filterType,
                        status: filterStatus === 'ALL' ? undefined : filterStatus,
                    },
                    pagination: {
                        page: pageToLoad,
                        limit: PAGE_SIZE,
                    },
                });

                setTransactions(response.transactions);
                setPagination(response.pagination);
                setCurrentPage(response.pagination.page);
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Không thể tải lịch sử giao dịch. Vui lòng thử lại.';
                setError(message);
                setTransactions([]);
            } finally {
                setIsLoading(false);
            }
        },
        [userId, filterType, filterStatus],
    );

    useEffect(() => {
        if (!userId) return;
        fetchTransactions(currentPage);
    }, [userId, currentPage, fetchTransactions]);

    const availableBalance = profile?.balance ?? user?.balance ?? 0;

    const pendingAmount = useMemo(
        () =>
            transactions
                .filter((transaction) => transaction.transaction_status === 'PENDING')
                .reduce((sum, transaction) => sum + transaction.total_amount, 0),
        [transactions],
    );

    const handleFilterTypeChange = (value: FilterType) => {
        setFilterType(value);
        setCurrentPage(1);
    };

    const handleFilterStatusChange = (value: FilterStatus) => {
        setFilterStatus(value);
        setCurrentPage(1);
    };

    const handlePrevPage = () => {
        if (currentPage <= 1) return;
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        if (currentPage >= pagination.totalPages) return;
        setCurrentPage((prev) => Math.min(prev + 1, pagination.totalPages));
    };

    const startItem = transactions.length ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const endItem = transactions.length ? startItem + transactions.length - 1 : 0;
    const totalItems = pagination.total;
    const isEmptyState = !isLoading && transactions.length === 0;

    if (!userId) {
        return (
            <div className="max-w-3xl mx-auto text-center py-16 space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Lịch sử giao dịch</h1>
                <p className="text-gray-600">
                    Vui lòng đăng nhập để xem lịch sử giao dịch và số dư của bạn.
                </p>
                <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                    Đăng nhập ngay
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Lịch sử giao dịch</h1>
                <p className="text-gray-600 mt-1">Quản lý và theo dõi các lệnh mua bán của bạn</p>
            </div>

            <HistoryBalanceCards availableBalance={availableBalance} pendingAmount={pendingAmount} />

            <HistoryFilters
                filterType={filterType}
                filterStatus={filterStatus}
                onChangeType={handleFilterTypeChange}
                onChangeStatus={handleFilterStatusChange}
            />

            {error && (
                <div className="rounded-xl border border-error bg-error-light px-4 py-3 text-sm text-error">
                    {error}
                </div>
            )}

            <HistoryTable transactions={transactions} isLoading={isLoading} isEmpty={isEmptyState} />

            <HistoryPagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={totalItems}
                startItem={startItem}
                endItem={endItem}
                onPrev={handlePrevPage}
                onNext={handleNextPage}
            />
        </div>
    );
}


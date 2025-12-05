'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { formatCurrency } from '@/features/history/utils/format';
import { transactionApi } from '@/lib/api/transaction.api';
import type { UserRankingItem, UserRankingPagination } from '@/lib/types/transactions';
import { useProfile } from '@/lib/hooks/useProfile';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import PageHeader from '@/components/dashboard/PageHeader';

const PAGE_SIZE = 10;

const medalStyles: Record<number, { bg: string; text: string; label: string }> = {
    1: {
        bg: 'var(--primary)',
        text: 'var(--primary-foreground)',
        label: 'Quán quân'
    },
    2: {
        bg: 'var(--accent)',
        text: 'var(--accent-foreground)',
        label: 'Á quân'
    },
    3: {
        bg: 'var(--chart-3)',
        text: 'var(--primary-foreground)',
        label: 'Top 3'
    }
};

const getProfitColor = (value: number) =>
    value >= 0 ? 'text-green-600' : 'text-red-600';

export default function RankingPage() {
    const [ranking, setRanking] = useState<UserRankingItem[]>([]);
    const [pagination, setPagination] = useState<UserRankingPagination | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch profile data for header
    const { profile, isLoading: isLoadingProfile } = useProfile(true);

    const fetchRanking = useCallback(
        async (pageToLoad: number) => {
            setIsLoading(true);
            setError(null);

            try {
                const data = await transactionApi.getUserRanking({
                    page: pageToLoad,
                    limit: PAGE_SIZE
                });

                setRanking(data.ranking);
                setPagination(data.pagination);
                setCurrentPage(data.pagination.current_page || pageToLoad);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Không thể tải bảng xếp hạng. Vui lòng thử lại.';
                setError(message);
                setRanking([]);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchRanking(currentPage);
    }, [fetchRanking, currentPage]);

    const topThree = useMemo(() => ranking.slice(0, 3), [ranking]);
    const canPrev = pagination ? pagination.current_page > 1 : false;
    const canNext = pagination ? pagination.current_page < pagination.total_pages : false;

    // Show loading while fetching profile
    if (isLoadingProfile || !profile) {
        return <LoadingSpinner />;
    }

    const userName = profile.user_fullName || 'Admin';

    return (
        <div className="space-y-6">
            <PageHeader
                title="Bảng xếp hạng lợi nhuận"
                description="Xếp hạng người dùng theo tổng lợi nhuận từ danh mục"
            />

            {error && (
                <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{
                        backgroundColor: 'var(--destructive)',
                        color: 'var(--destructive-foreground)',
                        border: `1px solid var(--border)`
                    }}
                >
                    {error}
                </div>
            )}

            {/* Top 3 highlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topThree.map((item) => {
                    const styles = medalStyles[item.rank] || {
                        bg: 'var(--card)',
                        text: 'var(--card-foreground)',
                        label: `Hạng ${item.rank}`
                    };

                    return (
                        <div
                            key={item.rank}
                            className="rounded-xl p-5 shadow-sm"
                            style={{
                                backgroundColor: styles.bg,
                                color: styles.text,
                                border: `1px solid var(--border)`
                            }}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-10 w-10 rounded-full shadow-inner flex items-center justify-center text-lg font-bold"
                                        style={{
                                            backgroundColor: 'var(--card)',
                                            color: styles.bg
                                        }}
                                    >
                                        {item.rank}
                                    </div>
                                    <div>
                                        <p className="text-sm opacity-90" style={{ color: styles.text }}>
                                            {styles.label}
                                        </p>
                                        <p className="text-lg font-semibold" style={{ color: styles.text }}>
                                            {item.user_fullName || '—'}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-5xl" style={{ color: styles.text }}>
                                    {item.rank === 1 && '🥇'}
                                    {item.rank === 2 && '🥈'}
                                    {item.rank === 3 && '🥉'}
                                </span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: styles.text }}>
                                {formatCurrency(item.total_profit)}
                            </p>
                        </div>
                    );
                })}

                {topThree.length === 0 && (
                    <div
                        className="col-span-3 rounded-xl border border-dashed p-6 text-center"
                        style={{ borderColor: 'var(--border-color)', color: 'var(--muted-text)' }}
                    >
                        Chưa có dữ liệu xếp hạng.
                    </div>
                )}
            </div>

            <div
                className="rounded-xl shadow-sm"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)' }}
                >
                    <div>
                        <p className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                            Danh sách xếp hạng
                        </p>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            Trang {pagination?.current_page ?? 1} / {pagination?.total_pages ?? 1}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => canPrev && setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={!canPrev || isLoading}
                            className="px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-60"
                            style={{
                                color: 'var(--color-foreground)',
                                borderColor: 'var(--border)',
                                backgroundColor: 'var(--card)'
                            }}
                        >
                            ← Trước
                        </button>
                        <button
                            onClick={() =>
                                canNext &&
                                setCurrentPage((p) =>
                                    pagination ? Math.min(pagination.total_pages, p + 1) : p + 1
                                )
                            }
                            disabled={!canNext || isLoading}
                            className="px-3 py-2 rounded-lg border text-sm font-medium disabled:opacity-60"
                            style={{
                                color: 'var(--color-foreground)',
                                borderColor: 'var(--border)',
                                backgroundColor: 'var(--card)'
                            }}
                        >
                            Sau →
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead style={{ backgroundColor: 'var(--sidebar)', color: 'var(--sidebar-foreground)' }}>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sidebar-foreground)' }}>
                                    Hạng
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sidebar-foreground)' }}>
                                    Người dùng
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--sidebar-foreground)' }}>
                                    Lợi nhuận
                                </th>
                            </tr>
                        </thead>
                        <tbody style={{ backgroundColor: 'var(--card)' }}>
                            {isLoading && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-6 text-center" style={{ color: 'var(--muted-text)' }}>
                                        Đang tải bảng xếp hạng...
                                    </td>
                                </tr>
                            )}

                            {!isLoading && ranking.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-4 py-6 text-center" style={{ color: 'var(--muted-text)' }}>
                                        Chưa có dữ liệu xếp hạng.
                                    </td>
                                </tr>
                            )}

                            {!isLoading &&
                                ranking.map((item) => (
                                    <tr
                                        key={item.rank}
                                        className="hover:opacity-80 transition-opacity"
                                        style={{
                                            borderColor: 'var(--border)',
                                            borderBottom: '1px solid var(--border)'
                                        }}
                                    >
                                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                                            {item.rank}
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--foreground)' }}>
                                            {item.user_fullName || '—'}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-sm font-semibold ${getProfitColor(
                                                item.total_profit
                                            )}`}
                                        >
                                            {formatCurrency(item.total_profit)}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {pagination && (
                    <div
                        className="flex items-center justify-between px-4 py-3 text-sm"
                        style={{ color: 'var(--muted-foreground)', borderTop: '1px solid var(--border)' }}
                    >
                        <div>
                            Tổng người dùng: <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{pagination.total_users}</span>
                        </div>
                        <div>
                            Trang {pagination.current_page} / {pagination.total_pages}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}



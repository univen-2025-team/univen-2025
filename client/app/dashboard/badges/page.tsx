'use client';

import { formatCurrency } from '@/features/history/utils/format';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import PageHeader from '@/components/dashboard/PageHeader';
import { useBadges } from '@/lib/hooks/useBadges';

export default function BadgesPage() {
    const { badges, earnedBadges, unearnedBadges, userRanking, isLoading, error } = useBadges();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Huy hiệu & Thành tích"
                description="Theo dõi các huy hiệu bạn đã đạt được trong hành trình đầu tư"
            />

            {/* User Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                    className="rounded-xl p-6 shadow-sm"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                        Tổng huy hiệu
                    </p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                        {earnedBadges.length}/{badges.length}
                    </p>
                </div>

                <div
                    className="rounded-xl p-6 shadow-sm"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                        Xếp hạng
                    </p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                        {userRanking ? `#${userRanking.rank}` : '—'}
                    </p>
                </div>

                <div
                    className="rounded-xl p-6 shadow-sm"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                >
                    <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                        Tổng lợi nhuận
                    </p>
                    <p
                        className={`text-3xl font-bold ${
                            userRanking && userRanking.total_profit >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                        }`}
                    >
                        {userRanking ? formatCurrency(userRanking.total_profit) : '0 ₫'}
                    </p>
                </div>
            </div>

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

            {/* Earned Badges */}
            <div>
                <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                    Huy hiệu đã đạt được ({earnedBadges.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {earnedBadges.map((badge) => (
                        <div
                            key={badge.id}
                            className="rounded-xl p-6 shadow-sm transition-all hover:shadow-md"
                            style={{
                                backgroundColor: 'var(--card)',
                                border: '2px solid var(--primary)'
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="rounded-full p-3 flex-shrink-0"
                                    style={{
                                        backgroundColor: 'var(--primary)',
                                        color: 'var(--primary-foreground)'
                                    }}
                                >
                                    {badge.icon}
                                </div>
                                <div className="flex-1">
                                    <h3
                                        className="text-lg font-semibold mb-1"
                                        style={{ color: 'var(--foreground)' }}
                                    >
                                        {badge.name}
                                    </h3>
                                    <p
                                        className="text-sm mb-2"
                                        style={{ color: 'var(--muted-foreground)' }}
                                    >
                                        {badge.description}
                                    </p>
                                    <p
                                        className="text-xs"
                                        style={{ color: 'var(--muted-foreground)' }}
                                    >
                                        Đạt được:{' '}
                                        {badge.earnedDate
                                            ? new Date(badge.earnedDate).toLocaleDateString('vi-VN')
                                            : '—'}
                                    </p>
                                    <div className="mt-2">
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                                            style={{
                                                backgroundColor: 'var(--success)',
                                                color: 'var(--success-foreground)'
                                            }}
                                        >
                                            ✓ Hoàn thành
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Unearned Badges */}
            {unearnedBadges.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
                        Huy hiệu chưa đạt được ({unearnedBadges.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {unearnedBadges.map((badge) => (
                            <div
                                key={badge.id}
                                className="rounded-xl p-6 shadow-sm opacity-60"
                                style={{
                                    backgroundColor: 'var(--card)',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="rounded-full p-3 flex-shrink-0"
                                        style={{
                                            backgroundColor: 'var(--muted)',
                                            color: 'var(--muted-foreground)'
                                        }}
                                    >
                                        {badge.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3
                                            className="text-lg font-semibold mb-1"
                                            style={{ color: 'var(--foreground)' }}
                                        >
                                            {badge.name}
                                        </h3>
                                        <p
                                            className="text-sm mb-2"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        >
                                            {badge.description}
                                        </p>
                                        <p
                                            className="text-xs mb-2"
                                            style={{ color: 'var(--muted-foreground)' }}
                                        >
                                            Yêu cầu: {badge.requirement}
                                        </p>
                                        {badge.progress !== undefined && badge.progress > 0 && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span
                                                        style={{ color: 'var(--muted-foreground)' }}
                                                    >
                                                        Tiến độ
                                                    </span>
                                                    <span style={{ color: 'var(--foreground)' }}>
                                                        {badge.progress.toFixed(0)}%
                                                    </span>
                                                </div>
                                                <div
                                                    className="w-full h-2 rounded-full overflow-hidden"
                                                    style={{ backgroundColor: 'var(--muted)' }}
                                                >
                                                    <div
                                                        className="h-full transition-all"
                                                        style={{
                                                            width: `${badge.progress}%`,
                                                            backgroundColor: 'var(--primary)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

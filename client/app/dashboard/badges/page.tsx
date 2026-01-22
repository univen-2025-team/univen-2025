'use client';

import { formatCurrency } from '@/features/history/utils/format';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import PageHeader from '@/components/dashboard/PageHeader';
import { useBadges } from '@/lib/hooks/useBadges';
import { BadgeCard } from '@/components/ui/badge';

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
                        <BadgeCard
                            key={badge.id}
                            badgeId={badge.id}
                            name={badge.name}
                            description={badge.description}
                            earned={badge.earned}
                            earnedDate={badge.earnedDate}
                            requirement={badge.requirement}
                        />
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
                            <BadgeCard
                                key={badge.id}
                                badgeId={badge.id}
                                name={badge.name}
                                description={badge.description}
                                earned={badge.earned}
                                earnedDate={badge.earnedDate}
                                progress={badge.progress}
                                requirement={badge.requirement}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

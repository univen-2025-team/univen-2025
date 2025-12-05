'use client';

import { useCallback, useEffect, useState } from 'react';
import { Trophy, TrendingUp, Target, Award, Star, Zap, Shield, Crown } from 'lucide-react';

import { formatCurrency } from '@/features/history/utils/format';
import { transactionApi } from '@/lib/api/transaction.api';
import type { UserRankingItem } from '@/lib/types/transactions';
import { useProfile } from '@/lib/hooks/useProfile';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import PageHeader from '@/components/dashboard/PageHeader';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    earned: boolean;
    earnedDate?: string;
    progress?: number;
    requirement: string;
}

export default function BadgesPage() {
    const [userRanking, setUserRanking] = useState<UserRankingItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch profile data
    const { profile, isLoading: isLoadingProfile } = useProfile(true);

    // Fetch user ranking
    const fetchUserRanking = useCallback(async () => {
        if (!profile?._id) return;

        setIsLoading(true);
        setError(null);

        try {
            // Fetch full ranking list and find current user by name
            const data = await transactionApi.getUserRanking({
                page: 1,
                limit: 100 // Get enough users to find current user
            });

            // Find current user in ranking by full name
            const currentUser = data.ranking.find(
                (item) => item.user_fullName === profile.user_fullName
            );

            setUserRanking(currentUser || null);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Không thể tải thông tin xếp hạng.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [profile?._id, profile?.user_fullName]);

    useEffect(() => {
        if (profile?._id) {
            fetchUserRanking();
        }
    }, [profile?._id, fetchUserRanking]);

    // Calculate badges based on user data
    const badges: Badge[] = [
        {
            id: 'first-trade',
            name: 'Giao dịch đầu tiên',
            description: 'Hoàn thành giao dịch đầu tiên của bạn',
            icon: <Target className="w-8 h-8" />,
            earned: true,
            earnedDate: new Date().toISOString(),
            requirement: 'Thực hiện 1 giao dịch'
        },
        {
            id: 'top-10',
            name: 'Top 10',
            description: 'Lọt vào top 10 bảng xếp hạng',
            icon: <Trophy className="w-8 h-8" />,
            earned: userRanking ? userRanking.rank <= 10 : false,
            earnedDate: userRanking && userRanking.rank <= 10 ? new Date().toISOString() : undefined,
            requirement: 'Đạt hạng 10 trở lên'
        },
        {
            id: 'top-3',
            name: 'Top 3',
            description: 'Lọt vào top 3 bảng xếp hạng',
            icon: <Crown className="w-8 h-8" />,
            earned: userRanking ? userRanking.rank <= 3 : false,
            earnedDate: userRanking && userRanking.rank <= 3 ? new Date().toISOString() : undefined,
            requirement: 'Đạt hạng 3 trở lên'
        },
        {
            id: 'champion',
            name: 'Quán quân',
            description: 'Đứng đầu bảng xếp hạng',
            icon: <Crown className="w-8 h-8" />,
            earned: userRanking ? userRanking.rank === 1 : false,
            earnedDate: userRanking && userRanking.rank === 1 ? new Date().toISOString() : undefined,
            requirement: 'Đạt hạng 1'
        },
        {
            id: 'profit-1m',
            name: 'Triệu phú',
            description: 'Đạt lợi nhuận 1 triệu đồng',
            icon: <TrendingUp className="w-8 h-8" />,
            earned: userRanking ? userRanking.total_profit >= 1000000 : false,
            earnedDate: userRanking && userRanking.total_profit >= 1000000 ? new Date().toISOString() : undefined,
            progress: userRanking ? Math.min((userRanking.total_profit / 1000000) * 100, 100) : 0,
            requirement: 'Lợi nhuận ≥ 1,000,000 ₫'
        },
        {
            id: 'profit-10m',
            name: 'Cao thủ',
            description: 'Đạt lợi nhuận 10 triệu đồng',
            icon: <Star className="w-8 h-8" />,
            earned: userRanking ? userRanking.total_profit >= 10000000 : false,
            earnedDate: userRanking && userRanking.total_profit >= 10000000 ? new Date().toISOString() : undefined,
            progress: userRanking ? Math.min((userRanking.total_profit / 10000000) * 100, 100) : 0,
            requirement: 'Lợi nhuận ≥ 10,000,000 ₫'
        },
        {
            id: 'profit-100m',
            name: 'Huyền thoại',
            description: 'Đạt lợi nhuận 100 triệu đồng',
            icon: <Award className="w-8 h-8" />,
            earned: userRanking ? userRanking.total_profit >= 100000000 : false,
            earnedDate: userRanking && userRanking.total_profit >= 100000000 ? new Date().toISOString() : undefined,
            progress: userRanking ? Math.min((userRanking.total_profit / 100000000) * 100, 100) : 0,
            requirement: 'Lợi nhuận ≥ 100,000,000 ₫'
        },
        {
            id: 'active-trader',
            name: 'Nhà giao dịch năng động',
            description: 'Thực hiện nhiều giao dịch',
            icon: <Zap className="w-8 h-8" />,
            earned: true,
            earnedDate: new Date().toISOString(),
            requirement: 'Thực hiện 10+ giao dịch'
        },
        {
            id: 'risk-master',
            name: 'Quản trị rủi ro',
            description: 'Quản lý danh mục hiệu quả',
            icon: <Shield className="w-8 h-8" />,
            earned: profile?.balance ? profile.balance > 0 : false,
            earnedDate: profile && profile.balance > 0 ? new Date().toISOString() : undefined,
            requirement: 'Duy trì số dư dương'
        }
    ];

    const earnedBadges = badges.filter((b) => b.earned);
    const unearnedBadges = badges.filter((b) => !b.earned);

    if (isLoadingProfile || isLoading) {
        return <LoadingSpinner />;
    }

    const userName = profile?.user_fullName || 'Admin';

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
                                                    <span style={{ color: 'var(--muted-foreground)' }}>
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

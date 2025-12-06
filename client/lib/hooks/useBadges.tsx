import { useCallback, useEffect, useState } from 'react';
import { Trophy, TrendingUp, Target, Award, Star, Zap, Shield, Crown } from 'lucide-react';
import { transactionApi } from '@/lib/api/transaction.api';
import type { UserRankingItem } from '@/lib/types/transactions';
import { useProfile } from '@/lib/hooks/useProfile';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode; // Note: This will be a ReactNode, but we might need to handle icons differently if used in non-React contexts, though here it's fine.
    earned: boolean;
    earnedDate?: string;
    progress?: number;
    requirement: string;
}

// We need to define the icons map or import them where used.
// Since the hook returns the badge objects with icons, we need to import lucide-react here.

export function useBadges() {
    const [userRanking, setUserRanking] = useState<UserRankingItem | null>(null);
    const [isLoadingRanking, setIsLoadingRanking] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch profile data
    const { profile, isLoading: isLoadingProfile } = useProfile(true);

    // Fetch user ranking
    const fetchUserRanking = useCallback(async () => {
        if (!profile?._id) return;

        setIsLoadingRanking(true);
        setError(null);

        try {
            // Fetch full ranking list and find current user by name
            // Note: In a real app, there should be an endpoint to get just the current user's rank
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
                err instanceof Error ? err.message : 'Không thể tải thông tin xếp hạng.';
            setError(message);
        } finally {
            setIsLoadingRanking(false);
        }
    }, [profile?._id, profile?.user_fullName]);

    useEffect(() => {
        if (profile?._id) {
            fetchUserRanking();
        } else if (!isLoadingProfile && !profile) {
            setIsLoadingRanking(false);
        }
    }, [profile?._id, isLoadingProfile, fetchUserRanking]);

    // Calculate badges based on user data
    // Note: We need to recreate the icons here.
    // Ideally, badge definitions should be static and we just compute 'earned'.
    // But for now, keeping it consistent with the original implementation.

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
            earnedDate:
                userRanking && userRanking.rank <= 10 ? new Date().toISOString() : undefined,
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
            earnedDate:
                userRanking && userRanking.rank === 1 ? new Date().toISOString() : undefined,
            requirement: 'Đạt hạng 1'
        },
        {
            id: 'profit-1m',
            name: 'Triệu phú',
            description: 'Đạt lợi nhuận 1 triệu đồng',
            icon: <TrendingUp className="w-8 h-8" />,
            earned: userRanking ? userRanking.total_profit >= 1000000 : false,
            earnedDate:
                userRanking && userRanking.total_profit >= 1000000
                    ? new Date().toISOString()
                    : undefined,
            progress: userRanking ? Math.min((userRanking.total_profit / 1000000) * 100, 100) : 0,
            requirement: 'Lợi nhuận ≥ 1,000,000 ₫'
        },
        {
            id: 'profit-10m',
            name: 'Cao thủ',
            description: 'Đạt lợi nhuận 10 triệu đồng',
            icon: <Star className="w-8 h-8" />,
            earned: userRanking ? userRanking.total_profit >= 10000000 : false,
            earnedDate:
                userRanking && userRanking.total_profit >= 10000000
                    ? new Date().toISOString()
                    : undefined,
            progress: userRanking ? Math.min((userRanking.total_profit / 10000000) * 100, 100) : 0,
            requirement: 'Lợi nhuận ≥ 10,000,000 ₫'
        },
        {
            id: 'profit-100m',
            name: 'Huyền thoại',
            description: 'Đạt lợi nhuận 100 triệu đồng',
            icon: <Award className="w-8 h-8" />,
            earned: userRanking ? userRanking.total_profit >= 100000000 : false,
            earnedDate:
                userRanking && userRanking.total_profit >= 100000000
                    ? new Date().toISOString()
                    : undefined,
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

    return {
        badges,
        earnedBadges,
        unearnedBadges,
        userRanking,
        isLoading: isLoadingProfile || isLoadingRanking,
        error
    };
}

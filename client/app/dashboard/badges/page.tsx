'use client';

import { formatCurrency } from '@/features/history/utils/format';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import PageHeader from '@/components/dashboard/PageHeader';
import { useBadges } from '@/lib/hooks/useBadges';
import { BadgeCard } from '@/components/ui/badge';
import { Trophy, Award, TrendingUp } from 'lucide-react';

export default function BadgesPage() {
    const { badges, earnedBadges, unearnedBadges, userRanking, isLoading, error } = useBadges();

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const profit = userRanking?.total_profit ?? 0;
    const isPositiveProfit = profit >= 0;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Huy hiệu & Thành tích"
                description="Theo dõi các huy hiệu bạn đã đạt được trong hành trình đầu tư"
            />

            {/* User Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Badges */}
                <div className="relative group">
                    <div className="relative bg-white rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[#718096] text-sm font-medium">Tổng huy hiệu</span>
                            <div className="bg-[#F0F4FF] rounded-lg p-3">
                                <Award className="w-6 h-6 text-[#2D5BDE]" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-[#2D3748] mt-2">
                            {earnedBadges.length}/{badges.length}
                        </p>
                        <p className="text-sm text-[#718096] mt-1">
                            {badges.length - earnedBadges.length > 0 
                                ? `Còn ${badges.length - earnedBadges.length} huy hiệu chưa đạt`
                                : 'Đã hoàn thành tất cả!'}
                        </p>
                    </div>
                </div>

                {/* Ranking */}
                <div className="relative group">
                    <div className="relative bg-white rounded-lg p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[#718096] text-sm font-medium">Xếp hạng</span>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <Trophy className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-[#2D3748] mt-2">
                            {userRanking ? `#${userRanking.rank}` : '—'}
                        </p>
                        <p className="text-sm text-amber-600 mt-1">Trong bảng xếp hạng</p>
                    </div>
                </div>

                {/* Total Profit */}
                <div className="relative group">
                    <div className="relative bg-white rounded-lg p-6 transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[#718096] text-sm font-medium">Tổng lợi nhuận</span>
                            <div className={`${isPositiveProfit ? 'bg-emerald-50' : 'bg-red-50'} rounded-lg p-3`}>
                                <TrendingUp className={`w-6 h-6 ${isPositiveProfit ? 'text-emerald-600' : 'text-red-600'}`} />
                            </div>
                        </div>
                        <p className={`text-2xl font-bold mt-2 ${isPositiveProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPositiveProfit ? '+' : ''}{formatCurrency(profit)}
                        </p>
                        <p className={`text-sm mt-1 ${isPositiveProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPositiveProfit ? 'Đang có lãi' : 'Đang lỗ'}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Earned Badges */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-[#2D3748]">
                    🏆 Huy hiệu đã đạt được ({earnedBadges.length})
                </h2>
                {earnedBadges.length > 0 ? (
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
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 text-center">
                        <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-[#718096]">Bạn chưa đạt được huy hiệu nào.</p>
                        <p className="text-sm text-[#A0AEC0] mt-1">Hãy bắt đầu giao dịch để mở khóa huy hiệu!</p>
                    </div>
                )}
            </div>

            {/* Unearned Badges */}
            {unearnedBadges.length > 0 && (
                <div>
                    <h2 className="text-xl font-bold mb-4 text-[#2D3748]">
                        🔒 Huy hiệu chưa đạt được ({unearnedBadges.length})
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useProfile } from '@/lib/hooks/useProfile';
import { selectUser, logoutUser } from '@/lib/store/authSlice';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import PageHeader from '@/components/dashboard/PageHeader';
import { PortfolioSummary } from '@/components/portfolio/portfolio-summary';
import { PortfolioEmpty } from '@/components/portfolio/portfolio-empty';
import { PortfolioLoading } from '@/components/portfolio/portfolio-loading';
import { HoldingsTable } from '@/components/portfolio/holdings-table';
import { usePortfolioCalculator } from '@/components/portfolio/hooks/use-portfolio-calculator';
import type { StockHolding, PortfolioStats } from '@/components/portfolio/types';

export default function PortfolioPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const userId = user?._id;
    const { profile, isLoading: isLoadingProfile } = useProfile(true);

    const [holdings, setHoldings] = useState<StockHolding[]>([]);
    const [stats, setStats] = useState<PortfolioStats>({
        totalInvested: 0,
        currentValue: 0,
        totalProfit: 0,
        totalProfitPercent: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { calculatePortfolio } = usePortfolioCalculator();

    const handleLogout = () => {
        dispatch(logoutUser());
        router.push('/auth/login');
    };

    const loadPortfolio = async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await calculatePortfolio(userId);
            setHoldings(result.holdings);
            setStats(result.stats);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Không thể tải danh mục đầu tư. Vui lòng thử lại.';
            setError(message);
            setHoldings([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            loadPortfolio();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    if (isLoadingProfile || !profile) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Danh mục đầu tư"
                description="Theo dõi các cổ phiếu bạn đang có và lợi nhuận"
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

            {/* Portfolio Summary */}
            <PortfolioSummary balance={profile.balance} stats={stats} />

            <div className="grid grid-cols-1 gap-6">
                {/* Holdings Table */}
                <div>
                    <div
                        className="rounded-xl shadow-sm overflow-hidden"
                        style={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)'
                        }}
                    >
                        <div
                            className="px-6 py-4"
                            style={{ borderBottom: '1px solid var(--border)' }}
                        >
                            <h2
                                className="text-xl font-bold"
                                style={{ color: 'var(--foreground)' }}
                            >
                                Cổ phiếu đang có ({holdings.length})
                            </h2>
                        </div>

                        {isLoading && <PortfolioLoading />}

                        {!isLoading && holdings.length === 0 && <PortfolioEmpty />}

                        {!isLoading && holdings.length > 0 && <HoldingsTable holdings={holdings} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

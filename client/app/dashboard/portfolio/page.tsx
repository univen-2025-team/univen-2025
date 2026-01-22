'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useProfile } from '@/lib/hooks/useProfile';
import { selectUser } from '@/lib/store/authSlice';
import { useAppSelector } from '@/lib/store/hooks';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import PageHeader from '@/components/dashboard/PageHeader';
import { Button } from '@/components/ui/button';
import { PortfolioSummary } from '@/components/portfolio/portfolio-summary';
import { PortfolioEmpty } from '@/components/portfolio/portfolio-empty';
import { PortfolioLoading } from '@/components/portfolio/portfolio-loading';
import { HoldingsTable } from '@/components/portfolio/holdings-table';
import { usePortfolioCalculator } from '@/components/portfolio/hooks/use-portfolio-calculator';
import type { StockHolding, PortfolioStats } from '@/components/portfolio/types';

const BG = '#F8FAFC';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const DANGER = '#DC2626';

export default function PortfolioPage() {
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
        <div
            className="min-h-screen font-sans font-normal"
            style={{ backgroundColor: BG }}
        >
            <div className="space-y-6 p-6">
                <PageHeader
                    title="Danh mục đầu tư"
                    description="Theo dõi các cổ phiếu bạn đang có và lợi nhuận"
                />

                {error && (
                    <div
                        className="rounded-xl border-2 px-4 py-3 text-sm font-medium"
                        style={{
                            borderColor: DANGER,
                            backgroundColor: 'rgba(220, 38, 38, 0.08)',
                            color: DANGER
                        }}
                    >
                        {error}
                    </div>
                )}

                <PortfolioSummary
                    balance={profile.balance ?? 0}
                    stats={stats}
                    animate={!isLoading}
                />

                <div
                    className="overflow-hidden rounded-2xl border-2 shadow-sm"
                    style={{ backgroundColor: CARD, borderColor: BORDER }}
                >
                    <div
                        className="flex flex-wrap items-center justify-between gap-3 border-b-2 px-6 py-4"
                        style={{ borderColor: BORDER }}
                    >
                        <h2 className="text-xl font-bold" style={{ color: '#1F3A8A' }}>
                            Cổ phiếu đang có ({holdings.length})
                        </h2>
                        <Button
                            type="button"
                            size="sm"
                            onClick={loadPortfolio}
                            disabled={isLoading}
                            className="cursor-pointer bg-[#2563EB] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1d4ed8]"
                        >
                            <RefreshCw
                                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                                aria-hidden
                            />
                            Làm mới
                        </Button>
                    </div>

                    {isLoading && <PortfolioLoading />}
                    {!isLoading && holdings.length === 0 && <PortfolioEmpty />}
                    {!isLoading && holdings.length > 0 && (
                        <HoldingsTable holdings={holdings} onRefresh={loadPortfolio} />
                    )}
                </div>
            </div>
        </div>
    );
}

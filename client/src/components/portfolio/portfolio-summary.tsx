'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/features/history/utils/format';
import { useCountUp } from './hooks/use-count-up';
import type { PortfolioStats } from './types';

const PRIMARY = '#1F3A8A';
const SECONDARY = '#2563EB';
const SUCCESS = '#16A34A';
const DANGER = '#DC2626';
const MUTED = '#64748B';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';

interface PortfolioSummaryProps {
    balance: number;
    stats: PortfolioStats;
    animate?: boolean;
}

function Money({ value, className = '' }: { value: number; className?: string }) {
    return (
        <span className={`font-variant-numeric tabular-nums ${className}`}>
            {formatCurrency(Math.round(value))}
        </span>
    );
}

export function PortfolioSummary({ balance, stats, animate = true }: PortfolioSummaryProps) {
    const isProfit = stats.totalProfit >= 0;
    const displayBalance = useCountUp(balance, { duration: 600, enabled: animate });
    const displayInvested = useCountUp(stats.totalInvested, { duration: 600, enabled: animate });
    const displayValue = useCountUp(stats.currentValue, { duration: 600, enabled: animate });
    const displayProfit = useCountUp(stats.totalProfit, { duration: 600, enabled: animate });

    return (
        <div
            className="group rounded-2xl border-2 p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: CARD, borderColor: BORDER }}
        >
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                <div>
                    <p className="mb-1 text-sm font-medium" style={{ color: MUTED }}>
                        Số dư khả dụng
                    </p>
                    <p className="text-2xl font-bold" style={{ color: PRIMARY }}>
                        <Money value={displayBalance} />
                    </p>
                </div>

                <div>
                    <p className="mb-1 text-sm font-medium" style={{ color: MUTED }}>
                        Tổng đã đầu tư
                    </p>
                    <p className="text-2xl font-bold" style={{ color: PRIMARY }}>
                        <Money value={displayInvested} />
                    </p>
                </div>

                <div
                    className="rounded-xl border-2 p-4"
                    style={{
                        backgroundColor: 'rgba(31, 58, 138, 0.06)',
                        borderColor: BORDER
                    }}
                >
                    <p className="mb-1 text-sm font-medium" style={{ color: MUTED }}>
                        Giá trị hiện tại
                    </p>
                    <p className="text-3xl font-bold" style={{ color: PRIMARY }}>
                        <Money value={displayValue} />
                    </p>
                </div>

                <div>
                    <div className="mb-1 flex items-center gap-1.5">
                        <p className="text-sm font-medium" style={{ color: MUTED }}>
                            Lãi/Lỗ
                        </p>
                        {isProfit ? (
                            <TrendingUp className="h-4 w-4" style={{ color: SUCCESS }} aria-hidden />
                        ) : (
                            <TrendingDown
                                className="h-4 w-4"
                                style={{ color: DANGER }}
                                aria-hidden
                            />
                        )}
                    </div>
                    <p
                        className="text-2xl font-bold"
                        style={{ color: isProfit ? SUCCESS : DANGER }}
                    >
                        <Money value={displayProfit} />
                    </p>
                    <p
                        className="mt-0.5 text-sm font-medium"
                        style={{ color: isProfit ? SUCCESS : DANGER }}
                    >
                        {isProfit ? '+' : ''}
                        {stats.totalProfitPercent.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    );
}

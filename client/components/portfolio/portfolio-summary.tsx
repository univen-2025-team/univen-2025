import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/features/history/utils/format';
import type { PortfolioStats } from './types';

interface PortfolioSummaryProps {
    balance: number;
    stats: PortfolioStats;
}

export function PortfolioSummary({ balance, stats }: PortfolioSummaryProps) {
    const isProfit = stats.totalProfit >= 0;
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-200">
                <p className="mb-2 text-sm text-muted-foreground">Số dư khả dụng</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(balance)}</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-200">
                <p className="mb-2 text-sm text-muted-foreground">Tổng đã đầu tư</p>
                <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.totalInvested)}
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-200">
                <p className="mb-2 text-sm text-muted-foreground">Giá trị hiện tại</p>
                <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(stats.currentValue)}
                </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-colors duration-200">
                <div className="mb-2 flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Lãi/Lỗ</p>
                    {isProfit ? (
                        <TrendingUp className="h-4 w-4 text-success" aria-hidden />
                    ) : (
                        <TrendingDown className="h-4 w-4 text-destructive" aria-hidden />
                    )}
                </div>
                <p
                    className={`text-2xl font-bold ${isProfit ? 'text-success' : 'text-destructive'}`}
                >
                    {formatCurrency(stats.totalProfit)}
                </p>
                <p
                    className={`mt-1 text-sm ${isProfit ? 'text-success' : 'text-destructive'}`}
                >
                    {isProfit ? '+' : ''}
                    {stats.totalProfitPercent.toFixed(2)}%
                </p>
            </div>
        </div>
    );
}

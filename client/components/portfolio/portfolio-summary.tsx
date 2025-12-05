import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/features/history/utils/format';
import type { PortfolioStats } from './types';

interface PortfolioSummaryProps {
    balance: number;
    stats: PortfolioStats;
}

export function PortfolioSummary({ balance, stats }: PortfolioSummaryProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div
                className="rounded-xl p-6 shadow-sm"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Số dư khả dụng
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(balance)}
                </p>
            </div>

            <div
                className="rounded-xl p-6 shadow-sm"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Tổng đã đầu tư
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(stats.totalInvested)}
                </p>
            </div>

            <div
                className="rounded-xl p-6 shadow-sm"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Giá trị hiện tại
                </p>
                <p className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                    {formatCurrency(stats.currentValue)}
                </p>
            </div>

            <div
                className="rounded-xl p-6 shadow-sm"
                style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Lãi/Lỗ
                    </p>
                    {stats.totalProfit >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                </div>
                <p
                    className={`text-2xl font-bold ${
                        stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                    {formatCurrency(stats.totalProfit)}
                </p>
                <p
                    className={`text-sm mt-1 ${
                        stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                >
                    {stats.totalProfit >= 0 ? '+' : ''}
                    {stats.totalProfitPercent.toFixed(2)}%
                </p>
            </div>
        </div>
    );
}

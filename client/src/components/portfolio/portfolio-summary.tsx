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
            {/* Available Balance Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/10 ring-1 ring-white/5">
                    <p className="text-sm mb-2 text-slate-400">Số dư khả dụng</p>
                    <p className="text-2xl font-bold text-white drop-shadow-md">
                        {formatCurrency(balance)}
                    </p>
                </div>
            </div>

            {/* Total Invested Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/10 ring-1 ring-white/5">
                    <p className="text-sm mb-2 text-slate-400">Tổng đã đầu tư</p>
                    <p className="text-2xl font-bold text-white drop-shadow-md">
                        {formatCurrency(stats.totalInvested)}
                    </p>
                </div>
            </div>

            {/* Current Value Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/10 ring-1 ring-white/5">
                    <p className="text-sm mb-2 text-slate-400">Giá trị hiện tại</p>
                    <p className="text-2xl font-bold text-white drop-shadow-md">
                        {formatCurrency(stats.currentValue)}
                    </p>
                </div>
            </div>

            {/* Profit/Loss Card */}
            <div className="relative group">
                <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${stats.totalProfit >= 0 ? 'from-emerald-500 to-cyan-500' : 'from-red-500 to-orange-500'} rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500`}
                ></div>
                <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/10 ring-1 ring-white/5">
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm text-slate-400">Lãi/Lỗ</p>
                        {stats.totalProfit >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                    </div>
                    <p
                        className={`text-2xl font-bold drop-shadow-[0_0_8px_${stats.totalProfit >= 0 ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'}] ${
                            stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                    >
                        {formatCurrency(stats.totalProfit)}
                    </p>
                    <p
                        className={`text-sm mt-1 ${
                            stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                    >
                        {stats.totalProfit >= 0 ? '+' : ''}
                        {stats.totalProfitPercent.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    );
}

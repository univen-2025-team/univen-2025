'use client';

import { Activity, TrendingUp, TrendingDown, Minus, DollarSign, BarChart3 } from 'lucide-react';

interface MarketStatsProps {
    totalStocks: number;
    advancing: number;
    declining: number;
    unchanged: number;
    totalVolume: number;
    avgChange: number;
}

export function MarketStats({
    totalStocks,
    advancing,
    declining,
    unchanged,
    totalVolume,
    avgChange
}: MarketStatsProps) {
    const formatNumber = (num: number) => num.toLocaleString('vi-VN');

    const stats = [
        {
            label: 'Tổng mã',
            value: totalStocks,
            icon: Activity,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            border: 'border-blue-200'
        },
        {
            label: 'Tăng',
            value: advancing,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200'
        },
        {
            label: 'Giảm',
            value: declining,
            icon: TrendingDown,
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200'
        },
        {
            label: 'Đứng giá',
            value: unchanged,
            icon: Minus,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200'
        },
        {
            label: 'Khối lượng (M)',
            value: Math.round(totalVolume / 1000000),
            icon: BarChart3,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-200'
        },
        {
            label: '% TB',
            value: `${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%`,
            icon: DollarSign,
            color: avgChange >= 0 ? 'text-emerald-600' : 'text-red-600',
            bg: avgChange >= 0 ? 'bg-emerald-50' : 'bg-red-50',
            border: avgChange >= 0 ? 'border-emerald-200' : 'border-red-200',
            isPercentage: true
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                const gradients = [
                    'from-violet-500 to-purple-500',
                    'from-emerald-500 to-cyan-500',
                    'from-red-500 to-orange-500',
                    'from-amber-500 to-yellow-500',
                    'from-violet-500 to-pink-500',
                    'from-blue-500 to-indigo-500'
                ];
                return (
                    <div
                        key={index}
                        className={`group bg-white rounded-xl shadow-sm p-4 border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${stat.border}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                            <div className={`p-2 rounded-lg ${stat.bg} transition-colors group-hover:scale-110`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${stat.color} tracking-tight`}>
                            {stat.isPercentage ? stat.value : formatNumber(Number(stat.value))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

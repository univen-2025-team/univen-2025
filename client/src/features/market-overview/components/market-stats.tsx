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
            label: 'Tổng số mã',
            value: totalStocks,
            icon: Activity,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20'
        },
        {
            label: 'Tăng',
            value: advancing,
            icon: TrendingUp,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/20'
        },
        {
            label: 'Giảm',
            value: declining,
            icon: TrendingDown,
            color: 'text-red-400',
            bgColor: 'bg-red-500/20'
        },
        {
            label: 'Đứng',
            value: unchanged,
            icon: Minus,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/20'
        },
        {
            label: 'Khối lượng (M)',
            value: Math.round(totalVolume / 1000000),
            icon: BarChart3,
            color: 'text-violet-400',
            bgColor: 'bg-violet-500/20'
        },
        {
            label: '% TB',
            value: `${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%`,
            icon: DollarSign,
            color: avgChange >= 0 ? 'text-emerald-400' : 'text-red-400',
            bgColor: avgChange >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20',
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
                    <div key={index} className="relative group">
                        <div
                            className={`absolute -inset-0.5 bg-gradient-to-r ${gradients[index % gradients.length]} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500`}
                        ></div>
                        <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/5 p-4 hover:shadow-violet-500/10 transition-all">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">{stat.label}</span>
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </div>
                            <div className={`text-2xl font-bold ${stat.color} drop-shadow-md`}>
                                {stat.isPercentage ? stat.value : formatNumber(Number(stat.value))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

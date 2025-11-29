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
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Tăng',
            value: advancing,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Giảm',
            value: declining,
            icon: TrendingDown,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            label: 'Đứng',
            value: unchanged,
            icon: Minus,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            label: 'Khối lượng (M)',
            value: Math.round(totalVolume / 1000000),
            icon: BarChart3,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            label: '% TB',
            value: `${avgChange > 0 ? '+' : ''}${avgChange.toFixed(2)}%`,
            icon: DollarSign,
            color: avgChange >= 0 ? 'text-green-600' : 'text-red-600',
            bgColor: avgChange >= 0 ? 'bg-green-50' : 'bg-red-50',
            isPercentage: true
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">{stat.label}</span>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </div>
                        <div className={`text-2xl font-bold ${stat.color}`}>
                            {stat.isPercentage ? stat.value : formatNumber(Number(stat.value))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

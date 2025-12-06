'use client';

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { StockData } from '@/lib/types/market';
import { formatPrice } from './utils';

type TopStocksChartProps = {
    stocks: StockData[];
};

export default function TopStocksChart({ stocks }: TopStocksChartProps) {
    const chartData = useMemo(() => {
        return stocks.slice(0, 10).map((stock, index) => ({
            ...stock,
            rank: index + 1
        }));
    }, [stocks]);

    // Calculate statistics
    const { maxPrice, minPrice, avgPrice } = useMemo(() => {
        if (chartData.length === 0) return { maxPrice: 0, minPrice: 0, avgPrice: 0 };
        const prices = chartData.map((s) => s.price);
        return {
            maxPrice: Math.max(...prices),
            minPrice: Math.min(...prices),
            avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length
        };
    }, [chartData]);

    // Generate gradient colors based on price ranking
    const getBarColor = (price: number) => {
        const range = maxPrice - minPrice || 1;
        const ratio = (price - minPrice) / range;
        // Gradient from blue to purple
        const r = Math.round(14 + ratio * 100);
        const g = Math.round(26 + ratio * 20);
        const b = Math.round(60 + ratio * 140);
        return `rgb(${r}, ${g}, ${b})`;
    };

    if (!stocks || stocks.length === 0) {
        return (
            <div className="bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">Top 10 cổ phiếu theo giá</h2>
                </div>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                        <svg
                            className="w-16 h-16 mx-auto mb-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <p className="text-lg font-medium">Chưa có dữ liệu</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Dữ liệu sẽ được cập nhật khi có giao dịch
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-indigo-50 to-white rounded-xl shadow-lg p-6 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <svg
                            className="w-7 h-7 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Top 10 cổ phiếu theo giá
                        </h2>
                        <p className="text-sm text-gray-500">Xếp hạng theo giá cao nhất</p>
                    </div>
                </div>
                {/* Stats */}
                <div className="hidden sm:flex items-center gap-4 text-sm">
                    <div className="text-center px-3 py-1 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500 text-xs">Cao nhất</p>
                        <p className="font-semibold text-indigo-600">
                            {maxPrice.toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <div className="text-center px-3 py-1 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500 text-xs">Trung bình</p>
                        <p className="font-semibold text-gray-900">
                            {avgPrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e5e7eb"
                            horizontal={true}
                            vertical={false}
                        />
                        <XAxis
                            type="number"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickFormatter={(value) => value.toLocaleString('vi-VN')}
                        />
                        <YAxis
                            type="category"
                            dataKey="symbol"
                            tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            width={60}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                                padding: '12px 16px'
                            }}
                            formatter={(value: number) => [formatPrice(value), 'Giá']}
                            labelFormatter={(label) => `Mã: ${label}`}
                        />
                        <Bar dataKey="price" radius={[0, 8, 8, 0]} name="Giá">
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBarColor(entry.price)} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded"
                        style={{ background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }}
                    ></div>
                    <span>Giá cổ phiếu (nghìn đồng)</span>
                </div>
            </div>
        </div>
    );
}

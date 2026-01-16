'use client';

import { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { IndexHistoryPoint } from '@/lib/types/market';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

type VN30IndexChartProps = {
    data: IndexHistoryPoint[];
    onRangeChange?: (range: string) => void;
    selectedRange?: string;
};

export default function VN30IndexChart({
    data,
    onRangeChange,
    selectedRange = '10M'
}: VN30IndexChartProps) {
    const ranges = [
        { label: '10 phút', value: '10M' },
        { label: '30 phút', value: '30M' },
        { label: '1 giờ', value: '1H' },
        { label: '3 giờ', value: '3H' },
        { label: '6 giờ', value: '6H' },
        { label: '1 ngày', value: '1D' },
        { label: '1 tuần', value: '1W' },
        { label: '1 tháng', value: '1M' },
        { label: '3 tháng', value: '3M' },
        { label: '6 tháng', value: '6M' },
        { label: '1 năm', value: '1Y' }
    ];

    // Calculate trend (up/down) and statistics
    const { isUp, change, changePercent, firstValue, lastValue, minValue, maxValue } =
        useMemo(() => {
            if (!data || data.length < 2) {
                return {
                    isUp: true,
                    change: 0,
                    changePercent: 0,
                    firstValue: 0,
                    lastValue: 0,
                    minValue: 0,
                    maxValue: 0
                };
            }
            const first = data[0].index;
            const last = data[data.length - 1].index;
            const diff = last - first;
            const percent = first !== 0 ? (diff / first) * 100 : 0;
            const min = Math.min(...data.map((d) => d.index));
            const max = Math.max(...data.map((d) => d.index));
            return {
                isUp: diff >= 0,
                change: diff,
                changePercent: percent,
                firstValue: first,
                lastValue: last,
                minValue: min,
                maxValue: max
            };
        }, [data]);

    // Dynamic colors based on trend
    const trendColor = isUp ? '#10b981' : '#ef4444';
    const gradientId = isUp ? 'greenGradientChart' : 'redGradientChart';
    const bgGradient = isUp ? 'from-emerald-50 to-white' : 'from-red-50 to-white';

    if (!data || data.length === 0) {
        return (
            <div
                className={`bg-gradient-to-b ${bgGradient} rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                            Biểu đồ VN30
                        </h3>
                    </div>
                    <div className="w-full sm:w-[120px]">
                        <Select value={selectedRange} onValueChange={onRangeChange}>
                            <SelectTrigger className="h-9 text-sm bg-white">
                                <SelectValue placeholder="Chọn thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                {ranges.map((range) => (
                                    <SelectItem
                                        key={range.value}
                                        value={range.value}
                                        className="text-sm"
                                    >
                                        {range.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                        <svg
                            className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                            />
                        </svg>
                        <p className="text-sm sm:text-lg font-medium">Đang thu thập dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-gradient-to-b ${bgGradient} rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100`}
        >
            {/* Header - Responsive */}
            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                isUp ? 'bg-emerald-100' : 'bg-red-100'
                            }`}
                        >
                            {isUp ? (
                                <svg
                                    className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5 sm:w-7 sm:h-7 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                                    />
                                </svg>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">
                                Biểu đồ VN30
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                                    {lastValue.toLocaleString('vi-VN', {
                                        maximumFractionDigits: 2
                                    })}
                                </span>
                                <span
                                    className={`text-xs sm:text-sm font-semibold px-1.5 sm:px-2 py-0.5 rounded-full ${
                                        isUp
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {isUp ? '+' : ''}
                                    {change.toFixed(2)} ({isUp ? '+' : ''}
                                    {changePercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Time Range Selector */}
                    <div className="w-full sm:w-[120px] flex-shrink-0">
                        <Select value={selectedRange} onValueChange={onRangeChange}>
                            <SelectTrigger className="h-9 text-sm bg-white shadow-sm">
                                <SelectValue placeholder="Chọn thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                {ranges.map((range) => (
                                    <SelectItem
                                        key={range.value}
                                        value={range.value}
                                        className="text-sm"
                                    >
                                        {range.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {/* Stats - Show on larger screens */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/50 rounded-lg">
                        <span className="text-gray-500">Thấp:</span>
                        <span className="font-semibold text-gray-900">
                            {minValue.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/50 rounded-lg">
                        <span className="text-gray-500">Cao:</span>
                        <span className="font-semibold text-gray-900">
                            {maxValue.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart - Responsive height */}
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data} margin={{ left: -10, right: 5 }}>
                    <defs>
                        <linearGradient id="greenGradientChart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#10b981" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="redGradientChart" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                            <stop offset="50%" stopColor="#ef4444" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickFormatter={(value) => {
                            if (value.includes(' ')) {
                                const timePart = value.split(' ')[1];
                                return timePart.substring(0, 5);
                            }
                            if (value.includes('/')) return value.split('/').slice(0, 2).join('/');
                            return value;
                        }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString('vi-VN')}
                        width={50}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                            padding: '8px 12px',
                            fontSize: '12px'
                        }}
                        labelStyle={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}
                        formatter={(value: number) => [
                            `${value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} điểm`,
                            'VN30'
                        ]}
                        labelFormatter={(label) => {
                            if (label.includes(' ')) {
                                return `Thời gian: ${label.split(' ')[1].substring(0, 5)}`;
                            }
                            return `Ngày: ${label}`;
                        }}
                    />
                    <ReferenceLine
                        y={firstValue}
                        stroke="#9ca3af"
                        strokeDasharray="4 4"
                        strokeWidth={1}
                    />
                    <Area
                        type="monotone"
                        dataKey="index"
                        stroke={trendColor}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        isAnimationActive={true}
                        animationDuration={500}
                    />
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend - Responsive */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                        className="w-6 sm:w-8 h-0.5 bg-gray-400"
                        style={{ borderTop: '2px dashed #9ca3af' }}
                    ></div>
                    <span className="hidden xs:inline">Điểm mở phiên</span>
                    <span className="xs:hidden">Mở</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                        style={{ backgroundColor: trendColor }}
                    ></div>
                    <span>{isUp ? 'Tăng' : 'Giảm'}</span>
                </div>
            </div>
        </div>
    );
}

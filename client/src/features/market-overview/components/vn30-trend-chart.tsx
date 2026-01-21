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
import { Activity } from 'lucide-react';

interface IndexHistoryPoint {
    time: string;
    index: number;
}

interface VN30TrendChartProps {
    data: IndexHistoryPoint[];
    onRangeChange?: (range: string) => void;
    selectedRange?: string;
}

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

export function VN30TrendChart({
    data,
    onRangeChange,
    selectedRange = '10M'
}: VN30TrendChartProps) {
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
    const trendColor = isUp ? '#4f46e5' : '#f43f5e'; // Indigo-600 or Rose-500
    const gradientId = isUp ? 'blueGradient' : 'redGradient';

    // Light mode gradients
    const bgGradient = 'bg-white';
    const borderColor = 'border-gray-100';

    if (!data || data.length === 0) {
        return (
            <div className={`h-full flex flex-col bg-white rounded-xl p-6 border border-gray-100`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                            <Activity className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Biểu đồ xu hướng VN30</h3>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <Activity className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                        <p className="text-lg font-medium text-gray-500">Sắp ra mắt</p>
                        <p className="text-sm text-gray-400 mt-1">Dữ liệu sẽ được cập nhật khi có giao dịch</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-white rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900 tracking-tight">
                                {lastValue.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                            </span>
                            <span className={`text-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${isUp ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                                {isUp ? '+' : ''}{change.toFixed(2)}
                                <span className="opacity-80">({isUp ? '+' : ''}{changePercent.toFixed(2)}%)</span>
                            </span>
                        </div>
                        <p className="text-xs font-medium text-gray-400 mt-0.5">VN30 Class • Trực tuyến</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Stats - Hidden on mobile */}
                    <div className="hidden sm:flex items-center gap-6 text-xs sm:text-sm mr-2">
                        <div className="text-right">
                            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Thấp</p>
                            <p className="font-bold text-gray-700 font-mono">
                                {minValue.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Cao</p>
                            <p className="font-bold text-gray-700 font-mono">
                                {maxValue.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                    {/* Time Range Selector */}
                    <div className="w-[100px]">
                        <Select value={selectedRange} onValueChange={onRangeChange}>
                            <SelectTrigger className="h-8 text-xs bg-white border-gray-200 text-gray-600 hover:bg-gray-50 focus:ring-1 focus:ring-gray-200 shadow-sm font-semibold">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-100 text-gray-700 shadow-lg">
                                {ranges.map((range) => (
                                    <SelectItem
                                        key={range.value}
                                        value={range.value}
                                        className="text-xs focus:bg-gray-50 focus:text-gray-900 cursor-pointer font-medium"
                                    >
                                        {range.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 min-h-0 -mx-2">
                <ResponsiveContainer width="100%" height="100%" debounce={200}>
                    <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
                                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={40}
                            tickFormatter={(value) => {
                                if (value.includes(' ')) {
                                    const timePart = value.split(' ')[1];
                                    return timePart.substring(0, 5);
                                }
                                if (value.includes('/')) return value.split('/').slice(0, 2).join('/');
                                return value;
                            }}
                            dy={10}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                            tickLine={false}
                            axisLine={false}
                            width={45}
                            tickFormatter={(value) => value.toLocaleString('vi-VN')}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                padding: '12px 16px',
                                color: '#1e293b'
                            }}
                            cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                            labelStyle={{ color: '#64748b', fontSize: '11px', marginBottom: '4px', fontWeight: 600 }}
                            formatter={(value: number) => [
                                <span key="value" className="font-bold text-base font-mono" style={{ color: trendColor }}>
                                    {value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}
                                </span>,
                                <span key="label" className="text-gray-500 text-xs ml-2 font-medium">VN30</span>
                            ]}
                            labelFormatter={(label) => {
                                if (label.includes(' ')) {
                                    return `${label.split(' ')[1].substring(0, 5)} • ${label.split(' ')[0]}`;
                                }
                                return label;
                            }}
                        />
                        <ReferenceLine y={firstValue} stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Mở cửa', position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                        <Area
                            type="monotone"
                            dataKey="index"
                            stroke={trendColor}
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                            isAnimationActive={true}
                            animationDuration={1000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

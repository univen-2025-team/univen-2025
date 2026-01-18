'use client';

import { useMemo, useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import api from '@/lib/axios';

type StockChartProps = {
    symbol: string;
    refreshTrigger?: number;
};

// Reuse types or define locally
type PricePoint = {
    time: string;
    price: number;
    volume: number;
};

export default function StockChart({ symbol, refreshTrigger = 0 }: StockChartProps) {
    const [data, setData] = useState<PricePoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRange, setSelectedRange] = useState('1D'); // Default to 1 Day (intraday)

    const ranges = [
        { label: '1 Ngày', value: '1D' },
        { label: '1 Tuần', value: '1W' },
        { label: '1 Tháng', value: '1M' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            if (!symbol) return;
            try {
                setLoading(true);

                const end = new Date();
                const start = new Date();

                if (selectedRange === '1W') {
                    start.setDate(end.getDate() - 7);
                } else if (selectedRange === '1M') {
                    start.setDate(end.getDate() - 30);
                } else if (selectedRange === '1D') {
                    // Fallback to Friday if today is Saturday (6) or Sunday (0)
                    const day = start.getDay();
                    if (day === 6) { // Saturday
                        start.setDate(start.getDate() - 1);
                        end.setDate(end.getDate() - 1);
                    } else if (day === 0) { // Sunday
                        start.setDate(start.getDate() - 2);
                        end.setDate(end.getDate() - 2);
                    }
                }
                // For '1D' (Weekday), start/end remains today

                const formatDate = (d: Date) => d.toISOString().split('T')[0];
                const startStr = formatDate(start);
                const endStr = formatDate(end);

                // Use date range filtering instead of limit
                const response = await api.get(`/market/stock/${symbol}/intraday?start=${startStr}&end=${endStr}`);

                if (response.data && response.data.metadata && response.data.metadata.history) {
                    const rawData = response.data.metadata.history;
                    // Combine date and time for unique X-axis keys and better tooltip context
                    const formattedData = rawData.map((item: any) => ({
                        time: item.date ? `${item.date} ${item.time}` : item.time,
                        price: item.price,
                        volume: item.volume
                    }));
                    setData(formattedData);
                }
            } catch (error) {
                console.error('Error fetching stock chart data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Poll every 1 minute if 1D is selected
        let intervalId: NodeJS.Timeout;
        if (selectedRange === '1D') {
            intervalId = setInterval(fetchData, 60000);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [symbol, refreshTrigger, selectedRange]);

    // Calculate statistics
    const { isUp, change, changePercent, firstValue, lastValue, minValue, maxValue } = useMemo(() => {
        if (!data || data.length < 2) {
            return {
                isUp: true, change: 0, changePercent: 0,
                firstValue: 0, lastValue: 0, minValue: 0, maxValue: 0
            };
        }
        const first = data[0].price;
        const last = data[data.length - 1].price;
        const diff = last - first;
        const percent = first !== 0 ? (diff / first) * 100 : 0;
        const min = Math.min(...data.map(d => d.price));
        const max = Math.max(...data.map(d => d.price));

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

    const trendColor = isUp ? '#10b981' : '#ef4444';
    const gradientId = `gradient-${symbol}-${isUp ? 'up' : 'down'}`;

    if (loading && data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                Loading chart...
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-500">
                No data available
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="space-y-1">
                    <div className={`text-2xl font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                        {(lastValue * 1000).toLocaleString('vi-VN')}
                    </div>
                    <div className={`text-sm font-medium flex items-center gap-2 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                        <span>{change > 0 ? '+' : ''}{(change * 1000).toLocaleString()}</span>
                        <span>({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
                    </div>
                </div>

                <Select value={selectedRange} onValueChange={setSelectedRange}>
                    <SelectTrigger className="w-[100px] h-8 text-xs">
                        <SelectValue placeholder="Range" />
                    </SelectTrigger>
                    <SelectContent>
                        {ranges.map(r => (
                            <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.8} />
                        <XAxis
                            dataKey="time"
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => {
                                // Format: extract time part (HH:MM) from "YYYY-MM-DD HH:MM:SS"
                                if (value && value.includes(' ')) {
                                    return value.split(' ')[1]?.substring(0, 5) || value;
                                }
                                return value?.substring(0, 5) || value;
                            }}
                            interval="preserveStartEnd"
                            minTickGap={50}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            orientation="right"
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(val) => (val * 1000).toLocaleString()}
                            width={50}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                borderColor: '#e5e7eb',
                                color: '#111827',
                                borderRadius: '0.5rem',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            formatter={(value: number) => [(value * 1000).toLocaleString(), 'Giá']}
                            labelFormatter={(label) => {
                                // Format label as "DD/MM/YYYY HH:MM"
                                if (label && label.includes(' ')) {
                                    const [datePart, timePart] = label.split(' ');
                                    const [year, month, day] = datePart.split('-');
                                    return `${day}/${month}/${year} ${timePart?.substring(0, 5) || ''}`;
                                }
                                return label;
                            }}
                            labelStyle={{ color: '#6b7280', fontWeight: 'bold' }}
                        />
                        <ReferenceLine
                            y={firstValue}
                            stroke="#9ca3af"
                            strokeDasharray="3 3"
                            strokeWidth={1}
                            opacity={0.8}
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke={trendColor}
                            fillOpacity={1}
                            fill={`url(#${gradientId})`}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

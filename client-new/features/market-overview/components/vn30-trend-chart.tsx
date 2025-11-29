'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

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

export function VN30TrendChart({ data, onRangeChange, selectedRange = '1M' }: VN30TrendChartProps) {
    const ranges = [
        { label: '1H', value: '1H' },
        { label: '3H', value: '3H' },
        { label: '6H', value: '6H' },
        { label: '1D', value: '1D' },
        { label: '1W', value: '1W' },
        { label: '1M', value: '1M' },
        { label: '3M', value: '3M' },
        { label: '6M', value: '6M' },
        { label: '1Y', value: '1Y' }
    ];

    if (!data || data.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Biểu đồ xu hướng VN30</h3>
                    <div className="w-[100px]">
                        <Select value={selectedRange} onValueChange={onRangeChange}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Time" />
                            </SelectTrigger>
                            <SelectContent>
                                {ranges.map((range) => (
                                    <SelectItem
                                        key={range.value}
                                        value={range.value}
                                        className="text-xs"
                                    >
                                        {range.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Chưa có dữ liệu
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Biểu đồ xu hướng VN30</h3>
                <div className="w-[100px]">
                    <Select value={selectedRange} onValueChange={onRangeChange}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Time" />
                        </SelectTrigger>
                        <SelectContent>
                            {ranges.map((range) => (
                                <SelectItem
                                    key={range.value}
                                    value={range.value}
                                    className="text-xs"
                                >
                                    {range.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="time"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => {
                            // For intraday data (YYYY-MM-DD HH:MM:SS), show only HH:MM
                            if (value.includes(' ')) {
                                const timePart = value.split(' ')[1]; // Get "HH:MM:SS"
                                return timePart.substring(0, 5); // Return "HH:MM"
                            }
                            // For daily data (YYYY-MM-DD or MM/DD), keep as is or simplify
                            if (value.includes('/')) return value.split('/').slice(0, 2).join('/');
                            return value;
                        }}
                    />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="index"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

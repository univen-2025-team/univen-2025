import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
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
    selectedRange = '1M'
}: VN30IndexChartProps) {
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

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <svg
                        className="w-6 h-6 text-blue-600 mr-2"
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
                    Biểu đồ VN30 Index
                </h2>
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
            <div className="h-64">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="time"
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                tickFormatter={(value) => {
                                    if (value.includes('/'))
                                        return value.split('/').slice(0, 2).join('/');
                                    return value;
                                }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="index"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={{ fill: '#2563eb', r: 3 }}
                                activeDot={{ r: 5 }}
                                name="VN30"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Đang thu thập dữ liệu...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

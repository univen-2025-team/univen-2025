'use client';

import { Clock, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface VN30IndexCardProps {
    index: number;
    change: number;
    changePercent: number;
    isConnected: boolean;
    realtimeEnabled: boolean;
    onToggleRealtime: () => void;
    lastUpdate?: string;
}

export function VN30IndexCard({
    index,
    change,
    changePercent,
    isConnected,
    realtimeEnabled,
    onToggleRealtime,
    lastUpdate
}: VN30IndexCardProps) {
    const isPositive = change > 0;
    const isNegative = change < 0;

    const getChangeColor = () => {
        if (isPositive) return 'text-green-600';
        if (isNegative) return 'text-red-600';
        return 'text-yellow-600';
    };

    const formatNumber = (num: number | undefined) => {
        if (num === undefined || num === null) return '0.00';
        return num.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Chỉ số VN30</h2>
                <div className="flex items-center gap-2">
                    {isConnected && realtimeEnabled && (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Real-time
                        </span>
                    )}
                    <button
                        onClick={onToggleRealtime}
                        className={`p-2 rounded-lg transition-colors ${
                            realtimeEnabled
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={
                            realtimeEnabled ? 'Tắt cập nhật real-time' : 'Bật cập nhật real-time'
                        }
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <div className="text-4xl font-bold text-gray-900">{formatNumber(index)}</div>
                    <div
                        className={`flex items-center gap-2 mt-2 text-lg font-semibold ${getChangeColor()}`}
                    >
                        {isPositive && <TrendingUp className="h-5 w-5" />}
                        {isNegative && <TrendingDown className="h-5 w-5" />}
                        {!isPositive && !isNegative && <Minus className="h-5 w-5" />}
                        <span>
                            {change > 0 ? '+' : ''}
                            {formatNumber(change)} ({changePercent > 0 ? '+' : ''}
                            {changePercent}%)
                        </span>
                    </div>
                </div>

                {lastUpdate && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 pt-2 border-t">
                        <Clock className="h-4 w-4" />
                        <span>Cập nhật: {lastUpdate}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

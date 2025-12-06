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

    const getBgGradient = () => {
        if (isPositive) return 'from-emerald-50 to-white';
        if (isNegative) return 'from-red-50 to-white';
        return 'from-amber-50 to-white';
    };

    const getIconBg = () => {
        if (isPositive) return 'bg-emerald-100';
        if (isNegative) return 'bg-red-100';
        return 'bg-amber-100';
    };

    const getIconColor = () => {
        if (isPositive) return 'text-emerald-600';
        if (isNegative) return 'text-red-600';
        return 'text-amber-600';
    };

    const getChangeColor = () => {
        if (isPositive) return 'text-emerald-600';
        if (isNegative) return 'text-red-600';
        return 'text-amber-600';
    };

    const getChangeBadge = () => {
        if (isPositive) return 'bg-emerald-100 text-emerald-700';
        if (isNegative) return 'bg-red-100 text-red-700';
        return 'bg-amber-100 text-amber-700';
    };

    const formatNumber = (num: number | undefined) => {
        if (num === undefined || num === null) return '0.00';
        return num.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div
            className={`bg-gradient-to-b ${getBgGradient()} rounded-xl shadow-lg p-6 border border-gray-100`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-12 h-12 ${getIconBg()} rounded-xl flex items-center justify-center`}
                    >
                        {isPositive && (
                            <svg
                                className={`w-7 h-7 ${getIconColor()}`}
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
                        )}
                        {isNegative && (
                            <svg
                                className={`w-7 h-7 ${getIconColor()}`}
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
                        {!isPositive && !isNegative && (
                            <Minus className={`w-7 h-7 ${getIconColor()}`} />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Chỉ số VN30</h2>
                        <p className="text-sm text-gray-500">Chỉ số thị trường</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isConnected && realtimeEnabled && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Trực tiếp
                        </span>
                    )}
                    <button
                        onClick={onToggleRealtime}
                        className={`p-2.5 rounded-xl transition-all duration-200 ${
                            realtimeEnabled
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={
                            realtimeEnabled ? 'Tắt cập nhật real-time' : 'Bật cập nhật real-time'
                        }
                    >
                        <RefreshCw className={`h-4 w-4 ${realtimeEnabled ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Value */}
            <div className="space-y-4">
                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">
                            {formatNumber(index)}
                        </span>
                        <span className="text-xl font-medium text-gray-400">điểm</span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                        <span
                            className={`flex items-center gap-1.5 text-lg font-semibold px-3 py-1 rounded-lg ${getChangeBadge()}`}
                        >
                            {isPositive && <TrendingUp className="h-5 w-5" />}
                            {isNegative && <TrendingDown className="h-5 w-5" />}
                            {!isPositive && !isNegative && <Minus className="h-5 w-5" />}
                            {change > 0 ? '+' : ''}
                            {formatNumber(change)} điểm
                        </span>
                        <span className={`text-lg font-semibold ${getChangeColor()}`}>
                            ({changePercent > 0 ? '+' : ''}
                            {changePercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>

                {/* Last Update */}
                {lastUpdate && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 pt-3 border-t border-gray-100">
                        <Clock className="h-4 w-4" />
                        <span>Cập nhật lần cuối: {lastUpdate}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

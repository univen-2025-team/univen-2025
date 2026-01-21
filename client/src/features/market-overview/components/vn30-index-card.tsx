'use client';

import { Clock, TrendingUp, TrendingDown, Minus, RefreshCw, Zap } from 'lucide-react';

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

    const getIconStyle = () => {
        if (isPositive) return 'bg-indigo-50 text-indigo-600';
        if (isNegative) return 'bg-red-50 text-red-600';
        return 'bg-amber-50 text-amber-600';
    };

    const getTextColor = () => {
        if (isPositive) return 'text-indigo-600';
        if (isNegative) return 'text-red-600';
        return 'text-amber-600';
    };

    // Formatter
    const formatNumber = (num: number | undefined) => {
        if (num === undefined || num === null) return '0.00';
        return num.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="p-5">
                {/* Header: Title & Status */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-105 ${getIconStyle()}`}>
                            {isPositive && <TrendingUp className="w-5 h-5" strokeWidth={2.5} />}
                            {isNegative && <TrendingDown className="w-5 h-5" strokeWidth={2.5} />}
                            {!isPositive && !isNegative && <Minus className="w-5 h-5" strokeWidth={2.5} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold text-gray-900 tracking-tight">Chỉ số VN30</h2>
                                {isConnected && realtimeEnabled && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 font-medium truncate max-w-[150px] sm:max-w-none">
                                Ho Chi Minh Stock Index 30
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Value - Responsive Layout */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter tabular-nums leading-none">
                            {formatNumber(index).split('.')[0]}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-gray-400 tracking-tight tabular-nums">
                            .{formatNumber(index).split('.')[1]}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-colors w-fit ${isPositive ? 'bg-indigo-50 border-indigo-100' :
                            isNegative ? 'bg-red-50 border-red-100' :
                                'bg-amber-50 border-amber-100'
                            }`}>
                            <span className={`text-base font-bold ${getTextColor()}`}>
                                {isPositive ? '+' : ''}{formatNumber(change)}
                            </span>
                            <span className={`h-3 w-px ${isPositive ? 'bg-indigo-200' : isNegative ? 'bg-red-200' : 'bg-amber-200'}`} />
                            <span className={`text-base font-bold ${getTextColor()}`}>
                                {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                            </span>
                        </div>

                        {/* Connection Toggle (moved here for cleaner mobile layout) */}
                        <button
                            onClick={onToggleRealtime}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ml-auto sm:ml-0 ${realtimeEnabled
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            <Zap className={`w-3.5 h-3.5 ${realtimeEnabled ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                            {realtimeEnabled ? 'BẬT' : 'TẮT'}
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                {lastUpdate && (
                    <div className="mt-5 flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Cập nhật: {lastUpdate}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

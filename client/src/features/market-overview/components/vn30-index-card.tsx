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

    const getBgStyle = () => {
        if (isPositive) return 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-emerald-100/50';
        if (isNegative) return 'bg-gradient-to-br from-red-50 via-white to-red-50/30 border-red-100/50';
        return 'bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-amber-100/50';
    };

    const getIconStyle = () => {
        if (isPositive) return 'bg-emerald-100/80 text-emerald-600 ring-4 ring-emerald-50';
        if (isNegative) return 'bg-red-100/80 text-red-600 ring-4 ring-red-50';
        return 'bg-amber-100/80 text-amber-600 ring-4 ring-amber-50';
    };

    const getTextColor = () => {
        if (isPositive) return 'text-emerald-600';
        if (isNegative) return 'text-red-600';
        return 'text-amber-600';
    };

    // Formatter
    const formatNumber = (num: number | undefined) => {
        if (num === undefined || num === null) return '0.00';
        return num.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl border ${getBgStyle()}`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-current opacity-5 blur-3xl pointer-events-none" />

            <div className="relative p-6 sm:p-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 ${getIconStyle()}`}>
                            {isPositive && <TrendingUp className="w-8 h-8" strokeWidth={2.5} />}
                            {isNegative && <TrendingDown className="w-8 h-8" strokeWidth={2.5} />}
                            {!isPositive && !isNegative && <Minus className="w-8 h-8" strokeWidth={2.5} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">VN30 Index</h2>
                                {isConnected && realtimeEnabled && (
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                <span>Vietnam Ho Chi Minh Stock Index 30</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border backdrop-blur-sm shadow-sm transition-colors ${realtimeEnabled
                            ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border-gray-200'
                            }`}>
                            <Zap className={`w-3.5 h-3.5 ${realtimeEnabled ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                            {realtimeEnabled ? 'LIVE DATA' : 'OFFLINE'}
                        </div>

                        <button
                            onClick={onToggleRealtime}
                            className={`p-2.5 rounded-xl transition-all active:scale-95 ${realtimeEnabled
                                ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100 hover:bg-emerald-50'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                            title="Toggle Real-time"
                        >
                            <RefreshCw className={`w-5 h-5 ${realtimeEnabled ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="flex flex-col sm:flex-row items-baseline gap-2 sm:gap-6">
                    <div className="flex items-baseline gap-1">
                        <span className="text-6xl font-black text-gray-900 tracking-tighter tabular-nums leading-none">
                            {formatNumber(index).split('.')[0]}
                        </span>
                        <span className="text-3xl font-bold text-gray-500 tracking-tight tabular-nums">
                            .{formatNumber(index).split('.')[1]}
                        </span>
                    </div>

                    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl backdrop-blur-sm border shadow-sm transition-colors ${isPositive ? 'bg-emerald-50/50 border-emerald-100' :
                        isNegative ? 'bg-red-50/50 border-red-100' :
                            'bg-amber-50/50 border-amber-100'
                        }`}>
                        <div className={`flex items-center gap-1 text-lg font-bold ${getTextColor()}`}>
                            {isPositive ? '+' : ''}{formatNumber(change)}
                        </div>
                        <div className={`h-4 w-px ${isPositive ? 'bg-emerald-200' : isNegative ? 'bg-red-200' : 'bg-amber-200'}`} />
                        <div className={`flex items-center gap-1 text-lg font-bold ${getTextColor()}`}>
                            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                {lastUpdate && (
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100/50">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Last update: {lastUpdate}</span>
                        </div>
                        <div className="text-xs font-bold text-gray-300 tracking-widest uppercase">
                            Market Overview
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

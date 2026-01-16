'use client';

import { VN30Index } from '@/lib/types/market';
import { formatNumber, getChangeColor } from './utils';

type VN30IndexCardProps = {
    vn30Index: VN30Index;
    timestamp: string;
    isConnected: boolean;
    realtimeEnabled: boolean;
    onToggleRealtime: () => void;
};

export default function VN30IndexCard({
    vn30Index,
    timestamp,
    isConnected,
    realtimeEnabled,
    onToggleRealtime
}: VN30IndexCardProps) {
    const isPositive = vn30Index.change > 0;
    const isNegative = vn30Index.change < 0;

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

    const getChangeBadge = () => {
        if (isPositive) return 'bg-emerald-100 text-emerald-700';
        if (isNegative) return 'bg-red-100 text-red-700';
        return 'bg-amber-100 text-amber-700';
    };

    return (
        <div
            className={`bg-gradient-to-b ${getBgGradient()} rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100`}
        >
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${getIconBg()} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                        {isPositive && (
                            <svg
                                className={`w-5 h-5 sm:w-7 sm:h-7 ${getIconColor()}`}
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
                                className={`w-5 h-5 sm:w-7 sm:h-7 ${getIconColor()}`}
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
                            <svg
                                className={`w-5 h-5 sm:w-7 sm:h-7 ${getIconColor()}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 12H4"
                                />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Chỉ số VN30</h2>
                        <p className="text-xs sm:text-sm text-gray-500">Chỉ số thị trường</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                    {isConnected && realtimeEnabled && (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-emerald-200">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="hidden xs:inline">Trực tiếp</span>
                        </span>
                    )}
                    <button
                        onClick={onToggleRealtime}
                        className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 ${
                            realtimeEnabled
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={
                            realtimeEnabled ? 'Tắt cập nhật real-time' : 'Bật cập nhật real-time'
                        }
                    >
                        <svg
                            className={`h-4 w-4 ${realtimeEnabled ? 'animate-spin' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Value - Responsive */}
            <div className="space-y-3 sm:space-y-4">
                <div>
                    <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
                            {formatNumber(vn30Index.index)}
                        </span>
                        <span className="text-base sm:text-lg md:text-xl font-medium text-gray-400">
                            điểm
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                        <span
                            className={`flex items-center gap-1 sm:gap-1.5 text-sm sm:text-base md:text-lg font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg ${getChangeBadge()}`}
                        >
                            {isPositive && (
                                <svg
                                    className="h-4 w-4 sm:h-5 sm:w-5"
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
                                    className="h-4 w-4 sm:h-5 sm:w-5"
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
                            {vn30Index.change > 0 ? '+' : ''}
                            {formatNumber(vn30Index.change)} điểm
                        </span>
                        <span
                            className={`text-sm sm:text-base md:text-lg font-semibold ${getChangeColor(
                                vn30Index.changePercent
                            )}`}
                        >
                            ({vn30Index.changePercent > 0 ? '+' : ''}
                            {vn30Index.changePercent.toFixed(2)}%)
                        </span>
                    </div>
                </div>

                {/* Last Update */}
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 pt-2 sm:pt-3 border-t border-gray-100">
                    <svg
                        className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <span className="truncate">
                        Cập nhật: {new Date(timestamp).toLocaleString('vi-VN')}
                    </span>
                </div>
            </div>
        </div>
    );
}

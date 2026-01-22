'use client';

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

interface StockData {
    symbol: string;
    companyName?: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
}

interface MarketHeatmapProps {
    stocks: StockData[];
}

export function MarketHeatmap({ stocks }: MarketHeatmapProps) {
    const [topN, setTopN] = useState(10);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Transform stocks data for treemap
    const treemapData = useMemo(() => {
        if (!stocks) return [];
        return [...stocks]
            .sort((a, b) => b.volume - a.volume) // Ensure sorted by volume
            .slice(0, topN) // Take Top N
            .map((stock) => ({
                name: stock.symbol,
                value: stock.volume, // Size by volume
                changePercent: stock.changePercent,
                price: stock.price,
                companyName: stock.companyName
            }));
    }, [stocks, topN]);

    const getColor = (changePercent: number) => {
        if (changePercent > 6) return '#4338ca'; // indigo-700
        if (changePercent > 3) return '#4f46e5'; // indigo-600
        if (changePercent > 1) return '#6366f1'; // indigo-500
        if (changePercent > 0) return '#818cf8'; // indigo-400
        if (changePercent === 0) return '#f59e0b'; // amber-500
        if (changePercent > -1) return '#f87171'; // red-400
        if (changePercent > -3) return '#ef4444'; // red-500
        if (changePercent > -6) return '#dc2626'; // red-600
        return '#b91c1c'; // red-700
    };

    const CustomizedContent = (props: any) => {
        const { x, y, width, height, name, changePercent } = props;

        // Only show label if rect is big enough
        const showLabel = width > 40 && height > 30;
        const isSmall = width < 60;

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    rx={6}
                    ry={6}
                    width={width}
                    height={height}
                    style={{
                        fill: getColor(changePercent),
                        stroke: '#ffffff',
                        strokeWidth: 3,
                        strokeOpacity: 1
                    }}
                />
                {showLabel && (
                    <>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 - 6}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={isSmall ? 10 : 14}
                            fontWeight="900"
                            style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                        >
                            {name}
                        </text>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 + 8}
                            textAnchor="middle"
                            fill="rgba(255,255,255,0.95)"
                            fontSize={isSmall ? 8 : 11}
                            fontWeight="600"
                            style={{ pointerEvents: 'none' }}
                        >
                            {changePercent > 0 ? '+' : ''}
                            {changePercent}%
                        </text>
                    </>
                )}
            </g>
        );
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 z-50 min-w-[150px]">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="font-black text-gray-900 text-lg">{data.name}</div>
                            <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{data.companyName?.substring(0, 20)}...</div>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-xs font-bold ${data.changePercent >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                            {data.changePercent > 0 ? '+' : ''}{data.changePercent}%
                        </div>
                    </div>

                    <div className="space-y-1 bg-gray-50 p-2 rounded-lg">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Giá</span>
                            <span className="font-mono font-bold text-gray-900">{data.price.toLocaleString('vi-VN')}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Khối lượng</span>
                            <span className="font-mono font-medium text-gray-700">{data.value.toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!stocks || stocks.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    Market Heatmap
                </h3>
                <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Không có dữ liệu
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                        Top {topN} Khối Lượng
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* Top N Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors ${isDropdownOpen ? 'bg-gray-200' : ''}`}
                            >
                                Top {topN} <ChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl py-1 z-10 w-24 animate-in fade-in zoom-in-95 duration-100">
                                    {[10, 20, 30].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => {
                                                setTopN(n);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 ${topN === n ? 'font-bold text-indigo-600' : 'text-gray-600'}`}
                                        >
                                            Top {n}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Zoom Button */}
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="Toàn màn hình"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Modern Gradient Legend */}
                <div className="w-full">
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 px-1">
                        <span>Giảm</span>
                        <span>Tham chiếu</span>
                        <span>Tăng</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gradient-to-r from-red-600 via-amber-400 to-indigo-600 opacity-80" />
                </div>
            </div>

            <div className="flex-1 min-h-[300px] -mx-1">
                <ResponsiveContainer width="100%" height="100%" debounce={200}>
                    <Treemap
                        data={treemapData}
                        dataKey="value"
                        stroke="#fff"
                        fill="#6366f1"
                        content={<CustomizedContent />}
                        animationDuration={1000}
                        isAnimationActive={true}
                    >
                        <Tooltip content={<CustomTooltip />} />
                    </Treemap>
                </ResponsiveContainer>
            </div>

            {/* Fullscreen Portal */}
            {isFullscreen && typeof document !== 'undefined' && createPortal(
                <div className="fixed inset-0 z-[99999] bg-white flex flex-col p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">Bản đồ nhiệt thị trường</h2>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {[10, 20, 30, 50].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setTopN(n)}
                                        className={`px-3 py-1 rounded-md text-sm font-bold transition-all ${topN === n ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                                    >
                                        Top {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsFullscreen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <Minimize2 className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={treemapData}
                                dataKey="value"
                                stroke="#fff"
                                fill="#6366f1"
                                content={<CustomizedContent />}
                                animationDuration={1000}
                                isAnimationActive={true}
                            >
                                <Tooltip content={<CustomTooltip />} />
                            </Treemap>
                        </ResponsiveContainer>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

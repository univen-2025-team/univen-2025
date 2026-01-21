'use client';

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';

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
    // Transform stocks data for treemap
    const treemapData =
        stocks?.map((stock) => ({
            name: stock.symbol,
            value: stock.volume, // Size by volume
            changePercent: stock.changePercent,
            price: stock.price,
            companyName: stock.companyName
        })) || [];

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
                        Top 10 Khối Lượng
                    </h3>
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
        </div>
    );
}

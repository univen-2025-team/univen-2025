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
        if (changePercent > 3) return '#059669'; // green-600
        if (changePercent > 1) return '#10b981'; // green-500
        if (changePercent > 0) return '#34d399'; // green-400
        if (changePercent === 0) return '#fbbf24'; // yellow-400
        if (changePercent > -1) return '#f87171'; // red-400
        if (changePercent > -3) return '#ef4444'; // red-500
        return '#dc2626'; // red-600
    };

    const CustomizedContent = (props: any) => {
        const { x, y, width, height, name, changePercent } = props;

        // Only show label if rect is big enough
        const showLabel = width > 60 && height > 40;

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: getColor(changePercent),
                        stroke: '#fff',
                        strokeWidth: 2,
                        strokeOpacity: 1
                    }}
                />
                {showLabel && (
                    <>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 - 8}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={14}
                            fontWeight="bold"
                        >
                            {name}
                        </text>
                        <text
                            x={x + width / 2}
                            y={y + height / 2 + 10}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={12}
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
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                    <div className="font-bold text-gray-900">{data.name}</div>
                    {data.companyName && (
                        <div className="text-xs text-gray-600 mb-2">{data.companyName}</div>
                    )}
                    <div className="text-sm">
                        <div>Giá: {data.price.toLocaleString('vi-VN')} nghìn đồng</div>
                        <div
                            className={data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}
                        >
                            Thay đổi: {data.changePercent > 0 ? '+' : ''}
                            {data.changePercent}%
                        </div>
                        <div className="text-gray-600">
                            KL: {data.value.toLocaleString('vi-VN')}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    if (!stocks || stocks.length === 0) {
        return (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bản đồ nhiệt thị trường</h3>
                <div className="h-96 flex items-center justify-center text-gray-500">
                    Chưa có dữ liệu
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Bản đồ nhiệt thị trường</h3>
                <p className="text-sm text-gray-600 mb-3">
                    Kích thước: Khối lượng giao dịch | Màu sắc: % Thay đổi
                </p>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: '#059669' }}
                        ></div>
                        <span>&gt;3%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: '#10b981' }}
                        ></div>
                        <span>1-3%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: '#34d399' }}
                        ></div>
                        <span>0-1%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: '#fbbf24' }}
                        ></div>
                        <span>0%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: '#f87171' }}
                        ></div>
                        <span>0-(-1)%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: '#ef4444' }}
                        ></div>
                        <span>(-1)-(-3)%</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: '#dc2626' }}
                        ></div>
                        <span>&lt;-3%</span>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={500}>
                <Treemap
                    data={treemapData}
                    dataKey="value"
                    stroke="#fff"
                    fill="#8884d8"
                    content={<CustomizedContent />}
                >
                    <Tooltip content={<CustomTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
}

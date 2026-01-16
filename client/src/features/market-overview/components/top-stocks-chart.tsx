'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StockData {
    symbol: string;
    price: number;
}

interface TopStocksChartProps {
    stocks: StockData[];
    title?: string;
}

export function TopStocksChart({
    stocks,
    title = 'Top 10 cổ phiếu theo giá'
}: TopStocksChartProps) {
    const chartData =
        stocks?.slice(0, 10).map((stock) => ({
            symbol: stock.symbol,
            price: stock.price
        })) || [];

    if (chartData.length === 0) {
        return (
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    Chưa có dữ liệu
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symbol" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="price" fill="#10b981" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

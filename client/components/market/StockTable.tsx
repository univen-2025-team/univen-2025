'use client';

import { useRouter } from 'next/navigation';
import { StockData } from '@/lib/types/market';
import { MarketSortField, MarketSortOrder } from '@/lib/services/marketService';
import { formatNumber, formatPrice, getChangeColor } from './utils';

type StockTableProps = {
    stocks: StockData[];
    sortBy: MarketSortField;
    order: MarketSortOrder;
    onSortChange: (sortBy: MarketSortField) => void;
    onOrderChange: (order: MarketSortOrder) => void;
    onRefresh: () => void;
};

export default function StockTable({
    stocks,
    sortBy,
    order,
    onSortChange,
    onOrderChange,
    onRefresh
}: StockTableProps) {
    const router = useRouter();

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-3 sm:p-6">
            {/* Header - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                <h2 className="text-base sm:text-xl font-bold text-gray-900">
                    Danh sách cổ phiếu VN30
                </h2>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value as MarketSortField)}
                        className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
                    >
                        <option value="price">Giá</option>
                        <option value="change">Thay đổi</option>
                        <option value="changePercent">% Thay đổi</option>
                        <option value="volume">Khối lượng</option>
                    </select>
                    <select
                        value={order}
                        onChange={(e) => onOrderChange(e.target.value as MarketSortOrder)}
                        className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="desc">Giảm</option>
                        <option value="asc">Tăng</option>
                    </select>
                    <button
                        onClick={onRefresh}
                        className="bg-primary text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium"
                    >
                        <span className="hidden sm:inline">Làm mới</span>
                        <svg
                            className="w-4 h-4 sm:hidden"
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

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-2">
                {stocks.map((stock) => (
                    <div
                        key={stock.symbol}
                        onClick={() => router.push(`/market/${stock.symbol}`)}
                        className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-primary text-sm">{stock.symbol}</span>
                            <span
                                className={`font-semibold text-sm ${getChangeColor(stock.change)}`}
                            >
                                {formatPrice(stock.price)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <span className={`font-semibold ${getChangeColor(stock.change)}`}>
                                    {stock.change > 0 ? '+' : ''}
                                    {formatNumber(stock.change)}
                                </span>
                                <span
                                    className={`font-semibold ${getChangeColor(
                                        stock.changePercent
                                    )}`}
                                >
                                    ({stock.changePercent > 0 ? '+' : ''}
                                    {stock.changePercent}%)
                                </span>
                            </div>
                            <span className="text-gray-500">KL: {formatNumber(stock.volume)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                                Mã CK
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">
                                Giá
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">
                                Thay đổi
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900">
                                %
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden md:table-cell">
                                Khối lượng
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden lg:table-cell">
                                Cao
                            </th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-900 hidden lg:table-cell">
                                Thấp
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((stock) => (
                            <tr
                                key={stock.symbol}
                                onClick={() => router.push(`/market/${stock.symbol}`)}
                                className="border-b border-gray-100 hover:bg-primary/5 transition-colors cursor-pointer"
                            >
                                <td className="px-2 sm:px-4 py-2 sm:py-3">
                                    <span className="font-bold text-primary text-xs sm:text-sm hover:text-primary/90">
                                        {stock.symbol}
                                    </span>
                                </td>
                                <td
                                    className={`px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold ${getChangeColor(
                                        stock.change
                                    )}`}
                                >
                                    {formatPrice(stock.price)}
                                </td>
                                <td
                                    className={`px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold ${getChangeColor(
                                        stock.change
                                    )}`}
                                >
                                    {stock.change > 0 ? '+' : ''}
                                    {formatNumber(stock.change)}
                                </td>
                                <td
                                    className={`px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold ${getChangeColor(
                                        stock.changePercent
                                    )}`}
                                >
                                    {stock.changePercent > 0 ? '+' : ''}
                                    {stock.changePercent}%
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-gray-700 hidden md:table-cell">
                                    {formatNumber(stock.volume)}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-gray-700 hidden lg:table-cell">
                                    {formatPrice(stock.high)}
                                </td>
                                <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-gray-700 hidden lg:table-cell">
                                    {formatPrice(stock.low)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

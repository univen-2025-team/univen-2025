'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
        <div className="relative group/table">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/30 to-blue-500/30 rounded-3xl blur opacity-20 group-hover/table:opacity-30 transition duration-500"></div>
            <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 ring-1 ring-white/5 p-3 sm:p-6">
                {/* Header - Responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                    <h2 className="text-base sm:text-xl font-bold text-white">
                        Danh sách cổ phiếu VN30
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                        <select
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value as MarketSortField)}
                            className="bg-white/5 border border-white/10 text-white rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 flex-1 sm:flex-none transition-all"
                        >
                            <option value="price" className="bg-[#0F111A] text-white">
                                Giá
                            </option>
                            <option value="change" className="bg-[#0F111A] text-white">
                                Thay đổi
                            </option>
                            <option value="changePercent" className="bg-[#0F111A] text-white">
                                % Thay đổi
                            </option>
                            <option value="volume" className="bg-[#0F111A] text-white">
                                Khối lượng
                            </option>
                        </select>
                        <select
                            value={order}
                            onChange={(e) => onOrderChange(e.target.value as MarketSortOrder)}
                            className="bg-white/5 border border-white/10 text-white rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                        >
                            <option value="desc" className="bg-[#0F111A] text-white">
                                Giảm
                            </option>
                            <option value="asc" className="bg-[#0F111A] text-white">
                                Tăng
                            </option>
                        </select>
                        <button
                            onClick={onRefresh}
                            className="bg-violet-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:bg-violet-500 transition-colors text-xs sm:text-sm font-medium shadow-lg shadow-violet-500/20"
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
                        <Link
                            key={stock.symbol}
                            href={`/dashboard/market/${stock.symbol}`}
                            className="block bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-colors border border-white/5 hover:border-violet-500/30"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-violet-400 text-sm">
                                    {stock.symbol}
                                </span>
                                <span
                                    className={`font-semibold text-sm ${getChangeColor(stock.change)}`}
                                >
                                    {formatPrice(stock.price)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`font-semibold ${getChangeColor(stock.change)}`}
                                    >
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
                                <span className="text-slate-400">
                                    KL: {formatNumber(stock.volume)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-slate-300">
                                    Mã CK
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-300">
                                    Giá
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-300">
                                    Thay đổi
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-300">
                                    %
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-300 hidden md:table-cell">
                                    Khối lượng
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-300 hidden lg:table-cell">
                                    Cao
                                </th>
                                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-300 hidden lg:table-cell">
                                    Thấp
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.map((stock) => (
                                <tr
                                    key={stock.symbol}
                                    onClick={() => router.push(`/dashboard/market/${stock.symbol}`)}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                                        <Link
                                            href={`/dashboard/market/${stock.symbol}`}
                                            className="font-bold text-violet-400 text-xs sm:text-sm hover:text-violet-300 block w-full h-full"
                                            onClick={(e) => e.stopPropagation()} // Prevent double nav
                                        >
                                            {stock.symbol}
                                        </Link>
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
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-300 hidden md:table-cell">
                                        {formatNumber(stock.volume)}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-300 hidden lg:table-cell">
                                        {formatPrice(stock.high)}
                                    </td>
                                    <td className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm text-slate-300 hidden lg:table-cell">
                                        {formatPrice(stock.low)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

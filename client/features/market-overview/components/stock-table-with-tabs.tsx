'use client';

import { QuickTradeButton } from './quick-trade-button';
import { WatchlistButton } from './watchlist-button';

interface StockData {
    symbol: string;
    companyName?: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
    previousClose?: number;
}

interface StockTableWithTabsProps {
    stocks: StockData[];
    viewMode: 'all' | 'watchlist';
    watchlist: string[];
    searchTerm: string;
    onViewModeChange: (mode: 'all' | 'watchlist') => void;
    onStockClick: (stock: StockData) => void;
    onBuyClick: (stock: StockData) => void;
    isInWatchlist: (symbol: string) => boolean;
    toggleWatchlist: (symbol: string) => void;
}

export function StockTableWithTabs({
    stocks,
    viewMode,
    watchlist,
    searchTerm,
    onViewModeChange,
    onStockClick,
    onBuyClick,
    isInWatchlist,
    toggleWatchlist
}: StockTableWithTabsProps) {
    const formatNumber = (num: number) => num.toLocaleString('vi-VN');
    const formatPrice = (price: number) => formatNumber(price) + ' nghìn đồng';

    const getChangeColor = (value: number) => {
        if (value > 0) return 'text-green-600';
        if (value < 0) return 'text-red-600';
        return 'text-yellow-600';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex gap-2">
                    <button
                        onClick={() => onViewModeChange('all')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                            viewMode === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Tất cả ({stocks?.length || 0})
                    </button>
                    <button
                        onClick={() => onViewModeChange('watchlist')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                            viewMode === 'watchlist'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <span>Danh sách theo dõi</span>
                        {watchlist.length > 0 && (
                            <span className="bg-white text-yellow-600 px-2 py-0.5 rounded-full text-xs font-bold">
                                {watchlist.length}
                            </span>
                        )}
                    </button>
                </div>
                {searchTerm && (
                    <div className="text-sm text-gray-600">
                        Tìm thấy {stocks?.length || 0} kết quả
                    </div>
                )}
            </div>

            {/* Stock Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="px-2 py-3 text-center text-sm font-semibold text-gray-900"></th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Mã CK
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                Công ty
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                Giá
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                Thay đổi
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                % Thay đổi
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                Giá TC
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                Biên độ
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                Khối lượng
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks?.map((stock) => {
                            const dayRange =
                                stock.high && stock.low
                                    ? `${formatPrice(stock.low)} - ${formatPrice(stock.high)}`
                                    : '-';

                            return (
                                <tr
                                    key={stock.symbol}
                                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                                    onClick={() => onStockClick(stock)}
                                >
                                    <td
                                        className="px-2 py-3 text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <WatchlistButton
                                            symbol={stock.symbol}
                                            isInWatchlist={isInWatchlist(stock.symbol)}
                                            onToggle={() => toggleWatchlist(stock.symbol)}
                                            size="sm"
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-blue-600 hover:text-blue-800">
                                            {stock.symbol}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-left">
                                        <span
                                            className="text-sm text-gray-700 line-clamp-1"
                                            title={stock.companyName}
                                        >
                                            {stock.companyName || '-'}
                                        </span>
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right font-bold text-lg ${getChangeColor(
                                            stock.change
                                        )}`}
                                    >
                                        {formatPrice(stock.price)}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right font-semibold ${getChangeColor(
                                            stock.change
                                        )}`}
                                    >
                                        {stock.change > 0 ? '+' : ''}
                                        {formatNumber(stock.change)}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right font-semibold ${getChangeColor(
                                            stock.changePercent
                                        )}`}
                                    >
                                        {stock.changePercent > 0 ? '+' : ''}
                                        {stock.changePercent}%
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 text-sm">
                                        {stock.previousClose
                                            ? formatPrice(stock.previousClose)
                                            : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600 text-sm">
                                        {dayRange}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700">
                                        {formatNumber(stock.volume)}
                                    </td>
                                    <td
                                        className="px-4 py-3 text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <QuickTradeButton
                                            symbol={stock.symbol}
                                            price={stock.price}
                                            onClick={() => onBuyClick(stock)}
                                            variant="buy"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {(!stocks || stocks.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                        {viewMode === 'watchlist' && watchlist.length === 0
                            ? 'Chưa có cổ phiếu nào trong danh sách theo dõi'
                            : 'Không tìm thấy cổ phiếu nào phù hợp'}
                    </div>
                )}
            </div>
        </div>
    );
}

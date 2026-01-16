'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { QuickTradeButton } from './quick-trade-button';

interface StockData {
    symbol: string;
    companyName?: string;
    price: number;
    change: number;
    changePercent: number;
}

interface TopGainersLosersProps {
    gainers: StockData[];
    losers: StockData[];
    onStockClick: (stock: any) => void;
    onBuyClick: (stock: any) => void;
}

export function TopGainersLosers({
    gainers,
    losers,
    onStockClick,
    onBuyClick
}: TopGainersLosersProps) {
    const formatNumber = (num: number) => num.toLocaleString('vi-VN');
    const formatPrice = (price: number) => formatNumber(price);

    const renderStockList = (stocks: StockData[], isGainers: boolean) => (
        <div className="space-y-2">
            {stocks.slice(0, 5).map((stock, index) => (
                <div
                    key={stock.symbol}
                    onClick={() => onStockClick(stock)}
                    className={`flex items-center justify-between p-2 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isGainers
                            ? 'bg-gradient-to-r from-emerald-50 to-transparent hover:from-emerald-100 border border-emerald-100'
                            : 'bg-gradient-to-r from-red-50 to-transparent hover:from-red-100 border border-red-100'
                    }`}
                >
                    {/* Rank Badge */}
                    <div
                        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm mr-2 sm:mr-3 flex-shrink-0 ${
                            isGainers
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {index + 1}
                    </div>

                    {/* Stock Info */}
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-sm sm:text-base">
                            {stock.symbol}
                        </div>
                        {stock.companyName && (
                            <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[80px] sm:max-w-none">
                                {stock.companyName}
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="text-right mr-2 sm:mr-3 min-w-0">
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm">
                            {formatPrice(stock.price)}
                        </div>
                        <div
                            className={`text-xs sm:text-sm font-bold flex items-center justify-end gap-0.5 sm:gap-1 ${
                                isGainers ? 'text-emerald-600' : 'text-red-600'
                            }`}
                        >
                            {isGainers ? (
                                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            ) : (
                                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            )}
                            {stock.changePercent > 0 ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                        </div>
                    </div>

                    {/* Trade Button - Hide on very small screens */}
                    <div onClick={(e) => e.stopPropagation()} className="hidden xs:block">
                        <QuickTradeButton
                            symbol={stock.symbol}
                            price={stock.price}
                            onClick={() => onBuyClick(stock)}
                            size="sm"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Top Gainers */}
            <div className="bg-gradient-to-b from-emerald-50 to-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900">
                            Top tăng mạnh
                        </h3>
                        <p className="text-[10px] sm:text-sm text-gray-500 hidden sm:block">
                            5 cổ phiếu tăng giá nhiều nhất
                        </p>
                    </div>
                </div>
                {gainers && gainers.length > 0 ? (
                    renderStockList(gainers, true)
                ) : (
                    <div className="text-center py-6 sm:py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
                    </div>
                )}
            </div>

            {/* Top Losers */}
            <div className="bg-gradient-to-b from-red-50 to-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingDown className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900">
                            Top giảm mạnh
                        </h3>
                        <p className="text-[10px] sm:text-sm text-gray-500 hidden sm:block">
                            5 cổ phiếu giảm giá nhiều nhất
                        </p>
                    </div>
                </div>
                {losers && losers.length > 0 ? (
                    renderStockList(losers, false)
                ) : (
                    <div className="text-center py-6 sm:py-8">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">Chưa có dữ liệu</p>
                    </div>
                )}
            </div>
        </div>
    );
}

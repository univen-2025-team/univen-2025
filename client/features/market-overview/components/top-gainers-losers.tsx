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
    const formatPrice = (price: number) => formatNumber(price) + ' nghìn đồng';

    const renderStockList = (stocks: StockData[], isGainers: boolean) => (
        <div className="space-y-2">
            {stocks.slice(0, 5).map((stock, index) => (
                <div
                    key={stock.symbol}
                    onClick={() => onStockClick(stock)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        isGainers
                            ? 'bg-gradient-to-r from-emerald-50 to-transparent hover:from-emerald-100 border border-emerald-100'
                            : 'bg-gradient-to-r from-red-50 to-transparent hover:from-red-100 border border-red-100'
                    }`}
                >
                    {/* Rank Badge */}
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-3 ${
                            isGainers
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {index + 1}
                    </div>

                    {/* Stock Info */}
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900">{stock.symbol}</div>
                        {stock.companyName && (
                            <div className="text-xs text-gray-500 truncate">
                                {stock.companyName}
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="text-right mr-3">
                        <div className="font-semibold text-gray-900 text-sm">
                            {formatPrice(stock.price)}
                        </div>
                        <div
                            className={`text-sm font-bold flex items-center justify-end gap-1 ${
                                isGainers ? 'text-emerald-600' : 'text-red-600'
                            }`}
                        >
                            {isGainers ? (
                                <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                                <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            {stock.changePercent > 0 ? '+' : ''}
                            {stock.changePercent.toFixed(2)}%
                        </div>
                    </div>

                    {/* Trade Button */}
                    <div onClick={(e) => e.stopPropagation()}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Gainers */}
            <div className="bg-gradient-to-b from-emerald-50 to-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Top mã tăng mạnh</h3>
                        <p className="text-sm text-gray-500">5 cổ phiếu tăng giá nhiều nhất</p>
                    </div>
                </div>
                {gainers && gainers.length > 0 ? (
                    renderStockList(gainers, true)
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">Chưa có dữ liệu</p>
                    </div>
                )}
            </div>

            {/* Top Losers */}
            <div className="bg-gradient-to-b from-red-50 to-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Top mã giảm mạnh</h3>
                        <p className="text-sm text-gray-500">5 cổ phiếu giảm giá nhiều nhất</p>
                    </div>
                </div>
                {losers && losers.length > 0 ? (
                    renderStockList(losers, false)
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <TrendingDown className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">Chưa có dữ liệu</p>
                    </div>
                )}
            </div>
        </div>
    );
}

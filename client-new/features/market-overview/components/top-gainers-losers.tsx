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
    const formatPrice = (price: number) => formatNumber(price) + ' ₫';

    const renderStockList = (stocks: StockData[], isGainers: boolean) => (
        <div className="space-y-2">
            {stocks.slice(0, 5).map((stock) => (
                <div
                    key={stock.symbol}
                    onClick={() => onStockClick(stock)}
                    className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                >
                    <div className="flex-1">
                        <div className="font-bold text-gray-900">{stock.symbol}</div>
                        {stock.companyName && (
                            <div className="text-xs text-gray-600 truncate">
                                {stock.companyName}
                            </div>
                        )}
                    </div>
                    <div className="text-right mr-3">
                        <div className="font-semibold text-gray-900">
                            {formatPrice(stock.price)}
                        </div>
                        <div
                            className={`text-sm font-medium ${
                                isGainers ? 'text-green-600' : 'text-red-600'
                            }`}
                        >
                            {stock.changePercent > 0 ? '+' : ''}
                            {stock.changePercent}%
                        </div>
                    </div>
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
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-bold text-gray-900">Top 5 tăng mạnh</h3>
                </div>
                {gainers && gainers.length > 0 ? (
                    renderStockList(gainers, true)
                ) : (
                    <div className="text-center text-gray-500 py-4">Chưa có dữ liệu</div>
                )}
            </div>

            {/* Top Losers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                    <h3 className="text-lg font-bold text-gray-900">Top 5 giảm mạnh</h3>
                </div>
                {losers && losers.length > 0 ? (
                    renderStockList(losers, false)
                ) : (
                    <div className="text-center text-gray-500 py-4">Chưa có dữ liệu</div>
                )}
            </div>
        </div>
    );
}

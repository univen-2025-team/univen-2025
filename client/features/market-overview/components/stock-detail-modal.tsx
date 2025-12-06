'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, ShoppingCart, Building2 } from 'lucide-react';
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

interface StockDetailModalProps {
    stock: StockData | null;
    isOpen: boolean;
    onClose: () => void;
    onBuy?: (stock: StockData) => void;
    isInWatchlist?: boolean;
    onToggleWatchlist?: () => void;
}

export function StockDetailModal({
    stock,
    isOpen,
    onClose,
    onBuy,
    isInWatchlist = false,
    onToggleWatchlist
}: StockDetailModalProps) {
    if (!stock) return null;

    const isPositive = stock.change > 0;
    const isNegative = stock.change < 0;

    const formatNumber = (num: number) => num.toLocaleString('vi-VN');
    const formatPrice = (price: number) => formatNumber(price) + ' VND';

    const getChangeColor = () => {
        if (isPositive) return 'text-green-600 bg-green-50';
        if (isNegative) return 'text-red-600 bg-red-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    // Calculate the visual position of current price in the day's range
    const pricePosition =
        stock.high && stock.low && stock.high !== stock.low
            ? ((stock.price - stock.low) / (stock.high - stock.low)) * 100
            : 50;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="h-5 w-5 text-gray-600" />
                                <div className="text-2xl font-bold">{stock.symbol}</div>
                                {onToggleWatchlist && (
                                    <WatchlistButton
                                        symbol={stock.symbol}
                                        isInWatchlist={isInWatchlist}
                                        onToggle={onToggleWatchlist}
                                        size="default"
                                        variant="ghost"
                                    />
                                )}
                            </div>
                            {stock.companyName && (
                                <div className="text-base text-gray-600 font-normal">
                                    {stock.companyName}
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-gray-900">
                                {formatPrice(stock.price)}
                            </div>
                            <div
                                className={`flex items-center gap-2 justify-end mt-2 px-4 py-2 rounded-full ${getChangeColor()}`}
                            >
                                {isPositive && <TrendingUp className="h-5 w-5" />}
                                {isNegative && <TrendingDown className="h-5 w-5" />}
                                {!isPositive && !isNegative && <Minus className="h-5 w-5" />}
                                <span className="font-semibold text-lg">
                                    {stock.change > 0 ? '+' : ''}
                                    {formatNumber(stock.change)} VND
                                </span>
                                <span className="font-semibold text-lg">
                                    ({stock.changePercent > 0 ? '+' : ''}
                                    {stock.changePercent}%)
                                </span>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    {/* Day's Range Visualization */}
                    {stock.high && stock.low && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                                Biên độ giao dịch hôm nay
                            </h3>
                            <div className="relative">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span className="font-medium text-red-600">
                                        Thấp: {formatPrice(stock.low)}
                                    </span>
                                    <span className="font-medium text-green-600">
                                        Cao: {formatPrice(stock.high)}
                                    </span>
                                </div>
                                <div className="relative h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 h-full w-1 bg-blue-600 shadow-lg"
                                        style={{ left: `${pricePosition}%` }}
                                    >
                                        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                            {formatPrice(stock.price)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Price Information Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Giá mở cửa</div>
                            <div className="text-xl font-bold text-gray-900">
                                {formatPrice(stock.open)}
                            </div>
                        </div>

                        {stock.previousClose && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="text-sm text-gray-600 mb-1">Giá tham chiếu</div>
                                <div className="text-xl font-bold text-yellow-600">
                                    {formatPrice(stock.previousClose)}
                                </div>
                            </div>
                        )}

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Giá đóng cửa</div>
                            <div className="text-xl font-bold text-gray-900">
                                {formatPrice(stock.close)}
                            </div>
                        </div>

                        <div className="bg-white border border-green-50 border-green-200 rounded-lg p-4">
                            <div className="text-sm text-green-700 mb-1">Giá cao nhất</div>
                            <div className="text-xl font-bold text-green-600">
                                {formatPrice(stock.high)}
                            </div>
                        </div>

                        <div className="bg-white border border-red-50 border-red-200 rounded-lg p-4">
                            <div className="text-sm text-red-700 mb-1">Giá thấp nhất</div>
                            <div className="text-xl font-bold text-red-600">
                                {formatPrice(stock.low)}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Khối lượng</div>
                            <div className="text-xl font-bold text-purple-600">
                                {formatNumber(stock.volume)}
                            </div>
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="text-sm text-blue-700 mb-1">Thay đổi (VND)</div>
                            <div
                                className={`text-2xl font-bold ${
                                    isPositive
                                        ? 'text-green-600'
                                        : isNegative
                                        ? 'text-red-600'
                                        : 'text-yellow-600'
                                }`}
                            >
                                {stock.change > 0 ? '+' : ''}
                                {formatNumber(stock.change)} VND
                            </div>
                        </div>

                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                            <div className="text-sm text-indigo-700 mb-1">Thay đổi (%)</div>
                            <div
                                className={`text-2xl font-bold ${
                                    isPositive
                                        ? 'text-green-600'
                                        : isNegative
                                        ? 'text-red-600'
                                        : 'text-yellow-600'
                                }`}
                            >
                                {stock.changePercent > 0 ? '+' : ''}
                                {stock.changePercent}%
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <Button
                            onClick={() => {
                                onBuy?.(stock);
                                onClose();
                            }}
                            className="flex-1 gap-2 h-12 text-lg"
                            size="lg"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            Mua {stock.symbol}
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 h-12 text-lg"
                            size="lg"
                        >
                            Đóng
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

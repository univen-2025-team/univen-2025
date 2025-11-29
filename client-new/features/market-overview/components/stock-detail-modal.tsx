'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, ShoppingCart } from 'lucide-react';

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
}

interface StockDetailModalProps {
    stock: StockData | null;
    isOpen: boolean;
    onClose: () => void;
    onBuy?: (stock: StockData) => void;
}

export function StockDetailModal({ stock, isOpen, onClose, onBuy }: StockDetailModalProps) {
    if (!stock) return null;

    const isPositive = stock.change > 0;
    const isNegative = stock.change < 0;

    const formatNumber = (num: number) => num.toLocaleString('vi-VN');
    const formatPrice = (price: number) => formatNumber(price) + ' ₫';

    const getChangeColor = () => {
        if (isPositive) return 'text-green-600 bg-green-50';
        if (isNegative) return 'text-red-600 bg-red-50';
        return 'text-yellow-600 bg-yellow-50';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold">{stock.symbol}</div>
                            {stock.companyName && (
                                <div className="text-sm text-muted-foreground font-normal mt-1">
                                    {stock.companyName}
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold">{formatPrice(stock.price)}</div>
                            <div
                                className={`flex items-center gap-1 justify-end mt-1 px-3 py-1 rounded-full ${getChangeColor()}`}
                            >
                                {isPositive && <TrendingUp className="h-4 w-4" />}
                                {isNegative && <TrendingDown className="h-4 w-4" />}
                                {!isPositive && !isNegative && <Minus className="h-4 w-4" />}
                                <span className="font-semibold">
                                    {stock.change > 0 ? '+' : ''}
                                    {formatNumber(stock.change)}
                                </span>
                                <span className="font-semibold">
                                    ({stock.changePercent > 0 ? '+' : ''}
                                    {stock.changePercent}%)
                                </span>
                            </div>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Price Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm text-muted-foreground">Giá mở cửa</span>
                                <span className="font-semibold">{formatPrice(stock.open)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm text-muted-foreground">Giá cao nhất</span>
                                <span className="font-semibold text-green-600">
                                    {formatPrice(stock.high)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm text-muted-foreground">Giá thấp nhất</span>
                                <span className="font-semibold text-red-600">
                                    {formatPrice(stock.low)}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm text-muted-foreground">Giá đóng cửa</span>
                                <span className="font-semibold">{formatPrice(stock.close)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm text-muted-foreground">Khối lượng</span>
                                <span className="font-semibold">{formatNumber(stock.volume)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                <span className="text-sm text-muted-foreground">Thay đổi</span>
                                <span
                                    className={`font-semibold ${
                                        isPositive
                                            ? 'text-green-600'
                                            : isNegative
                                            ? 'text-red-600'
                                            : 'text-yellow-600'
                                    }`}
                                >
                                    {stock.change > 0 ? '+' : ''}
                                    {formatNumber(stock.change)} ₫
                                </span>
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
                            className="flex-1 gap-2"
                            size="lg"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Mua {stock.symbol}
                        </Button>
                        <Button onClick={onClose} variant="outline" className="flex-1" size="lg">
                            Đóng
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, ExternalLink } from 'lucide-react';
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

export function TopGainersLosers({ gainers, losers, onStockClick, onBuyClick }: TopGainersLosersProps) {
    const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');

    const displayedStocks = activeTab === 'gainers' ? gainers : losers;
    const formatNumber = (num: number) => num.toLocaleString('vi-VN');
    const formatPrice = (price: number) => formatNumber(price);

    const renderStockList = (stocks: StockData[], isGainers: boolean) => (
        <div className="space-y-2">
            {stocks.slice(0, 5).map((stock, index) => (
                <div
                    key={stock.symbol}
                    onClick={() => onStockClick && onStockClick(stock)}
                    className="group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                >
                    {/* Rank Badge */}
                    <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0 ${isGainers
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-red-50 text-red-600'
                            }`}
                    >
                        {index + 1}
                    </div>

                    {/* Stock Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{stock.symbol}</span>
                            {onBuyClick && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onBuyClick(stock);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-50 rounded text-blue-600 transition-all transform scale-90 hover:scale-100"
                                    title="Quick View"
                                >
                                    <TrendingUp className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        {stock.companyName && (
                            <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                {stock.companyName}
                            </div>
                        )}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm font-mono">
                            {formatPrice(stock.price)}
                        </div>
                        <div
                            className={`text-xs font-bold flex items-center justify-end gap-1 ${isGainers ? 'text-emerald-600' : 'text-red-600'
                                }`}
                        >
                            {isGainers ? (
                                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            ) : (
                                <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            )}
                            {(stock.changePercent ?? stock.change ?? 0) > 0 ? '+' : ''}
                            {(stock.changePercent ?? stock.change ?? 0).toFixed(2)}%
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                    {activeTab === 'gainers' ? (
                        <div className="p-1.5 bg-emerald-100 rounded text-emerald-600">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    ) : (
                        <div className="p-1.5 bg-red-100 rounded text-red-600">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                    )}
                    Top Biến Động
                </h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('gainers')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'gainers'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Tăng giá
                    </button>
                    <button
                        onClick={() => setActiveTab('losers')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'losers'
                            ? 'bg-white text-red-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Giảm giá
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {displayedStocks && displayedStocks.length > 0 ? (
                    renderStockList(displayedStocks, activeTab === 'gainers')
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                            <Activity className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium">Không có dữ liệu</p>
                    </div>
                )}
            </div>
        </div>
    );
}

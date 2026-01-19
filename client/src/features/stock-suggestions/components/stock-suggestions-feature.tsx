'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getStockData } from '@/lib/api/market-cache';
import { FeatureInstruction } from '@/features/types/features';

type StockSuggestionsFeatureProps = {
    symbols: string[];
    onStockClick?: (symbol: string) => void;
};

type StockCardData = {
    symbol: string;
    companyName: string;
    price: number;
    changePercent: number;
    isLoading: boolean;
    error?: boolean;
};

export function StockSuggestionsFeature({ symbols, onStockClick }: StockSuggestionsFeatureProps) {
    const [stocks, setStocks] = useState<StockCardData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStocks = async () => {
            setIsLoading(true);

            // Initialize với loading state
            const initialStocks: StockCardData[] = symbols.map((symbol) => ({
                symbol: symbol.toUpperCase(),
                companyName: `${symbol.toUpperCase()} Corporation`,
                price: 0,
                changePercent: 0,
                isLoading: true
            }));
            setStocks(initialStocks);

            // Fetch data cho từng mã
            const fetchPromises = symbols.map(async (symbol, index) => {
                try {
                    const symbolUpper = symbol.toUpperCase().trim();
                    const stockData = await getStockData(symbolUpper);

                    if (stockData) {
                        return {
                            symbol: stockData.symbol,
                            companyName: stockData.companyName || `${symbolUpper} Corporation`,
                            price: stockData.price,
                            changePercent: stockData.changePercent,
                            isLoading: false,
                            error: false
                        };
                    } else {
                        // Nếu không fetch được, dùng mock data
                        const mockPrice =
                            50000 + (symbolUpper.charCodeAt(0) + symbolUpper.charCodeAt(1)) * 1000;
                        const mockChangePercent = (Math.random() * 4 - 2).toFixed(2);

                        return {
                            symbol: symbolUpper,
                            companyName: getCompanyName(symbolUpper),
                            price: mockPrice + Math.floor(Math.random() * 20000),
                            changePercent: parseFloat(mockChangePercent),
                            isLoading: false,
                            error: true // Đánh dấu là mock data
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching ${symbol}:`, error);
                    // Fallback về mock data
                    const symbolUpper = symbol.toUpperCase().trim();
                    const mockPrice =
                        50000 + (symbolUpper.charCodeAt(0) + symbolUpper.charCodeAt(1)) * 1000;
                    const mockChangePercent = (Math.random() * 4 - 2).toFixed(2);

                    return {
                        symbol: symbolUpper,
                        companyName: getCompanyName(symbolUpper),
                        price: mockPrice + Math.floor(Math.random() * 20000),
                        changePercent: parseFloat(mockChangePercent),
                        isLoading: false,
                        error: true
                    };
                }
            });

            const results = await Promise.all(fetchPromises);
            setStocks(results);
            setIsLoading(false);
        };

        if (symbols.length > 0) {
            fetchStocks();
        }
    }, [symbols]);

    const handleStockClick = (symbol: string) => {
        if (onStockClick) {
            onStockClick(symbol);
        }
    };

    const getChangeIcon = (changePercent: number) => {
        if (changePercent > 0) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
        if (changePercent < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
        return <Minus className="h-4 w-4 text-yellow-400" />;
    };

    const getChangeColor = (changePercent: number) => {
        if (changePercent > 0) return 'text-emerald-400';
        if (changePercent < 0) return 'text-red-400';
        return 'text-yellow-400';
    };

    if (isLoading && stocks.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">
                        Đang tải danh sách cổ phiếu...
                    </span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card border border-border/50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Cổ phiếu được gợi ý</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stocks.map((stock) => (
                        <Card
                            key={stock.symbol}
                            className="cursor-pointer hover:shadow-md transition-shadow border border-border/50"
                            onClick={() => handleStockClick(stock.symbol)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2 gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-foreground mb-1">
                                            {stock.symbol}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                                            {stock.companyName}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {stock.isLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        ) : (
                                            getChangeIcon(stock.changePercent)
                                        )}
                                    </div>
                                </div>

                                {stock.isLoading ? (
                                    <div className="mt-2">
                                        <div className="h-4 bg-muted animate-pulse rounded w-20 mb-1" />
                                        <div className="h-3 bg-muted animate-pulse rounded w-16" />
                                    </div>
                                ) : (
                                    <div className="mt-2">
                                        <div className="text-xl font-semibold text-foreground">
                                            {stock.price.toLocaleString('vi-VN')} VNĐ
                                        </div>
                                        <div
                                            className={`text-sm font-medium ${getChangeColor(stock.changePercent)}`}
                                        >
                                            {stock.changePercent >= 0 ? '+' : ''}
                                            {stock.changePercent.toFixed(2)}%
                                        </div>
                                        {stock.error && (
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Dữ liệu mẫu
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// Helper function để lấy tên công ty
function getCompanyName(symbol: string): string {
    const companyNames: Record<string, string> = {
        VCB: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
        VNM: 'Công ty Cổ phần Sữa Việt Nam',
        VIC: 'Tập đoàn Vingroup',
        VRE: 'Công ty Cổ phần Vinhomes',
        TPB: 'Ngân hàng TMCP Tiên Phong',
        MWG: 'Công ty Cổ phần Đầu tư Thế Giới Di Động',
        FPT: 'Công ty Cổ phần FPT',
        HPG: 'Công ty Cổ phần Tập đoàn Hòa Phát',
        VHM: 'Công ty Cổ phần Vinhomes',
        MSN: 'Công ty Cổ phần Tập đoàn Ma San',
        BID: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
        CTG: 'Ngân hàng TMCP Công Thương Việt Nam',
        ACB: 'Ngân hàng TMCP Á Châu',
        MBB: 'Ngân hàng TMCP Quân đội',
        VPB: 'Ngân hàng TMCP Việt Nam Thịnh Vượng'
    };
    return companyNames[symbol] || `${symbol} Corporation`;
}

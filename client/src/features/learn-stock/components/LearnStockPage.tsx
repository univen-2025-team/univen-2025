'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CandlestickChart from '@/features/learn-stock/components/candlestick-chart';
import LessonsList from './lessons-list';
import StockPicker from './stock-picker';
import { mockLessons } from '@/lib/mock-data';
import { useLearnStockStore } from '@/features/learn-stock/stores/useLearnStockStore';
import { getStockData, CachedStockData } from '@/lib/api/market-cache';

export default function LearnStockPage() {
    const { selectedStock, setSelectedStock, isLoading, setIsLoading } = useLearnStockStore();
    const [stockData, setStockData] = useState<CachedStockData | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const selectedSymbol = selectedStock ?? '';

    // Fetch stock data when selected stock changes
    useEffect(() => {
        const fetchStockData = async () => {
            if (!selectedStock) return;
            
            setPriceLoading(true);
            try {
                const data = await getStockData(selectedStock);
                setStockData(data);
            } catch (error) {
                console.error('Error fetching stock data:', error);
                setStockData(null);
            } finally {
                setPriceLoading(false);
            }
        };

        fetchStockData();
    }, [selectedStock]);

    // Calculate percentage change: (price - previousClose) / previousClose * 100
    const calculateChangePercent = () => {
        if (!stockData || !stockData.previousClose) return 0;
        return ((stockData.price - stockData.previousClose) / stockData.previousClose) * 100;
    };

    const changePercent = calculateChangePercent();
    const isPositive = changePercent >= 0;

    // Format price with thousand separator
    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN');
    };

    const handleGenerateLessons = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
    };

    // Filter lessons for selected stock
    const stockLessons = mockLessons.filter((lesson) => lesson.symbol === selectedStock);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">Phân tích cổ phiếu</h1>
                <p className="text-muted-foreground text-lg">
                    Học trading thông qua sự kiện thị trường
                </p>
            </div>

            {/* Stock Picker Section */}
            <Card className="mb-8 p-6 bg-card border-border">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Select Stock Symbol
                        </label>
                        <StockPicker
                            value={selectedSymbol}
                            onChange={setSelectedStock}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        onClick={handleGenerateLessons}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {isLoading ? 'Đang tạo phân tích...' : 'Tạo phân tích'}
                    </Button>
                </div>
            </Card>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2">
                    <Card className="p-6 bg-card border-border h-full">
                        <h2 className="text-xl font-semibold text-foreground mb-4">
                            Price Movement Analysis
                        </h2>
                        <CandlestickChart symbol={selectedSymbol} />
                    </Card>
                </div>

                {/* Stats Section */}
                <div className="flex flex-col gap-4">
                    <Card className="p-6 bg-card border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Current Price
                        </h3>
                        <p className="text-3xl font-bold text-foreground">
                            {priceLoading ? '...' : stockData ? formatPrice(stockData.price) : '---'} VND
                        </p>
                        <p className={`text-sm mt-2 ${isPositive ? 'text-chart-up' : 'text-chart-down'}`}>
                            {priceLoading ? '...' : stockData ? `${isPositive ? '+' : ''}${changePercent.toFixed(2)}% today` : '---'}
                        </p>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Tổng số phân tích
                        </h3>
                        <p className="text-3xl font-bold text-foreground">{stockLessons.length}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Từ chuyển động giá
                        </p>
                    </Card>
                </div>
            </div>

            {/* Lessons Section */}
            <div className="mt-8">
                <Card className="p-6 bg-card border-border">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Phân tích theo ngày giao dịch
                    </h2>
                    <LessonsList lessons={stockLessons} />
                </Card>
            </div>
        </div>
    );
}
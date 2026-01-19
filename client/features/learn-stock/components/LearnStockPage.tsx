'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CandlestickChart from './candlestick-chart';
import LessonsList from './lessons-list';
import StockPicker from './stock-picker';
import PageHeader from '@/components/dashboard/PageHeader';
import { mockLessons } from '@/lib/mock-data';
import { useLearnStockStore } from '../stores/useLearnStockStore';
import { getStockData, CachedStockData } from '@/lib/api/market-cache';

export default function LearnStockPage() {
    const { selectedStock, setSelectedStock, isLoading, setIsLoading } = useLearnStockStore();
    const [stockData, setStockData] = useState<CachedStockData | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);

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
        <div className="container mx-auto px-4 py-4">
            {/* Header */}
            <div className="space-y-6">
                <PageHeader
                    title="Stock Learning Hub"
                    description="Learn trading through real market events and price movements"
                />
            </div>

            {/* Stock Picker Section */}
            <div className="relative group/picker mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/30 to-blue-500/30 rounded-3xl blur opacity-20 group-hover/picker:opacity-30 transition duration-500"></div>
                <Card className="relative p-6 bg-[#0F111A]/80 backdrop-blur-2xl border-white/10 ring-1 ring-white/5 shadow-2xl rounded-2xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-white mb-2">
                                Select Stock Symbol
                            </label>
                            <StockPicker
                                value={selectedStock}
                                onChange={setSelectedStock}
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={handleGenerateLessons}
                            disabled={isLoading}
                            className="bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/20 rounded-xl transition-all"
                        >
                            {isLoading ? 'Generating...' : 'Generate Lessons'}
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Chart Section */}
                <div className="lg:col-span-2 relative group/chart h-full">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/30 to-pink-500/30 rounded-3xl blur opacity-20 group-hover/chart:opacity-30 transition duration-500"></div>
                    <Card className="relative p-6 bg-[#0F111A]/80 backdrop-blur-2xl border-white/10 ring-1 ring-white/5 shadow-2xl rounded-2xl h-full">
                        <h2 className="text-xl font-semibold text-white mb-4">
                            Price Movement Analysis
                        </h2>
                        <CandlestickChart symbol={selectedStock} />
                    </Card>
                </div>

                {/* Stats Section */}
                <div className="flex flex-col gap-4">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <Card className="relative p-6 bg-[#0F111A]/80 backdrop-blur-2xl border-white/10 ring-1 ring-white/5 shadow-2xl rounded-2xl">
                            <h3 className="text-sm font-medium text-slate-400 mb-2">
                                Current Price
                            </h3>
                            <p className="text-3xl font-bold text-white drop-shadow-md">
                                {priceLoading
                                    ? '...'
                                    : stockData
                                      ? formatPrice(stockData.price)
                                      : '---'}{' '}
                                VND
                            </p>
                            <p
                                className={`text-sm mt-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}
                            >
                                {priceLoading
                                    ? '...'
                                    : stockData
                                      ? `${isPositive ? '+' : ''}${changePercent.toFixed(2)}% today`
                                      : '---'}
                            </p>
                        </Card>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <Card className="relative p-6 bg-[#0F111A]/80 backdrop-blur-2xl border-white/10 ring-1 ring-white/5 shadow-2xl rounded-2xl">
                            <h3 className="text-sm font-medium text-slate-400 mb-2">
                                Total Lessons
                            </h3>
                            <p className="text-3xl font-bold text-white drop-shadow-md">
                                {stockLessons.length}
                            </p>
                            <p className="text-sm text-slate-400 mt-2">From price movements</p>
                        </Card>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                        <Card className="relative p-6 bg-[#0F111A]/80 backdrop-blur-2xl border-white/10 ring-1 ring-white/5 shadow-2xl rounded-2xl">
                            <h3 className="text-sm font-medium text-slate-400 mb-2">
                                Difficulty Level
                            </h3>
                            <div className="flex gap-2 mt-3">
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                    Beginner
                                </span>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Lessons Section */}
            <div className="mt-8 relative group/lessons">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500/30 to-blue-500/30 rounded-3xl blur opacity-20 group-hover/lessons:opacity-30 transition duration-500"></div>
                <Card className="relative p-6 bg-[#0F111A]/80 backdrop-blur-2xl border-white/10 ring-1 ring-white/5 shadow-2xl rounded-2xl">
                    <h2 className="text-2xl font-semibold text-white mb-6">
                        Lessons by Trading Date
                    </h2>
                    <LessonsList lessons={stockLessons} />
                </Card>
            </div>
        </div>
    );
}

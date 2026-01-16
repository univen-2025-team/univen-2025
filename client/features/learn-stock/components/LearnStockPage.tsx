'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CandlestickChart from './candlestick-chart';
import LessonsList from './lessons-list';
import StockPicker from './stock-picker';
import { mockLessons } from '@/lib/mock-data';
import { useLearnStockStore } from '../stores/useLearnStockStore';

export default function LearnStockPage() {
    const { selectedStock, setSelectedStock, isLoading, setIsLoading } = useLearnStockStore();

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
                <h1 className="text-4xl font-bold text-foreground mb-2">Stock Learning Hub</h1>
                <p className="text-muted-foreground text-lg">
                    Learn trading through real market events and price movements
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
                            value={selectedStock}
                            onChange={setSelectedStock}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        onClick={handleGenerateLessons}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {isLoading ? 'Generating...' : 'Generate Lessons'}
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
                        <CandlestickChart symbol={selectedStock} />
                    </Card>
                </div>

                {/* Stats Section */}
                <div className="flex flex-col gap-4">
                    <Card className="p-6 bg-card border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Current Price
                        </h3>
                        <p className="text-3xl font-bold text-foreground">
                            {selectedStock === 'HPG' ? '30,200' : selectedStock === 'FPT' ? '141,200' : selectedStock === 'VNM' ? '66,500' : '42,300'} VND
                        </p>
                        <p className="text-sm text-chart-up mt-2">+2.34% today</p>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Total Lessons
                        </h3>
                        <p className="text-3xl font-bold text-foreground">{stockLessons.length}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            From price movements
                        </p>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Difficulty Level
                        </h3>
                        <div className="flex gap-2 mt-3">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                                Beginner
                            </span>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Lessons Section */}
            <div className="mt-8">
                <Card className="p-6 bg-card border-border">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Lessons by Trading Date
                    </h2>
                    <LessonsList lessons={stockLessons} />
                </Card>
            </div>
        </div>
    );
}

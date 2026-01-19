'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CandlestickChart from './candlestick-chart';
import LessonsList from './lessons-list';
import StockPicker from './stock-picker';
import PageHeader from '@/components/dashboard/PageHeader';
import { mockLessons } from '@/lib/mock-data';
import { useLearnStockStore } from '../stores/useLearnStockStore';
import { 
    getStockData, 
    CachedStockData, 
    generateStockLessons, 
    LearnProductLesson 
} from '@/lib/api/market-cache';
import type { Lesson } from '@/lib/types';

// Transform API lesson to UI lesson format
const transformLesson = (apiLesson: LearnProductLesson): Lesson => {
    const changePercent = apiLesson.priceChangePercent;
    let volatilityType: string;
    
    if (changePercent >= 5) volatilityType = 'strong_up';
    else if (changePercent <= -5) volatilityType = 'strong_down';
    else if (changePercent > 0) volatilityType = 'gap';
    else volatilityType = 'spike_volume';
    
    return {
        id: apiLesson._id,
        symbol: apiLesson.symbol,
        event_date: apiLesson.eventDate.split('T')[0],
        volatility_type: volatilityType,
        news_summary: apiLesson.newsSummary || '',
        lesson_title: apiLesson.lessonTitle,
        lesson_content: apiLesson.lessonContent,
        key_takeaways: apiLesson.keyTakeaways,
        difficulty_level: apiLesson.difficultyLevel,
        confidence_score: apiLesson.confidenceScore,
    };
};

export default function LearnStockPage() {
    const { selectedStock, setSelectedStock, isLoading, setIsLoading, setGeneratedLessons } = useLearnStockStore();
    const [stockData, setStockData] = useState<CachedStockData | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [generationStatus, setGenerationStatus] = useState<{
        generated: number;
        cached: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Default user age (can be fetched from user profile later)
    const userAge = 25;

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

    // Use changePercent from API directly, or calculate if previousClose is available
    const getChangePercent = () => {
        if (!stockData) return 0;
        // API already provides changePercent
        if (stockData.changePercent !== undefined) {
            return stockData.changePercent;
        }
        // Fallback: calculate from previousClose if available
        if (stockData.previousClose && stockData.previousClose > 0) {
            return ((stockData.price - stockData.previousClose) / stockData.previousClose) * 100;
        }
        return 0;
    };

    const changePercent = getChangePercent();
    const isPositive = changePercent >= 0;

    // Format price with thousand separator
    // API returns price in thousands (e.g., 27.6 = 27,600 VND), multiply by 1000
    const formatPrice = (price: number) => {
        return (price * 1000).toLocaleString('vi-VN');
    };

    const handleGenerateLessons = async () => {
        setIsLoading(true);
        setError(null);
        setGenerationStatus(null);
        
        try {
            // Call real API to generate lessons
            // threshold: 5% - detect price changes >= 5%
            // lookbackDays: 365 - analyze 1 year of history
            const result = await generateStockLessons(selectedStock, userAge, {
                threshold: 3,
                lookbackDays: 365,
                limit: 20
            });
            
            // Transform API lessons to UI format
            const transformedLessons = result.lessons.map(transformLesson);
            setLessons(transformedLessons);
            setGeneratedLessons(transformedLessons);
            
            setGenerationStatus({
                generated: result.generated,
                cached: result.cached
            });
            
            if (result.total === 0) {
                setError('Không tìm thấy sự kiện biến động giá đáng kể (>3%) trong 1 năm qua');
            }
        } catch (err) {
            console.error('Error generating lessons:', err);
            setError('Có lỗi xảy ra khi tạo bài học. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    // Use generated lessons from state
    const stockLessons = lessons.filter((lesson) => lesson.symbol === selectedStock);

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
                    
                    {/* Generation Status Badge */}
                    {generationStatus && (
                        <div className="flex gap-2 items-center">
                            {generationStatus.generated > 0 && (
                                <Badge variant="default" className="bg-green-600">
                                    +{generationStatus.generated} Generated
                                </Badge>
                            )}
                            {generationStatus.cached > 0 && (
                                <Badge variant="secondary">
                                    {generationStatus.cached} Cached
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                        {error}
                    </div>
                )}
            </Card>

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

                    <Card className="p-6 bg-card border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Total Lessons
                        </h3>
                        <p className="text-3xl font-bold text-foreground">{stockLessons.length}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            From price movements
                        </p>
                    </Card>
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

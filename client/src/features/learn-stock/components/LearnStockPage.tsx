'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import CandlestickChart from '@/components/market/charts/CandlestickChart';
import LessonsList from './lessons-list';
import StockPicker from './stock-picker';
import { useLearnStockStore } from '@/features/learn-stock/stores/useLearnStockStore';
import {
    getStockData,
    getStockLessons,
    generateStockLessons,
    type CachedStockData,
    type LearnProductResponse,
    type LearnProductLesson
} from '@/lib/api/market-cache';
import { fetchStockIntraday } from '@/lib/services/marketService';
import { mapLearnProductToLesson } from '@/features/learn-stock/utils/lesson-map';
import { aggregateIntradayToDaily } from '@/features/learn-stock/utils/chart-data';
import type { Lesson } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const DEFAULT_USER_AGE = 25;

export default function LearnStockPage() {
    const { selectedStock, setSelectedStock, isLoading, setIsLoading } = useLearnStockStore();
    const [stockData, setStockData] = useState<CachedStockData | null>(null);
    const [priceLoading, setPriceLoading] = useState(false);
    const [chartData, setChartData] = useState<{ time: string; open: number; high: number; low: number; close: number }[]>([]);
    const [chartLoading, setChartLoading] = useState(false);
    const [lessons, setLessons] = useState<LearnProductLesson[]>([]);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [lessonsMeta, setLessonsMeta] = useState<{
        total: number;
        generated: number;
        cached: number;
    } | null>(null);
    const [lessonsSource, setLessonsSource] = useState<'none' | 'fetch' | 'generate'>('none');
    const [generateError, setGenerateError] = useState<string | null>(null);

    const selectedSymbol = selectedStock ?? '';

    const formatPrice = useCallback((price: number) => price.toLocaleString('vi-VN'), []);

    const valueFormatter = useCallback((v: number) => formatPrice(v), [formatPrice]);

    // Fetch stock summary (price, etc.) when symbol changes
    useEffect(() => {
        if (!selectedStock) {
            setStockData(null);
            return;
        }
        setPriceLoading(true);
        getStockData(selectedStock)
            .then((data) => setStockData(data))
            .catch(() => setStockData(null))
            .finally(() => setPriceLoading(false));
    }, [selectedStock]);

    // Fetch existing lessons when symbol changes
    useEffect(() => {
        if (!selectedStock) {
            setLessons([]);
            setLessonsMeta(null);
            setLessonsSource('none');
            return;
        }
        setLessonsLoading(true);
        setGenerateError(null);
        getStockLessons(selectedStock)
            .then((list) => {
                setLessons(list);
                setLessonsMeta({ total: list.length, generated: 0, cached: 0 });
                setLessonsSource('fetch');
            })
            .catch(() => {
                setLessons([]);
                setLessonsMeta(null);
            })
            .finally(() => setLessonsLoading(false));
    }, [selectedStock]);

    // Fetch intraday → daily candles for chart when symbol changes
    useEffect(() => {
        if (!selectedStock) {
            setChartData([]);
            return;
        }
        setChartLoading(true);
        fetchStockIntraday({ symbol: selectedStock, filter: '1Y' })
            .then((res) => {
                if (res.success && res.data?.length) {
                    const daily = aggregateIntradayToDaily(res.data as any);
                    setChartData(daily);
                } else {
                    setChartData([]);
                }
            })
            .catch(() => setChartData([]))
            .finally(() => setChartLoading(false));
    }, [selectedStock]);

    const handleGenerateLessons = async () => {
        if (!selectedStock) return;
        setIsLoading(true);
        setGenerateError(null);
        try {
            const res: LearnProductResponse = await generateStockLessons(
                selectedStock,
                DEFAULT_USER_AGE,
                { lookbackDays: 365, limit: 10 }
            );
            setLessons(res.lessons);
            setLessonsMeta({
                total: res.total,
                generated: res.generated,
                cached: res.cached
            });
            setLessonsSource('generate');
        } catch (e) {
            setGenerateError(e instanceof Error ? e.message : 'Lỗi khi tạo phân tích');
        } finally {
            setIsLoading(false);
        }
    };

    // Tính % thay đổi giá: (giá hiện tại - giá đóng cửa hôm trước) / giá đóng cửa hôm trước * 100
    const changePercent = (() => {
        if (!stockData) return 0;
        // Nếu có previousClose và > 0, tính toán từ giá hiện tại
        if (stockData.previousClose && stockData.previousClose > 0) {
            return ((stockData.price - stockData.previousClose) / stockData.previousClose) * 100;
        }
        // Fallback: sử dụng changePercent từ API nếu có
        if (typeof stockData.changePercent === 'number') {
            return stockData.changePercent;
        }
        return 0;
    })();
    const isPositive = changePercent >= 0;

    const mappedLessons: Lesson[] = lessons.map((l) =>
        mapLearnProductToLesson(l, selectedSymbol)
    );

    const showGenerateEmpty =
        selectedStock &&
        lessons.length === 0 &&
        (lessonsSource === 'fetch' || lessonsSource === 'none') &&
        !lessonsLoading;
    const showNoEvents =
        selectedStock &&
        lessons.length === 0 &&
        lessonsSource === 'generate' &&
        !lessonsLoading;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                    Phân tích cổ phiếu
                </h1>
                <p className="text-muted-foreground text-lg">
                    Học trading thông qua sự kiện thị trường
                </p>
            </div>

            <Card className="mb-8 p-6 bg-card border-border">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Mã cổ phiếu
                        </label>
                        <StockPicker
                            value={selectedSymbol}
                            onChange={setSelectedStock}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        onClick={handleGenerateLessons}
                        disabled={isLoading || !selectedStock}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang tạo phân tích...
                            </>
                        ) : (
                            'Tạo phân tích'
                        )}
                    </Button>
                </div>
                {generateError && (
                    <p className="text-destructive text-sm mt-3">{generateError}</p>
                )}
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="p-6 bg-card border-border h-full min-h-[420px] flex flex-col">
                        <h2 className="text-xl font-semibold text-foreground mb-4">
                            Biểu đồ giá (1 năm)
                        </h2>
                        {!selectedStock ? (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                Chọn mã cổ phiếu để xem biểu đồ
                            </div>
                        ) : chartLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-muted-foreground min-h-[360px]">
                                Không có dữ liệu nến cho mã này
                            </div>
                        ) : (
                            <div className="h-[420px] w-full">
                                <CandlestickChart
                                    data={chartData}
                                    valueFormatter={valueFormatter}
                                    selectedRange="1Y"
                                />
                            </div>
                        )}
                    </Card>
                </div>

                <div className="flex flex-col gap-4">
                    <Card className="p-6 bg-card border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Giá hiện tại
                        </h3>
                        <p className="text-3xl font-bold text-foreground">
                            {priceLoading
                                ? '...'
                                : stockData
                                  ? `${formatPrice(stockData.price)} VND`
                                  : '---'}
                        </p>
                        <p
                            className={`text-sm mt-2 ${isPositive ? 'text-chart-up' : 'text-chart-down'}`}
                        >
                            {priceLoading
                                ? '...'
                                : stockData
                                  ? `${isPositive ? '+' : ''}${changePercent.toFixed(2)}%`
                                  : '---'}
                        </p>
                    </Card>

                    <Card className="p-6 bg-card border-border">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Tổng phân tích
                        </h3>
                        <p className="text-3xl font-bold text-foreground">
                            {lessonsLoading ? '...' : lessonsMeta?.total ?? 0}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                            {lessonsMeta &&
                            (lessonsMeta.generated > 0 || lessonsMeta.cached > 0)
                                ? `Mới tạo: ${lessonsMeta.generated} · Đã lưu: ${lessonsMeta.cached}`
                                : 'Từ chuyển động giá'}
                        </p>
                    </Card>
                </div>
            </div>

            <div className="mt-8">
                <Card className="p-6 bg-card border-border">
                    <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Phân tích theo ngày giao dịch
                    </h2>
                    {lessonsLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : showGenerateEmpty ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-lg mb-2">Chưa có phân tích cho mã này.</p>
                            <p className="text-sm">
                                Bấm <strong>Tạo phân tích</strong> để tạo bài học từ biến động giá.
                            </p>
                        </div>
                    ) : showNoEvents ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-lg">
                                Không tìm thấy sự kiện bất thường nào trong 1 năm.
                            </p>
                            <p className="text-sm mt-1">
                                Thử mã khác hoặc điều chỉnh ngưỡng phân tích.
                            </p>
                        </div>
                    ) : (
                        <LessonsList lessons={mappedLessons} />
                    )}
                </Card>
            </div>
        </div>
    );
}

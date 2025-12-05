'use client';

<<<<<<< HEAD
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { useToast } from '@/components/toast/toast-provider';
import { useWatchlist } from '@/lib/hooks/useWatchlist';
import { useMarketSocket } from '@/lib/hooks/useMarketSocket';

// Components
import { MarketHeader } from '@/features/market-overview/components/market-header';
import { MarketStats } from '@/features/market-overview/components/market-stats';
import { VN30IndexCard } from '@/features/market-overview/components/vn30-index-card';
import { VN30TrendChart } from '@/features/market-overview/components/vn30-trend-chart';
import { TopStocksChart } from '@/features/market-overview/components/top-stocks-chart';
import { TopGainersLosers } from '@/features/market-overview/components/top-gainers-losers';
import { StockTableWithTabs } from '@/features/market-overview/components/stock-table-with-tabs';
import { MarketHeatmap } from '@/features/market-overview/components/market-heatmap';
import { StockDetailModal } from '@/features/market-overview/components/stock-detail-modal';
import { BuyStockFeature } from '@/features/buy-stock/components/buy-stock-feature';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface StockData {
    symbol: string;
    companyName?: string;
    price: number;
    prices?: Array<{
        time: string;
        price: number;
        volume: number;
    }>;
=======
import { useMarketSocket } from '@/lib/hooks/useMarketSocket';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PageHeader from '@/components/dashboard/PageHeader';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface StockData {
    symbol: string;
    price: number;
>>>>>>> f255a1a0 (rename: client-new => client)
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
<<<<<<< HEAD
    previousClose?: number;
=======
>>>>>>> f255a1a0 (rename: client-new => client)
}

interface VN30Index {
    index: number;
    change: number;
    changePercent: number;
}

interface MarketData {
    vn30Index: VN30Index;
    stocks: StockData[];
    topGainers: StockData[];
    topLosers: StockData[];
<<<<<<< HEAD
=======
    total: number;
    timestamp: string;
>>>>>>> f255a1a0 (rename: client-new => client)
}

interface IndexHistoryPoint {
    time: string;
    index: number;
}

export default function MarketPage() {
    const router = useRouter();
<<<<<<< HEAD
    const { showToast } = useToast();
    const { watchlist, toggleWatchlist, isInWatchlist } = useWatchlist();

    // States
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [indexHistory, setIndexHistory] = useState<IndexHistoryPoint[]>([]);
    const [realtimeEnabled, setRealtimeEnabled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [buyStock, setBuyStock] = useState<StockData | null>(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'watchlist'>('all');
    const [historyRange, setHistoryRange] = useState('10M');
    const [topStocksByPrice, setTopStocksByPrice] = useState<StockData[]>([]);

    // Socket connection
=======
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'price' | 'change' | 'changePercent' | 'volume'>('price');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [indexHistory, setIndexHistory] = useState<IndexHistoryPoint[]>([]);
    const [realtimeEnabled, setRealtimeEnabled] = useState(false);

    // Socket connection for real-time updates
>>>>>>> f255a1a0 (rename: client-new => client)
    const {
        isConnected,
        marketData: socketMarketData,
        subscribeToMarket,
        unsubscribeFromMarket
    } = useMarketSocket();

<<<<<<< HEAD
    // Fetch history data
    const fetchHistory = async (range: string) => {
        try {
            setHistoryRange(range);

            // Map range to limit (days)
            let limit = 300; // Default to full day minutes
            let type = 'intraday'; // Always use intraday as requested

            switch (range) {
                case '10M':
                    limit = 10;
                    break;
                case '30M':
                    limit = 30;
                    break;
                case '1H':
                    limit = 60;
                    break;
                case '3H':
                    limit = 180;
                    break;
                case '6H':
                    limit = 360;
                    break;
                case '1D':
                    limit = 300;
                    break;
                case '1W':
                    limit = 300; // Show latest day for now
                    break;
                case '1M':
                    limit = 300;
                    break;
                case '3M':
                    limit = 300;
                    break;
                case '6M':
                    limit = 300;
                    break;
                case '1Y':
                    limit = 300;
                    break;
                default:
                    limit = 300;
            }

            // Use the updated API function with type parameter
            // We need to update the call here. Since we imported getVN30History from api/market-cache,
            // we should use that if possible, or use axios directly with the new param.
            // The previous code used axios directly. Let's update it to use the new param.

            const response = await axios.get(`/market/history/vn30?limit=${limit}&type=${type}`);
            if (response.data?.metadata?.history) {
                setIndexHistory(response.data.metadata.history);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
            showToast('error', 'Không thể tải dữ liệu lịch sử', 3000);
        }
    };

    // Fetch market data
    const fetchMarketData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/market');

            console.log('🔍 API Response:', response);
            console.log('🔍 Response Data:', response.data);

            if (response.data?.metadata) {
                const { metadata } = response.data;

                // Combine topGainers and topLosers to create stocks array
                const allStocks = [...(metadata.topGainers || []), ...(metadata.topLosers || [])];

                const marketDataFormatted = {
                    vn30Index: metadata.vn30Index,
                    stocks: allStocks,
                    topGainers: metadata.topGainers || [],
                    topLosers: metadata.topLosers || []
                };

                console.log('✅ Setting marketData:', marketDataFormatted);
                setMarketData(marketDataFormatted);

                // Set top stocks by price from latest trading day
                if (metadata.topStocksByPrice && Array.isArray(metadata.topStocksByPrice)) {
                    setTopStocksByPrice(metadata.topStocksByPrice);
                }

                // Note: indexHistory is set by fetchHistory() which handles the selected range
                // Don't override it here to avoid race conditions

                setError(null);
            } else {
                console.warn('⚠️ No metadata in response');
            }
        } catch (err: any) {
            console.error('❌ Error fetching market data:', err);
            setError(err.message || 'Không thể tải dữ liệu thị trường');
            showToast('error', 'Không thể tải dữ liệu thị trường', 3000);
=======
    const fetchMarketData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/market?sortBy=${sortBy}&order=${order}`);
            const result = await response.json();

            if (result.success) {
                setMarketData(result.data);
                setError(null);

                // Update index history for the chart (keep last 20 points)
                const now = new Date();
                const timeStr = now.toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                setIndexHistory((prev) => {
                    const newHistory = [
                        ...prev,
                        { time: timeStr, index: result.data.vn30Index.index }
                    ];
                    return newHistory.slice(-20); // Keep only last 20 data points
                });
            } else {
                setError(result.error || 'Failed to fetch market data');
            }
        } catch (err) {
            setError('Network error: Unable to fetch market data');
            console.error('Error fetching market data:', err);
>>>>>>> f255a1a0 (rename: client-new => client)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
<<<<<<< HEAD
        fetchHistory(historyRange);
    }, []);

    // Real-time updates
    useEffect(() => {
        if (realtimeEnabled && isConnected) {
=======
        // Auto-refresh every 30 seconds (only when realtime is disabled)
        if (!realtimeEnabled) {
            const interval = setInterval(fetchMarketData, 30000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, order, realtimeEnabled]);

    // Handle real-time updates from socket
    useEffect(() => {
        if (realtimeEnabled && socketMarketData) {
            setMarketData({
                ...socketMarketData,
                total: socketMarketData.stocks.length
            });
            setError(null);

            // Update index history for the chart
            const now = new Date();
            const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            setIndexHistory((prev) => {
                const newHistory = [
                    ...prev,
                    { time: timeStr, index: socketMarketData.vn30Index.index }
                ];
                return newHistory.slice(-20);
            });
        }
    }, [socketMarketData, realtimeEnabled]);

    // Subscribe/unsubscribe to real-time updates
    useEffect(() => {
        if (realtimeEnabled) {
>>>>>>> f255a1a0 (rename: client-new => client)
            subscribeToMarket();
        } else {
            unsubscribeFromMarket();
        }
<<<<<<< HEAD

        return () => {
            unsubscribeFromMarket();
        };
    }, [realtimeEnabled, isConnected]);

    useEffect(() => {
        if (socketMarketData && realtimeEnabled) {
            setMarketData(socketMarketData);

            if (socketMarketData.vn30Index) {
                setIndexHistory((prev) => {
                    // Format time to match historical data: "YYYY-MM-DD HH:MM:SS"
                    const now = new Date();
                    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                        2,
                        '0'
                    )}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
                        2,
                        '0'
                    )}:${String(now.getMinutes()).padStart(2, '0')}:${String(
                        now.getSeconds()
                    ).padStart(2, '0')}`;

                    const newPoint = {
                        time: timeStr,
                        index: socketMarketData.vn30Index.index
                    };

                    // Check if this time already exists (avoid duplicates)
                    const existingIndex = prev.findIndex(
                        (p) => p.time.substring(0, 16) === timeStr.substring(0, 16)
                    );
                    if (existingIndex >= 0) {
                        // Update existing point
                        const updated = [...prev];
                        updated[existingIndex] = newPoint;
                        return updated;
                    }

                    // Append new point without slicing to preserve historical data
                    return [...prev, newPoint];
                });
            }
        }
    }, [socketMarketData, realtimeEnabled]);

    // Filter stocks
    const filteredStocks = useMemo(() => {
        if (!marketData) return [];

        let stocks = marketData.stocks;

        if (viewMode === 'watchlist') {
            stocks = stocks.filter((stock) => watchlist.includes(stock.symbol));
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            stocks = stocks.filter(
                (stock) =>
                    stock.symbol.toLowerCase().includes(search) ||
                    stock.companyName?.toLowerCase().includes(search)
            );
        }

        return stocks;
    }, [marketData, searchTerm, viewMode, watchlist]);

    // Market statistics
    const marketStats = useMemo(() => {
        console.log('📊 Computing marketStats from:', marketData);

        if (!marketData?.stocks || marketData.stocks.length === 0) {
            console.warn('⚠️ No stocks data available');
            return {
                totalStocks: 0,
                advancing: 0,
                declining: 0,
                unchanged: 0,
                totalVolume: 0,
                avgChange: 0
            };
        }

        const advancing = marketData.stocks.filter((s) => s.change > 0).length;
        const declining = marketData.stocks.filter((s) => s.change < 0).length;
        const unchanged = marketData.stocks.filter((s) => s.change === 0).length;
        const totalVolume = marketData.stocks.reduce((sum, s) => sum + s.volume, 0);
        const avgChange =
            marketData.stocks.reduce((sum, s) => sum + s.changePercent, 0) /
            marketData.stocks.length;

        const stats = {
            totalStocks: marketData.stocks.length,
            advancing,
            declining,
            unchanged,
            totalVolume,
            avgChange: Number(avgChange.toFixed(2))
        };

        console.log('📊 Computed stats:', stats);
        return stats;
    }, [marketData]);

    // Handlers
    const handleStockClick = (stock: StockData) => {
        setSelectedStock(stock);
        setIsDetailModalOpen(true);
    };

    const handleBuyClick = (stock: StockData) => {
        setBuyStock(stock);
        setIsBuyModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
=======
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [realtimeEnabled]);

    const formatNumber = (num: number): string => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const formatPrice = (price: number): string => {
        return formatNumber(price) + ' ₫';
    };

    const getChangeColor = (change: number): string => {
        if (change > 0) return 'text-success';
        if (change < 0) return 'text-error';
        return 'text-warning';
    };

    const getChangeBgColor = (change: number): string => {
        if (change > 0) return 'bg-success-light border-success';
        if (change < 0) return 'bg-error-light border-error';
        return 'bg-warning-light border-warning';
    };

    if (loading && !marketData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
>>>>>>> f255a1a0 (rename: client-new => client)
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu thị trường...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
<<<<<<< HEAD
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchMarketData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // If no market data after loading and no error, show a different message
    if (!marketData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Không có dữ liệu thị trường</p>
                    <button
                        onClick={fetchMarketData}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Tải lại
                    </button>
=======
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-error-light border border-error text-error px-4 py-3 rounded relative max-w-md">
                        <strong className="font-bold">Lỗi!</strong>
                        <span className="block sm:inline"> {error}</span>
                        <button
                            onClick={fetchMarketData}
                            className="mt-4 bg-error text-white px-4 py-2 rounded hover:bg-error"
                        >
                            Thử lại
                        </button>
                    </div>
>>>>>>> f255a1a0 (rename: client-new => client)
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
<<<<<<< HEAD
            <MarketHeader />

            {/* Market Stats */}
            <MarketStats {...marketStats} />

            {/* VN30 Index Card */}
            <VN30IndexCard
                {...marketData.vn30Index}
                isConnected={isConnected}
                realtimeEnabled={realtimeEnabled}
                onToggleRealtime={() => setRealtimeEnabled(!realtimeEnabled)}
                lastUpdate={new Date().toLocaleTimeString('vi-VN')}
            />

            {/* VN30 Trend Chart - Full Width */}
            <VN30TrendChart
                data={indexHistory}
                onRangeChange={fetchHistory}
                selectedRange={historyRange}
            />

            {/* Top Stocks Chart - uses data from latest trading day */}
            <TopStocksChart
                stocks={topStocksByPrice.length > 0 ? topStocksByPrice : marketData.stocks}
            />

            {/* Market Heatmap */}
            <MarketHeatmap stocks={marketData.stocks} />

            {/* Top Gainers & Losers */}
            <TopGainersLosers
                gainers={marketData.topGainers}
                losers={marketData.topLosers}
                onStockClick={handleStockClick}
                onBuyClick={handleBuyClick}
            />

            {/* Stock Table */}
            <StockTableWithTabs
                stocks={filteredStocks}
                viewMode={viewMode}
                watchlist={watchlist}
                searchTerm={searchTerm}
                onViewModeChange={setViewMode}
                onStockClick={handleStockClick}
                onBuyClick={handleBuyClick}
                isInWatchlist={isInWatchlist}
                toggleWatchlist={toggleWatchlist}
            />

            {/* Stock Detail Modal */}
            <StockDetailModal
                stock={selectedStock}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onBuy={(stock) => {
                    setIsDetailModalOpen(false);
                    handleBuyClick(stock);
                }}
                isInWatchlist={selectedStock ? isInWatchlist(selectedStock.symbol) : false}
                onToggleWatchlist={
                    selectedStock ? () => toggleWatchlist(selectedStock.symbol) : undefined
                }
            />

            {/* Buy Stock Modal */}
            {buyStock && (
                <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <BuyStockFeature
                            data={{
                                symbol: buyStock.symbol,
                                currentPrice: buyStock.price,
                                currentStepIndex: 0,
                                steps: [
                                    {
                                        id: 'step-1',
                                        title: 'Nhập số lượng cổ phiếu',
                                        description: 'Nhập số lượng cổ phiếu bạn muốn mua',
                                        fields: [
                                            {
                                                name: 'quantity',
                                                type: 'number',
                                                label: 'Số lượng',
                                                placeholder: 'Nhập số lượng...'
                                            }
                                        ]
                                    },
                                    {
                                        id: 'step-2',
                                        title: 'Chọn loại lệnh',
                                        description: 'Chọn loại lệnh và thêm ghi chú',
                                        fields: [
                                            {
                                                name: 'orderType',
                                                type: 'select',
                                                label: 'Loại lệnh',
                                                options: ['Market Order', 'Limit Order']
                                            },
                                            {
                                                name: 'notes',
                                                type: 'text',
                                                label: 'Ghi chú (tùy chọn)',
                                                placeholder: 'Thêm ghi chú...'
                                            }
                                        ]
                                    },
                                    {
                                        id: 'step-3',
                                        title: 'Xác nhận giao dịch',
                                        description: 'Kiểm tra lại thông tin trước khi đặt lệnh',
                                        fields: []
                                    }
                                ]
                            }}
                            onBack={() => setIsBuyModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
=======
            <PageHeader
                title="Thị trường VN30"
                description="Theo dõi 30 mã cổ phiếu vốn hóa lớn nhất thị trường Việt Nam"
            />

            {/* VN30 Index Card */}
            {marketData && (
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <p className="text-gray-600 text-sm font-medium">Chỉ số VN30</p>
                                {isConnected && realtimeEnabled && (
                                    <span className="flex items-center text-xs text-success bg-success-light px-2 py-1 rounded-full">
                                        <span className="w-2 h-2 bg-success rounded-full mr-1 animate-pulse"></span>
                                        Trực tiếp
                                    </span>
                                )}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                {formatNumber(marketData.vn30Index.index)}
                            </h2>
                        </div>
                        <div className="text-right">
                            <p
                                className={`text-2xl font-bold ${getChangeColor(
                                    marketData.vn30Index.change
                                )}`}
                            >
                                {marketData.vn30Index.change > 0 ? '+' : ''}
                                {formatNumber(marketData.vn30Index.change)}
                            </p>
                            <p
                                className={`text-lg font-semibold ${getChangeColor(
                                    marketData.vn30Index.changePercent
                                )}`}
                            >
                                {marketData.vn30Index.changePercent > 0 ? '+' : ''}
                                {marketData.vn30Index.changePercent}%
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-gray-500 text-xs">
                            Cập nhật lần cuối:{' '}
                            {new Date(marketData.timestamp).toLocaleString('vi-VN')}
                        </p>
                        <button
                            onClick={() => setRealtimeEnabled(!realtimeEnabled)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${realtimeEnabled
                                ? 'bg-success text-white hover:bg-success'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            {realtimeEnabled ? 'Đang cập nhật' : 'Cập nhật trực tiếp'}
                        </button>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            {marketData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* VN30 Index Trend Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg
                                className="w-6 h-6 text-primary mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                />
                            </svg>
                            Biểu đồ VN30 Index
                        </h2>
                        <div className="h-64">
                            {indexHistory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={indexHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="time"
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="index"
                                            stroke="#0E1A3C"
                                            strokeWidth={2}
                                            dot={{ fill: '#0E1A3C', r: 3 }}
                                            activeDot={{ r: 5 }}
                                            name="VN30"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p>Đang thu thập dữ liệu...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Stocks Performance Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg
                                className="w-6 h-6 text-accent mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            Top 10 cổ phiếu
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={marketData.stocks.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="symbol"
                                        stroke="#6b7280"
                                        style={{ fontSize: '11px' }}
                                    />
                                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        formatter={(value: number) => [formatPrice(value), 'Giá']}
                                    />
                                    <Bar
                                        dataKey="price"
                                        fill="#0E1A3C"
                                        radius={[8, 8, 0, 0]}
                                        name="Giá"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            {marketData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* VN30 Index Trend Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg
                                className="w-6 h-6 text-primary mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                />
                            </svg>
                            Biểu đồ VN30 Index
                        </h2>
                        <div className="h-64">
                            {indexHistory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={indexHistory}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="time"
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                            domain={['auto', 'auto']}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#fff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="index"
                                            stroke="#0E1A3C"
                                            strokeWidth={2}
                                            dot={{ fill: '#0E1A3C', r: 3 }}
                                            activeDot={{ r: 5 }}
                                            name="VN30"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <p>Đang thu thập dữ liệu...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Stocks Performance Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg
                                className="w-6 h-6 text-accent mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                            Top 10 cổ phiếu
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={marketData.stocks.slice(0, 10)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="symbol"
                                        stroke="#6b7280"
                                        style={{ fontSize: '11px' }}
                                    />
                                    <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                        formatter={(value: number) => [formatPrice(value), 'Giá']}
                                    />
                                    <Bar
                                        dataKey="price"
                                        fill="#0E1A3C"
                                        radius={[8, 8, 0, 0]}
                                        name="Giá"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* Top Gainers and Losers */}
            {marketData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Gainers */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg
                                className="w-6 h-6 text-success mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                />
                            </svg>
                            Top mã tăng mạnh
                        </h2>
                        <div className="space-y-3">
                            {marketData.topGainers.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    onClick={() => router.push(`/market/${stock.symbol}`)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getChangeBgColor(
                                        stock.change
                                    )}`}
                                >
                                    <div>
                                        <p className="font-bold text-gray-900">{stock.symbol}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatPrice(stock.price)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-success">
                                            +{formatNumber(stock.change)}
                                        </p>
                                        <p className="text-sm font-semibold text-success">
                                            +{stock.changePercent}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Losers */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <svg
                                className="w-6 h-6 text-error mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                />
                            </svg>
                            Top mã giảm mạnh
                        </h2>
                        <div className="space-y-3">
                            {marketData.topLosers.map((stock) => (
                                <div
                                    key={stock.symbol}
                                    onClick={() => router.push(`/market/${stock.symbol}`)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getChangeBgColor(
                                        stock.change
                                    )}`}
                                >
                                    <div>
                                        <p className="font-bold text-gray-900">{stock.symbol}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatPrice(stock.price)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-error">
                                            {formatNumber(stock.change)}
                                        </p>
                                        <p className="text-sm font-semibold text-error">
                                            {stock.changePercent}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sorting Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Danh sách cổ phiếu VN30</h2>
                    <div className="flex items-center gap-2 ml-auto">
                        <label className="text-sm font-medium text-gray-700">Sắp xếp theo:</label>
                        <select
                            value={sortBy}
                            onChange={(e) =>
                                setSortBy(
                                    e.target.value as
                                    | 'price'
                                    | 'change'
                                    | 'changePercent'
                                    | 'volume'
                                )
                            }
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="price">Giá</option>
                            <option value="change">Thay đổi</option>
                            <option value="changePercent">% Thay đổi</option>
                            <option value="volume">Khối lượng</option>
                        </select>
                        <select
                            value={order}
                            onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="desc">Giảm dần</option>
                            <option value="asc">Tăng dần</option>
                        </select>
                        <button
                            onClick={fetchMarketData}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* Stock Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Mã CK
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                    Giá
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                    Thay đổi
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                    % Thay đổi
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                    Khối lượng
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                    Cao
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                    Thấp
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {marketData?.stocks.map((stock) => (
                                <tr
                                    key={stock.symbol}
                                    onClick={() => router.push(`/market/${stock.symbol}`)}
                                    className="border-b border-gray-100 hover:bg-primary/5 transition-colors cursor-pointer"
                                >
                                    <td className="px-4 py-3">
                                        <span className="font-bold text-primary hover:text-primary/90">
                                            {stock.symbol}
                                        </span>
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right font-semibold ${getChangeColor(
                                            stock.change
                                        )}`}
                                    >
                                        {formatPrice(stock.price)}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right font-semibold ${getChangeColor(
                                            stock.change
                                        )}`}
                                    >
                                        {stock.change > 0 ? '+' : ''}
                                        {formatNumber(stock.change)}
                                    </td>
                                    <td
                                        className={`px-4 py-3 text-right font-semibold ${getChangeColor(
                                            stock.changePercent
                                        )}`}
                                    >
                                        {stock.changePercent > 0 ? '+' : ''}
                                        {stock.changePercent}%
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700">
                                        {formatNumber(stock.volume)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700">
                                        {formatPrice(stock.high)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-700">
                                        {formatPrice(stock.low)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
>>>>>>> f255a1a0 (rename: client-new => client)
        </div>
    );
}

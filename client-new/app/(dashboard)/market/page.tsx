'use client';

import { useMarketSocket } from '@/lib/hooks/useMarketSocket';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
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
import { StockSearch } from '@/features/market-overview/components/stock-search';
import { QuickTradeButton } from '@/features/market-overview/components/quick-trade-button';
import { StockDetailModal } from '@/features/market-overview/components/stock-detail-modal';
import { NewsFeature } from '@/features/news/components/news-feature';
import { BuyStockFeature } from '@/features/buy-stock/components/buy-stock-feature';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import axios from '@/lib/axios';
import { useToast } from '@/components/toast/toast-provider';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Clock } from 'lucide-react';

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
    total: number;
    timestamp: string;
}

interface IndexHistoryPoint {
    time: string;
    index: number;
}

export default function MarketPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const [marketData, setMarketData] = useState<MarketData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'price' | 'change' | 'changePercent' | 'volume'>('price');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [indexHistory, setIndexHistory] = useState<IndexHistoryPoint[]>([]);
    const [realtimeEnabled, setRealtimeEnabled] = useState(false);

    // New states for search, modal, and buy feature
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [buyStock, setBuyStock] = useState<StockData | null>(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

    // Socket connection for real-time updates
    const {
        isConnected,
        marketData: socketMarketData,
        subscribeToMarket,
        unsubscribeFromMarket
    } = useMarketSocket();

    const fetchMarketData = async () => {
        try {
            setLoading(true);

            // Call Node.js backend directly using axios
            const response = await axios.get(`/market?sortBy=${sortBy}&order=${order}`);
            const result = response.data;

            // Handle Node.js backend response format: { statusCode, message, metadata }
            if (result.statusCode === 200 && result.metadata) {
                // Fetch all stocks for complete data
                const stocksResponse = await axios.get(
                    `/market/stocks?date=${result.metadata.date}`
                );
                const stocksResult = stocksResponse.data;

                const allStocks =
                    stocksResult.statusCode === 200 && stocksResult.metadata?.stocks
                        ? stocksResult.metadata.stocks
                        : [];

                const marketDataResponse = {
                    vn30Index: result.metadata.vn30Index,
                    stocks: allStocks,
                    topGainers: result.metadata.topGainers || [],
                    topLosers: result.metadata.topLosers || [],
                    total: result.metadata.totalStocks || allStocks.length,
                    timestamp: result.metadata.timestamp || new Date().toISOString()
                };

                setMarketData(marketDataResponse);
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
                        { time: timeStr, index: result.metadata.vn30Index.index }
                    ];
                    return newHistory.slice(-20); // Keep only last 20 data points
                });
            } else {
                setError(result.message || 'Failed to fetch market data');
            }
        } catch (err: any) {
            const errorMsg =
                err.response?.data?.message || err.message || 'Không thể kết nối đến server';
            setError(errorMsg);
            console.error('Error fetching market data:', err);

            // Show toast notification instead of alert
            showToast('error', errorMsg, 7000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
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
            subscribeToMarket();
        } else {
            unsubscribeFromMarket();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [realtimeEnabled]);

    // Filter stocks based on search
    const filteredStocks = useMemo(() => {
        if (!marketData?.stocks) return [];
        if (!searchTerm.trim()) return marketData.stocks;

        const term = searchTerm.toLowerCase();
        return marketData.stocks.filter(
            (stock) =>
                stock.symbol.toLowerCase().includes(term) ||
                (stock.companyName && stock.companyName.toLowerCase().includes(term))
        );
    }, [marketData, searchTerm]);

    // Calculate market statistics
    const marketStats = useMemo(() => {
        if (!marketData) return null;

        const advancing = marketData.stocks.filter((s) => s.change > 0).length;
        const declining = marketData.stocks.filter((s) => s.change < 0).length;
        const unchanged = marketData.stocks.filter((s) => s.change === 0).length;
        const totalVolume = marketData.stocks.reduce((sum, s) => sum + s.volume, 0);
        const avgChange =
            marketData.stocks.reduce((sum, s) => sum + s.changePercent, 0) /
            marketData.stocks.length;

        return { advancing, declining, unchanged, totalVolume, avgChange };
    }, [marketData]);

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

    const handleStockClick = (stock: StockData) => {
        setSelectedStock(stock);
        setIsDetailModalOpen(true);
    };

    const handleBuyClick = (stock: StockData) => {
        setBuyStock(stock);
        setIsBuyModalOpen(true);
    };

    if (loading && !marketData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu thị trường...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
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
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header with Search */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 md:p-8 text-white">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Thị trường VN30</h1>
                        <p className="text-blue-100 text-lg">
                            Theo dõi 30 mã cổ phiếu vốn hóa lớn nhất thị trường Việt Nam
                        </p>
                    </div>
                    <div className="w-full lg:w-96">
                        <StockSearch
                            stocks={marketData?.stocks || []}
                            onSelect={handleStockClick}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Market Statistics Cards */}
            {marketStats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-4 w-4 text-blue-600" />
                            <p className="text-xs text-gray-600 font-medium">Tổng số mã</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{marketData?.total}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <p className="text-xs text-gray-600 font-medium">Tăng giá</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{marketStats.advancing}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="h-4 w-4 text-red-600" />
                            <p className="text-xs text-gray-600 font-medium">Giảm giá</p>
                        </div>
                        <p className="text-2xl font-bold text-red-600">{marketStats.declining}</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="h-4 w-4 text-yellow-600" />
                            <p className="text-xs text-gray-600 font-medium">Đứng giá</p>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                            {marketStats.unchanged}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            <p className="text-xs text-gray-600 font-medium">Tổng KL (tr)</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                            {formatNumber(Math.round(marketStats.totalVolume / 1000000))}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-indigo-500">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-indigo-600" />
                            <p className="text-xs text-gray-600 font-medium">% TB</p>
                        </div>
                        <p
                            className={`text-2xl font-bold ${getChangeColor(
                                marketStats.avgChange
                            )}`}
                        >
                            {marketStats.avgChange > 0 ? '+' : ''}
                            {marketStats.avgChange.toFixed(2)}%
                        </p>
                    </div>
                </div>
            )}

            {/* VN30 Index Card */}
            {marketData && (
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
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
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                                {formatNumber(marketData.vn30Index.index)}
                            </h2>
                        </div>
                        <div className="flex items-center gap-4">
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
                            <button
                                onClick={() => setRealtimeEnabled(!realtimeEnabled)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                                    realtimeEnabled
                                        ? 'bg-green-600 text-white hover:bg-green-700'
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
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-gray-500">
                            Cập nhật lần cuối:{' '}
                            {new Date(marketData.timestamp).toLocaleString('vi-VN')}
                        </p>
                        <button
                            onClick={fetchMarketData}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Làm mới dữ liệu
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

            {/* News Section - Only show if there's news data available */}
            {/* TODO: Integrate with real news API when available */}

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
                                    onClick={() => handleStockClick(stock)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getChangeBgColor(
                                        stock.change
                                    )}`}
                                >
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{stock.symbol}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatPrice(stock.price)}
                                        </p>
                                    </div>
                                    <div className="text-right mr-2">
                                        <p className="font-bold text-green-600">
                                            +{formatNumber(stock.change)}
                                        </p>
                                        <p className="text-sm font-semibold text-success">
                                            +{stock.changePercent}%
                                        </p>
                                    </div>
                                    <QuickTradeButton
                                        symbol={stock.symbol}
                                        price={stock.price}
                                        onClick={() => handleBuyClick(stock)}
                                        variant="buy"
                                    />
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
                                    onClick={() => handleStockClick(stock)}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getChangeBgColor(
                                        stock.change
                                    )}`}
                                >
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{stock.symbol}</p>
                                        <p className="text-sm text-gray-600">
                                            {formatPrice(stock.price)}
                                        </p>
                                    </div>
                                    <div className="text-right mr-2">
                                        <p className="font-bold text-red-600">
                                            {formatNumber(stock.change)}
                                        </p>
                                        <p className="text-sm font-semibold text-error">
                                            {stock.changePercent}%
                                        </p>
                                    </div>
                                    <QuickTradeButton
                                        symbol={stock.symbol}
                                        price={stock.price}
                                        onClick={() => handleBuyClick(stock)}
                                        variant="buy"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Table with Sorting */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        Danh sách cổ phiếu VN30
                        {searchTerm && (
                            <span className="text-base font-normal text-gray-600 ml-2">
                                ({filteredStocks.length} kết quả)
                            </span>
                        )}
                    </h2>
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
                    </div>
                </div>

                {/* Stock Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Mã CK
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                                    Công ty
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
                                    Giá TC
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                    Biên độ
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                    Khối lượng
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.map((stock) => {
                                const dayRange =
                                    stock.high && stock.low
                                        ? `${formatPrice(stock.low)} - ${formatPrice(stock.high)}`
                                        : '-';
                                const priceChange = stock.previousClose
                                    ? ((stock.price - stock.previousClose) / stock.previousClose) *
                                      100
                                    : stock.changePercent;

                                return (
                                    <tr
                                        key={stock.symbol}
                                        className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                                        onClick={() => handleStockClick(stock)}
                                    >
                                        <td className="px-4 py-3">
                                            <div>
                                                <span className="font-bold text-blue-600 hover:text-blue-800 block">
                                                    {stock.symbol}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-left">
                                            <span
                                                className="text-sm text-gray-700 line-clamp-1"
                                                title={stock.companyName}
                                            >
                                                {stock.companyName || '-'}
                                            </span>
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-bold text-lg ${getChangeColor(
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
                                        <td className="px-4 py-3 text-right text-gray-600 text-sm">
                                            {stock.previousClose
                                                ? formatPrice(stock.previousClose)
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600 text-sm">
                                            {dayRange}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-700">
                                            {formatNumber(stock.volume)}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-center"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <QuickTradeButton
                                                symbol={stock.symbol}
                                                price={stock.price}
                                                onClick={() => handleBuyClick(stock)}
                                                variant="buy"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {filteredStocks.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Không tìm thấy cổ phiếu nào phù hợp
                        </div>
                    )}
                </div>
            </div>

            {/* Stock Detail Modal */}
            <StockDetailModal
                stock={selectedStock}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                onBuy={(stock) => {
                    setIsDetailModalOpen(false);
                    handleBuyClick(stock);
                }}
            />

            {/* Buy Stock Modal */}
            {buyStock && (
                <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
        </div>
    );
}

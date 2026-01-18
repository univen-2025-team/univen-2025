'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { useToast } from '@/components/toast/toast-provider';
import { useWatchlist } from '@/lib/hooks/useWatchlist';
import { useMarketSocket } from '@/lib/hooks/useMarketSocket';
import { useDragSelect } from '@/lib/hooks/useDragSelect';

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
}

interface IndexHistoryPoint {
    time: string;
    index: number;
}

export default function MarketPage() {
    const router = useRouter();
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
    const {
        isConnected,
        marketData: socketMarketData,
        subscribeToMarket,
        unsubscribeFromMarket
    } = useMarketSocket();

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
    const fetchMarketData = async (showFullScreenLoader = true) => {
        try {
            if (showFullScreenLoader) {
                setLoading(true);
            }
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
        } finally {
            if (showFullScreenLoader) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchMarketData(true);
        fetchHistory(historyRange);
    }, []);

    // Real-time updates
    useEffect(() => {
        if (realtimeEnabled && isConnected) {
            subscribeToMarket();
        } else {
            unsubscribeFromMarket();
        }

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

        const advancing = marketData.stocks.filter((s) => (s.change ?? 0) > 0).length;
        const declining = marketData.stocks.filter((s) => (s.change ?? 0) < 0).length;
        const unchanged = marketData.stocks.filter((s) => (s.change ?? 0) === 0).length;
        const totalVolume = marketData.stocks.reduce((sum, s) => sum + (s.volume ?? 0), 0);
        const avgChange =
            marketData.stocks.reduce((sum, s) => sum + (s.changePercent ?? 0), 0) /
            (marketData.stocks.length || 1);

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
    const handleRowClick = (stock: StockData) => {
        router.push(`/dashboard/market/${stock.symbol}`);
    };

    const handleQuickView = (stock: StockData) => {
        setSelectedStock(stock);
        setIsDetailModalOpen(true);
    };

    const handleTransactionStart = (stock: StockData) => {
        setBuyStock(stock);
        setIsBuyModalOpen(true);
    };

    // Drag Select Integration
    const containerRef = useRef<HTMLDivElement>(null);
    const lastFetchTimeRef = useRef<number>(0);

    const handleEdgeHover = useCallback((edge: 'top' | 'bottom' | 'left' | 'right') => {
        const now = Date.now();
        // Throttle fetches to once every 2 seconds
        if (now - lastFetchTimeRef.current < 2000) return;

        if (['bottom', 'right', 'left', 'top'].includes(edge)) {
            lastFetchTimeRef.current = now;
            showToast('info', `Đang tải thêm dữ liệu (${edge})...`, 2000);
            fetchMarketData(false);
        }
    }, []); // Empty deps as fetchMarketData and showToast are stable or imported

    const { isSelecting, selectionBox } = useDragSelect({
        containerRef,
        onEdgeHover: handleEdgeHover,
        onSelectionComplete: (box) => {
            // "chiều ngang giữa 2 điểm start, end là vùng cần phân tích"
            const startX = box.x;
            const endX = box.x + box.width;

            console.log(`Selection Complete: Horizontal Range ${startX} - ${endX}`);

            // Logic to identify data within this range would go here.
            // For now, we confirm the action to the user.
            showToast('success', `Đã chọn vùng phân tích: ${Math.round(startX)}px - ${Math.round(endX)}px`, 3000);
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu thị trường...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => fetchMarketData(true)}
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
                        onClick={() => fetchMarketData(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Tải lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 relative min-h-[calc(100vh-100px)]" ref={containerRef}>
            {/* Selection Overlay */}
            {isSelecting && selectionBox && (
                <div
                    className="absolute border-2 border-primary bg-primary/20 pointer-events-none z-50 rounded-sm"
                    style={{
                        left: selectionBox.x,
                        top: selectionBox.y,
                        width: selectionBox.width,
                        height: selectionBox.height
                    }}
                />
            )}

            {/* Header */}
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
                onStockClick={handleRowClick}
                onBuyClick={handleQuickView}
            />

            {/* Stock Table */}
            <StockTableWithTabs
                stocks={filteredStocks}
                viewMode={viewMode}
                watchlist={watchlist}
                searchTerm={searchTerm}
                onViewModeChange={setViewMode}
                onStockClick={handleRowClick}
                onBuyClick={handleQuickView}
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
                    handleTransactionStart(stock);
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
        </div>
    );
}

'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { useToast } from '@/components/toast/toast-provider';
import { useWatchlist } from '@/lib/hooks/useWatchlist';
import { useMarketSocket } from '@/lib/hooks/useMarketSocket';
import { useDragSelect } from '@/lib/hooks/useDragSelect';

// Components
import { MarketDashboardV2 } from '@/features/market-overview/components/market-dashboard-v2';
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
    const [viewMode, setViewMode] = useState<'all' | 'watchlist' | 'news'>('all');
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

            let limit = 300;
            let type = 'intraday';

            switch (range) {
                case '10M': limit = 10; break;
                case '30M': limit = 30; break;
                case '1H': limit = 60; break;
                // ... map others or keep default
                default: limit = 300;
            }

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

            if (response.data?.metadata) {
                const { metadata } = response.data;

                // Combine topGainers and topLosers to create stocks array if stocks is empty/partial
                // But usually metadata.stocks has full list from history. 
                // Since we implemented All Stocks Sync, let's trust metadata.stocks if available
                let allStocks = metadata.stocks || [];

                if (allStocks.length === 0) {
                    allStocks = [...(metadata.topGainers || []), ...(metadata.topLosers || [])];
                }

                const marketDataFormatted = {
                    vn30Index: metadata.vn30Index,
                    stocks: allStocks,
                    topGainers: metadata.topGainers || [],
                    topLosers: metadata.topLosers || []
                };

                setMarketData(marketDataFormatted);

                if (metadata.topStocksByPrice && Array.isArray(metadata.topStocksByPrice)) {
                    setTopStocksByPrice(metadata.topStocksByPrice);
                }
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
        return () => { unsubscribeFromMarket(); };
    }, [realtimeEnabled, isConnected]);

    useEffect(() => {
        if (socketMarketData && realtimeEnabled) {
            setMarketData(prev => {
                if (!prev) return socketMarketData;
                return {
                    ...prev,
                    vn30Index: socketMarketData.vn30Index || prev.vn30Index,
                    stocks: socketMarketData.stocks?.length > 0 ? socketMarketData.stocks : prev.stocks,
                    topGainers: socketMarketData.topGainers?.length > 0 ? socketMarketData.topGainers : prev.topGainers,
                    topLosers: socketMarketData.topLosers?.length > 0 ? socketMarketData.topLosers : prev.topLosers,
                };
            });

            if (socketMarketData.vn30Index) {
                setIndexHistory((prev) => {
                    // ... basic append logic (simplified for brevity or copy full logic if needed)
                    // Copy full logic to be safe
                    const now = new Date();
                    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                    const newPoint = { time: timeStr, index: socketMarketData.vn30Index.index };
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
            stocks = stocks.filter((stock) =>
                stock.symbol.toLowerCase().includes(search) || stock.companyName?.toLowerCase().includes(search)
            );
        }
        return stocks;
    }, [marketData, searchTerm, viewMode, watchlist]);

    // Market statistics
    const marketStats = useMemo(() => {
        if (!marketData?.stocks || marketData.stocks.length === 0) {
            return { totalStocks: 0, advancing: 0, declining: 0, unchanged: 0, totalVolume: 0, avgChange: 0 };
        }

        const advancing = marketData.stocks.filter((s) => (s.change ?? 0) > 0).length;
        const declining = marketData.stocks.filter((s) => (s.change ?? 0) < 0).length;
        const unchanged = marketData.stocks.filter((s) => (s.change ?? 0) === 0).length;
        const totalVolume = marketData.stocks.reduce((sum, s) => sum + (s.volume ?? 0), 0);
        const avgChange =
            marketData.stocks.reduce((sum, s) => sum + (s.changePercent ?? 0), 0) /
            (marketData.stocks.length || 1);

        return {
            totalStocks: marketData.stocks.length,
            advancing,
            declining,
            unchanged,
            totalVolume,
            avgChange: Number(avgChange.toFixed(2))
        };
    }, [marketData]);

    const handleRowClick = (stock: StockData) => router.push(`/dashboard/market/${stock.symbol}`);
    const handleQuickView = (stock: StockData) => { setSelectedStock(stock); setIsDetailModalOpen(true); };
    const handleTransactionStart = (stock: StockData) => { setBuyStock(stock); setIsBuyModalOpen(true); };

    // --- RENDER ---

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-muted/10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground font-medium">Đang tải dữ liệu thị trường...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-muted/10">
                <div className="text-center">
                    <p className="text-destructive mb-4 font-medium">{error}</p>
                    <button onClick={() => fetchMarketData(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium shadow-sm transition-colors">Thử lại</button>
                </div>
            </div>
        );
    }

    if (!marketData) {
        return (
            <div className="flex items-center justify-center h-screen bg-muted/10">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4 font-medium">Không có dữ liệu thị trường</p>
                    <button onClick={() => fetchMarketData(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-medium shadow-sm transition-colors">Làm mới</button>
                </div>
            </div>
        );
    }

    return (
        <>
            <MarketDashboardV2
                marketData={marketData}
                marketStats={marketStats}
                indexHistory={indexHistory}
                isConnected={isConnected}
                realtimeEnabled={realtimeEnabled}
                onToggleRealtime={() => setRealtimeEnabled(!realtimeEnabled)}
                historyRange={historyRange}
                onHistoryRangeChange={fetchHistory}
                onStockClick={handleRowClick}
                onQuickView={handleQuickView}
                watchlist={watchlist}
                isInWatchlist={isInWatchlist}
                toggleWatchlist={toggleWatchlist}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                filteredStocks={filteredStocks}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            {/* Buy Stock Modal */}
            {buyStock && (
                <Dialog open={isBuyModalOpen} onOpenChange={setIsBuyModalOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground">
                        <BuyStockFeature
                            data={{
                                symbol: buyStock.symbol,
                                currentPrice: buyStock.price,
                                currentStepIndex: 0,
                                steps: [
                                    {
                                        id: 'step-1',
                                        title: 'Khối lượng',
                                        description: 'Nhập khối lượng',
                                        fields: [{ name: 'quantity', type: 'number', label: 'Khối lượng', placeholder: '100...' }]
                                    },
                                    {
                                        id: 'step-2',
                                        title: 'Lệnh',
                                        description: 'Chọn loại lệnh',
                                        fields: [
                                            { name: 'orderType', type: 'select', label: 'Loại', options: ['Lệnh thị trường (MP)', 'Lệnh giới hạn (LO)'] },
                                            { name: 'notes', type: 'text', label: 'Ghi chú', placeholder: 'Tùy chọn...' }
                                        ]
                                    },
                                    { id: 'step-3', title: 'Xác nhận', description: 'Xem lại lệnh', fields: [] }
                                ]
                            }}
                            onBack={() => setIsBuyModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}

'use client';

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

    // Socket connection
    const {
        isConnected,
        marketData: socketMarketData,
        subscribeToMarket,
        unsubscribeFromMarket
    } = useMarketSocket();

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
                setError(null);
            } else {
                console.warn('⚠️ No metadata in response');
            }
        } catch (err: any) {
            console.error('❌ Error fetching market data:', err);
            setError(err.message || 'Không thể tải dữ liệu thị trường');
            showToast('error', 'Không thể tải dữ liệu thị trường', 3000);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
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
                    const newPoint = {
                        time: new Date().toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        index: socketMarketData.vn30Index.index
                    };
                    return [...prev.slice(-29), newPoint];
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
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <MarketHeader />

            {/* Market Stats */}
            <MarketStats {...marketStats} />

            {/* VN30 Index + Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VN30IndexCard
                    {...marketData.vn30Index}
                    isConnected={isConnected}
                    realtimeEnabled={realtimeEnabled}
                    onToggleRealtime={() => setRealtimeEnabled(!realtimeEnabled)}
                    lastUpdate={new Date().toLocaleTimeString('vi-VN')}
                />
                <VN30TrendChart data={indexHistory} />
            </div>

            {/* Top Stocks Chart */}
            <TopStocksChart stocks={marketData.stocks} />

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

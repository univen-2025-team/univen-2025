'use client';

import { useEffect, useMemo, useState } from 'react';
import { MarketHeader } from './market-header';
import VN30IndexCard from '@/components/market/VN30IndexCard';
import VN30IndexChart from '@/components/market/VN30IndexChart';
import TopStocksChart from '@/components/market/TopStocksChart';
import TopGainersLosers from '@/components/market/TopGainersLosers';
import StockTable from '@/components/market/StockTable';
import MarketLoadingSpinner from '@/components/market/MarketLoadingSpinner';
import ErrorDisplay from '@/components/market/ErrorDisplay';
import { MarketOverviewData } from '@/features/types/features';
import { MarketData, IndexHistoryPoint } from '@/lib/types/market';
import {
    fetchMarketDataService,
    MarketSortField,
    MarketSortOrder
} from '@/lib/services/marketService';
import { useMarketSocket } from '@/lib/hooks/useMarketSocket';
import { API_URL } from '@/config/app';

type MarketOverviewFeatureProps = {
    data: MarketOverviewData;
};

const buildFallbackMarketData = (data: MarketOverviewData): MarketData => {
    const primaryIndex = data.indices[0];

    return {
        vn30Index: {
            index: primaryIndex?.value ?? 0,
            change: 0,
            changePercent: primaryIndex?.changePercent ?? 0
        },
        stocks: data.trendingStocks.map((stock) => ({
            symbol: stock.symbol,
            price: stock.price,
            change: 0,
            changePercent: stock.changePercent,
            volume: 0,
            high: stock.price,
            low: stock.price,
            open: stock.price,
            close: stock.price
        })),
        topGainers: [],
        topLosers: [],
        total: data.trendingStocks.length,
        timestamp: new Date().toISOString()
    };
};

export function MarketOverviewFeature({ data }: MarketOverviewFeatureProps) {
    const fallbackData = useMemo(() => buildFallbackMarketData(data), [data]);
    const [marketData, setMarketData] = useState<MarketData | null>(fallbackData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<MarketSortField>('price');
    const [order, setOrder] = useState<MarketSortOrder>('desc');
    const [indexHistory, setIndexHistory] = useState<IndexHistoryPoint[]>([]);
    const [realtimeEnabled, setRealtimeEnabled] = useState(false);
    const [historyRange, setHistoryRange] = useState('10M');

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
            let limit = 30;
            let type = 'intraday';

            switch (range) {
                case '10M':
                    limit = 10;
                    type = 'intraday';
                    break;
                case '30M':
                    limit = 30;
                    type = 'intraday';
                    break;
                case '1H':
                    limit = 60;
                    type = 'intraday';
                    break;
                case '3H':
                    limit = 180;
                    type = 'intraday';
                    break;
                case '6H':
                    limit = 360;
                    type = 'intraday';
                    break;
                case '1D':
                    limit = 300;
                    type = 'intraday';
                    break;
                case '1W':
                    limit = 7;
                    break;
                case '1M':
                    limit = 30;
                    break;
                case '3M':
                    limit = 90;
                    break;
                case '6M':
                    limit = 180;
                    break;
                case '1Y':
                    limit = 365;
                    break;
                default:
                    limit = 10;
                    type = 'intraday';
            }

            // Import dynamically to avoid circular dependency if any, or just use fetch
            const response = await fetch(
                `${API_URL}/market/history/vn30?limit=${limit}&type=${type}`
            );
            if (response.ok) {
                const result = await response.json();
                if (result.metadata?.history) {
                    setIndexHistory(result.metadata.history);
                }
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const fetchMarketData = async () => {
        try {
            setLoading(true);
            const result = await fetchMarketDataService({ sortBy, order });

            if (result.success && result.data) {
                const latestData = result.data;
                setMarketData(latestData);
                setError(null);

                // Initial history fetch
                fetchHistory(historyRange);
            } else {
                setError(result.error || 'Failed to fetch market data');
            }
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Network error: Unable to fetch market data';
            setError(message);
            console.error('Error fetching market data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketData();
        if (!realtimeEnabled) {
            const interval = setInterval(fetchMarketData, 30000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, order, realtimeEnabled]);

    useEffect(() => {
        if (realtimeEnabled && socketMarketData) {
            setMarketData({
                ...socketMarketData,
                total: socketMarketData.stocks.length
            });
            setError(null);

            const now = new Date();
            const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            setIndexHistory((prev) => {
                const newHistory = [
                    ...prev,
                    { time: timeStr, index: socketMarketData.vn30Index.index }
                ];
                return newHistory.slice(-100);
            });
        }
    }, [socketMarketData, realtimeEnabled]);

    useEffect(() => {
        if (realtimeEnabled) {
            subscribeToMarket();
        } else {
            unsubscribeFromMarket();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [realtimeEnabled]);

    if (loading && !marketData) {
        return <MarketLoadingSpinner />;
    }

    if (error) {
        return <ErrorDisplay error={error} onRetry={fetchMarketData} />;
    }

    if (!marketData) {
        return <MarketLoadingSpinner />;
    }

    return (
        <div className="space-y-6 pb-8">
            <MarketHeader />

            <VN30IndexCard
                vn30Index={marketData.vn30Index}
                timestamp={marketData.timestamp}
                isConnected={isConnected}
                realtimeEnabled={realtimeEnabled}
                onToggleRealtime={() => setRealtimeEnabled((prev) => !prev)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <VN30IndexChart
                    data={indexHistory}
                    onRangeChange={fetchHistory}
                    selectedRange={historyRange}
                />
                <TopStocksChart
                    stocks={
                        marketData.topStocksByPrice && marketData.topStocksByPrice.length > 0
                            ? marketData.topStocksByPrice
                            : marketData.stocks
                    }
                />
            </div>

            <TopGainersLosers topGainers={marketData.topGainers} topLosers={marketData.topLosers} />

            <StockTable
                stocks={marketData.stocks}
                sortBy={sortBy}
                order={order}
                onSortChange={setSortBy}
                onOrderChange={setOrder}
                onRefresh={fetchMarketData}
            />
        </div>
    );
}

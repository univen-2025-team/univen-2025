"use client";

import { useEffect, useState } from "react";
import { useMarketSocket } from "@/lib/hooks/useMarketSocket";
import { MarketData, IndexHistoryPoint } from "@/lib/types/market";
import { fetchMarketDataService, MarketSortField, MarketSortOrder } from "@/lib/services/marketService";
import MarketHeader from "@/components/market/MarketHeader";
import VN30IndexCard from "@/components/market/VN30IndexCard";
import VN30IndexChart from "@/components/market/VN30IndexChart";
import TopStocksChart from "@/components/market/TopStocksChart";
import TopGainersLosers from "@/components/market/TopGainersLosers";
import StockTable from "@/components/market/StockTable";
import ErrorDisplay from "@/components/market/ErrorDisplay";
import MarketLoadingSpinner from "@/components/market/MarketLoadingSpinner";

export default function MarketPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<MarketSortField>("price");
  const [order, setOrder] = useState<MarketSortOrder>("desc");
  const [indexHistory, setIndexHistory] = useState<IndexHistoryPoint[]>([]);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Socket connection for real-time updates
  const { isConnected, marketData: socketMarketData, subscribeToMarket, unsubscribeFromMarket } = useMarketSocket();

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const result = await fetchMarketDataService({ sortBy, order });

      if (result.success && result.data) {
        const latestData = result.data;
        setMarketData(latestData);
        setError(null);

        // Update index history for the chart (keep last 20 points)
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setIndexHistory(prev => {
          const newHistory = [...prev, { time: timeStr, index: latestData.vn30Index.index }];
          return newHistory.slice(-20); // Keep only last 20 data points
        });
      } else {
        setError(result.error || "Failed to fetch market data");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error: Unable to fetch market data";
      setError(message);
      console.error("Error fetching market data:", err);
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
        total: socketMarketData.stocks.length,
      });
      setError(null);

      // Update index history for the chart
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      setIndexHistory(prev => {
        const newHistory = [...prev, { time: timeStr, index: socketMarketData.vn30Index.index }];
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

  if (loading && !marketData) {
    return <MarketLoadingSpinner />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchMarketData} />;
  }

  return (
    <div className="space-y-6 pb-8">
      <MarketHeader />

      {/* VN30 Index Card */}
      {marketData && (
        <VN30IndexCard
          vn30Index={marketData.vn30Index}
          timestamp={marketData.timestamp}
          isConnected={isConnected}
          realtimeEnabled={realtimeEnabled}
          onToggleRealtime={() => setRealtimeEnabled(!realtimeEnabled)}
        />
      )}

      {/* Charts Section */}
      {marketData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <VN30IndexChart data={indexHistory} />
          <TopStocksChart stocks={marketData.stocks} />
        </div>
      )}

      {/* Top Gainers and Losers */}
      {marketData && (
        <TopGainersLosers
          topGainers={marketData.topGainers}
          topLosers={marketData.topLosers}
        />
      )}

      {/* Stock Table */}
      {marketData && (
        <StockTable
          stocks={marketData.stocks}
          sortBy={sortBy}
          order={order}
          onSortChange={setSortBy}
          onOrderChange={setOrder}
          onRefresh={fetchMarketData}
        />
      )}
    </div>
  );
}

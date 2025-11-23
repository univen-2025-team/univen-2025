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

      {/* Charts Section */}
      {marketData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VN30 Index Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
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
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', r: 3 }}
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
              <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
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
                    fill="#6366f1"
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

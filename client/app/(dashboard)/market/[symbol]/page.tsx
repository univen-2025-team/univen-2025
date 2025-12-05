"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStockSocket } from "@/lib/hooks/useMarketSocket";
import {
  PriceHistoryPoint,
  StockDetailData,
  TechnicalIndicator,
  TimeRange,
} from "@/lib/types/stock-detail";
import { fetchStockDetail } from "@/lib/services/marketService";
import StockBackButton from "@/components/market/stock/StockBackButton";
import StockHeaderCard from "@/components/market/stock/StockHeaderCard";
import StockMetricsGrid from "@/components/market/stock/StockMetricsGrid";
import PriceChartCard from "@/components/market/stock/PriceChartCard";
import VolumeChartCard from "@/components/market/stock/VolumeChartCard";
import TechnicalIndicatorsCard from "@/components/market/stock/TechnicalIndicatorsCard";
import CompanyInfoCard from "@/components/market/stock/CompanyInfoCard";
import StockErrorState from "@/components/market/stock/StockErrorState";
import StockLoadingState from "@/components/market/stock/StockLoadingState";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;

  const [stockData, setStockData] = useState<StockDetailData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);

  // Get interval in milliseconds from time range
  const getInterval = (range: string): number => {
    const intervalMap: Record<string, number> = {
      '15s': 15000,
      '1m': 60000,
      '3m': 180000,
      '5m': 300000,
      '15m': 900000,
      '30m': 1800000,
      '1h': 3600000,
      '6h': 21600000,
      '12h': 43200000,
      '1D': 86400000,
      '1W': 604800000,
      '1M': 2592000000,
      '3M': 7776000000,
      '1Y': 31536000000,
    };
    return intervalMap[range] || 60000;
  };

  // Socket connection for real-time updates
  const { isConnected, stockData: socketStockData, subscribeToStock, unsubscribeFromStock } = useStockSocket(
    symbol,
    getInterval(timeRange)
  );

  const loadStockDetail = async () => {
    try {
      setLoading(true);
      const result = await fetchStockDetail({ symbol, timeRange });

      if (result.success && result.data) {
        setStockData(result.data.stock);
        setPriceHistory(result.data.priceHistory);
        setTechnicalIndicators(result.data.technicalIndicators);
        setError(null);
      } else {
        setError(result?.error || result?.message || "Failed to fetch stock data");
      }
    } catch (err) {
      setError("Network error: Unable to fetch stock data");
      console.error("Error fetching stock data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      loadStockDetail();
      // Auto-refresh every 15 seconds (only when realtime is disabled)
      if (!realtimeEnabled) {
        const interval = setInterval(loadStockDetail, 15000);
        return () => clearInterval(interval);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeRange, realtimeEnabled]);

  // Handle real-time updates from socket
  useEffect(() => {
    if (realtimeEnabled && socketStockData && stockData) {
      // Update stock data with socket data
      setStockData({
        ...stockData,
        price: socketStockData.price,
        change: socketStockData.change,
        changePercent: socketStockData.changePercent,
        volume: socketStockData.volume,
        high: socketStockData.high,
        low: socketStockData.low,
        lastUpdate: socketStockData.timestamp,
      });

      // Add new point to price history
      const now = new Date();
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setPriceHistory(prev => {
        const prevClose = prev.length ? (prev[prev.length - 1].close ?? prev[prev.length - 1].price) : socketStockData.price;
        const open = prevClose;
        const close = socketStockData.price;
        const high = Math.max(open, close);
        const low = Math.min(open, close);
        const newHistory = [...prev, {
          time: timeStr,
          price: close,
          volume: socketStockData.volume,
          open,
          close,
          high,
          low,
        }];
        // Keep last 50 points for real-time chart
        return newHistory.slice(-50);
      });
    }
  }, [socketStockData, realtimeEnabled, stockData]);

  // Subscribe/unsubscribe to real-time updates
  useEffect(() => {
    if (realtimeEnabled && symbol) {
      subscribeToStock(symbol, getInterval(timeRange));
    } else {
      unsubscribeFromStock(symbol);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeEnabled, symbol, timeRange]);

  if (loading && !stockData) {
    return <StockLoadingState symbol={symbol} />;
  }

  if (error) {
    return <StockErrorState error={error} onRetry={loadStockDetail} onBack={() => router.push('/market')} />;
  }

  return (
    <div className="space-y-6 pb-8">
      <StockBackButton onBack={() => router.push('/market')} />

      {stockData && (
        <>
          <StockHeaderCard stock={stockData} showRealtimeBadge={isConnected && realtimeEnabled} />
          <StockMetricsGrid stock={stockData} />
        </>
      )}

      <PriceChartCard
        data={priceHistory}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        realtimeEnabled={realtimeEnabled}
        onToggleRealtime={() => setRealtimeEnabled((prev) => !prev)}
      />

      <VolumeChartCard data={priceHistory} />

      {technicalIndicators && stockData && (
        <TechnicalIndicatorsCard stock={stockData} indicators={technicalIndicators} />
      )}

      {stockData && <CompanyInfoCard stock={stockData} />}
    </div>
  );
}

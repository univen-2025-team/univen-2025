'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import StockBackButton from '@/components/market/stock/StockBackButton'
import StockHeaderCard from '@/components/market/stock/StockHeaderCard'
import StockMetricsGrid from '@/components/market/stock/StockMetricsGrid'
import PriceChartCard from '@/components/market/stock/PriceChartCard'
import VolumeChartCard from '@/components/market/stock/VolumeChartCard'
import TechnicalIndicatorsCard from '@/components/market/stock/TechnicalIndicatorsCard'
import CompanyInfoCard from '@/components/market/stock/CompanyInfoCard'
import StockErrorState from '@/components/market/stock/StockErrorState'
import StockLoadingState from '@/components/market/stock/StockLoadingState'
import { Button } from '@/components/ui/button'
import { StockDetailData as FeatureStockDetailData } from '@/features/types/features'
import {
  PriceHistoryPoint,
  StockDetailData as FullStockDetailData,
  TechnicalIndicator,
  TimeRange,
} from '@/lib/types/stock-detail'
import { fetchStockDetail } from '@/lib/services/marketService'
import { useStockSocket } from '@/lib/hooks/useMarketSocket'

type StockDetailFeatureProps = {
  data: FeatureStockDetailData
  onBack?: () => void
  onBuyClick?: (symbol: string) => void
}

const getInterval = (range: TimeRange | string): number => {
  const map: Record<string, number> = {
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
  }
  return map[range] ?? 60000
}

const buildFallbackPriceHistory = (detail: FeatureStockDetailData): PriceHistoryPoint[] => {
  if (!detail.intradayChart.length) {
    return []
  }

  return detail.intradayChart.map((point, index, arr) => {
    const previousValue = arr[index - 1]?.value ?? point.value
    const open = previousValue
    const close = point.value
    const high = Math.max(open, close)
    const low = Math.min(open, close)

    return {
      time: point.time,
      price: point.value,
      volume: 0,
      open,
      close,
      high,
      low,
    }
  })
}

const buildFallbackStockDetail = (detail: FeatureStockDetailData): FullStockDetailData => {
  const chartValues = detail.intradayChart.map((point) => point.value)
  const high = chartValues.length ? Math.max(...chartValues) : detail.price
  const low = chartValues.length ? Math.min(...chartValues) : detail.price
  const change = Number(((detail.changePercent / 100) * detail.price).toFixed(2))
  const previousClose = detail.price - change

  return {
    symbol: detail.symbol,
    companyName: detail.name ?? detail.symbol,
    price: detail.price,
    change,
    changePercent: detail.changePercent,
    volume: 0,
    high,
    low,
    open: previousClose,
    close: detail.price,
    previousClose,
    marketCap: detail.price * 1_000_000,
    pe: 0,
    eps: 0,
    lastUpdate: new Date().toISOString(),
  }
}

const createFallbackIndicators = (
  priceHistory: PriceHistoryPoint[],
  fallbackPrice: number
): TechnicalIndicator => {
  const prices = priceHistory.map((point) => point.price)
  const base = prices.length ? prices[prices.length - 1] : fallbackPrice

  const avg = (items: number[]) => {
    if (!items.length) return base
    const sum = items.reduce((acc, val) => acc + val, 0)
    return sum / items.length
  }

  return {
    ma5: avg(prices.slice(-5)),
    ma10: avg(prices.slice(-10)),
    ma20: avg(prices.slice(-20)),
    rsi: 50,
    macd: 0,
  }
}

export function StockDetailFeature({ data, onBack, onBuyClick }: StockDetailFeatureProps) {
  const symbol = data.symbol.toUpperCase()
  const fallbackDetail = useMemo(() => buildFallbackStockDetail(data), [data])
  const fallbackHistory = useMemo(() => buildFallbackPriceHistory(data), [data])
  const fallbackIndicators = useMemo(
    () => createFallbackIndicators(fallbackHistory, fallbackDetail.price),
    [fallbackHistory, fallbackDetail.price]
  )

  const [stockData, setStockData] = useState<FullStockDetailData | null>(fallbackDetail)
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>(fallbackHistory)
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator | null>(
    fallbackIndicators
  )
  const [timeRange, setTimeRange] = useState<TimeRange>('1D')
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStockData(fallbackDetail)
    setPriceHistory(fallbackHistory)
    setTechnicalIndicators(fallbackIndicators)
  }, [fallbackDetail, fallbackHistory, fallbackIndicators])

  const {
    isConnected,
    stockData: socketStockData,
    subscribeToStock,
    unsubscribeFromStock,
  } = useStockSocket(symbol, getInterval(timeRange))

  const loadStockDetail = useCallback(async () => {
    try {
      setLoading(true)
      const result = await fetchStockDetail({ symbol, timeRange })

      if (result.success && result.data) {
        setStockData(result.data.stock)
        setPriceHistory(result.data.priceHistory)
        setTechnicalIndicators(result.data.technicalIndicators)
        setError(null)
      } else {
        setError(result?.error || result?.message || 'Failed to fetch stock data')
      }
    } catch (err) {
      setError('Network error: Unable to fetch stock data')
      console.error('Error fetching stock data:', err)
    } finally {
      setLoading(false)
    }
  }, [symbol, timeRange])

  useEffect(() => {
    if (!symbol) return

    loadStockDetail()

    if (!realtimeEnabled) {
      const interval = setInterval(loadStockDetail, 15000)
      return () => clearInterval(interval)
    }
  }, [symbol, timeRange, realtimeEnabled, loadStockDetail])

  useEffect(() => {
    if (realtimeEnabled && socketStockData) {
      setStockData((prev) =>
        prev
          ? {
            ...prev,
            price: socketStockData.price,
            change: socketStockData.change,
            changePercent: socketStockData.changePercent,
            volume: socketStockData.volume,
            high: socketStockData.high,
            low: socketStockData.low,
            lastUpdate: socketStockData.timestamp,
          }
          : prev
      )

      setPriceHistory((prev) => {
        const previousClose =
          prev.length > 0 ? prev[prev.length - 1].close ?? prev[prev.length - 1].price : socketStockData.price
        const open = previousClose
        const close = socketStockData.price
        const high = Math.max(open, close)
        const low = Math.min(open, close)
        const now = new Date()
        const timeStr = now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })

        return [
          ...prev,
          {
            time: timeStr,
            price: close,
            volume: socketStockData.volume,
            open,
            close,
            high,
            low,
          },
        ].slice(-50)
      })
    }
  }, [socketStockData, realtimeEnabled])

  useEffect(() => {
    if (realtimeEnabled) {
      subscribeToStock(symbol, getInterval(timeRange))
    } else {
      unsubscribeFromStock(symbol)
    }

    return () => {
      unsubscribeFromStock(symbol)
    }
  }, [realtimeEnabled, symbol, timeRange, subscribeToStock, unsubscribeFromStock])

  const handleToggleRealtime = () => setRealtimeEnabled((prev) => !prev)
  const handleBack = onBack ?? (() => setError(null))

  if (loading && !stockData) {
    return <StockLoadingState symbol={symbol} />
  }

  if (error) {
    return <StockErrorState error={error} onRetry={loadStockDetail} onBack={handleBack} />
  }

  if (!stockData) {
    return <StockLoadingState symbol={symbol} />
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>{onBack && <StockBackButton onBack={onBack} />}</div>
        {onBuyClick && (
          <Button onClick={() => onBuyClick(stockData.symbol)} className="bg-blue-600 text-white">
            Mua ngay
          </Button>
        )}
      </div>

      <StockHeaderCard stock={stockData} showRealtimeBadge={isConnected && realtimeEnabled} />
      <StockMetricsGrid stock={stockData} />

      <PriceChartCard
        data={priceHistory}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        realtimeEnabled={realtimeEnabled}
        onToggleRealtime={handleToggleRealtime}
      />

      <VolumeChartCard data={priceHistory} />

      {technicalIndicators && (
        <TechnicalIndicatorsCard stock={stockData} indicators={technicalIndicators} />
      )}

      <CompanyInfoCard stock={stockData} />
    </div>
  )
}


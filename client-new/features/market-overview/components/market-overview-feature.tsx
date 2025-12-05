'use client'

import { useEffect, useMemo, useState } from 'react'
import VN30IndexCard from '@/components/market/VN30IndexCard'
import VN30IndexChart from '@/components/market/VN30IndexChart'
import TopStocksChart from '@/components/market/TopStocksChart'
import TopGainersLosers from '@/components/market/TopGainersLosers'
import StockTable from '@/components/market/StockTable'
import MarketLoadingSpinner from '@/components/market/MarketLoadingSpinner'
import ErrorDisplay from '@/components/market/ErrorDisplay'
import { MarketOverviewData } from '@/features/types/features'
import { MarketData, IndexHistoryPoint } from '@/lib/types/market'
import PageHeader from '@/components/dashboard/PageHeader'
import {
  fetchMarketDataService,
  MarketSortField,
  MarketSortOrder,
} from '@/lib/services/marketService'
import { useMarketSocket } from '@/lib/hooks/useMarketSocket'

type MarketOverviewFeatureProps = {
  data: MarketOverviewData
}

const buildFallbackMarketData = (data: MarketOverviewData): MarketData => {
  const primaryIndex = data.indices[0]

  return {
    vn30Index: {
      index: primaryIndex?.value ?? 0,
      change: 0,
      changePercent: primaryIndex?.changePercent ?? 0,
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
      close: stock.price,
    })),
    topGainers: [],
    topLosers: [],
    total: data.trendingStocks.length,
    timestamp: new Date().toISOString(),
  }
}

export function MarketOverviewFeature({ data }: MarketOverviewFeatureProps) {
  const fallbackData = useMemo(() => buildFallbackMarketData(data), [data])
  const [marketData, setMarketData] = useState<MarketData | null>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<MarketSortField>('price')
  const [order, setOrder] = useState<MarketSortOrder>('desc')
  const [indexHistory, setIndexHistory] = useState<IndexHistoryPoint[]>([])
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)

  const {
    isConnected,
    marketData: socketMarketData,
    subscribeToMarket,
    unsubscribeFromMarket,
  } = useMarketSocket()

  const fetchMarketData = async () => {
    try {
      setLoading(true)
      const result = await fetchMarketDataService({ sortBy, order })

      if (result.success && result.data) {
        const latestData = result.data
        setMarketData(latestData)
        setError(null)

        const now = new Date()
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        setIndexHistory((prev) => {
          const newHistory = [...prev, { time: timeStr, index: latestData.vn30Index.index }]
          return newHistory.slice(-20)
        })
      } else {
        setError(result.error || 'Failed to fetch market data')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Network error: Unable to fetch market data'
      setError(message)
      console.error('Error fetching market data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    if (!realtimeEnabled) {
      const interval = setInterval(fetchMarketData, 30000)
      return () => clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, order, realtimeEnabled])

  useEffect(() => {
    if (realtimeEnabled && socketMarketData) {
      setMarketData({
        ...socketMarketData,
        total: socketMarketData.stocks.length,
      })
      setError(null)

      const now = new Date()
      const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      setIndexHistory((prev) => {
        const newHistory = [...prev, { time: timeStr, index: socketMarketData.vn30Index.index }]
        return newHistory.slice(-20)
      })
    }
  }, [socketMarketData, realtimeEnabled])

  useEffect(() => {
    if (realtimeEnabled) {
      subscribeToMarket()
    } else {
      unsubscribeFromMarket()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeEnabled])

  if (loading && !marketData) {
    return <MarketLoadingSpinner />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchMarketData} />
  }

  if (!marketData) {
    return <MarketLoadingSpinner />
  }

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Thị trường VN30"
        description="Theo dõi 30 mã cổ phiếu vốn hóa lớn nhất thị trường Việt Nam"
      />

      <VN30IndexCard
        vn30Index={marketData.vn30Index}
        timestamp={marketData.timestamp}
        isConnected={isConnected}
        realtimeEnabled={realtimeEnabled}
        onToggleRealtime={() => setRealtimeEnabled((prev) => !prev)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VN30IndexChart data={indexHistory} />
        <TopStocksChart stocks={marketData.stocks} />
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
  )
}


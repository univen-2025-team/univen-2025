'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, ChevronRight } from 'lucide-react'
import { MarketOverviewData } from '@/features/types/features'
import { getThemeColor } from '@/lib/theme-colors'

type MarketOverviewFeatureProps = {
  data: MarketOverviewData
}

export function MarketOverviewFeature({ data }: MarketOverviewFeatureProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1 Ngày')

  const chart1 = getThemeColor('chart1')
  const borderColor = getThemeColor('border-color')
  const mutedText = getThemeColor('muted-text')
  const cardBg = getThemeColor('card-bg')

  const timeframes = ['1 Ngày', '1 Tháng', '3 Tháng', '1 Năm', '5 Năm', 'Tất cả']

  // Transform chart data
  const chartData = data.mainChart.points.map((point) => ({
    time: point.time,
    value: point.value,
  }))

  return (
    <div className="space-y-6">
      {/* Header với chọn quốc gia */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⭐</span>
          <h1 className="text-xl font-semibold">Việt Nam</h1>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      {/* Các chỉ số chính */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {data.indices.map((index) => (
          <Card
            key={index.id}
            className="min-w-[200px] bg-gradient-to-br from-card to-card/95 border border-border/50 shadow-sm"
          >
            <CardContent className="p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{index.name}</p>
                <p className="text-lg font-bold">{index.value.toLocaleString('vi-VN')}</p>
                <p
                  className={`text-sm font-medium ${
                    index.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {index.changePercent >= 0 ? '+' : ''}
                  {index.changePercent.toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button variant="ghost" size="icon" className="shrink-0">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Chart */}
      <Card className="bg-gradient-to-br from-card to-card/95 border border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{data.mainChart.label}</CardTitle>
            </div>
            <div className="flex gap-2">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant={selectedTimeframe === tf ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(tf)}
                  className="text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
                <XAxis dataKey="time" stroke={mutedText} />
                <YAxis stroke={mutedText} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chart1}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: chart1 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b pb-2">
        <Button variant="ghost" size="sm" className="shrink-0">
          Các chỉ số chính
        </Button>
        <Button variant="default" size="sm" className="shrink-0">
          Cổ phiếu Việt Nam
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0">
          Ngoại hối
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0">
          Lợi suất trái phiếu chính phủ Việt Nam
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0">
          Quỹ Hoán đổi Danh mục
        </Button>
        <Button variant="ghost" size="sm" className="shrink-0">
          Nền kinh tế Việt Nam
        </Button>
      </div>

      {/* Cổ phiếu Việt Nam / Xu hướng của cộng đồng */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Cổ phiếu Việt Nam</h2>
            <p className="text-sm text-muted-foreground">Xu hướng của cộng đồng</p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {data.trendingStocks.map((stock) => (
            <Card
              key={stock.symbol}
              className="min-w-[200px] bg-gradient-to-br from-card to-card/95 border border-border/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">
                      {stock.price.toLocaleString('vi-VN')} VND
                    </p>
                    <p
                      className={`text-sm font-medium ${
                        stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ArrowLeft } from 'lucide-react'
import { StockDetailData } from '@/features/types/features'
import { getThemeColor } from '@/lib/theme-colors'

type StockDetailFeatureProps = {
  data: StockDetailData
  onBack?: () => void
  onBuyClick?: (symbol: string) => void
}

export function StockDetailFeature({
  data,
  onBack,
  onBuyClick,
}: StockDetailFeatureProps) {
  const [timeframe, setTimeframe] = useState('1D')

  const chart1 = getThemeColor('chart1')
  const borderColor = getThemeColor('border-color')
  const mutedText = getThemeColor('muted-text')
  const cardBg = getThemeColor('card-bg')

  const timeframes = ['1H', '1D', '1W', '1M', '1Y']

  // Transform chart data
  const chartData = data.intradayChart.map((point) => ({
    time: point.time,
    value: point.value,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{data.symbol}</h1>
          {data.description && (
            <p className="text-sm text-muted-foreground">{data.description}</p>
          )}
        </div>
      </div>

      {/* Price Card */}
      <Card className="bg-gradient-to-br from-card to-card/95 border border-border/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold text-primary">
                {data.price.toLocaleString('vi-VN')} VND
              </p>
              <p
                className={`mt-1 text-lg font-medium ${
                  data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {data.changePercent >= 0 ? '+' : ''}
                {data.changePercent.toFixed(2)}%
              </p>
            </div>
            {onBuyClick && (
              <Button
                onClick={() => onBuyClick(data.symbol)}
                className="bg-chart-1 hover:bg-chart-1/90 text-primary-foreground"
              >
                Mua ngay
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="bg-gradient-to-br from-card to-card/95 border border-border/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Biểu đồ {data.symbol}</CardTitle>
            <div className="flex gap-2">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                  className="w-12"
                >
                  {tf}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
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

      {/* Info Blocks - Placeholder */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-card to-card/95 border border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="text-lg font-semibold">--</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/95 border border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="text-lg font-semibold">--</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/95 border border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">P/E Ratio</p>
            <p className="text-lg font-semibold">--</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


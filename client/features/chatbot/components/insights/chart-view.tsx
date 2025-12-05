'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { getThemeColor } from '@/lib/theme-colors'

type ChartViewProps = {
  chart: {
    symbol: string
    timeframe: '1D' | '1W' | '1M' | '1Y'
    points: { time: string; value: number }[]
  }
}

export function ChartView({ chart }: ChartViewProps) {
  const [timeframe, setTimeframe] = useState(chart.timeframe)

  const chart1 = getThemeColor('chart1')
  const borderColor = getThemeColor('border-color')
  const mutedText = getThemeColor('muted-text')
  const cardBg = getThemeColor('card-bg')

  // Transform points to chart format
  const chartData = chart.points.map((point) => ({
    time: point.time,
    price: point.value,
  }))

  // Calculate latest price and change
  const latestPrice = chart.points[chart.points.length - 1]?.value || 0
  const previousPrice = chart.points[chart.points.length - 2]?.value || latestPrice
  const change = latestPrice - previousPrice
  const changePercent = previousPrice > 0 ? ((change / previousPrice) * 100).toFixed(2) : '0.00'

  return (
    <Card className="bg-linear-to-br from-card to-card/95 border border-border/50 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{chart.symbol} Stock Price</CardTitle>
          </div>
          <div className="flex gap-2">
            {['1D', '1W', '1M', '1Y'].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf as '1D' | '1W' | '1M' | '1Y')}
                className="w-12"
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-4xl font-bold text-primary">${latestPrice.toLocaleString()}</p>
            <p
              className={`mt-1 text-sm font-medium ${
                change >= 0 ? 'text-success' : 'text-error'
              }`}
            >
              {change >= 0 ? '+' : ''}
              {changePercent}% today
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={borderColor} />
              <XAxis dataKey="time" stroke={mutedText} />
              <YAxis stroke={mutedText} domain={['dataMin - 500', 'dataMax + 500']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={chart1}
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: chart1 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button className="bg-chart-1 hover:bg-chart-1/90 text-primary-foreground">
            Buy Now
          </Button>
          <Button variant="outline">Set Alert</Button>
        </div>
      </CardContent>
    </Card>
  )
}


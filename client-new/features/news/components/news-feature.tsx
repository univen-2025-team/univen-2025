'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewsData } from '@/features/types/features'

type NewsFeatureProps = {
  data: NewsData
  onBack?: () => void
}

export function NewsFeature({ data, onBack }: NewsFeatureProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">
            {data.symbol ? `Tin tức ${data.symbol}` : 'Tin tức thị trường'}
          </h1>
        </div>
      </div>

      {/* News List */}
      <Card className="bg-card border border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {data.symbol ? `Tin tức ${data.symbol}` : 'Tin tức thị trường'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.items.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">Không có tin tức</p>
          ) : (
            data.items.map((item) => (
              <div
                key={item.id}
                className="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-4 transition-colors hover:bg-muted/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="flex-1 text-base font-medium leading-snug text-foreground">
                    {item.title}
                  </h3>
                  <Badge
                    variant={item.sentiment === 'positive' ? 'default' : 'secondary'}
                    className="shrink-0"
                  >
                    {item.sentiment}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="rounded bg-primary/10 px-2 py-1 text-primary text-xs">
                    {item.source}
                  </span>
                  <span>{item.timeAgo}</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}


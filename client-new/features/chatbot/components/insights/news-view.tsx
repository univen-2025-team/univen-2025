'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'
import { NewsItem } from '../types'

type NewsViewProps = {
  news: {
    symbol?: string
    items: NewsItem[]
  }
}

export function NewsView({ news }: NewsViewProps) {
  return (
    <Card className="bg-card border border-border/50 shadow-lg backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {news.symbol ? `${news.symbol} News` : 'Market News'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {news.items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">Không có tin tức</p>
        ) : (
          news.items.map((item) => (
            <div
              key={item.id}
              className="space-y-2 rounded-lg border border-border/40 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between">
                <h4 className="flex-1 text-sm font-medium leading-snug text-foreground">
                  {item.title}
                </h4>
                <Badge
                  variant={item.sentiment === 'positive' ? 'default' : 'secondary'}
                  className="ml-2 flex-shrink-0"
                >
                  {item.sentiment}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="rounded bg-primary/10 px-2 py-1 text-primary">{item.source}</span>
                <span>{item.timeAgo}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}


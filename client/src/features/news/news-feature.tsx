'use client'

import { ArrowLeft, Globe2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { NewsData } from '../types/features'

type NewsFeatureProps = {
  data: NewsData
  onBack?: () => void
}

function SentimentBadge({ sentiment }: { sentiment: NewsData['items'][number]['sentiment'] }) {
  switch (sentiment) {
    case 'positive':
      return <Badge className="border-none">Tích cực</Badge>
    case 'negative':
      return <Badge variant="outline">Tiêu cực</Badge>
    default:
      return <Badge variant="secondary">Trung tính</Badge>
  }
}

function SentimentIcon({ sentiment }: { sentiment: NewsData['items'][number]['sentiment'] }) {
  switch (sentiment) {
    case 'positive':
      return <TrendingUp className="h-4 w-4" />
    case 'negative':
      return <TrendingDown className="h-4 w-4" />
    default:
      return <Minus className="h-4 w-4" />
  }
}

// Mock news data khi không có data từ API
const getMockNewsData = (symbol?: string): NewsData['items'] => {
  return [
    {
      id: 'mock-1',
      title: symbol 
        ? `${symbol} công bố kết quả kinh doanh quý mới nhất`
        : 'Thị trường chứng khoán Việt Nam tăng điểm mạnh trong phiên giao dịch hôm nay',
      source: 'VnExpress',
      timeAgo: '1 giờ trước',
      sentiment: 'positive' as const,
    },
    {
      id: 'mock-2',
      title: symbol
        ? `Phân tích triển vọng đầu tư ${symbol} trong năm 2025`
        : 'Nhu cầu chip AI thúc đẩy đà tăng của các cổ phiếu công nghệ',
      source: 'Bloomberg',
      timeAgo: '3 giờ trước',
      sentiment: 'positive' as const,
    },
    {
      id: 'mock-3',
      title: symbol
        ? `${symbol} nhận được đánh giá tích cực từ các nhà phân tích`
        : 'Fed báo hiệu có thể giữ lãi suất ổn định trong thời gian tới',
      source: 'Reuters',
      timeAgo: '5 giờ trước',
      sentiment: 'neutral' as const,
    },
    {
      id: 'mock-4',
      title: symbol
        ? `Cập nhật tin tức mới nhất về ${symbol}`
        : 'Thị trường chứng khoán châu Á có dấu hiệu phục hồi',
      source: 'AP',
      timeAgo: '1 ngày trước',
      sentiment: 'positive' as const,
    },
  ]
}

export function NewsFeature({ data, onBack }: NewsFeatureProps) {
  const { symbol, items } = data
  
  // Sử dụng mock data nếu không có items
  const displayItems = items.length > 0 ? items : getMockNewsData(symbol)

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <div className="flex flex-1 items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Tin tức thị trường
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {symbol ? `Tin tức về ${symbol}` : 'Tin tức mới nhất'}
              </h2>
            </div>
          </div>

          <Badge variant="outline" className="gap-1">
            <Globe2 className="h-3 w-3" />
            Real-time feed
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-auto pr-1">
        {displayItems.map((item) => (
            <button
              key={item.id}
              className="w-full rounded-xl border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SentimentIcon sentiment={item.sentiment} />
                    <h3 className="text-sm font-medium leading-snug">
                      {item.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{item.source}</span>
                    <span>·</span>
                    <span>{item.timeAgo}</span>
                  </div>
                </div>

                <SentimentBadge sentiment={item.sentiment} />
              </div>
            </button>
          ))}
      </div>
    </div>
  )
}

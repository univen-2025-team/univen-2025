'use client';

import { ArrowLeft, Globe2, TrendingUp, TrendingDown, Minus, Loader2, ExternalLink, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { NewsData } from '../types/features'
import { useStockNews } from '@/lib/hooks/useStockNews'
import { StockNewsItem } from '@/lib/api/market-cache'

type NewsFeatureProps = {
    data: NewsData;
    onBack?: () => void;
};

// Helper để tính sentiment từ priceChangePct
function getSentimentFromPriceChange(priceChangePct: number | undefined): 'positive' | 'negative' | 'neutral' {
  if (!priceChangePct) return 'neutral';
  if (priceChangePct > 0.01) return 'positive';
  if (priceChangePct < -0.01) return 'negative';
  return 'neutral';
}

// Helper để format thời gian
function formatTimeAgo(publishedAt: string | undefined): string {
  if (!publishedAt) return '';
  
  try {
    const publishedDate = new Date(publishedAt.replace(' ', 'T'));
    const now = new Date();
    const diffMs = now.getTime() - publishedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} ngày trước`;
    } else if (diffHours > 0) {
      return `${diffHours} giờ trước`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} phút trước`;
    }
  } catch {
    return publishedAt;
  }
}

function SentimentBadge({ sentiment }: { sentiment: 'positive' | 'negative' | 'neutral' }) {
  switch (sentiment) {
    case 'positive':
      return <Badge className="border-none bg-green-500/10 text-green-600">Tích cực</Badge>
    case 'negative':
      return <Badge variant="outline" className="border-red-500/30 text-red-500">Tiêu cực</Badge>
    default:
      return <Badge variant="secondary">Trung tính</Badge>
  }
}

function SentimentIcon({ sentiment }: { sentiment: 'positive' | 'negative' | 'neutral' }) {
  switch (sentiment) {
    case 'positive':
      return <TrendingUp className="h-4 w-4 text-green-500" />
    case 'negative':
      return <TrendingDown className="h-4 w-4 text-red-500" />
    default:
      return <Minus className="h-4 w-4 text-muted-foreground" />
  }
}

// Component hiển thị tin tức từ API
function NewsItem({ item }: { item: StockNewsItem }) {
  const sentiment = getSentimentFromPriceChange(item.priceChangePct);
  const timeAgo = formatTimeAgo(item.publishedAt);
  
  return (
    <a
      href={item.sourceLink}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full rounded-xl border bg-card p-3 text-left transition hover:border-primary/40 hover:bg-accent/40"
    >
      <div className="flex items-start gap-3">
        {item.imageUrl && (
          <img 
            src={item.imageUrl} 
            alt="" 
            className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium leading-snug line-clamp-2">
              {item.title}
            </h3>
            <SentimentBadge sentiment={sentiment} />
          </div>
          {item.shortContent && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {item.shortContent}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              Nguồn chính thức
            </span>
            {timeAgo && (
              <>
                <span>·</span>
                <span>{timeAgo}</span>
              </>
            )}
            {item.priceChangePct !== undefined && (
              <>
                <span>·</span>
                <span className={item.priceChangePct >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {item.priceChangePct >= 0 ? '+' : ''}{(item.priceChangePct * 100).toFixed(2)}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

export function NewsFeature({ data, onBack }: NewsFeatureProps) {
  const { symbol } = data
  
  // Fetch news từ API
  const { news, loading, error, total, refetch } = useStockNews(symbol, 20);

    return (
        <div className="flex h-full flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                {onBack && (
                    <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
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
              {total > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {total} tin
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={refetch}
              disabled={loading}
              className="h-8 w-8"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Badge variant="outline" className="gap-1">
              <Globe2 className="h-3 w-3" />
              Live
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-3 overflow-auto pr-1">
        {loading && news.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}
        
        {!loading && news.length === 0 && !error && (
          <div className="py-8 text-center text-muted-foreground">
            {symbol ? `Không có tin tức nào về ${symbol}` : 'Không có tin tức'}
          </div>
        )}
        
        {news.map((item) => (
          <NewsItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

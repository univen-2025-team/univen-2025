'use client'

import { NewsItem } from '../types'
import { Badge } from '@/components/ui/badge'

type NewsWidgetProps = {
  items: NewsItem[]
}

export function NewsWidget({ items }: NewsWidgetProps) {
  return (
    <div className="rounded-2xl border bg-white/80 shadow-sm p-3 space-y-2">
      <h3 className="text-sm font-semibold text-slate-900">Market News</h3>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2 hover:bg-slate-100 transition-colors"
        >
          {/* Sentiment indicator */}
          <div className="flex-shrink-0 mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                item.sentiment === 'positive'
                  ? 'bg-success-light0'
                  : item.sentiment === 'negative'
                    ? 'bg-error-light0'
                    : 'bg-gray-400'
              }`}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 line-clamp-2">{item.title}</p>
            <p className="text-xs text-slate-500 mt-1">
              {item.source} · {item.timeAgo}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

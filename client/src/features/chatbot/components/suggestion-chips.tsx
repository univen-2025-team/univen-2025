'use client'

import { Button } from '@/components/ui/button'
import { SuggestionMessage } from './types'

type SuggestionChipsProps = {
  suggestions?: string[] | SuggestionMessage[]
  onClick?: (value: string) => void
}

const DEFAULT_SUGGESTIONS: SuggestionMessage[] = [
  { text: 'Show market news', icon: '📰' },
  { text: 'Buy AAPL', icon: '💹' },
  { text: 'Explain P/E ratio', icon: '📊' },
  { text: 'Top gainers today', icon: '📈' },
]

export function SuggestionChips({ suggestions, onClick }: SuggestionChipsProps) {
  // Convert string[] to SuggestionMessage[] nếu cần
  const chips: SuggestionMessage[] = suggestions
    ? suggestions.map((s) =>
        typeof s === 'string'
          ? { text: s }
          : s
      )
    : DEFAULT_SUGGESTIONS

  return (
    <div className="mb-3 space-y-2">
      <p className="text-xs text-muted-foreground">Quick actions:</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, index) => (
          <Button
            key={chip.text || index}
            variant="outline"
            size="sm"
            className="text-xs hover:text-primary"
            onClick={() => onClick?.(chip.text)}
          >
            {chip.icon && <span className="mr-1">{chip.icon}</span>}
            {chip.text}
          </Button>
        ))}
      </div>
    </div>
  )
}

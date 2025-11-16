'use client'

import { Button } from '@/components/ui/button'

type SuggestionChipsProps = {
  suggestions?: string[]
  onClick?: (value: string) => void
}

const DEFAULT_SUGGESTIONS = ['Show market news', 'Buy AAPL', 'Explain P/E ratio', 'Top gainers today']

export function SuggestionChips({ suggestions, onClick }: SuggestionChipsProps) {
  const chips = suggestions || DEFAULT_SUGGESTIONS

  return (
    <div className="mb-3 space-y-2">
      <p className="text-xs text-muted-foreground">Quick actions:</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Button
            key={chip}
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onClick?.(chip)}
          >
            {chip}
          </Button>
        ))}
      </div>
    </div>
  )
}

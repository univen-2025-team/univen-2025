export type NewsItem = {
  id: string
  title: string
  source: string
  timeAgo: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

export type BuyFlowStep = {
  id: string
  title: string
  description: string
  helperText?: string
  fields?: {
    type: 'text' | 'number' | 'select'
    name: string
    label: string
    placeholder?: string
    options?: string[]
  }[]
}

export type ChatActionWidget =
  | {
      type: 'NEWS_LIST'
      items: NewsItem[]
    }
  | {
      type: 'BUY_FLOW'
      symbol: string
      steps: BuyFlowStep[]
      currentStepIndex: number
    }
  | {
      type: 'HELP_CARD'
      title: string
      description: string
      tips?: string[]
    }

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
  widgets?: ChatActionWidget[]
}

export type TradingChatPanelProps = {
  messages: ChatMessage[]
  isLoading?: boolean
  suggestions?: string[]
  onSendMessage: (text: string) => void
  onSuggestionClick?: (suggestion: string) => void
}

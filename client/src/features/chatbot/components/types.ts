// Chat Message
export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  text: string
  createdAt: string
}

// Suggestion Message (theo API_RESPONSE_FORMAT.md)
export type SuggestionMessage = {
  text: string // Nội dung gợi ý
  action?: string // Action để thực hiện (VD: "query:lịch sử giá VCB")
  icon?: string // Icon emoji (VD: "📊", "🔍")
}

// Trading Chat Panel Props
export type TradingChatPanelProps = {
  messages: ChatMessage[]
  isLoading: boolean
  suggestions?: string[] | SuggestionMessage[] // Hỗ trợ cả string[] và SuggestionMessage[]
  onSendMessage: (text: string) => void
  onSuggestionClick: (suggestion: string) => void
  hasComponentLoaded?: boolean // Component đã được load chưa
  onClearStorage?: () => void
}

// Feature IDs
export type FeatureId =
  | 'MARKET_OVERVIEW'
  | 'BUY_STOCK'
  | 'VIEW_NEWS'
  | 'VIEW_STOCK_DETAIL'

// Buy Flow Step
export type BuyFlowStep = {
  id: string
  title: string
  // Backend có thể trả về null -> cho phép null để khỏi lỗi khi parse
  description: string | null
  helperText?: string
  fields?: {
    type: 'text' | 'number' | 'select'
    name: string
    label: string
    placeholder?: string
    options?: string[]
  }[]
}

// Market Overview Data
export type MarketOverviewData = {
  indices: {
    id: string
    name: string
    value: number
    changePercent: number
  }[]
  mainChart: {
    label: string // VD: "VNINDEX"
    points: { time: string; value: number }[]
  }
  trendingStocks: {
    symbol: string
    name: string
    price: number
    changePercent: number
  }[]
}

// Buy Stock Data (frontend state)
// currentStepIndex là state nội bộ của FE, API không cần trả
export type BuyStockData = {
  symbol: string
  currentPrice: number
  steps: BuyFlowStep[]
  currentStepIndex: number
}

// News Item
export type NewsItem = {
  id: string
  title: string
  source: string
  timeAgo: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

// News Data
export type NewsData = {
  symbol?: string
  items: NewsItem[]
}

// Stock Detail Data
export type StockDetailData = {
  symbol: string
  name: string
  description?: string
  price: number
  changePercent: number
  // API trả intradayChart: [{ time, price }]
  intradayChart: { time: string; price: number }[]
}

// Feature State
export type FeatureState = {
  activeFeature: FeatureId
  // Luôn giữ market overview để quay lại nhanh
  marketOverview: MarketOverviewData
  buyStock?: BuyStockData
  news?: NewsData
  stockDetail?: StockDetailData
}

// Feature Instruction (mapping 1–1 với API ui_effects)
export type FeatureInstruction =
  | {
      type: 'SHOW_MARKET_OVERVIEW'
    }
  | {
      type: 'OPEN_BUY_STOCK'
      payload: {
        symbol: string
        currentPrice: number
        steps: BuyFlowStep[]
      }
    }
  | {
      type: 'OPEN_NEWS'
      payload: NewsData
    }
  | {
      type: 'OPEN_STOCK_DETAIL'
      payload: StockDetailData
    }

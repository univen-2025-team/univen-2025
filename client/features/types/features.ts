// Feature IDs
export type FeatureId =
  | 'MARKET_OVERVIEW'
  | 'BUY_STOCK'
  | 'SELL_STOCK'
  | 'VIEW_NEWS'
  | 'VIEW_STOCK_DETAIL'
  | 'CONFIRM_TRANSACTION'
  | 'USER_PROFILE'
  | 'TRANSACTION_HISTORY'
  | 'TRANSACTION_STATS'
  | 'RANKING'
  | 'STOCK_SUGGESTIONS'

// Buy Flow Step
export type BuyFlowStep = {
  id: string
  title: string
  description?: string
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
    label: string // VNINDEX
    points: { time: string; value: number }[]
  }
  trendingStocks: {
    symbol: string
    name: string
    price: number
    changePercent: number
  }[]
}

// Buy Stock Data
export type BuyStockData = {
  symbol: string
  currentPrice: number
  steps: BuyFlowStep[]
  currentStepIndex: number
}

// Sell Stock Data (theo FE_TEST.md)
export type SellStockData = {
  symbol: string
  currentPrice: number
  availableQuantity: number // Số lượng cổ phiếu user đang có
  steps: BuyFlowStep[]
  currentStepIndex: number
}

// Transaction Data (theo FE_TEST.md)
export type TransactionData = {
  transactionId?: string
  symbol: string
  type: 'buy' | 'sell'
  quantity: number
  price: number
  totalAmount: number
  userId: string
}

// User Profile Data (theo FE_TEST.md)
export type UserProfileData = {
  userId: string
  fullName?: string
  email?: string
  balance?: number
  avatar?: string
}

// Transaction History Data (theo FE_TEST.md)
export type TransactionHistoryData = {
  userId: string
  transactions: any[]
}

// Transaction Stats Data (theo FE_TEST.md)
export type TransactionStatsData = {
  userId: string
  totalProfit?: number
  totalTransactions?: number
  winRate?: number
}

// Ranking Data (theo FE_TEST.md)
export type RankingData = {
  rankings: any[]
  userRank?: number
}

// News Data
export type NewsData = {
  symbol?: string
  items: {
    id: string
    title: string
    source: string
    timeAgo: string
    sentiment: 'positive' | 'negative' | 'neutral'
  }[]
}

// Stock Detail Data
export type StockDetailData = {
  symbol: string
  name: string
  description?: string
  price: number
  changePercent: number
  intradayChart: { time: string; value: number }[]
}

// Stock Suggestions Data
export type StockSuggestionsData = {
  symbols: string[]
}

// Feature State
export type FeatureState = {
  activeFeature: FeatureId
  marketOverview: MarketOverviewData // luôn giữ để quay lại nhanh
  buyStock?: BuyStockData
  sellStock?: SellStockData
  news?: NewsData
  stockDetail?: StockDetailData
  transaction?: TransactionData
  userProfile?: UserProfileData
  transactionHistory?: TransactionHistoryData
  transactionStats?: TransactionStatsData
  ranking?: RankingData
  stockSuggestions?: StockSuggestionsData
}

// Feature Instruction (theo FE_TEST.md - đầy đủ 10 types)
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
      type: 'OPEN_SELL_STOCK'
      payload: {
        symbol: string
        currentPrice: number
        availableQuantity: number
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
  | {
      type: 'CONFIRM_TRANSACTION'
      payload: TransactionData
    }
  | {
      type: 'SHOW_USER_PROFILE'
      payload: UserProfileData
    }
  | {
      type: 'SHOW_TRANSACTION_HISTORY'
      payload: TransactionHistoryData
    }
  | {
      type: 'SHOW_TRANSACTION_STATS'
      payload: TransactionStatsData
    }
  | {
      type: 'SHOW_RANKING'
      payload: RankingData
    }
  | {
      type: 'SHOW_STOCK_SUGGESTIONS'
      payload: StockSuggestionsData
    }


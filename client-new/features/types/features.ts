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

// Feature State
export type FeatureState = {
  activeFeature: FeatureId
  marketOverview: MarketOverviewData // luôn giữ để quay lại nhanh
  buyStock?: BuyStockData
  news?: NewsData
  stockDetail?: StockDetailData
}

// Feature Instruction
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


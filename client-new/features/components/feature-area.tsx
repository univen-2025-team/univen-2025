'use client'

import { FeatureState, FeatureInstruction } from '../types/features'
import { MarketOverviewFeature } from '../market-overview/components/market-overview-feature'
import { BuyStockWizard } from '../buy-stock/components/buy-stock-wizard'
import { NewsFeature } from '../news/components/news-feature'
import { StockDetailFeature } from '../stock-detail/components/stock-detail-feature'

type FeatureAreaProps = {
  state: FeatureState
  onBack?: () => void
  onFeatureAction?: (instruction: FeatureInstruction) => void
}

export function FeatureArea({
  state,
  onBack,
  onFeatureAction,
}: FeatureAreaProps) {
  const handleBuyClick = (symbol: string) => {
    if (onFeatureAction) {
      // Trigger buy stock feature - in real app would fetch current price and steps
      onFeatureAction({
        type: 'OPEN_BUY_STOCK',
        payload: {
          symbol,
          currentPrice: 0, // Would be fetched
          steps: [], // Would be fetched
        },
      })
    }
  }

  switch (state.activeFeature) {
    case 'MARKET_OVERVIEW':
      return <MarketOverviewFeature data={state.marketOverview} />

    case 'BUY_STOCK':
      return state.buyStock ? (
        <BuyStockWizard data={state.buyStock} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'VIEW_NEWS':
      return state.news ? (
        <NewsFeature data={state.news} onBack={onBack} />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    case 'VIEW_STOCK_DETAIL':
      return state.stockDetail ? (
        <StockDetailFeature
          data={state.stockDetail}
          onBack={onBack}
          onBuyClick={handleBuyClick}
        />
      ) : (
        <MarketOverviewFeature data={state.marketOverview} />
      )

    default:
      return <MarketOverviewFeature data={state.marketOverview} />
  }
}


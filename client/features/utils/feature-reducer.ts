import { FeatureState, FeatureInstruction } from '../types/features'

export function reduceFeatureState(
  state: FeatureState,
  effects: FeatureInstruction[]
): FeatureState {
  return effects.reduce((s, eff) => {
    switch (eff.type) {
      case 'SHOW_MARKET_OVERVIEW':
        return {
          ...s,
          activeFeature: 'MARKET_OVERVIEW',
        }

      case 'OPEN_BUY_STOCK':
        return {
          ...s,
          activeFeature: 'BUY_STOCK',
          buyStock: {
            symbol: eff.payload.symbol,
            currentPrice: eff.payload.currentPrice,
            steps: eff.payload.steps,
            currentStepIndex: 0,
          },
        }

      case 'OPEN_NEWS':
        return {
          ...s,
          activeFeature: 'VIEW_NEWS',
          news: eff.payload,
        }

      case 'OPEN_STOCK_DETAIL':
        return {
          ...s,
          activeFeature: 'VIEW_STOCK_DETAIL',
          stockDetail: eff.payload,
        }

      default:
        return s
    }
  }, state)
}


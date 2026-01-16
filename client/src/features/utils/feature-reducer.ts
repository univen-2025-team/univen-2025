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

      case 'OPEN_SELL_STOCK':
        return {
          ...s,
          activeFeature: 'SELL_STOCK',
          sellStock: {
            symbol: eff.payload.symbol,
            currentPrice: eff.payload.currentPrice,
            availableQuantity: eff.payload.availableQuantity,
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

      case 'CONFIRM_TRANSACTION':
        return {
          ...s,
          activeFeature: 'CONFIRM_TRANSACTION',
          transaction: eff.payload,
        }

      case 'SHOW_USER_PROFILE':
        return {
          ...s,
          activeFeature: 'USER_PROFILE',
          userProfile: eff.payload,
        }

      case 'SHOW_TRANSACTION_HISTORY':
        return {
          ...s,
          activeFeature: 'TRANSACTION_HISTORY',
          transactionHistory: eff.payload,
        }

      case 'SHOW_TRANSACTION_STATS':
        return {
          ...s,
          activeFeature: 'TRANSACTION_STATS',
          transactionStats: eff.payload,
        }

      case 'SHOW_RANKING':
        return {
          ...s,
          activeFeature: 'RANKING',
          ranking: eff.payload,
        }

      case 'SHOW_STOCK_SUGGESTIONS':
        return {
          ...s,
          activeFeature: 'STOCK_SUGGESTIONS',
          stockSuggestions: eff.payload,
        }

      default:
        // TypeScript exhaustive check
        const _exhaustive: never = eff
        console.warn('Unknown UI effect type:', eff)
        return s
    }
  }, state)
}


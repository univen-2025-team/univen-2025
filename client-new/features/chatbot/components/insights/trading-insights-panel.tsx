'use client'

import { DashboardState } from '../types/dashboard'
import { ChartView } from './chart-view'
import { NewsView } from './news-view'
import { BuyFlowView } from './buy-flow-view'
import { OverviewView } from './overview-view'

type TradingInsightsPanelProps = {
  state: DashboardState
}

export function TradingInsightsPanel({ state }: TradingInsightsPanelProps) {
  switch (state.activeView) {
    case 'CHART':
      return state.chart ? <ChartView chart={state.chart} /> : <OverviewView />

    case 'NEWS':
      return state.news ? <NewsView news={state.news} /> : <OverviewView />

    case 'BUY_FLOW':
      return state.buyFlow ? (
        <BuyFlowView buyFlow={state.buyFlow} />
      ) : (
        <OverviewView />
      )

    default:
      return <OverviewView />
  }
}


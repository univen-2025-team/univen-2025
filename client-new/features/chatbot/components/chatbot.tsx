'use client'

import { useState } from 'react'
import { ChatInterface } from './chat/chat-interface'
import { FeatureArea } from '@/features/components/feature-area'
import { FeatureState, FeatureInstruction, MarketOverviewData } from '@/features/types/features'
import { reduceFeatureState } from '@/features/utils/feature-reducer'

// Default Market Overview Data - giống screenshot
const defaultMarketOverview: MarketOverviewData = {
  indices: [
    { id: 'VNINDEX', name: 'VNINDEX', value: 1635.46, changePercent: 0.25 },
    { id: 'VN30', name: 'VN30 Index', value: 1871.54, changePercent: 0.39 },
    { id: 'VN100', name: 'VN100 Index', value: 1780.35, changePercent: 0.38 },
    { id: 'HNX', name: 'HNX Index', value: 267.61, changePercent: 0.5 },
    { id: 'VNAllshare', name: 'VNAllshare Index', value: 1766.42, changePercent: 0.36 },
    { id: 'VNMidcap', name: 'VNMidcap Index', value: 2296.95, changePercent: 0.73 },
  ],
  mainChart: {
    label: 'VNINDEX',
    points: [
      { time: '09:00', value: 1624.5 },
      { time: '09:30', value: 1626.8 },
      { time: '10:00', value: 1625.2 },
      { time: '10:30', value: 1628.1 },
      { time: '11:00', value: 1630.5 },
      { time: '11:20', value: 1632.8 },
      { time: '13:00', value: 1634.2 },
      { time: '13:30', value: 1633.5 },
      { time: '14:00', value: 1635.0 },
      { time: '14:30', value: 1635.3 },
      { time: '14:40', value: 1635.46 },
    ],
  },
  trendingStocks: [
    { symbol: 'HPG', name: 'Hòa Phát Group', price: 26900, changePercent: 1.32 },
    { symbol: 'MWG', name: 'Mobile World Investment', price: 81400, changePercent: 1.62 },
    { symbol: 'SSI', name: 'SSI Securities', price: 34950, changePercent: 0.0 },
    { symbol: 'TCB', name: 'Techcombank', price: 35100, changePercent: 0.0 },
    { symbol: 'VCB', name: 'Vietcombank', price: 60000, changePercent: 0.33 },
    { symbol: 'VHM', name: 'Vinhomes', price: 93900, changePercent: 0.64 },
    { symbol: 'VIB', name: 'Vietnam International Bank', price: 18500, changePercent: -0.27 },
    { symbol: 'VIC', name: 'Vingroup', price: 211000, changePercent: -0.09 },
  ],
}

const initialState: FeatureState = {
  activeFeature: 'MARKET_OVERVIEW',
  marketOverview: defaultMarketOverview,
}

export default function Chatbot() {
  const [featureState, setFeatureState] = useState<FeatureState>(initialState)

  const handleUiEffects = (effects: FeatureInstruction[]) => {
    setFeatureState((prevState) => reduceFeatureState(prevState, effects))
  }

  const handleBackToMarket = () => {
    setFeatureState((prev) => ({
      ...prev,
      activeFeature: 'MARKET_OVERVIEW',
    }))
  }

  const handleFeatureAction = (instruction: FeatureInstruction) => {
    setFeatureState((prevState) => reduceFeatureState(prevState, [instruction]))
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid h-screen grid-cols-12">
        {/* LEFT: Feature Area (8 cols) */}
        <section className="col-span-8 border-r border-border/50 overflow-y-auto">
          <div className="p-6">
            <FeatureArea
              state={featureState}
              onBack={handleBackToMarket}
              onFeatureAction={handleFeatureAction}
            />
          </div>
        </section>

        {/* RIGHT: Chatbot Panel (4 cols) */}
        <section className="col-span-4 overflow-y-auto">
          <ChatInterface onUiEffects={handleUiEffects} />
        </section>
      </div>
    </div>
  )
}

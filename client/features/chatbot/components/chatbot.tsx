'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from './chat/chat-interface';
import { FeatureArea } from '@/features/components/feature-area';
import { FeatureState, FeatureInstruction, MarketOverviewData } from '@/features/types/features';
import { reduceFeatureState } from '@/features/utils/feature-reducer';
import { getLatestMarketData } from '@/lib/api/market-cache';

// Default Market Overview Data - fallback if API fails
const defaultMarketOverview: MarketOverviewData = {
    indices: [{ id: 'VN30', name: 'VN30 Index', value: 0, changePercent: 0 }],
    mainChart: {
        label: 'VN30',
        points: []
    },
    // Empty array - real data comes from API (topStocksByPrice)
    trendingStocks: []
};

const initialState: FeatureState = {
    activeFeature: 'MARKET_OVERVIEW',
    marketOverview: defaultMarketOverview
};

export default function Chatbot() {
    const [featureState, setFeatureState] = useState<FeatureState>(initialState);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real market data from cached API
    useEffect(() => {
        async function loadMarketData() {
            try {
                setIsLoading(true);
                const cachedData = await getLatestMarketData();

                if (cachedData) {
                    // Transform cached data to MarketOverviewData format
                    // Use topStocksByPrice for the top stocks chart (real data from MongoDB)
                    const topStocks = cachedData.topStocksByPrice || [];

                    const transformedData: MarketOverviewData = {
                        indices: [
                            {
                                id: 'VN30',
                                name: 'VN30 Index',
                                value: cachedData.vn30Index.index,
                                changePercent: cachedData.vn30Index.changePercent
                            }
                        ],
                        mainChart: {
                            label: 'VN30',
                            points: [] // Could be populated from historical data if available
                        },
                        // Use topStocksByPrice for trending stocks (top 10 by price)
                        trendingStocks: topStocks.slice(0, 10).map((stock) => ({
                            symbol: stock.symbol,
                            name: stock.companyName || stock.symbol,
                            price: stock.price,
                            changePercent: stock.changePercent
                        }))
                    };

                    setFeatureState((prev) => ({
                        ...prev,
                        marketOverview: transformedData
                    }));

                    console.log('✅ Loaded cached market data:', cachedData.date);
                } else {
                    console.warn('⚠️ Using fallback market data - cached data not available');
                }
            } catch (error) {
                console.error('❌ Error loading market data:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadMarketData();
    }, []);

    const handleUiEffects = (effects: FeatureInstruction[]) => {
        setFeatureState((prevState) => reduceFeatureState(prevState, effects));
    };

    const handleBackToMarket = () => {
        setFeatureState((prev) => ({
            ...prev,
            activeFeature: 'MARKET_OVERVIEW'
        }));
    };

    const handleFeatureAction = (instruction: FeatureInstruction) => {
        setFeatureState((prevState) => reduceFeatureState(prevState, [instruction]));
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="grid h-screen grid-cols-12">
                {/* LEFT: Feature Area (8 cols) */}
                <section className="col-span-8 border-r border-border/50 overflow-y-auto">
                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-muted-foreground">Loading market data...</div>
                            </div>
                        ) : (
                            <FeatureArea
                                state={featureState}
                                onBack={handleBackToMarket}
                                onFeatureAction={handleFeatureAction}
                            />
                        )}
                    </div>
                </section>

                {/* RIGHT: Chatbot Panel (4 cols) */}
                <section className="col-span-4 overflow-y-auto">
                    <ChatInterface onUiEffects={handleUiEffects} />
                </section>
            </div>
        </div>
    );
}

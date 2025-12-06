'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatInterface } from './chat/chat-interface';
import { FeatureArea } from '@/features/components/feature-area';
import { FeatureState, FeatureInstruction, MarketOverviewData } from '@/features/types/features';
import { reduceFeatureState } from '@/features/utils/feature-reducer';
import { getLatestMarketData } from '@/lib/api/market-cache';
import { MessageCircle, X, GripVertical } from 'lucide-react';

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

// Minimum and maximum width for the chatbox
const MIN_CHAT_WIDTH = 280;
const MAX_CHAT_WIDTH = 600;
const DEFAULT_CHAT_WIDTH = 380;

export default function Chatbot() {
    const [featureState, setFeatureState] = useState<FeatureState>(initialState);
    const [isLoading, setIsLoading] = useState(true);

    // Chatbox resize state
    const [chatWidth, setChatWidth] = useState(DEFAULT_CHAT_WIDTH);
    const [isResizing, setIsResizing] = useState(false);

    // Mobile state
    const [isMobile, setIsMobile] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsChatOpen(false); // Reset on desktop
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle mouse move for resizing
    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = containerRect.right - e.clientX;

            if (newWidth >= MIN_CHAT_WIDTH && newWidth <= MAX_CHAT_WIDTH) {
                setChatWidth(newWidth);
            }
        },
        [isResizing]
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    // Add/remove event listeners for resize
    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    const startResizing = () => {
        setIsResizing(true);
    };

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

    // Mobile: Fullscreen chat popup
    if (isMobile) {
        return (
            <div className="min-h-screen bg-background">
                {/* Main Content */}
                <div className="h-screen overflow-y-auto pb-20">
                    <div className="p-4">
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
                </div>

                {/* Floating Chat Button */}
                <button
                    onClick={() => setIsChatOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center z-40"
                >
                    <MessageCircle className="w-6 h-6" />
                </button>

                {/* Fullscreen Chat Modal */}
                {isChatOpen && (
                    <div className="fixed inset-0 z-50 bg-background">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-primary" />
                                <h2 className="font-semibold text-gray-900">Trợ lý AI</h2>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Chat Content */}
                        <div className="h-[calc(100%-56px)] overflow-hidden">
                            <ChatInterface onUiEffects={handleUiEffects} />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Desktop: Resizable split layout
    return (
        <div className="min-h-screen bg-background" ref={containerRef}>
            <div className="flex h-screen">
                {/* LEFT: Feature Area (flexible width) */}
                <section
                    className="flex-1 border-r border-border/50 overflow-y-auto"
                    style={{ minWidth: 0 }}
                >
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

                {/* Resize Handle */}
                <div
                    className={`w-1.5 bg-gray-200 hover:bg-primary/50 cursor-col-resize flex items-center justify-center transition-colors ${
                        isResizing ? 'bg-primary/50' : ''
                    }`}
                    onMouseDown={startResizing}
                >
                    <div className="flex flex-col gap-1 py-4">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                    </div>
                </div>

                {/* RIGHT: Chatbot Panel (resizable width) */}
                <section
                    className="overflow-y-auto bg-white"
                    style={{ width: chatWidth, minWidth: MIN_CHAT_WIDTH, maxWidth: MAX_CHAT_WIDTH }}
                >
                    <ChatInterface onUiEffects={handleUiEffects} />
                </section>
            </div>
        </div>
    );
}

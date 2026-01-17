import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Lesson {
    id: string;
    title: string;
    symbol: string;
    date: string;
    content: string;
    event_date?: string;
    volatility_type?: string;
}

export type VolatilityType = 'strong_up' | 'strong_down' | 'gap' | 'spike_volume';

interface LearnStockState {
    selectedStock: string;
    generatedLessons: Lesson[];
    isLoading: boolean;
    // New interaction state
    selectedEventDate: string | null;
    visibleVolTypes: Record<VolatilityType, boolean>;

    // Actions
    setSelectedStock: (stock: string) => void;
    setGeneratedLessons: (lessons: Lesson[]) => void;
    setIsLoading: (loading: boolean) => void;
    setSelectedEventDate: (date: string | null) => void;
    toggleVolType: (type: VolatilityType) => void;
    resetFilters: () => void;
}

export const useLearnStockStore = create<LearnStockState>()(
    persist(
        (set) => ({
            selectedStock: 'HPG',
            generatedLessons: [],
            isLoading: false,

            selectedEventDate: null,
            visibleVolTypes: {
                strong_up: true,
                strong_down: true,
                gap: true,
                spike_volume: true
            },

            setSelectedStock: (stock) => set({ selectedStock: stock }),
            setGeneratedLessons: (lessons) => set({ generatedLessons: lessons }),
            setIsLoading: (loading) => set({ isLoading: loading }),

            setSelectedEventDate: (date) => set({ selectedEventDate: date }),
            toggleVolType: (type) => set((state) => ({
                visibleVolTypes: {
                    ...state.visibleVolTypes,
                    [type]: !state.visibleVolTypes[type]
                }
            })),
            resetFilters: () => set({
                selectedEventDate: null,
                visibleVolTypes: {
                    strong_up: true,
                    strong_down: true,
                    gap: true,
                    spike_volume: true
                }
            }),
        }),
        {
            name: 'learn-stock-storage',
            partialize: (state) => ({
                selectedStock: state.selectedStock,
                visibleVolTypes: state.visibleVolTypes
            }),
        }
    )
);

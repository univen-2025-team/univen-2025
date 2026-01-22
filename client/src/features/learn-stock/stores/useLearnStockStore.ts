'use client';

import { create } from 'zustand';

interface LearnStockState {
  selectedStock: string | null;
  setSelectedStock: (stock: string | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  selectedEventDate: string | null;
  setSelectedEventDate: (date: string | null) => void;
  visibleVolTypes: {
    strong_up: boolean;
    strong_down: boolean;
    moderate_up: boolean;
    moderate_down: boolean;
  };
  setVisibleVolType: (type: keyof LearnStockState['visibleVolTypes'], visible: boolean) => void;
  resetFilters: () => void;
}

export const useLearnStockStore = create<LearnStockState>((set) => ({
  selectedStock: null,
  setSelectedStock: (stock) => set({ selectedStock: stock }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  selectedEventDate: null,
  setSelectedEventDate: (date) => set({ selectedEventDate: date }),
  visibleVolTypes: {
    strong_up: true,
    strong_down: true,
    moderate_up: true,
    moderate_down: true,
  },
  setVisibleVolType: (type, visible) =>
    set((state) => ({
      visibleVolTypes: {
        ...state.visibleVolTypes,
        [type]: visible,
      },
    })),
  resetFilters: () =>
    set({
      selectedEventDate: null,
      visibleVolTypes: {
        strong_up: true,
        strong_down: true,
        moderate_up: true,
        moderate_down: true,
      },
    }),
}));

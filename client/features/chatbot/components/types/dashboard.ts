'use client';

import { NewsItem } from '../types';

export type DashboardActiveView = 'OVERVIEW' | 'CHART' | 'NEWS' | 'BUY_FLOW';

export type ChartState = {
    symbol: string;
    timeframe: '1D' | '1W' | '1M' | '1Y';
    points: { time: string; value: number }[];
};

export type NewsState = {
    symbol?: string;
    items: NewsItem[];
};

export type BuyFlowState = {
    symbol: string;
    currentPrice: number;
    currentStepIndex: number;
    steps: Array<{
        id: string;
        title: string;
        description: string;
        helperText?: string;
        fields?: {
            type: 'text' | 'number' | 'select';
            name: string;
            label: string;
            placeholder?: string;
            options?: string[];
        }[];
    }>;
    draftValues: Record<string, any>;
};

export type DashboardState = {
    activeView: DashboardActiveView;
    chart?: ChartState;
    news?: NewsState;
    buyFlow?: BuyFlowState;
};

import { CandleData } from './types';

// Simplified mock data for a realistic looking chart pattern
export const MOCK_CHART_DATA: CandleData[] = [
    { time: '10:00', open: 150, close: 152, high: 153, low: 149, volume: 1200 },
    { time: '10:15', open: 152, close: 151, high: 152.5, low: 150.5, volume: 900 },
    { time: '10:30', open: 151, close: 154, high: 155, low: 151, volume: 1500, event: 'Earning Report', insight: "Price spiked due to better-than-expected earnings." },
    { time: '10:45', open: 154, close: 153, high: 154.5, low: 152, volume: 800 },
    { time: '11:00', open: 153, close: 156, high: 157, low: 152.5, volume: 2100, event: 'Breakout', insight: "High volume breakout above resistance level." },
    { time: '11:15', open: 156, close: 155, high: 156.5, low: 154, volume: 1000 },
    { time: '11:30', open: 155, close: 158, high: 159, low: 155, volume: 1800 },
    { time: '11:45', open: 158, close: 157, high: 158.5, low: 156.5, volume: 950 },
    { time: '12:00', open: 157, close: 160, high: 161, low: 157, volume: 2500, event: 'News Alert', insight: "CEO announces new partnership." },
    { time: '12:15', open: 160, close: 159, high: 160.5, low: 158, volume: 1100 },
];

export const AI_SUGGESTIONS = [
    "Why did the price jump at 11:00?",
    "Is this a bullish trend?",
    "What does 'volume' mean here?",
];

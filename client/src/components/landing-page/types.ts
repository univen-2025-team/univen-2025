import { LucideIcon } from 'lucide-react';

export interface CandleData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    event?: string; // If an event occurred here
    insight?: string; // AI explanation
}

export interface Feature {
    title: string;
    description: string;
    icon: LucideIcon;
}

export interface Lesson {
    title: string;
    duration: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    tags: string[];
}

/**
 * Learn Product Types
 * Type definitions for lesson generation from abnormal price events
 */

// Difficulty levels for lessons
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Age group classification
export type AgeGroup = 'teen' | 'young_adult' | 'adult' | 'senior';

// Daily price data from market API
export interface DailyPriceData {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

// Calculated price change
export interface PriceChangeData {
    date: string;
    closePrice: number;
    previousClose: number;
    changePercent: number;
    volume: number;
    isAbnormal: boolean;
}

// News article from external API
export interface NewsArticle {
    id: string;
    title: string;
    shortContent: string;
    fullContent?: string;
    sourceLink: string;
    publishedAt: string;
    imageUrl?: string;
    relevanceScore?: number;
}

// Abnormal price event with context
export interface AbnormalPriceEvent {
    symbol: string;
    eventDate: string;
    priceChangePercent: number;
    relatedNews: NewsArticle[];
    priceData: {
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
    };
}

// Claude LLM request
export interface LessonGenerationRequest {
    event: AbnormalPriceEvent;
    userAge: number;
    language?: string;
}

// Claude LLM response (structured)
export interface GeneratedLesson {
    lessonTitle: string;
    lessonContent: string;
    newsSummary: string | null;
    keyTakeaways: string[];
    difficultyLevel: DifficultyLevel;
    confidenceScore: number;
}

// Stored lesson document
export interface LearnProductDocument {
    _id?: string;
    symbol: string;
    eventDate: Date;
    priceChangePercent: number;
    lessonTitle: string;
    lessonContent: string;
    newsSummary: string | null;
    keyTakeaways: string[];
    difficultyLevel: DifficultyLevel;
    confidenceScore: number;
    userAgeGroup?: AgeGroup;
    createdAt: Date;
    updatedAt: Date;
}

// API query parameters
export interface LearnProductQuery {
    symbol: string;
    userAge: number;
    threshold?: number;
    lookbackDays?: number;
    limit?: number;
}

// API response
export interface LearnProductResponse {
    symbol: string;
    lessons: LearnProductDocument[];
    total: number;
    generated: number;
    cached: number;
}

// Utility: classify age into group
export function classifyAgeGroup(age: number): AgeGroup {
    if (age < 18) return 'teen';
    if (age < 30) return 'young_adult';
    if (age < 55) return 'adult';
    return 'senior';
}

// Utility: get Vietnamese label for age group
export function getAgeGroupLabel(ageGroup: AgeGroup): string {
    const labels: Record<AgeGroup, string> = {
        teen: 'Thanh thiếu niên',
        young_adult: 'Người trẻ',
        adult: 'Người trưởng thành',
        senior: 'Người cao tuổi'
    };
    return labels[ageGroup];
}

import type { Lesson } from '@/lib/types';
import type { LearnProductLesson } from '@/lib/api/market-cache';

/**
 * Derive volatility_type from priceChangePercent for LessonsList badges.
 */
export function deriveVolatilityType(priceChangePercent: number): string {
    if (priceChangePercent >= 5) return 'strong_up';
    if (priceChangePercent > 0) return 'moderate_up';
    if (priceChangePercent <= -5) return 'strong_down';
    return 'moderate_down';
}

/**
 * Map API LearnProductLesson to Lesson shape for LessonsList.
 */
export function mapLearnProductToLesson(doc: LearnProductLesson, symbol: string): Lesson {
    const eventDate =
        typeof doc.eventDate === 'string'
            ? doc.eventDate.slice(0, 10)
            : new Date(doc.eventDate).toISOString().slice(0, 10);

    return {
        id: String(doc._id),
        symbol,
        event_date: eventDate,
        volatility_type: deriveVolatilityType(doc.priceChangePercent),
        news_summary: doc.newsSummary ?? '',
        lesson_title: doc.lessonTitle,
        lesson_content: doc.lessonContent,
        key_takeaways: doc.keyTakeaways ?? [],
        difficulty_level: doc.difficultyLevel,
        confidence_score: doc.confidenceScore
    };
}

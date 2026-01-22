/**
 * Learn Product Service
 * Orchestrates lesson generation from abnormal price events
 */

import LoggerService from './logger.service';
import PriceAnalysisService from './price-analysis.service';
import NewsService from './news.service';
import GroqService from './groq.service';
import LearnProductRepository from '@/repositories/learn-product.repository';
import type {
    LearnProductQuery,
    LearnProductResponse,
    AbnormalPriceEvent,
    GeneratedLesson,
    AgeGroup,
    LearnProductDocument
} from '@/types/learn-product.types';
import { classifyAgeGroup } from '@/types/learn-product.types';
import { parseISO } from 'date-fns';

/** Raw DB row (e.g. from .lean()); _id may be ObjectId. */
type LearnProductRaw = Omit<LearnProductDocument, '_id'> & { _id?: unknown };

const CONFIG = {
    DEFAULT_THRESHOLD: 3,
    DEFAULT_LOOKBACK_DAYS: 365,
    DEFAULT_LIMIT: 10,
    MAX_EVENTS_TO_PROCESS: 20,
    GENERATION_DELAY_MS: 500 // Groq có rate limit cao hơn
};

export default class LearnProductService {
    private static logger = LoggerService.getInstance();

    /**
     * Convert raw DB row to LearnProductDocument.
     * Converts _id from ObjectId to string for API response.
     */
    private static toLearnProductDocument(doc: LearnProductRaw): LearnProductDocument {
        const id = doc._id;
        return {
            _id: id != null ? (typeof id === 'string' ? id : String(id)) : undefined,
            symbol: doc.symbol,
            eventDate: doc.eventDate,
            priceChangePercent: doc.priceChangePercent,
            lessonTitle: doc.lessonTitle,
            lessonContent: doc.lessonContent,
            newsSummary: doc.newsSummary,
            keyTakeaways: doc.keyTakeaways,
            difficultyLevel: doc.difficultyLevel,
            confidenceScore: doc.confidenceScore,
            userAgeGroup: doc.userAgeGroup,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        };
    }

    /**
     * Main entry: get or generate lessons for a symbol
     */
    static async getLessons(query: LearnProductQuery): Promise<LearnProductResponse> {
        const {
            symbol,
            userAge,
            threshold = CONFIG.DEFAULT_THRESHOLD,
            lookbackDays = CONFIG.DEFAULT_LOOKBACK_DAYS,
            limit = CONFIG.DEFAULT_LIMIT
        } = query;

        const upperSymbol = symbol.toUpperCase();
        const ageGroup = classifyAgeGroup(userAge);

        this.logger.info(
            `Processing learn request: symbol=${upperSymbol}, age=${userAge}, ` +
            `threshold=${threshold}%, lookback=${lookbackDays}d`
        );

        // Step 1: Check existing lessons in DB
        const existingLessonsRaw = (await LearnProductRepository.findBySymbol(upperSymbol, limit)) as LearnProductRaw[];
        const existingLessons: LearnProductDocument[] = existingLessonsRaw.map((doc) =>
            this.toLearnProductDocument(doc)
        );

        if (existingLessons.length >= limit) {
            this.logger.info(`Returning ${existingLessons.length} cached lessons for ${upperSymbol}`);
            return {
                symbol: upperSymbol,
                lessons: existingLessons,
                total: existingLessons.length,
                generated: 0,
                cached: existingLessons.length
            };
        }

        // Step 2: Analyze price movements
        const abnormalEvents = await PriceAnalysisService.analyze(upperSymbol, {
            thresholdPercent: threshold,
            lookbackDays
        });

        if (abnormalEvents.length === 0) {
            this.logger.info(`No abnormal events found for ${upperSymbol}`);
            return {
                symbol: upperSymbol,
                lessons: existingLessons,
                total: existingLessons.length,
                generated: 0,
                cached: existingLessons.length
            };
        }

        // Step 3: Filter out already processed events
        const existingDates = await LearnProductRepository.findExistingDates(
            upperSymbol,
            abnormalEvents.map(e => parseISO(e.eventDate))
        );

        const newEvents = abnormalEvents.filter(
            e => !existingDates.has(e.eventDate)
        ).slice(0, CONFIG.MAX_EVENTS_TO_PROCESS);

        if (newEvents.length === 0) {
            this.logger.info(`All events already processed for ${upperSymbol}`);
            return {
                symbol: upperSymbol,
                lessons: existingLessons,
                total: existingLessons.length,
                generated: 0,
                cached: existingLessons.length
            };
        }

        this.logger.info(`Processing ${newEvents.length} new events for ${upperSymbol}`);

        // Step 4: Fetch news for all events (batch)
        const newsMap = await NewsService.fetchForEvents(
            upperSymbol,
            newEvents.map(e => e.eventDate)
        );

        // Step 5: Build complete events with news
        const completeEvents: AbnormalPriceEvent[] = newEvents.map(event => ({
            ...event,
            relatedNews: newsMap.get(event.eventDate) || []
        }));

        // Step 6: Generate lessons using Groq
        const generatedLessons = await this.generateAndSaveLessons(
            completeEvents,
            userAge,
            ageGroup
        );

        // Step 7: Fetch updated lessons from DB
        const allLessonsRaw = (await LearnProductRepository.findBySymbol(upperSymbol, limit)) as LearnProductRaw[];
        const allLessons: LearnProductDocument[] = allLessonsRaw.map((doc) =>
            this.toLearnProductDocument(doc)
        );

        return {
            symbol: upperSymbol,
            lessons: allLessons,
            total: allLessons.length,
            generated: generatedLessons,
            cached: existingLessons.length
        };
    }

    /**
     * Generate lessons and save to DB
     */
    private static async generateAndSaveLessons(
        events: AbnormalPriceEvent[],
        userAge: number,
        ageGroup: AgeGroup
    ): Promise<number> {
        if (!GroqService.isAvailable()) {
            this.logger.warn('Groq API not configured, skipping lesson generation');
            return 0;
        }

        let generatedCount = 0;

        for (const event of events) {
            try {
                // Generate lesson
                const lesson = await GroqService.generateLesson({
                    event,
                    userAge
                });

                // Save to DB (upsert for idempotency)
                await LearnProductRepository.upsert({
                    symbol: event.symbol,
                    eventDate: parseISO(event.eventDate),
                    priceChangePercent: event.priceChangePercent,
                    lesson,
                    userAgeGroup: ageGroup
                });

                generatedCount++;

                // Rate limiting
                await this.delay(CONFIG.GENERATION_DELAY_MS);

            } catch (error) {
                this.logger.error(
                    `Failed to generate/save lesson for ${event.symbol} on ${event.eventDate}`,
                    error as Error
                );
                // Continue with next event
            }
        }

        this.logger.info(`Generated and saved ${generatedCount} lessons`);
        return generatedCount;
    }

    /**
     * Force regenerate lessons for a symbol (admin use)
     */
    static async regenerateLessons(
        symbol: string,
        userAge: number,
        options: {
            threshold?: number;
            lookbackDays?: number;
            deleteExisting?: boolean;
        } = {}
    ): Promise<LearnProductResponse> {
        const upperSymbol = symbol.toUpperCase();

        if (options.deleteExisting) {
            const deleted = await LearnProductRepository.deleteBySymbol(upperSymbol);
            this.logger.info(`Deleted ${deleted} existing lessons for ${upperSymbol}`);
        }

        return this.getLessons({
            symbol: upperSymbol,
            userAge,
            threshold: options.threshold,
            lookbackDays: options.lookbackDays
        });
    }

    /**
     * Utility: delay helper
     */
    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

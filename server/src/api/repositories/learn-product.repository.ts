/**
 * Learn Product Repository
 * Data access layer for learn_product collection
 */

import LearnProductModel, { ILearnProduct } from '@/models/learn-product.model';
import type { LearnProductDocument, GeneratedLesson, AgeGroup } from '@/types/learn-product.types';

export default class LearnProductRepository {
    /**
     * Find lessons by symbol, sorted by eventDate desc
     */
    static async findBySymbol(
        symbol: string,
        limit: number = 20
    ): Promise<ILearnProduct[]> {
        return LearnProductModel
            .find({ symbol: symbol.toUpperCase() })
            .sort({ eventDate: -1 })
            .limit(limit)
            .lean()
            .exec();
    }

    /**
     * Find a specific lesson by symbol and event date
     */
    static async findOne(
        symbol: string,
        eventDate: Date
    ): Promise<ILearnProduct | null> {
        return LearnProductModel
            .findOne({
                symbol: symbol.toUpperCase(),
                eventDate
            })
            .lean()
            .exec();
    }

    /**
     * Check if lesson exists (for idempotency check)
     */
    static async exists(symbol: string, eventDate: Date): Promise<boolean> {
        const count = await LearnProductModel.countDocuments({
            symbol: symbol.toUpperCase(),
            eventDate
        });
        return count > 0;
    }

    /**
     * Find existing lessons for multiple event dates
     */
    static async findExistingDates(
        symbol: string,
        eventDates: Date[]
    ): Promise<Set<string>> {
        const existing = await LearnProductModel
            .find({
                symbol: symbol.toUpperCase(),
                eventDate: { $in: eventDates }
            })
            .select('eventDate')
            .lean()
            .exec();

        return new Set(
            existing.map(doc => doc.eventDate.toISOString().split('T')[0])
        );
    }

    /**
     * Create a new lesson document
     */
    static async create(data: {
        symbol: string;
        eventDate: Date;
        priceChangePercent: number;
        lesson: GeneratedLesson;
        userAgeGroup?: AgeGroup;
    }): Promise<ILearnProduct> {
        const doc = new LearnProductModel({
            symbol: data.symbol.toUpperCase(),
            eventDate: data.eventDate,
            priceChangePercent: data.priceChangePercent,
            lessonTitle: data.lesson.lessonTitle,
            lessonContent: data.lesson.lessonContent,
            newsSummary: data.lesson.newsSummary,
            keyTakeaways: data.lesson.keyTakeaways,
            difficultyLevel: data.lesson.difficultyLevel,
            confidenceScore: data.lesson.confidenceScore,
            userAgeGroup: data.userAgeGroup
        });

        return doc.save();
    }

    /**
     * Upsert lesson (create or update if exists)
     */
    static async upsert(data: {
        symbol: string;
        eventDate: Date;
        priceChangePercent: number;
        lesson: GeneratedLesson;
        userAgeGroup?: AgeGroup;
    }): Promise<ILearnProduct> {
        const filter = {
            symbol: data.symbol.toUpperCase(),
            eventDate: data.eventDate
        };

        const update = {
            $set: {
                priceChangePercent: data.priceChangePercent,
                lessonTitle: data.lesson.lessonTitle,
                lessonContent: data.lesson.lessonContent,
                newsSummary: data.lesson.newsSummary,
                keyTakeaways: data.lesson.keyTakeaways,
                difficultyLevel: data.lesson.difficultyLevel,
                confidenceScore: data.lesson.confidenceScore,
                userAgeGroup: data.userAgeGroup
            },
            $setOnInsert: {
                symbol: data.symbol.toUpperCase(),
                eventDate: data.eventDate
            }
        };

        const result = await LearnProductModel.findOneAndUpdate(
            filter,
            update,
            { upsert: true, new: true, lean: true }
        );

        return result as ILearnProduct;
    }

    /**
     * Bulk insert lessons (skip duplicates)
     */
    static async bulkCreate(
        lessons: Array<{
            symbol: string;
            eventDate: Date;
            priceChangePercent: number;
            lesson: GeneratedLesson;
            userAgeGroup?: AgeGroup;
        }>
    ): Promise<{ inserted: number; skipped: number }> {
        if (lessons.length === 0) {
            return { inserted: 0, skipped: 0 };
        }

        const docs = lessons.map(data => ({
            symbol: data.symbol.toUpperCase(),
            eventDate: data.eventDate,
            priceChangePercent: data.priceChangePercent,
            lessonTitle: data.lesson.lessonTitle,
            lessonContent: data.lesson.lessonContent,
            newsSummary: data.lesson.newsSummary,
            keyTakeaways: data.lesson.keyTakeaways,
            difficultyLevel: data.lesson.difficultyLevel,
            confidenceScore: data.lesson.confidenceScore,
            userAgeGroup: data.userAgeGroup
        }));

        try {
            const result = await LearnProductModel.insertMany(docs, {
                ordered: false // Continue on duplicate key errors
            });
            return { inserted: result.length, skipped: lessons.length - result.length };
        } catch (error: any) {
            // Handle duplicate key errors gracefully
            if (error.code === 11000 && error.insertedDocs) {
                return {
                    inserted: error.insertedDocs.length,
                    skipped: lessons.length - error.insertedDocs.length
                };
            }
            throw error;
        }
    }

    /**
     * Delete lessons by symbol
     */
    static async deleteBySymbol(symbol: string): Promise<number> {
        const result = await LearnProductModel.deleteMany({
            symbol: symbol.toUpperCase()
        });
        return result.deletedCount;
    }

    /**
     * Count lessons by symbol
     */
    static async countBySymbol(symbol: string): Promise<number> {
        return LearnProductModel.countDocuments({
            symbol: symbol.toUpperCase()
        });
    }

    /**
     * Find lesson by ID
     */
    static async findById(id: string): Promise<ILearnProduct | null> {
        try {
            return LearnProductModel.findById(id).lean().exec();
        } catch (error) {
            // Invalid ObjectId format
            return null;
        }
    }
}

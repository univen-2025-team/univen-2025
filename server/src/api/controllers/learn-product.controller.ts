/**
 * Learn Product Controller
 * HTTP handlers for lesson generation API
 */

import { Request, Response, NextFunction } from 'express';
import { OkResponse } from '@/response/success.response';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response';
import LearnProductService from '@/services/learn-product.service';
import LearnProductRepository from '@/repositories/learn-product.repository';
import type { LearnProductQuery } from '@/types/learn-product.types';

export default class LearnProductController {
    /**
     * GET /api/learn/product?symbol=XXX&userAge=YY
     * Get or generate lessons for a stock symbol
     */
    static async getLessons(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol, userAge, threshold, lookbackDays, limit } = req.query;

            // Validate required params
            if (!symbol || typeof symbol !== 'string') {
                throw new BadRequestErrorResponse({
                    message: 'Symbol parameter is required'
                });
            }

            if (!userAge) {
                throw new BadRequestErrorResponse({
                    message: 'userAge parameter is required'
                });
            }

            const parsedAge = parseInt(userAge as string, 10);
            if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
                throw new BadRequestErrorResponse({
                    message: 'userAge must be a valid number between 1 and 120'
                });
            }

            // Build query
            const query: LearnProductQuery = {
                symbol: symbol.toUpperCase(),
                userAge: parsedAge,
                threshold: threshold ? parseFloat(threshold as string) : undefined,
                lookbackDays: lookbackDays ? parseInt(lookbackDays as string, 10) : undefined,
                limit: limit ? parseInt(limit as string, 10) : undefined
            };

            // Validate optional params
            if (query.threshold !== undefined && (query.threshold < 1 || query.threshold > 50)) {
                throw new BadRequestErrorResponse({
                    message: 'threshold must be between 1 and 50'
                });
            }

            if (query.lookbackDays !== undefined && (query.lookbackDays < 30 || query.lookbackDays > 730)) {
                throw new BadRequestErrorResponse({
                    message: 'lookbackDays must be between 30 and 730'
                });
            }

            if (query.limit !== undefined && (query.limit < 1 || query.limit > 50)) {
                throw new BadRequestErrorResponse({
                    message: 'limit must be between 1 and 50'
                });
            }

            // Get lessons
            const result = await LearnProductService.getLessons(query);

            new OkResponse({
                message: result.lessons.length > 0
                    ? `Found ${result.total} lessons for ${result.symbol}`
                    : `No lessons available for ${result.symbol}`,
                metadata: result
            }).send(res);

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/learn/product/:symbol
     * Get existing lessons for a symbol (no generation)
     */
    static async getLessonsBySymbol(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol } = req.params;
            const { limit } = req.query;

            if (!symbol) {
                throw new BadRequestErrorResponse({
                    message: 'Symbol parameter is required'
                });
            }

            const parsedLimit = limit ? parseInt(limit as string, 10) : 20;

            const lessons = await LearnProductRepository.findBySymbol(
                symbol.toUpperCase(),
                parsedLimit
            );

            new OkResponse({
                message: `Found ${lessons.length} lessons for ${symbol.toUpperCase()}`,
                metadata: {
                    symbol: symbol.toUpperCase(),
                    lessons,
                    total: lessons.length
                }
            }).send(res);

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/learn/product/regenerate
     * Force regenerate lessons (admin endpoint)
     */
    static async regenerateLessons(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol, userAge, threshold, lookbackDays, deleteExisting } = req.body;

            if (!symbol || typeof symbol !== 'string') {
                throw new BadRequestErrorResponse({
                    message: 'symbol is required in request body'
                });
            }

            if (!userAge || typeof userAge !== 'number') {
                throw new BadRequestErrorResponse({
                    message: 'userAge is required in request body'
                });
            }

            const result = await LearnProductService.regenerateLessons(
                symbol,
                userAge,
                {
                    threshold,
                    lookbackDays,
                    deleteExisting: deleteExisting === true
                }
            );

            new OkResponse({
                message: `Regenerated ${result.generated} lessons for ${result.symbol}`,
                metadata: result
            }).send(res);

        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/learn/product/:symbol
     * Delete all lessons for a symbol (admin endpoint)
     */
    static async deleteLessons(req: Request, res: Response, next: NextFunction) {
        try {
            const { symbol } = req.params;

            if (!symbol) {
                throw new BadRequestErrorResponse({
                    message: 'Symbol parameter is required'
                });
            }

            const deletedCount = await LearnProductRepository.deleteBySymbol(
                symbol.toUpperCase()
            );

            new OkResponse({
                message: `Deleted ${deletedCount} lessons for ${symbol.toUpperCase()}`,
                metadata: {
                    symbol: symbol.toUpperCase(),
                    deletedCount
                }
            }).send(res);

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/learn/lesson/:id
     * Get a specific lesson by ID
     */
    static async getLessonById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;

            if (!id) {
                throw new BadRequestErrorResponse({
                    message: 'Lesson ID is required'
                });
            }

            const lesson = await LearnProductRepository.findById(id);

            if (!lesson) {
                throw new NotFoundErrorResponse({
                    message: 'Lesson not found'
                });
            }

            new OkResponse({
                message: 'Lesson found',
                metadata: lesson
            }).send(res);

        } catch (error) {
            next(error);
        }
    }
}

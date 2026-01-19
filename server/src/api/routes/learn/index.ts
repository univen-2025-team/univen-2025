/**
 * Learn Product Routes
 * API endpoints for lesson generation from price events
 */

import { Router } from 'express';
import LearnProductController from '@/controllers/learn-product.controller';

const router = Router();

// GET /api/learn/product?symbol=XXX&userAge=YY
// Main endpoint: get or generate lessons
router.get('/product', LearnProductController.getLessons);

// GET /api/learn/lesson/:id
// Get a specific lesson by ID
router.get('/lesson/:id', LearnProductController.getLessonById);

// GET /api/learn/product/:symbol
// Get existing lessons only (no generation)
router.get('/product/:symbol', LearnProductController.getLessonsBySymbol);

// POST /api/learn/product/regenerate
// Force regenerate lessons (admin)
router.post('/product/regenerate', LearnProductController.regenerateLessons);

// DELETE /api/learn/product/:symbol
// Delete lessons for a symbol (admin)
router.delete('/product/:symbol', LearnProductController.deleteLessons);

export default router;

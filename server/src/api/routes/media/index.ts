import mediaController from '@/controllers/media.controller.js';
import catchError from '@/middlewares/catchError.middleware.js';
import { Router } from 'express';

const mediaRoute = Router();

/* ---------------------------------------------------------- */
/*                      Public routes                         */
/* ---------------------------------------------------------- */
// Get media file by ID (public - no auth required for serving images)
mediaRoute.get('/:id', catchError(mediaController.getMediaById));

export default mediaRoute;

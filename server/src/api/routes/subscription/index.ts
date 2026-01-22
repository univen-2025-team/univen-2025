import { Router } from 'express';

/* --------------------- Controllers -------------------- */
import SubscriptionController from '@/controllers/subscription.controller.js';

/* --------------------- Middlewares -------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';

const subscriptionRoute = Router();
const subscriptionAuthRoute = Router();

/* ------------------------------------------------------ */
/*                     Public Routes                      */
/* ------------------------------------------------------ */

// Get all available plans (public)
subscriptionRoute.get('/plans', catchError(SubscriptionController.getPlans));

/* ------------------------------------------------------ */
/*                  Authenticated Routes                  */
/* ------------------------------------------------------ */
subscriptionRoute.use(authenticate, subscriptionAuthRoute);

// Get current user's subscription
subscriptionAuthRoute.get('/me', catchError(SubscriptionController.getCurrentSubscription));

// Get user's subscription limits
subscriptionAuthRoute.get('/me/limits', catchError(SubscriptionController.getLimits));

// Subscribe to a plan (bypass payment)
subscriptionAuthRoute.post('/subscribe', catchError(SubscriptionController.subscribe));

// Change subscription tier
subscriptionAuthRoute.patch('/change', catchError(SubscriptionController.changeSubscription));

// Reset portfolio
subscriptionAuthRoute.post('/reset-portfolio', catchError(SubscriptionController.resetPortfolio));

// Check if can reset portfolio
subscriptionAuthRoute.get('/can-reset', catchError(SubscriptionController.canResetPortfolio));

export default subscriptionRoute;

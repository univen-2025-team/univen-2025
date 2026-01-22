import type { RequestHandler } from 'express';
import { subscriptionService } from '@/services/subscription.service.js';
import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { SubscriptionTier } from '@/enums/subscription.enum.js';
import { BadRequestErrorResponse } from '@/response/error.response.js';

export default class SubscriptionController {
    /**
     * Get all available subscription plans
     */
    public static getPlans: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get subscription plans success!',
            metadata: await subscriptionService.getPlans()
        }).send(res);
    };

    /**
     * Get user's current subscription
     */
    public static getCurrentSubscription: RequestHandler = async (req, res, _) => {
        const userId = req.userId as string;
        const subscription = await subscriptionService.getUserSubscription(userId);

        new OkResponse({
            message: 'Get current subscription success!',
            metadata: subscription ?? undefined
        }).send(res);
    };

    /**
     * Get user's subscription limits
     */
    public static getLimits: RequestHandler = async (req, res, _) => {
        const userId = req.userId as string;

        new OkResponse({
            message: 'Get subscription limits success!',
            metadata: await subscriptionService.getUserLimits(userId)
        }).send(res);
    };

    /**
     * Subscribe to a plan (bypass payment)
     */
    public static subscribe: RequestHandler = async (req, res, _) => {
        const userId = req.userId as string;
        const { tier } = req.body;

        if (!tier || !Object.values(SubscriptionTier).includes(tier)) {
            throw new BadRequestErrorResponse({
                message: `Invalid tier. Must be one of: ${Object.values(SubscriptionTier).join(', ')}`
            });
        }

        await subscriptionService.subscribe(userId, tier as SubscriptionTier);

        new CreatedResponse({
            message: `Successfully subscribed to ${tier} plan!`,
            metadata: {
                tier,
                subscription: await subscriptionService.getUserSubscription(userId),
                limits: await subscriptionService.getUserLimits(userId)
            }
        }).send(res);
    };

    /**
     * Change subscription tier (upgrade/downgrade, bypass payment)
     */
    public static changeSubscription: RequestHandler = async (req, res, _) => {
        const userId = req.userId as string;
        const { tier } = req.body;

        if (!tier || !Object.values(SubscriptionTier).includes(tier)) {
            throw new BadRequestErrorResponse({
                message: `Invalid tier. Must be one of: ${Object.values(SubscriptionTier).join(', ')}`
            });
        }

        await subscriptionService.changeSubscription(userId, tier as SubscriptionTier);

        new OkResponse({
            message: `Successfully changed to ${tier} plan!`,
            metadata: {
                tier,
                subscription: await subscriptionService.getUserSubscription(userId),
                limits: await subscriptionService.getUserLimits(userId)
            }
        }).send(res);
    };

    /**
     * Reset portfolio (subject to tier limits)
     */
    public static resetPortfolio: RequestHandler = async (req, res, _) => {
        const userId = req.userId as string;

        await subscriptionService.resetPortfolio(userId);

        new OkResponse({
            message: 'Portfolio reset success!'
        }).send(res);
    };

    /**
     * Check if user can reset portfolio
     */
    public static canResetPortfolio: RequestHandler = async (req, res, _) => {
        const userId = req.userId as string;

        const canReset = await subscriptionService.canResetPortfolio(userId);

        new OkResponse({
            message: 'Check reset portfolio success!',
            metadata: { canReset }
        }).send(res);
    };
}

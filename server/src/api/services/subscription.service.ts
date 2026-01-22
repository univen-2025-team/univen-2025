import {
    SubscriptionTier,
    SubscriptionStatus,
    SUBSCRIPTION_LIMITS,
    SUBSCRIPTION_PRICING,
    MarketAccess
} from '@/enums/subscription.enum.js';
import { subscriptionPlanModel } from '@/models/subscription-plan.model.js';
import { userSubscriptionModel } from '@/models/user-subscription.model.js';
import { userModel } from '@/models/user.model.js';
import { BadRequestErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';
import { RoleNames } from '@/enums/rbac.enum.js';
import { findOneAndUpdateRole, findRoles } from '@/models/repository/rbac/index.js';

class SubscriptionService {
    /**
     * Initialize default subscription plans in database
     */
    async initSubscriptionPlans(): Promise<void> {
        const plans = [
            {
                tier: SubscriptionTier.FREEMIUM,
                name: 'Freemium',
                description: 'Basic access for curious newbies',
                price: SUBSCRIPTION_PRICING[SubscriptionTier.FREEMIUM],
                ...SUBSCRIPTION_LIMITS[SubscriptionTier.FREEMIUM],
                is_active: true
            },
            {
                tier: SubscriptionTier.STANDARD,
                name: 'Standard',
                description: 'For students and beginners - 99,000 VND/month',
                price: SUBSCRIPTION_PRICING[SubscriptionTier.STANDARD],
                ...SUBSCRIPTION_LIMITS[SubscriptionTier.STANDARD],
                is_active: true
            },
            {
                tier: SubscriptionTier.ADVANCED,
                name: 'Advanced',
                description: 'For serious learners - 349,000 VND/month',
                price: SUBSCRIPTION_PRICING[SubscriptionTier.ADVANCED],
                ...SUBSCRIPTION_LIMITS[SubscriptionTier.ADVANCED],
                is_active: true
            },
            {
                tier: SubscriptionTier.ACADEMIC,
                name: 'Academic License',
                description: 'Volume-based licensing for universities and training centers',
                price: SUBSCRIPTION_PRICING[SubscriptionTier.ACADEMIC],
                ...SUBSCRIPTION_LIMITS[SubscriptionTier.ACADEMIC],
                is_active: true
            }
        ];

        for (const plan of plans) {
            await subscriptionPlanModel.findOneAndUpdate(
                { tier: plan.tier },
                {
                    $set: {
                        ...plan,
                        virtual_capital: plan.virtualCapital,
                        portfolio_resets_per_month: plan.portfolioResetsPerMonth,
                        max_portfolios: plan.maxPortfolios,
                        market_access: plan.marketAccess,
                        ai_level: plan.aiLevel,
                        social_trading_limit: plan.socialTradingLimit,
                        ad_free: plan.adFree,
                        certification_type: plan.certification
                    }
                },
                { upsert: true, new: true }
            );
        }

        console.log('[SubscriptionService] Initialized subscription plans');
    }

    /**
     * Get all available subscription plans
     */
    async getPlans() {
        return subscriptionPlanModel.find({ is_active: true }).lean();
    }

    /**
     * Get a specific plan by tier
     */
    async getPlanByTier(tier: SubscriptionTier) {
        const plan = await subscriptionPlanModel.findOne({ tier, is_active: true }).lean();
        if (!plan) {
            throw new NotFoundErrorResponse({ message: `Plan ${tier} not found` });
        }
        return plan;
    }

    /**
     * Get user's current subscription
     */
    async getUserSubscription(userId: string) {
        const subscription = await userSubscriptionModel
            .findOne({
                user_id: userId,
                status: SubscriptionStatus.ACTIVE
            })
            .populate('plan_id')
            .lean();

        return subscription;
    }

    /**
     * Subscribe user to a plan
     */
    async subscribe(userId: string, tier: SubscriptionTier): Promise<void> {
        const plan = await this.getPlanByTier(tier);
        const user = await userModel.findById(userId);

        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found' });
        }

        // Cancel existing subscription if any
        await userSubscriptionModel.updateMany(
            { user_id: userId, status: SubscriptionStatus.ACTIVE },
            { $set: { status: SubscriptionStatus.CANCELLED } }
        );

        // Create new subscription
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month subscription

        const subscription = await userSubscriptionModel.create({
            user_id: userId,
            plan_id: plan._id,
            status: SubscriptionStatus.ACTIVE,
            started_at: now,
            expires_at: expiresAt,
            current_period_start: now,
            portfolio_resets_used: 0
        });

        // Update user's subscription tier and balance
        const newBalance = SUBSCRIPTION_LIMITS[tier].virtualCapital;
        await userModel.findByIdAndUpdate(userId, {
            $set: {
                subscription_tier: tier,
                subscription_id: subscription._id,
                balance: newBalance === -1 ? user.balance : newBalance // Keep balance if unlimited
            }
        });

        console.log(`[SubscriptionService] User ${userId} subscribed to ${tier}`);
    }

    /**
     * Upgrade or downgrade user's subscription
     */
    async changeSubscription(userId: string, newTier: SubscriptionTier): Promise<void> {
        const user = await userModel.findById(userId);
        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found' });
        }

        if (user.subscription_tier === newTier) {
            throw new BadRequestErrorResponse({ message: 'Already subscribed to this tier' });
        }

        await this.subscribe(userId, newTier);
    }

    /**
     * Check if user can reset portfolio this month
     */
    async canResetPortfolio(userId: string): Promise<boolean> {
        const user = await userModel.findById(userId).lean();
        if (!user) return false;

        const limits = SUBSCRIPTION_LIMITS[user.subscription_tier as SubscriptionTier];
        if (limits.portfolioResetsPerMonth === -1) return true; // Unlimited

        const subscription = await this.getUserSubscription(userId);
        if (!subscription) return limits.portfolioResetsPerMonth > 0;

        return subscription.portfolio_resets_used < limits.portfolioResetsPerMonth;
    }

    /**
     * Reset user's portfolio (balance)
     */
    async resetPortfolio(userId: string): Promise<void> {
        const canReset = await this.canResetPortfolio(userId);
        if (!canReset) {
            throw new BadRequestErrorResponse({
                message: 'Portfolio reset limit reached for this month'
            });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found' });
        }

        const tier = user.subscription_tier as SubscriptionTier;
        const limits = SUBSCRIPTION_LIMITS[tier];
        const newBalance = limits.virtualCapital === -1 ? 1_000_000_000 : limits.virtualCapital; // 1B default for unlimited

        await userModel.findByIdAndUpdate(userId, { $set: { balance: newBalance } });

        // Increment reset counter
        await userSubscriptionModel.findOneAndUpdate(
            { user_id: userId, status: SubscriptionStatus.ACTIVE },
            { $inc: { portfolio_resets_used: 1 } }
        );

        console.log(`[SubscriptionService] Reset portfolio for user ${userId}`);
    }

    /**
     * Check if user has access to a specific market
     */
    async hasMarketAccess(userId: string, market: MarketAccess): Promise<boolean> {
        const user = await userModel.findById(userId).lean();
        if (!user) return false;

        const tier = user.subscription_tier as SubscriptionTier;
        const limits = SUBSCRIPTION_LIMITS[tier];

        return [...limits.marketAccess].includes(market);
    }

    /**
     * Get user's subscription limits
     */
    async getUserLimits(userId: string) {
        const user = await userModel.findById(userId).lean();
        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found' });
        }

        const tier = (user.subscription_tier as SubscriptionTier) || SubscriptionTier.FREEMIUM;
        return {
            tier,
            limits: SUBSCRIPTION_LIMITS[tier],
            pricing: SUBSCRIPTION_PRICING[tier]
        };
    }

    /**
     * Get role name for subscription tier
     */
    getRoleNameForTier(tier: SubscriptionTier): RoleNames {
        const tierToRole: Record<SubscriptionTier, RoleNames> = {
            [SubscriptionTier.FREEMIUM]: RoleNames.USER_FREEMIUM,
            [SubscriptionTier.STANDARD]: RoleNames.USER_STANDARD,
            [SubscriptionTier.ADVANCED]: RoleNames.USER_ADVANCED,
            [SubscriptionTier.ACADEMIC]: RoleNames.USER_ACADEMIC
        };
        return tierToRole[tier];
    }
}

export const subscriptionService = new SubscriptionService();
export default SubscriptionService;

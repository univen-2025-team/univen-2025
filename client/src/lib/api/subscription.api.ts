import axiosInstance from '../axios';

// Types
export type SubscriptionTier = 'freemium' | 'standard' | 'advanced' | 'academic';

export interface SubscriptionPlan {
    _id: string;
    tier: SubscriptionTier;
    name: string;
    description: string;
    price: number;
    virtual_capital: number;
    portfolio_resets_per_month: number;
    max_portfolios: number;
    market_access: string[];
    ai_level: string;
    social_trading_limit: number;
    ad_free: boolean;
    certification_type: string;
    is_active: boolean;
}

export interface UserSubscription {
    _id: string;
    user_id: string;
    plan_id: SubscriptionPlan;
    status: 'active' | 'expired' | 'cancelled' | 'trial';
    started_at: string;
    expires_at: string;
    portfolio_resets_used: number;
    current_period_start: string;
}

export interface SubscriptionLimits {
    tier: SubscriptionTier;
    limits: {
        virtualCapital: number;
        portfolioResetsPerMonth: number;
        maxPortfolios: number;
        marketAccess: string[];
        aiLevel: string;
        socialTradingLimit: number;
        adFree: boolean;
        certification: string;
    };
    pricing: number;
}

export interface SubscribeResponse {
    tier: SubscriptionTier;
    subscription: UserSubscription;
    limits: SubscriptionLimits;
}

/**
 * Subscription API Service
 */
export const subscriptionApi = {
    /**
     * Get all available subscription plans (public)
     */
    getPlans: async (): Promise<SubscriptionPlan[]> => {
        const response = await axiosInstance.get('/subscription/plans');
        return response.data.metadata;
    },

    /**
     * Get current user's subscription
     */
    getCurrentSubscription: async (): Promise<UserSubscription | null> => {
        const response = await axiosInstance.get('/subscription/me');
        return response.data.metadata ?? null;
    },

    /**
     * Get user's subscription limits
     */
    getLimits: async (): Promise<SubscriptionLimits> => {
        const response = await axiosInstance.get('/subscription/me/limits');
        return response.data.metadata;
    },

    /**
     * Subscribe to a plan (bypass payment)
     */
    subscribe: async (tier: SubscriptionTier): Promise<SubscribeResponse> => {
        const response = await axiosInstance.post('/subscription/subscribe', { tier });
        return response.data.metadata;
    },

    /**
     * Change subscription tier (upgrade/downgrade)
     */
    changeSubscription: async (tier: SubscriptionTier): Promise<SubscribeResponse> => {
        const response = await axiosInstance.patch('/subscription/change', { tier });
        return response.data.metadata;
    },

    /**
     * Reset portfolio
     */
    resetPortfolio: async (): Promise<void> => {
        await axiosInstance.post('/subscription/reset-portfolio');
    },

    /**
     * Check if user can reset portfolio
     */
    canResetPortfolio: async (): Promise<boolean> => {
        const response = await axiosInstance.get('/subscription/can-reset');
        return response.data.metadata.canReset;
    }
};

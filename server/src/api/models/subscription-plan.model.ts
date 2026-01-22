import { Schema, model } from 'mongoose';
import { required, timestamps, unique } from '@/configs/mongoose.config.js';
import {
    SubscriptionTier,
    SubscriptionStatus,
    MarketAccess,
    AILevel,
    CertificationType
} from '@/enums/subscription.enum.js';

export const SUBSCRIPTION_PLAN_MODEL_NAME = 'SubscriptionPlan';
export const SUBSCRIPTION_PLAN_COLLECTION_NAME = 'subscription_plans';

const subscriptionPlanSchema = new Schema<model.subscription.SubscriptionPlanSchema>(
    {
        tier: {
            type: String,
            enum: SubscriptionTier,
            required,
            unique
        },
        name: { type: String, required },
        description: { type: String, default: '' },
        price: { type: Number, required, min: 0 },

        // Feature limits
        virtual_capital: { type: Number, required }, // -1 = unlimited
        portfolio_resets_per_month: { type: Number, required }, // -1 = unlimited
        max_portfolios: { type: Number, required, min: 1 },

        // Market access
        market_access: [{
            type: String,
            enum: MarketAccess
        }],

        // Features
        ai_level: {
            type: String,
            enum: AILevel,
            default: AILevel.BASIC
        },
        social_trading_limit: { type: Number, default: 0 }, // -1 = unlimited, 0 = join only
        ad_free: { type: Boolean, default: false },
        certification_type: {
            type: String,
            enum: CertificationType,
            default: CertificationType.NONE
        },

        // Status
        is_active: { type: Boolean, default: true }
    },
    {
        collection: SUBSCRIPTION_PLAN_COLLECTION_NAME,
        timestamps
    }
);

export const subscriptionPlanModel = model(
    SUBSCRIPTION_PLAN_MODEL_NAME,
    subscriptionPlanSchema
);

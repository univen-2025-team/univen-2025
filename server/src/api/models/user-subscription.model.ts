import { Schema, model } from 'mongoose';
import { ObjectId, required, timestamps } from '@/configs/mongoose.config.js';
import { SubscriptionStatus } from '@/enums/subscription.enum.js';

// Use string literals to avoid circular dependency
const USER_MODEL_REF = 'User';
const SUBSCRIPTION_PLAN_MODEL_REF = 'SubscriptionPlan';

export const USER_SUBSCRIPTION_MODEL_NAME = 'UserSubscription';
export const USER_SUBSCRIPTION_COLLECTION_NAME = 'user_subscriptions';

const userSubscriptionSchema = new Schema<model.subscription.UserSubscriptionSchema>(
    {
        user_id: {
            type: ObjectId,
            required,
            ref: USER_MODEL_REF,
            index: true
        },
        plan_id: {
            type: ObjectId,
            required,
            ref: SUBSCRIPTION_PLAN_MODEL_REF
        },

        status: {
            type: String,
            enum: SubscriptionStatus,
            default: SubscriptionStatus.ACTIVE,
            index: true
        },

        // Billing period
        started_at: { type: Date, required },
        expires_at: { type: Date, required, index: true },

        // Usage tracking for current billing period
        portfolio_resets_used: { type: Number, default: 0 },
        current_period_start: { type: Date, required },

        // Payment info
        payment_method: { type: String },
        last_payment_date: { type: Date },
        next_billing_date: { type: Date },

        // For academic/institutional licenses
        institution_id: { type: ObjectId },
        is_bulk_license: { type: Boolean, default: false }
    },
    {
        collection: USER_SUBSCRIPTION_COLLECTION_NAME,
        timestamps
    }
);

// Indexes for efficient querying
userSubscriptionSchema.index({ user_id: 1, status: 1 });
userSubscriptionSchema.index({ expires_at: 1, status: 1 });

export const userSubscriptionModel = model(
    USER_SUBSCRIPTION_MODEL_NAME,
    userSubscriptionSchema
);

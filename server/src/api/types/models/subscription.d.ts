import type {
    SubscriptionTier,
    SubscriptionStatus,
    MarketAccess,
    AILevel,
    CertificationType
} from '@/enums/subscription.enum.ts';

declare global {
    namespace model {
        namespace subscription {
            interface CommonTypes {
                _id: moduleTypes.mongoose.ObjectId;
            }

            type SubscriptionPlanSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    tier: SubscriptionTier;
                    name: string;
                    description: string;
                    price: number; // VND per month

                    // Feature limits
                    virtual_capital: number; // -1 = unlimited
                    portfolio_resets_per_month: number; // -1 = unlimited
                    max_portfolios: number;

                    // Market access
                    market_access: MarketAccess[];

                    // Features
                    ai_level: AILevel;
                    social_trading_limit: number; // -1 = unlimited, 0 = join only
                    ad_free: boolean;
                    certification_type: CertificationType;

                    // Status
                    is_active: boolean;
                },
                isModel,
                isDoc,
                CommonTypes
            >;

            type UserSubscriptionSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    user_id: moduleTypes.mongoose.ObjectId;
                    plan_id: moduleTypes.mongoose.ObjectId;

                    status: SubscriptionStatus;

                    // Billing period
                    started_at: Date;
                    expires_at: Date;

                    // Usage tracking for current billing period
                    portfolio_resets_used: number;
                    current_period_start: Date;

                    // Payment info (optional)
                    payment_method?: string;
                    last_payment_date?: Date;
                    next_billing_date?: Date;

                    // For academic license
                    institution_id?: moduleTypes.mongoose.ObjectId;
                    is_bulk_license?: boolean;
                },
                isModel,
                isDoc,
                CommonTypes
            >;
        }
    }
}

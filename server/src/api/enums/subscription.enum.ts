export enum SubscriptionTier {
    FREEMIUM = 'freemium',
    STANDARD = 'standard',
    ADVANCED = 'advanced',
    ACADEMIC = 'academic'
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
    TRIAL = 'trial'
}

export enum MarketAccess {
    VN_STOCKS = 'vn_stocks',
    VN_CRYPTO = 'vn_crypto',
    US_STOCKS = 'us_stocks'
}

export enum AILevel {
    BASIC = 'basic',
    STANDARD = 'standard',
    ADVANCED = 'advanced'
}

export enum CertificationType {
    NONE = 'none',
    COURSE_COMPLETION = 'course_completion',
    VERIFIED_SKILL_BADGE = 'verified_skill_badge'
}

// Feature limits per tier
export const SUBSCRIPTION_LIMITS = {
    [SubscriptionTier.FREEMIUM]: {
        virtualCapital: 10_000_000, // 10M VND
        portfolioResetsPerMonth: 1,
        maxPortfolios: 1,
        marketAccess: [MarketAccess.VN_STOCKS],
        aiLevel: AILevel.BASIC,
        socialTradingLimit: 0, // Join public only
        adFree: false,
        certification: CertificationType.NONE
    },
    [SubscriptionTier.STANDARD]: {
        virtualCapital: 100_000_000, // 100M VND
        portfolioResetsPerMonth: 3,
        maxPortfolios: 3,
        marketAccess: [MarketAccess.VN_STOCKS],
        aiLevel: AILevel.STANDARD,
        socialTradingLimit: 10, // Create private rooms max 10 users
        adFree: false,
        certification: CertificationType.COURSE_COMPLETION
    },
    [SubscriptionTier.ADVANCED]: {
        virtualCapital: -1, // Unlimited (customizable)
        portfolioResetsPerMonth: -1, // Unlimited
        maxPortfolios: 10,
        marketAccess: [MarketAccess.VN_STOCKS, MarketAccess.VN_CRYPTO, MarketAccess.US_STOCKS],
        aiLevel: AILevel.ADVANCED,
        socialTradingLimit: -1, // Host large contests (unlimited users)
        adFree: true,
        certification: CertificationType.VERIFIED_SKILL_BADGE
    },
    [SubscriptionTier.ACADEMIC]: {
        virtualCapital: 100_000_000, // Customizable per institution
        portfolioResetsPerMonth: -1, // Unlimited for students
        maxPortfolios: 3,
        marketAccess: [MarketAccess.VN_STOCKS],
        aiLevel: AILevel.STANDARD,
        socialTradingLimit: 0,
        adFree: true,
        certification: CertificationType.COURSE_COMPLETION
    }
} as const;

// Pricing in VND
export const SUBSCRIPTION_PRICING = {
    [SubscriptionTier.FREEMIUM]: 0,
    [SubscriptionTier.STANDARD]: 99_000,
    [SubscriptionTier.ADVANCED]: 349_000,
    [SubscriptionTier.ACADEMIC]: 69_000 // per student/month
} as const;

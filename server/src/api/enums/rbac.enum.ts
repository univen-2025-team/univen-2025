export enum RoleActions {
    /* ------------------------- Create ------------------------- */
    CREATE_ANY = 'create:any',
    CREATE_OWN = 'create:own',

    /* ------------------------- Update ------------------------- */
    UPDATE_ANY = 'update:any',
    UPDATE_OWN = 'update:own',

    /* ------------------------- Read ------------------------- */
    READ_ANY = 'read:any',
    READ_OWN = 'read:own',

    /* ------------------------- Delete ------------------------- */
    DELETE_ANY = 'delete:any',
    DELETE_OWN = 'delete:own'
}


export enum RoleNames {
    // Subscription-based user roles
    USER_FREEMIUM = 'user_freemium',
    USER_STANDARD = 'user_standard',
    USER_ADVANCED = 'user_advanced',
    USER_ACADEMIC = 'user_academic',
    // Legacy user role (for backward compatibility)
    USER = 'user',
    // Admin roles
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin'
}

export enum RoleStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted'
}

export enum Resources {
    // Original resources
    CATEGORY = 'category',
    SHOP = 'shop',
    PROFILE = 'profile',
    ORDER = 'order',
    PRODUCT = 'product',
    CART = 'cart',
    WAREHOUSES = 'warehouses',
    DISCOUNT = 'discount',
    SHOP_ANALYTICS = 'shop_analytics',

    // Subscription feature resources
    VIRTUAL_CAPITAL = 'virtual_capital',
    PORTFOLIO = 'portfolio',
    PORTFOLIO_RESET = 'portfolio_reset',
    MARKET_VN = 'market_vn',
    MARKET_CRYPTO = 'market_crypto',
    MARKET_US = 'market_us',
    AI_MENTOR = 'ai_mentor',
    SOCIAL_TRADING = 'social_trading',
    AD_FREE = 'ad_free',
    CERTIFICATION = 'certification',
    SUBSCRIPTION = 'subscription'
}

export enum ResourceStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DELETED = 'deleted'
}

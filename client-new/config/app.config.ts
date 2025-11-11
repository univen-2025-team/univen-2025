export const appConfig = {
  name: "Stockie",
  fullName: "Stockie - Sàn Giao Dịch Chứng Khoán",
  shortName: "Stockie",
  description: "Nền tảng giao dịch chứng khoán hiện đại và thông minh",
  tagline: "Đầu tư thông minh, Sinh lời bền vững",
  version: "1.0.0",
  
  // Company info
  company: {
    name: "SampleUniven2025",
    legalName: "Công ty Cổ phần Chứng khoán SampleUniven2025",
    shortName: "SU Securities",
    website: "https://stockie.vn",
    email: "support@stockie.vn",
    phone: "1900-xxxx",
    address: "Tầng 10, Tòa nhà ABC, Quận 1, TP. HCM",
  },

  // SEO & Meta
  seo: {
    title: "Stockie - Sàn Giao Dịch Chứng Khoán",
    description: "Nền tảng giao dịch chứng khoán hiện đại với công nghệ AI, phân tích thị trường real-time, và tư vấn đầu tư thông minh",
    keywords: "chứng khoán, đầu tư, cổ phiếu, thị trường, trading, stock market, VN30, HOSE, HNX",
    ogImage: "/images/og-image.jpg",
  },

  // Features
  features: {
    ai: {
      enabled: true,
      name: "AI Trading Assistant",
      description: "Chatbot AI hỗ trợ phân tích và tư vấn đầu tư",
    },
    realtime: {
      enabled: true,
      name: "Real-time Market Data",
      description: "Dữ liệu thị trường cập nhật theo thời gian thực",
    },
    badges: {
      enabled: true,
      name: "Achievement Badges",
      description: "Hệ thống huy hiệu và thành tựu",
    },
    news: {
      enabled: true,
      name: "Market News",
      description: "Tin tức thị trường và phân tích chuyên sâu",
    },
  },

  // Social Links
  social: {
    facebook: "https://facebook.com/stockie",
    twitter: "https://twitter.com/stockie",
    linkedin: "https://linkedin.com/company/stockie",
    youtube: "https://youtube.com/@stockie",
    telegram: "https://t.me/stockie",
    zalo: "https://zalo.me/stockie",
  },

  // Support
  support: {
    email: "support@stockie.vn",
    phone: "1900-xxxx",
    hotline: "024-xxxx-xxxx",
    hours: "8:00 - 17:30 (Thứ 2 - Thứ 6)",
    liveChat: true,
  },

  // Legal
  legal: {
    termsOfService: "/terms",
    privacyPolicy: "/privacy",
    riskDisclosure: "/risk-disclosure",
    tradingRules: "/trading-rules",
  },

  // Trading
  trading: {
    markets: ["HOSE", "HNX", "UPCOM"],
    tradingHours: {
      morning: "09:00 - 11:30",
      afternoon: "13:00 - 15:00",
      closing: "14:30 - 15:00",
    },
    minDeposit: 10000000, // 10 triệu VNĐ
    currencies: ["VND"],
  },

  // App Settings
  settings: {
    defaultLanguage: "vi",
    supportedLanguages: ["vi", "en"],
    defaultCurrency: "VND",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "HH:mm:ss",
    timezone: "Asia/Ho_Chi_Minh",
  },

  // API
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1/api",
    timeout: 30000,
    version: "v1",
  },

  // App Store
  appStore: {
    ios: "https://apps.apple.com/app/stockie",
    android: "https://play.google.com/store/apps/details?id=com.stockie",
  },

  // Analytics
  analytics: {
    googleAnalytics: process.env.NEXT_PUBLIC_GA_ID || "",
    facebookPixel: process.env.NEXT_PUBLIC_FB_PIXEL_ID || "",
  },
} as const;

export type AppConfig = typeof appConfig;

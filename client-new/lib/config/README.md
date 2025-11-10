# App Configuration

This file documents the application configuration structure.

## Location
`/lib/config/app.config.ts`

## Configuration Structure

### Basic Info
```typescript
{
  name: "Stockie",
  fullName: "Stockie - Sàn Giao Dịch Chứng Khoán",
  shortName: "Stockie",
  description: "Nền tảng giao dịch chứng khoán hiện đại và thông minh",
  tagline: "Đầu tư thông minh, Sinh lời bền vững",
  version: "1.0.0"
}
```

### Company Information
```typescript
company: {
  name: "SampleUniven2025",
  legalName: "Công ty Cổ phần Chứng khoán SampleUniven2025",
  shortName: "SU Securities",
  website: "https://stockie.vn",
  email: "support@stockie.vn",
  phone: "1900-xxxx",
  address: "Tầng 10, Tòa nhà ABC, Quận 1, TP. HCM"
}
```

### SEO & Meta Tags
```typescript
seo: {
  title: "Stockie - Sàn Giao Dịch Chứng Khoán",
  description: "Nền tảng giao dịch chứng khoán hiện đại...",
  keywords: "chứng khoán, đầu tư, cổ phiếu, thị trường...",
  ogImage: "/images/og-image.jpg"
}
```

### Features Configuration
```typescript
features: {
  ai: {
    enabled: true,
    name: "AI Trading Assistant",
    description: "Chatbot AI hỗ trợ phân tích và tư vấn đầu tư"
  },
  realtime: { enabled: true, ... },
  badges: { enabled: true, ... },
  news: { enabled: true, ... }
}
```

### Social Links
```typescript
social: {
  facebook: "https://facebook.com/stockie",
  twitter: "https://twitter.com/stockie",
  linkedin: "https://linkedin.com/company/stockie",
  youtube: "https://youtube.com/@stockie",
  telegram: "https://t.me/stockie",
  zalo: "https://zalo.me/stockie"
}
```

### Support Information
```typescript
support: {
  email: "support@stockie.vn",
  phone: "1900-xxxx",
  hotline: "024-xxxx-xxxx",
  hours: "8:00 - 17:30 (Thứ 2 - Thứ 6)",
  liveChat: true
}
```

### Legal Pages
```typescript
legal: {
  termsOfService: "/terms",
  privacyPolicy: "/privacy",
  riskDisclosure: "/risk-disclosure",
  tradingRules: "/trading-rules"
}
```

### Trading Configuration
```typescript
trading: {
  markets: ["HOSE", "HNX", "UPCOM"],
  tradingHours: {
    morning: "09:00 - 11:30",
    afternoon: "13:00 - 15:00",
    closing: "14:30 - 15:00"
  },
  minDeposit: 10000000, // 10 triệu VNĐ
  currencies: ["VND"]
}
```

### App Settings
```typescript
settings: {
  defaultLanguage: "vi",
  supportedLanguages: ["vi", "en"],
  defaultCurrency: "VND",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "HH:mm:ss",
  timezone: "Asia/Ho_Chi_Minh"
}
```

### API Configuration
```typescript
api: {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/v1/api",
  timeout: 30000,
  version: "v1"
}
```

## Usage

### Import the config
```typescript
import { appConfig } from '@/lib/config';
```

### Use in components
```typescript
// In a component
<h1>{appConfig.name}</h1>
<p>{appConfig.description}</p>

// Company info
<p>{appConfig.company.email}</p>

// Social links
<a href={appConfig.social.facebook}>Facebook</a>

// Feature flags
{appConfig.features.ai.enabled && <AIAssistant />}
```

### Use in metadata (app/layout.tsx)
```typescript
export const metadata: Metadata = {
  title: appConfig.seo.title,
  description: appConfig.seo.description,
  keywords: appConfig.seo.keywords,
};
```

### Use in API calls
```typescript
const response = await fetch(`${appConfig.api.baseURL}/endpoint`);
```

## Environment Variables

Some values can be overridden using environment variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/v1/api
NEXT_PUBLIC_GA_ID=your-ga-id
NEXT_PUBLIC_FB_PIXEL_ID=your-fb-pixel-id
```

## Type Safety

The configuration is fully typed with TypeScript:

```typescript
import type { AppConfig } from '@/lib/config';

// Use the type
const myConfig: AppConfig = appConfig;
```

## Updating Configuration

To update the configuration:

1. Edit `/lib/config/app.config.ts`
2. The changes will be reflected throughout the app
3. No need to restart the dev server (Hot Module Replacement)

## Best Practices

1. **Don't hardcode strings** - Use config values instead
2. **Feature flags** - Use `features.*. enabled` for conditional rendering
3. **Environment-specific** - Use environment variables for API URLs
4. **Type safety** - Always use the TypeScript types provided

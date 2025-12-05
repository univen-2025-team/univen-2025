# 📁 Cấu Trúc Dự Án - Trading Dashboard

**Tech stack:** Next.js 14, React, TypeScript, Tailwind CSS

---

## 1. Tổng Quan Kiến Trúc

Ứng dụng được xây dựng theo kiến trúc **Feature-based Architecture** với giao diện **2-side layout**:

```
┌───────────────────────────────┐ ┌─────────────────────────┐
│    LEFT SIDE (8 cols)         │ │  RIGHT SIDE (4 cols)    │
│    Feature Area               │ │  Chatbot Panel          │
│                               │ │                         │
│  - Market Overview (default)  │ │  - Chat Interface       │
│  - Buy Stock Feature          │ │  - Suggestion Chips     │
│  - News Feature               │ │  - Messages             │
│  - Stock Detail Feature       │ │                         │
└───────────────────────────────┘ └─────────────────────────┘
```

**Data Flow:**

```
User → Chatbot → FeatureInstruction[] → Parent → FeatureState → FeatureArea → Render Feature
```

---

## 2. Cấu Trúc Thư Mục

```
client-new/
├── features/
│   ├── components/              # Shared components
│   │   └── feature-area.tsx     # Router component cho features
│   │
│   ├── types/                   # Shared types
│   │   └── features.ts          # FeatureState, FeatureInstruction, etc.
│   │
│   ├── utils/                   # Shared utilities
│   │   └── feature-reducer.ts   # Reducer cho FeatureState
│   │
│   ├── chatbot/                 # Chatbot Feature Module
│   │   ├── components/
│   │   │   ├── chatbot.tsx      # Main chatbot component (parent)
│   │   │   ├── trading-chat-panel.tsx
│   │   │   ├── chat-message-list.tsx
│   │   │   ├── chat-input.tsx
│   │   │   ├── suggestion-chips.tsx
│   │   │   ├── types.ts
│   │   │   └── chat/
│   │   │       ├── chat-interface.tsx  # Chat engine interface
│   │   │       └── theme-provider.tsx
│   │   ├── hooks/               # Chatbot hooks
│   │   ├── contexts/            # Chatbot contexts
│   │   └── services/            # Chatbot services
│   │
│   ├── market-overview/         # Market Overview Feature Module
│   │   └── components/
│   │       └── market-overview-feature.tsx
│   │
│   ├── buy-stock/               # Buy Stock Feature Module
│   │   └── components/
│   │       └── buy-stock-feature.tsx
│   │
│   ├── news/                    # News Feature Module
│   │   └── components/
│   │       └── news-feature.tsx
│   │
│   └── stock-detail/            # Stock Detail Feature Module
│       └── components/
│           └── stock-detail-feature.tsx
│
└── docs/
    ├── chat.md                  # Kiến trúc chatbot
    └── structure.md             # File này
```

---

## 3. Feature Modules

### 3.1 Chatbot Feature (`features/chatbot/`)

**Responsibility:** Quản lý giao diện chatbot và gửi FeatureInstruction lên parent.

**Cấu trúc:**

```
chatbot/
├── components/
│   ├── chatbot.tsx              # Parent component, quản lý FeatureState
│   ├── trading-chat-panel.tsx   # UI panel
│   ├── chat-message-list.tsx    # Hiển thị messages
│   ├── chat-input.tsx           # Input component
│   ├── suggestion-chips.tsx     # Suggestion buttons
│   ├── types.ts                 # Chatbot types
│   └── chat/
│       └── chat-interface.tsx   # Chat engine interface
├── hooks/                       # Custom hooks (optional)
├── contexts/                    # React contexts (optional)
└── services/                    # API services (optional)
```

**Key Components:**

-   `Chatbot`: Main component, quản lý `FeatureState` và layout 2-side
-   `ChatInterface`: Xử lý message và gửi `FeatureInstruction[]` qua `onUiEffects`
-   `SuggestionChips`: Luôn hiển thị suggestions cho user

### 3.2 Market Overview Feature (`features/market-overview/`)

**Responsibility:** Hiển thị overview thị trường (default view).

**Features:**

-   Các chỉ số chính (VNINDEX, VN30, etc.)
-   Main chart với timeframe selector
-   Tabs navigation
-   Stock cards list

**Cấu trúc:**

```
market-overview/
└── components/
    └── market-overview-feature.tsx
```

### 3.3 Buy Stock Feature (`features/buy-stock/`)

**Responsibility:** Flow đặt lệnh mua cổ phiếu.

**Features:**

-   Step-by-step flow
-   Form validation
-   Progress indicator
-   Back button

**Cấu trúc:**

```
buy-stock/
└── components/
    └── buy-stock-feature.tsx
```

### 3.4 News Feature (`features/news/`)

**Responsibility:** Hiển thị tin tức thị trường.

**Features:**

-   News list với sentiment
-   Filter by symbol (optional)
-   Back button

**Cấu trúc:**

```
news/
└── components/
    └── news-feature.tsx
```

### 3.5 Stock Detail Feature (`features/stock-detail/`)

**Responsibility:** Chi tiết cổ phiếu.

**Features:**

-   Price display
-   Intraday chart
-   Info blocks (Volume, Market Cap, P/E)
-   Buy button

**Cấu trúc:**

```
stock-detail/
└── components/
    └── stock-detail-feature.tsx
```

---

## 4. Shared Components & Utilities

### 4.1 FeatureArea (`features/components/feature-area.tsx`)

**Responsibility:** Router component, render feature dựa trên `FeatureState.activeFeature`.

```tsx
export function FeatureArea({ state, onBack, onFeatureAction }: FeatureAreaProps) {
    switch (state.activeFeature) {
        case 'MARKET_OVERVIEW':
            return <MarketOverviewFeature data={state.marketOverview} />;
        // ... other cases
    }
}
```

### 4.2 Types (`features/types/features.ts`)

**Exports:**

-   `FeatureId`: Type cho feature IDs
-   `FeatureState`: State của left panel
-   `FeatureInstruction`: Actions từ chatbot
-   `MarketOverviewData`, `BuyStockData`, `NewsData`, `StockDetailData`: Data types

### 4.3 Reducer (`features/utils/feature-reducer.ts`)

**Function:**

-   `reduceFeatureState(state, effects)`: Xử lý `FeatureInstruction[]` và cập nhật `FeatureState`

---

## 5. Data Flow & State Management

### 5.1 FeatureState Flow

```
Initial State:
{
  activeFeature: 'MARKET_OVERVIEW',
  marketOverview: { ... },
}

User: "Mua MWG"
  ↓
Chatbot Engine: { reply: "...", uiEffects: [OPEN_BUY_STOCK] }
  ↓
ChatInterface.onUiEffects([OPEN_BUY_STOCK])
  ↓
Chatbot.handleUiEffects([OPEN_BUY_STOCK])
  ↓
reduceFeatureState(state, [OPEN_BUY_STOCK])
  ↓
FeatureState: {
  activeFeature: 'BUY_STOCK',
  buyStock: { symbol: 'MWG', ... },
  marketOverview: { ... }, // vẫn giữ
}
  ↓
FeatureArea renders BuyStockFeature
```

### 5.2 FeatureInstruction Types

```typescript
type FeatureInstruction =
    | { type: 'SHOW_MARKET_OVERVIEW' }
    | { type: 'OPEN_BUY_STOCK'; payload: { symbol; currentPrice; steps } }
    | { type: 'OPEN_NEWS'; payload: NewsData }
    | { type: 'OPEN_STOCK_DETAIL'; payload: StockDetailData };
```

---

## 6. Nguyên Tắc Thiết Kế

### 6.1 Feature Independence

-   Mỗi feature là module độc lập
-   Có thư mục riêng với `components/`, `hooks/`, `contexts/`, `services/` (nếu cần)
-   Không phụ thuộc vào feature khác

### 6.2 Chatbot chỉ gửi Instructions

-   Chatbot **không render UI** của left panel
-   Chỉ gửi `FeatureInstruction[]` qua `onUiEffects` callback
-   Parent component quản lý state và render

### 6.3 Suggestions luôn hiển thị

-   `SuggestionChips` luôn hiển thị trong chatbot panel
-   Giúp user nhanh chóng truy cập các tính năng

### 6.4 State Persistence

-   `marketOverview` luôn được giữ trong `FeatureState`
-   Dễ dàng quay lại market overview

---

## 7. Cách Thêm Feature Mới

### Bước 1: Tạo feature module

```
features/
└── new-feature/
    ├── components/
    │   └── new-feature-feature.tsx
    ├── hooks/       (optional)
    ├── contexts/    (optional)
    └── services/    (optional)
```

### Bước 2: Thêm types vào `features/types/features.ts`

```typescript
export type FeatureId = 'MARKET_OVERVIEW' | 'BUY_STOCK' | 'NEW_FEATURE'; // ← Thêm

export type NewFeatureData = {
    // ... data structure
};

export type FeatureState = {
    // ...
    newFeature?: NewFeatureData; // ← Thêm
};

export type FeatureInstruction =
    // ...
    { type: 'OPEN_NEW_FEATURE'; payload: NewFeatureData }; // ← Thêm
```

### Bước 3: Update reducer

```typescript
// features/utils/feature-reducer.ts
case 'OPEN_NEW_FEATURE':
  return {
    ...s,
    activeFeature: 'NEW_FEATURE',
    newFeature: eff.payload,
  }
```

### Bước 4: Update FeatureArea

```typescript
// features/components/feature-area.tsx
import { NewFeatureFeature } from '../new-feature/components/new-feature-feature'

// Trong switch statement:
case 'NEW_FEATURE':
  return state.newFeature ? (
    <NewFeatureFeature data={state.newFeature} onBack={onBack} />
  ) : (
    <MarketOverviewFeature data={state.marketOverview} />
  )
```

### Bước 5: Update ChatInterface

```typescript
// features/chatbot/components/chat/chat-interface.tsx
// Trong handleSendMessage, thêm logic để tạo FeatureInstruction
if (text.includes('new feature')) {
  effects.push({
    type: 'OPEN_NEW_FEATURE',
    payload: { ... }
  })
}
```

---

## 8. Best Practices

### ✅ DO:

-   Mỗi feature có thư mục riêng
-   Tách logic vào hooks/services
-   Giữ component nhỏ, focused
-   Sử dụng TypeScript types
-   Luôn có `onBack` prop cho navigation

### ❌ DON'T:

-   Render UI của left panel trong chatbot
-   Import feature component này vào feature component kia
-   Hardcode data trong component
-   Bỏ qua error handling

---

## 9. File Locations Summary

| Component/Type     | Location                                                          |
| ------------------ | ----------------------------------------------------------------- |
| Main Chatbot       | `features/chatbot/components/chatbot.tsx`                         |
| FeatureArea Router | `features/components/feature-area.tsx`                            |
| FeatureState Types | `features/types/features.ts`                                      |
| FeatureReducer     | `features/utils/feature-reducer.ts`                               |
| MarketOverview     | `features/market-overview/components/market-overview-feature.tsx` |
| BuyStock           | `features/buy-stock/components/buy-stock-feature.tsx`             |
| News               | `features/news/components/news-feature.tsx`                       |
| StockDetail        | `features/stock-detail/components/stock-detail-feature.tsx`       |
| ChatInterface      | `features/chatbot/components/chat/chat-interface.tsx`             |
| ChatPanel          | `features/chatbot/components/trading-chat-panel.tsx`              |

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

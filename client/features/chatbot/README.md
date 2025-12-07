# Chatbot Feature Documentation

## 📋 Tổng quan

Chatbot là một tính năng trợ lý ảo thông minh giúp người dùng thực hiện các giao dịch chứng khoán, truy vấn thị trường, và tương tác với hệ thống thông qua giao diện chat tự nhiên.

### Tính năng chính:

-   💬 Chat với AI agent để nhận tư vấn chứng khoán
-   🎯 Phân loại intent tự động và hiển thị UI components tương ứng
-   ⚡ Phản hồi nhanh với Groq API (fallback)
-   🔄 Tích hợp với AGENT_API để cập nhật dữ liệu thực tế
-   📊 Hiển thị 10 loại UI effects khác nhau

---

## 📁 Cấu trúc thư mục

```
features/chatbot/
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx      # Component chính của chat
│   │   └── theme-provider.tsx       # Theme provider
│   ├── hooks/
│   │   └── useChat.ts               # Custom hook quản lý chat logic
│   ├── chat-input.tsx                # Input component
│   ├── chat-message-list.tsx         # Danh sách messages
│   ├── chatbot.tsx                   # Main chatbot component
│   ├── suggestion-chips.tsx          # Gợi ý câu hỏi
│   ├── trading-chat-panel.tsx        # Panel chứa chat UI
│   ├── types.ts                      # Type definitions
│   ├── insights/                     # Trading insights components
│   └── widgets/                      # Widget components
└── services/
    └── chatService.ts                # Service layer cho API calls
```

---

## 🏗️ Kiến trúc

### Flow hoạt động:

```
User Input
    ↓
useChat Hook
    ↓
┌─────────────────────────────────────┐
│ 1. Gọi Groq API (nhanh)            │
│    - Phân loại intent              │
│    - Hiển thị component ngay       │
│    - Hiển thị reply text            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ 2. Gọi AGENT_API (song song)       │
│    - Cập nhật suggestions          │
│    - Cập nhật UI effects            │
│    - Tạo message mới từ reply       │
└─────────────────────────────────────┘
    ↓
Update UI với dữ liệu từ AGENT_API
```

### Components Hierarchy:

```
ChatInterface
  └── TradingChatPanel
      ├── ChatMessageList
      ├── ChatInput
      └── SuggestionChips
```

---

## 🔌 API Integration

### 1. Groq API (Fast Response)

**Endpoint:** `/api/groq` (Next.js API route)

**Mục đích:** Phân loại intent và hiển thị component ngay lập tức

**Request:**

```typescript
POST /api/groq
{
  "model": "llama-3.1-8b-instant",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "response_format": { "type": "json_object" }
}
```

**Response:**

```typescript
{
  "content": "JSON string với reply, uiEffects, suggestions",
  "model": "llama-3.1-8b-instant",
  "usage": { ... }
}
```

**Models (fallback order):**

1. `llama-3.1-8b-instant` (fast, ít token)
2. `llama-3.3-70b-versatile` (medium)
3. `llama-3.1-70b-versatile` (large, nhiều token)

### 2. AGENT_API (Full Context)

**Endpoint:** `${AGENT_API}/api/v1/chat`

**Mục đích:** Cập nhật suggestions và UI effects với dữ liệu thực tế

**Request:**

```typescript
POST ${AGENT_API}/api/v1/chat
{
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "meta": {
    "user_id": "user123",
    "session_id": "conv_123456",
    "locale": "vi-VN",
    "user_name": "Nguyễn Văn A",
    "user_email": "user@example.com",
    "balance": 10000000,
    "user_status": "active",
    "user_role": "user"
  }
}
```

**Response:**

```typescript
{
  "reply": "Câu trả lời từ agent",
  "ui_effects": [
    {
      "type": "OPEN_BUY_STOCK",
      "payload": { "symbol": "VCB", "currentPrice": 85000, ... }
    }
  ],
  "suggestion_messages": [
    { "text": "Gợi ý 1", "icon": "💡" }
  ],
  "raw_agent_output": { ... }
}
```

---

## 🎣 Hooks

### `useChat`

Custom hook quản lý toàn bộ logic của chat.

**Location:** `features/chatbot/components/hooks/useChat.ts`

**Props:**

```typescript
type UseChatOptions = {
    onUiEffects?: (effects: FeatureInstruction[]) => void;
};
```

**Returns:**

```typescript
type UseChatReturn = {
    messages: ChatMessage[]; // Danh sách messages
    isLoading: boolean; // Trạng thái loading
    hasComponentLoaded: boolean; // Component đã load chưa
    suggestions: SuggestionMessage[]; // Gợi ý câu hỏi
    handleSendMessage: (text: string) => Promise<void>;
    handleSuggestionClick: (suggestionText: string) => void;
};
```

**Usage:**

```typescript
const {
    messages,
    isLoading,
    hasComponentLoaded,
    suggestions,
    handleSendMessage,
    handleSuggestionClick
} = useChat({
    onUiEffects: (effects) => {
        // Xử lý UI effects
        dispatchFeatureEffects(effects);
    }
});
```

---

## 🔧 Services

### `chatService.ts`

Service layer chứa tất cả logic gọi API và xử lý dữ liệu.

#### Exported Functions:

##### 1. `getAgentApiUrl()`

Lấy URL của AGENT_API từ environment variables.

##### 2. `createDefaultUiEffects(text: string)`

Tạo default UI effects từ text input (cho các intent rõ ràng như "mua VCB", "tin tức thị trường").

##### 3. `buildConversationHistory(messages: ChatMessage[])`

Xây dựng conversation history từ messages array.

##### 4. `fetchUserProfile(userId: string, fallbackUser?: any)`

Fetch thông tin user profile từ backend.

##### 5. `buildChatRequest(conversationHistory, userId, sessionId, userProfile)`

Xây dựng request body cho AGENT_API với đầy đủ context và meta.

##### 6. `callGroqAPI(messages, modelIndex = 0)`

Gọi Groq API qua Next.js endpoint để phân loại intent.

**Flow:**

1. Gọi `/api/groq` với messages
2. Parse JSON response
3. Convert `uiEffects` string → `FeatureInstruction[]`
4. Convert `suggestions` string[] → `SuggestionMessage[]`
5. Fallback sang model khác nếu gặp token limit

##### 7. `sendChatMessage(request: ChatRequest, agentApiUrl: string)`

Gửi message đến AGENT_API với timeout 5 giây.

**Flow:**

1. Gọi AGENT_API với full context
2. Nếu timeout/error → fallback sang Groq
3. Return response hoặc error

##### 8. `parseChatResponse(data: ChatApiResponse)`

Parse response từ AGENT_API thành `reply`, `uiEffects`, `suggestionMessages`.

##### 9. `createFallbackResponse(defaultEffects: FeatureInstruction[])`

Tạo fallback response khi cả Groq và AGENT_API đều fail.

---

## 🎨 UI Effects

Chatbot hỗ trợ 10 loại UI effects:

### 1. `SHOW_MARKET_OVERVIEW`

Hiển thị tổng quan thị trường.

**Trigger:** "thị trường", "market", "tổng quan", "vn30", "top cổ phiếu hôm nay"

### 2. `OPEN_BUY_STOCK`

Mở form mua cổ phiếu.

**Payload:**

```typescript
{
  symbol: string
  currentPrice: number
  steps: BuyFlowStep[]
}
```

**Trigger:** "mua", "buy", "đặt lệnh mua"

### 3. `OPEN_SELL_STOCK`

Mở form bán cổ phiếu.

**Payload:**

```typescript
{
  symbol: string
  currentPrice: number
  availableQuantity: number
  steps: BuyFlowStep[]
}
```

**Trigger:** "bán", "sell", "đặt lệnh bán"

### 4. `OPEN_NEWS`

Hiển thị tin tức.

**Payload:**

```typescript
{
  symbol?: string
  items: NewsItem[]
}
```

**Trigger:** "tin tức", "news", "tin tức thị trường"

### 5. `OPEN_STOCK_DETAIL`

Hiển thị chi tiết cổ phiếu.

**Payload:**

```typescript
{
  symbol: string
  name: string
  description?: string
  price: number
  changePercent: number
  intradayChart: ChartPoint[]
}
```

**Trigger:** "chi tiết", "detail", "giá", symbol name (VD: "VCB")

### 6. `CONFIRM_TRANSACTION`

Xác nhận giao dịch.

**Payload:**

```typescript
{
    symbol: string;
    type: 'buy' | 'sell';
    quantity: number;
    price: number;
    totalAmount: number;
    userId: string;
}
```

**Trigger:** "xác nhận", "confirm", "xác nhận giao dịch"

### 7. `SHOW_USER_PROFILE`

Hiển thị thông tin tài khoản.

**Payload:**

```typescript
{
  userId: string
  fullName?: string
  email?: string
  balance?: number
  avatar?: string
}
```

**Trigger:** "tài khoản", "profile", "thông tin cá nhân", "số dư"

### 8. `SHOW_TRANSACTION_HISTORY`

Hiển thị lịch sử giao dịch.

**Payload:**

```typescript
{
  userId: string
  transactions: Transaction[]
}
```

**Trigger:** "lịch sử", "history", "lịch sử giao dịch"

**API:** `GET /v1/api/stock-transactions/transactions/:userId`

### 9. `SHOW_TRANSACTION_STATS`

Hiển thị thống kê giao dịch.

**Payload:**

```typescript
{
  userId: string
  totalProfit?: number
  totalTransactions?: number
  winRate?: number
}
```

**Trigger:** "thống kê", "stats", "thống kê giao dịch"

**API:** `GET /v1/api/stock-transactions/transactions/:userId/stats`

### 10. `SHOW_RANKING`

Hiển thị bảng xếp hạng.

**Payload:**

```typescript
{
  rankings: RankingItem[]
  userRank?: number
}
```

**Trigger:** "xếp hạng", "ranking", "bảng xếp hạng" (không có "cổ phiếu")

**API:** `GET /v1/api/stock-transactions/ranking`

---

## 🔐 Environment Variables

### Client-side (.env.local):

```bash
# AGENT_API URL (gọi trực tiếp từ client)
NEXT_PUBLIC_AGENT_API=https://your-agent-api.com

# Groq API Key (không cần nữa, đã chuyển sang server-side)
# NEXT_PUBLIC_GROQ_API_KEY=your-groq-key
```

### Server-side (.env):

```bash
# Groq API Key (dùng trong /api/groq)
GROQ_API_KEY=your-groq-api-key
```

---

## 📝 Usage

### Basic Usage:

```typescript
import { ChatInterface } from '@/features/chatbot/components/chat/chat-interface';
import { FeatureInstruction } from '@/features/types/features';

function MyPage() {
    const handleUiEffects = (effects: FeatureInstruction[]) => {
        // Xử lý UI effects
        effects.forEach((effect) => {
            switch (effect.type) {
                case 'SHOW_MARKET_OVERVIEW':
                    // Hiển thị market overview
                    break;
                case 'OPEN_BUY_STOCK':
                    // Mở form mua cổ phiếu
                    break;
                // ... các cases khác
            }
        });
    };

    return <ChatInterface onUiEffects={handleUiEffects} />;
}
```

### Advanced Usage với Redux:

```typescript
import { useDispatch } from 'react-redux';
import { setFeatureState } from '@/features/store/featureSlice';

function MyPage() {
    const dispatch = useDispatch();

    const handleUiEffects = (effects: FeatureInstruction[]) => {
        // Dispatch effects vào Redux store
        effects.forEach((effect) => {
            dispatch(setFeatureState(effect));
        });
    };

    return <ChatInterface onUiEffects={handleUiEffects} />;
}
```

---

## 🐛 Error Handling

### Groq API Errors:

-   **Token limit:** Tự động fallback sang model tiếp theo
-   **Network error:** Log error, tiếp tục với AGENT_API
-   **Parse error:** Fallback về text parsing

### AGENT_API Errors:

-   **Timeout (5s):** Fallback sang Groq response
-   **4xx/5xx:** Log error, giữ nguyên Groq response
-   **Network error:** Log error, giữ nguyên Groq response

### Validation:

-   **AGENT_API response:** Validate `reply`, `suggestions`, `uiEffects` trước khi update
-   **Chỉ update khi:** Response hợp lệ và không có error
-   **Tạo message mới:** AGENT_API reply tạo message mới, không ghi đè Groq reply

---

## 🔍 Intent Classification Logic

### Priority Order:

1. **Market Overview** (highest priority)

    - "thị trường", "market", "tổng quan"
    - "top cổ phiếu hôm nay" (không phải ranking)
    - "vn30", "index"

2. **Buy/Sell Stock**

    - "mua", "buy" → `OPEN_BUY_STOCK`
    - "bán", "sell" → `OPEN_SELL_STOCK`

3. **News**

    - "tin tức", "news", "tin tức thị trường"

4. **Stock Detail**

    - "chi tiết", "detail", "giá"
    - Symbol name (VCB, VNM, etc.)

5. **Transaction Actions**

    - "xác nhận" → `CONFIRM_TRANSACTION`

6. **User Info**

    - "tài khoản", "profile" → `SHOW_USER_PROFILE`
    - "lịch sử" → `SHOW_TRANSACTION_HISTORY`
    - "thống kê" → `SHOW_TRANSACTION_STATS`

7. **Ranking** (lowest priority)
    - "xếp hạng", "ranking", "bảng xếp hạng"
    - **Không** trigger khi có "cổ phiếu" trong text

### Symbol Extraction:

1. Check common symbols: VCB, VNM, MWG, etc.
2. Check exact match: Text chỉ là symbol (2-5 chữ cái)
3. Regex pattern: Tìm pattern `\b[A-Z]{2,5}\b`

---

## 📊 State Management

### Local State (useChat):

-   `messages`: Chat messages array
-   `isLoading`: Loading state
-   `hasComponentLoaded`: Component đã load chưa
-   `suggestions`: Suggestion messages

### Session Storage:

-   `chatbot_conversation_id`: Conversation ID để maintain context

### Redux Store:

-   `user`: User profile từ `authSlice`
-   `featureState`: Feature state từ `featureSlice` (optional)

---

## 🚀 Performance Optimizations

1. **Groq First:** Gọi Groq trước để hiển thị component ngay
2. **Parallel Calls:** Groq và AGENT_API chạy song song
3. **Timeout:** AGENT_API timeout 5s để tránh chờ lâu
4. **Model Fallback:** Tự động chuyển model khi token limit
5. **Validation:** Chỉ update UI khi response hợp lệ

---

## 🧪 Testing

### Test Cases:

1. **Intent Classification:**

    - "Top cổ phiếu hôm nay" → `SHOW_MARKET_OVERVIEW`
    - "Mua VCB" → `OPEN_BUY_STOCK` với symbol "VCB"
    - "Xếp hạng" → `SHOW_RANKING`

2. **Error Handling:**

    - Groq API fail → Fallback về text parsing
    - AGENT_API timeout → Giữ nguyên Groq response
    - AGENT_API invalid response → Giữ nguyên Groq response

3. **Data Fetching:**
    - Transaction history → Fetch từ backend
    - Ranking → Fetch từ backend
    - Stock price → Fetch từ market cache

---

## 📚 Related Documentation

-   [Feature Types](../../types/features.ts)
-   [API Endpoints](../../../docs/API_ENDPOINTS.md)
-   [Feature Area Component](../../components/feature-area.tsx)

---

## 🔄 Changelog

### v1.0.0

-   ✅ Groq API integration với Next.js endpoint
-   ✅ AGENT_API integration với full context
-   ✅ 10 UI effects support
-   ✅ Intent classification với priority logic
-   ✅ Error handling và fallback mechanisms
-   ✅ Transaction history, stats, ranking data fetching

---

## 👥 Contributors

-   Development Team

---

## 📄 License

Internal use only

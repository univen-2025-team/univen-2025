# Frontend Integration Guide - Chat API

Tài liệu này hướng dẫn frontend cách fetch data và xử lý response từ Chat API `/api/v1/chat`.

---

## 1. API Endpoint

### Endpoints

```
POST /api/v1/chat
GET /health
```

---

## 2. Request Structure

### ChatRequest Schema

```typescript
interface ChatRequest {
  messages: ChatMessage[]; // BẮT BUỘC - Danh sách messages trong conversation
  meta?: {
    user_id?: string; // User ID (optional)
    session_id?: string; // Session ID (optional, dùng để maintain conversation)
    locale?: string; // Locale (default: "vi-VN")
  };
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string; // Nội dung message
}
```

### Ví dụ Request

#### Request đơn giản (message đầu tiên)

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Giá cổ phiếu VCB hôm nay là bao nhiêu?"
    }
  ],
  "meta": {
    "user_id": "demo",
    "session_id": "sess-price"
  }
}
```

#### Request với conversation history (multi-turn)

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Mình muốn mua cổ phiếu VCB"
    },
    {
      "role": "assistant",
      "content": "Tôi sẽ hướng dẫn bạn mua cổ phiếu VCB. Giá hiện tại là 95,000 VNĐ. Vui lòng điền form bên dưới."
    },
    {
      "role": "user",
      "content": "Xác nhận mua VCB"
    }
  ],
  "meta": {
    "user_id": "demo",
    "session_id": "sess-buy-flow"
  }
}
```

### Lưu ý quan trọng

1. **Conversation History**: Luôn gửi toàn bộ conversation history (tất cả messages trước đó) để:

   - Agent hiểu context
   - Suggestions được generate dựa trên toàn bộ conversation
   - Flow state được detect chính xác

2. **Session ID**: Dùng cùng `session_id` cho một conversation để maintain context

3. **Message cuối cùng**: Message cuối cùng trong `messages` array phải là message từ user (role: "user")

---

## 3. Response Structure

### ChatResponse Schema

```typescript
interface ChatResponse {
  reply: string; // BẮT BUỘC - Text response từ agent
  ui_effects: FeatureInstruction[]; // Danh sách UI components cần render
  suggestion_messages: SuggestionMessage[]; // Gợi ý câu hỏi tiếp theo (luôn có ít nhất 1)
  raw_agent_output?: {
    // Debug info (optional)
    reply: string;
    events: Array<{
      author: string;
      has_is_final: boolean;
      text: string;
      type: string;
    }>;
  };
}
```

### Ví dụ Response

```json
{
  "reply": "Giá VCB hôm nay là 95,000 VNĐ, tăng 2.5% so với hôm qua.",
  "ui_effects": [],
  "suggestion_messages": [
    {
      "text": "Xem lịch sử giá VCB 1 tháng qua",
      "action": "query:lịch sử giá VCB",
      "icon": "📊"
    },
    {
      "text": "So sánh VCB với mã khác",
      "action": "query:so sánh VCB",
      "icon": "🔍"
    },
    {
      "text": "Xem báo cáo tài chính VCB",
      "action": "query:báo cáo tài chính VCB",
      "icon": "📈"
    }
  ]
}
```

---

## 4. Fetch Data - Implementation

### TypeScript/JavaScript Example

```typescript
// Types
interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  meta?: {
    user_id?: string;
    session_id?: string;
    locale?: string;
  };
}

interface SuggestionMessage {
  text: string;
  action?: string;
  icon?: string;
}

// UI Effect Payload Types
interface BuyFlowStep {
  id: string;
  title: string;
  description?: string;
}

interface BuyStockData {
  symbol: string;
  currentPrice: number;
  steps: BuyFlowStep[];
}

interface SellStockData {
  symbol: string;
  currentPrice: number;
  availableQuantity: number;
  steps: BuyFlowStep[];
}

interface TransactionData {
  transactionId?: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  totalAmount: number;
  userId: string;
}

interface UserProfileData {
  userId: string;
  fullName?: string;
  email?: string;
  balance?: number;
  avatar?: string;
}

interface TransactionHistoryData {
  userId: string;
  transactions: any[];
}

interface TransactionStatsData {
  userId: string;
  totalProfit?: number;
  totalTransactions?: number;
  winRate?: number;
}

interface RankingData {
  rankings: any[];
  userRank?: number;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  sentiment: "positive" | "negative" | "neutral";
}

interface NewsData {
  symbol?: string;
  items: NewsItem[];
}

interface StockDetailData {
  symbol: string;
  name: string;
  description?: string;
  price: number;
  changePercent: number;
  intradayChart: any[];
}

// UI Effect Types
type FeatureInstruction =
  | { type: "SHOW_MARKET_OVERVIEW" }
  | { type: "OPEN_BUY_STOCK"; payload: BuyStockData }
  | { type: "OPEN_SELL_STOCK"; payload: SellStockData }
  | { type: "OPEN_NEWS"; payload: NewsData }
  | { type: "OPEN_STOCK_DETAIL"; payload: StockDetailData }
  | { type: "CONFIRM_TRANSACTION"; payload: TransactionData }
  | { type: "SHOW_USER_PROFILE"; payload: UserProfileData }
  | { type: "SHOW_TRANSACTION_HISTORY"; payload: TransactionHistoryData }
  | { type: "SHOW_TRANSACTION_STATS"; payload: TransactionStatsData }
  | { type: "SHOW_RANKING"; payload: RankingData };

interface ChatResponse {
  reply: string;
  ui_effects: FeatureInstruction[];
  suggestion_messages: SuggestionMessage[];
  raw_agent_output?: any;
}

// API Client
class ChatAPI {
  private baseURL: string;
  private sessionId: string;
  private userId: string;

  constructor(baseURL: string, userId: string, sessionId?: string) {
    this.baseURL = baseURL;
    this.userId = userId;
    this.sessionId = sessionId || `session-${Date.now()}`;
  }

  async sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<ChatResponse> {
    // Build messages array với conversation history
    const messages: ChatMessage[] = [
      ...conversationHistory,
      {
        role: "user",
        content: userMessage,
      },
    ];

    const request: ChatRequest = {
      messages,
      meta: {
        user_id: this.userId,
        session_id: this.sessionId,
        locale: "vi-VN",
      },
    };

    try {
      const response = await fetch(`${this.baseURL}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Usage Example
// Thay {BASE_URL} bằng URL thực tế của server (VD: "http://localhost:8002" hoặc "https://your-api.com")
const chatAPI = new ChatAPI("{BASE_URL}", "demo", "sess-123");

// Conversation state
let conversationHistory: ChatMessage[] = [];

// Send first message
async function sendFirstMessage() {
  const response = await chatAPI.sendMessage("Giá VCB hôm nay?");

  // Update conversation history
  conversationHistory.push(
    { role: "user", content: "Giá VCB hôm nay?" },
    { role: "assistant", content: response.reply }
  );

  // Render response
  renderResponse(response);
}

// Send follow-up message
async function sendFollowUpMessage() {
  const response = await chatAPI.sendMessage(
    "Cho mình xem lịch sử giá VCB",
    conversationHistory // Pass full history
  );

  // Update conversation history
  conversationHistory.push(
    { role: "user", content: "Cho mình xem lịch sử giá VCB" },
    { role: "assistant", content: response.reply }
  );

  // Render response
  renderResponse(response);
}
```

---

## 5. Xử lý Response

### 5.1. Render Reply (Text Response)

```typescript
function renderReply(reply: string) {
  // Hiển thị reply trong chat bubble
  const messageElement = document.createElement("div");
  messageElement.className = "chat-message assistant";
  messageElement.textContent = reply;
  chatContainer.appendChild(messageElement);
}
```

### 5.2. Xử lý UI Effects

```typescript
function handleUIEffects(uiEffects: FeatureInstruction[]) {
  for (const effect of uiEffects) {
    switch (effect.type) {
      case "SHOW_MARKET_OVERVIEW":
        showMarketOverview();
        break;

      case "OPEN_BUY_STOCK":
        openBuyStockModal(effect.payload);
        break;

      case "OPEN_SELL_STOCK":
        openSellStockModal(effect.payload);
        break;

      case "OPEN_NEWS":
        showNewsPanel(effect.payload);
        break;

      case "OPEN_STOCK_DETAIL":
        showStockDetail(effect.payload);
        break;

      case "SHOW_USER_PROFILE":
        showUserProfile(effect.payload);
        break;

      case "SHOW_TRANSACTION_HISTORY":
        showTransactionHistory(effect.payload);
        break;

      case "SHOW_TRANSACTION_STATS":
        showTransactionStats(effect.payload);
        break;

      case "SHOW_RANKING":
        showRanking(effect.payload);
        break;

      case "CONFIRM_TRANSACTION":
        showTransactionConfirmation(effect.payload);
        break;

      default:
        // TypeScript sẽ báo lỗi nếu có type mới chưa được handle
        const _exhaustive: never = effect;
        console.warn("Unknown UI effect type:", effect);
    }
  }
}

// Example: Handle OPEN_BUY_STOCK
function openBuyStockModal(payload: {
  symbol: string;
  currentPrice: number;
  steps: Array<{ id: string; title: string; description?: string }>;
}) {
  // Mở modal mua cổ phiếu
  const modal = document.getElementById("buy-stock-modal");
  modal.style.display = "block";

  // Pre-fill data
  document.getElementById("stock-symbol").textContent = payload.symbol;
  document.getElementById(
    "current-price"
  ).textContent = `${payload.currentPrice.toLocaleString("vi-VN")} VNĐ`;

  // Render steps
  renderBuySteps(payload.steps);
}
```

### 5.3. Xử lý Suggestions

```typescript
function handleSuggestions(suggestions: SuggestionMessage[]) {
  const suggestionsContainer = document.getElementById("suggestions");
  suggestionsContainer.innerHTML = ""; // Clear previous

  for (const suggestion of suggestions) {
    const button = document.createElement("button");
    button.className = "suggestion-button";
    button.innerHTML = `${suggestion.icon || ""} ${suggestion.text}`;

    // Handle click
    button.addEventListener("click", () => {
      if (suggestion.action) {
        handleSuggestionAction(suggestion.action);
      }
    });

    suggestionsContainer.appendChild(button);
  }
}

function handleSuggestionAction(action: string) {
  // Parse action
  if (action.startsWith("query:")) {
    // Gửi query mới
    const query = action.replace("query:", "");
    sendMessage(query);
  } else if (action.startsWith("buy:")) {
    // Mở form mua
    const symbol = action.replace("buy:", "");
    sendMessage(`Mua ${symbol}`);
  } else if (action.startsWith("sell:")) {
    // Mở form bán
    const symbol = action.replace("sell:", "");
    sendMessage(`Bán ${symbol}`);
  } else if (action.startsWith("confirm:")) {
    // Xác nhận action
    const parts = action.split(":");
    if (parts.length >= 3) {
      const type = parts[1]; // "buy" or "sell"
      const symbol = parts[2];
      sendMessage(`Xác nhận ${type} ${symbol}`);
    }
  } else if (action === "help") {
    // Show help
    showHelp();
  }
}
```

---

## 6. Flow Examples

### 6.1. Flow Mua Cổ Phiếu

```typescript
// Step 1: User yêu cầu mua
const response1 = await chatAPI.sendMessage("Mình muốn mua cổ phiếu VCB");
// Response có:
// - reply: "Tôi sẽ hướng dẫn bạn mua cổ phiếu VCB..."
// - ui_effects: [{ type: "OPEN_BUY_STOCK", payload: {...} }]
// - suggestion_messages: [
//     { text: "Xác nhận mua VCB", action: "confirm:buy:VCB" },
//     { text: "Hủy mua VCB", action: "cancel:buy:VCB" }
//   ]

// Update conversation history
conversationHistory.push(
  { role: "user", content: "Mình muốn mua cổ phiếu VCB" },
  { role: "assistant", content: response1.reply }
);

// Render UI: Mở modal mua cổ phiếu
handleUIEffects(response1.ui_effects);

// Step 2: User điền form và xác nhận (qua UI hoặc suggestion)
const response2 = await chatAPI.sendMessage(
  "Xác nhận mua VCB",
  conversationHistory // QUAN TRỌNG: Pass full history
);
// Response có:
// - reply: "Đã xác nhận mua VCB..."
// - ui_effects: [{ type: "CONFIRM_TRANSACTION", payload: {...} }]
// - suggestion_messages: [
//     { text: "Xem lịch sử giao dịch", action: "query:lịch sử giao dịch" },
//     { text: "Xem thông tin tài khoản", action: "query:thông tin tài khoản" }
//   ]

// Update conversation history
conversationHistory.push(
  { role: "user", content: "Xác nhận mua VCB" },
  { role: "assistant", content: response2.reply }
);
```

### 6.2. Flow Hỏi Giá với Conversation History

```typescript
// Step 1: Hỏi giá
const response1 = await chatAPI.sendMessage("Giá VCB hôm nay?");
conversationHistory.push(
  { role: "user", content: "Giá VCB hôm nay?" },
  { role: "assistant", content: response1.reply }
);

// Step 2: Hỏi tiếp (có context từ step 1)
const response2 = await chatAPI.sendMessage(
  "Cho mình xem lịch sử giá VCB",
  conversationHistory // Suggestions sẽ có context về VCB
);
// Suggestions sẽ có:
// - "Xem lịch sử giá VCB 1 tháng qua" (có VCB từ conversation)
// - "So sánh VCB với mã khác" (có VCB từ conversation)
```

---

## 7. UI Effects Chi Tiết

### 7.1. OPEN_BUY_STOCK

```typescript
interface BuyStockPayload {
  symbol: string;
  currentPrice: number;
  steps: Array<{
    id: string; // VD: "choose_volume", "choose_price", "confirm"
    title: string;
    description?: string;
  }>;
}

function openBuyStockModal(payload: BuyStockPayload) {
  // 1. Mở modal
  // 2. Pre-fill symbol và currentPrice
  // 3. Render form với steps từ payload
  //    - choose_volume: Input số lượng
  //    - choose_price: Input giá đặt lệnh
  //    - confirm: Button xác nhận
  // 4. Khi user confirm, gọi API transaction
}

// Ví dụ payload:
// {
//   "type": "OPEN_BUY_STOCK",
//   "payload": {
//     "symbol": "VCB",
//     "currentPrice": 95000,
//     "steps": [
//       { "id": "choose_volume", "title": "Chọn khối lượng" },
//       { "id": "choose_price", "title": "Chọn giá đặt lệnh" },
//       { "id": "confirm", "title": "Xác nhận lệnh" }
//     ]
//   }
// }
```

### 7.2. OPEN_SELL_STOCK

```typescript
interface SellStockPayload {
  symbol: string;
  currentPrice: number;
  availableQuantity: number; // Số lượng cổ phiếu user đang có
  steps: Array<{
    id: string;
    title: string;
    description?: string;
  }>;
}

function openSellStockModal(payload: SellStockPayload) {
  // Tương tự OPEN_BUY_STOCK
  // Nhưng giới hạn quantity <= availableQuantity
}

// Ví dụ payload:
// {
//   "type": "OPEN_SELL_STOCK",
//   "payload": {
//     "symbol": "VCB",
//     "currentPrice": 95000,
//     "availableQuantity": 1000,
//     "steps": [
//       { "id": "choose_volume", "title": "Chọn khối lượng" },
//       { "id": "choose_price", "title": "Chọn giá đặt lệnh" },
//       { "id": "confirm", "title": "Xác nhận lệnh" }
//     ]
//   }
// }
```

### 7.3. CONFIRM_TRANSACTION

```typescript
interface TransactionPayload {
  transactionId?: string;
  symbol: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  totalAmount: number;
  userId: string;
}

function showTransactionConfirmation(payload: TransactionPayload) {
  // Hiển thị thông tin giao dịch đã xác nhận
  // Có thể redirect đến trang thanh toán hoặc lịch sử
}

// Ví dụ payload:
// {
//   "type": "CONFIRM_TRANSACTION",
//   "payload": {
//     "transactionId": "txn_123",
//     "symbol": "VCB",
//     "type": "buy",
//     "quantity": 100,
//     "price": 95000,
//     "totalAmount": 9500000,
//     "userId": "user_123"
//   }
// }
```

### 7.4. Các UI Effects khác

#### SHOW_MARKET_OVERVIEW

```typescript
// Không có payload
{
  "type": "SHOW_MARKET_OVERVIEW"
}
```

#### OPEN_NEWS

```typescript
{
  "type": "OPEN_NEWS",
  "payload": {
    "symbol": "VCB", // optional
    "items": [
      {
        "id": "news_1",
        "title": "Tin tức về VCB",
        "source": "VnExpress",
        "timeAgo": "2 giờ trước",
        "sentiment": "positive"
      }
    ]
  }
}
```

#### OPEN_STOCK_DETAIL

```typescript
{
  "type": "OPEN_STOCK_DETAIL",
  "payload": {
    "symbol": "VCB",
    "name": "Vietcombank",
    "description": "Ngân hàng thương mại cổ phần Ngoại Thương Việt Nam",
    "price": 95000,
    "changePercent": 2.5,
    "intradayChart": [...]
  }
}
```

#### SHOW_USER_PROFILE

```typescript
{
  "type": "SHOW_USER_PROFILE",
  "payload": {
    "userId": "user_123",
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "balance": 100000000,
    "avatar": "https://..."
  }
}
```

#### SHOW_TRANSACTION_HISTORY

```typescript
{
  "type": "SHOW_TRANSACTION_HISTORY",
  "payload": {
    "userId": "user_123",
    "transactions": [...]
  }
}
```

#### SHOW_TRANSACTION_STATS

```typescript
{
  "type": "SHOW_TRANSACTION_STATS",
  "payload": {
    "userId": "user_123",
    "totalProfit": 5000000,
    "totalTransactions": 50,
    "winRate": 0.65
  }
}
```

#### SHOW_RANKING

```typescript
{
  "type": "SHOW_RANKING",
  "payload": {
    "rankings": [...],
    "userRank": 10
  }
}
```

---

## 8. Suggestions Chi Tiết

### 8.1. Action Format

Suggestions có thể có các action format:

- `query:<text>`: Gửi query mới (VD: `query:lịch sử giá VCB`)
- `buy:<symbol>`: Mở form mua (VD: `buy:VCB`)
- `sell:<symbol>`: Mở form bán (VD: `sell:VCB`)
- `confirm:<type>:<symbol>`: Xác nhận action (VD: `confirm:buy:VCB`)
- `cancel:<type>:<symbol>`: Hủy action (VD: `cancel:buy:VCB`)
- `help`: Hiển thị help

### 8.2. Suggestions dựa trên Flow State

Suggestions thay đổi dựa trên conversation history và flow state:

- **Flow mua/bán (step 1)**: Có suggestions "Xác nhận" và "Hủy"
- **Flow mua/bán (step 2 - sau xác nhận)**: Có suggestions "Xem lịch sử giao dịch"
- **Flow hỏi giá**: Có suggestions về lịch sử, so sánh, báo cáo tài chính

### 8.3. Suggestions dựa trên Conversation History

Suggestions có context từ toàn bộ conversation:

- Nếu conversation có nhắc đến symbol (VD: VCB), suggestions sẽ có VCB
- Nếu conversation về giá, suggestions sẽ về lịch sử giá, báo cáo tài chính

---

## 9. Error Handling

```typescript
async function sendMessageWithErrorHandling(
  message: string,
  conversationHistory: ChatMessage[]
): Promise<ChatResponse | null> {
  try {
    const response = await chatAPI.sendMessage(message, conversationHistory);
    return response;
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error
      console.error("Network error:", error);
      showError("Không thể kết nối đến server. Vui lòng thử lại.");
    } else if (error instanceof Error) {
      // HTTP error
      console.error("HTTP error:", error);
      showError("Đã có lỗi xảy ra. Vui lòng thử lại.");
    }
    return null;
  }
}
```

---

## 10. Best Practices

1. **Luôn gửi full conversation history**: Để suggestions và flow state hoạt động đúng

2. **Maintain session_id**: Dùng cùng session_id cho một conversation

3. **Update conversation history sau mỗi response**:

   ```typescript
   conversationHistory.push(
     { role: "user", content: userMessage },
     { role: "assistant", content: response.reply }
   );
   ```

4. **Xử lý UI effects ngay sau khi nhận response**: Để UI update kịp thời

5. **Render suggestions dưới mỗi assistant message**: Để user dễ dàng click

6. **Handle loading state**: Hiển thị loading khi đang gửi request

7. **Handle errors gracefully**: Hiển thị error message thân thiện với user

---

## 11. Testing

### Test với curl

```bash
# Health check
curl {BASE_URL}/health

# Send message
curl -X POST {BASE_URL}/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Giá VCB hôm nay?"
      }
    ],
    "meta": {
      "user_id": "demo",
      "session_id": "test-session"
    }
  }'
```

### Test với conversation history

```bash
curl -X POST {BASE_URL}/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Mình muốn mua cổ phiếu VCB"
      },
      {
        "role": "assistant",
        "content": "Tôi sẽ hướng dẫn bạn mua cổ phiếu VCB..."
      },
      {
        "role": "user",
        "content": "Xác nhận mua VCB"
      }
    ],
    "meta": {
      "user_id": "demo",
      "session_id": "test-session"
    }
  }'
```

---

## 12. Summary

### Request Flow

1. Build `messages` array với full conversation history
2. Gửi POST request đến `/api/v1/chat`
3. Nhận `ChatResponse`

### Response Processing

1. Render `reply` (text response)
2. Xử lý `ui_effects` (mở modal, show panel, etc.)
3. Render `suggestion_messages` (buttons/chips)
4. Update conversation history

### Key Points

- ✅ Luôn gửi full conversation history
- ✅ Maintain session_id
- ✅ Update conversation history sau mỗi response
- ✅ Xử lý UI effects ngay lập tức
- ✅ Render suggestions dưới mỗi assistant message

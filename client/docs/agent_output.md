STRUCTURE 

# API Response Format - Frontend Integration Guide

Tài liệu này mô tả format response từ API `/api/v1/chat` và cách frontend render UI dựa trên response.

---

## 1. Response Schema

### ChatResponse

```typescript
interface ChatResponse {
  reply: string; // Text response từ agent (BẮT BUỘC)
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

---

## 2. Reply (Text Response)

### Format

- **Type**: `string`
- **Required**: `true`
- **Description**: Câu trả lời từ agent bằng tiếng Việt

### Ví dụ

```json
{
  "reply": "Dựa trên dữ liệu thị trường hôm nay, chỉ số VN-Index đang ở mức 1,250 điểm, tăng 0.5% so với phiên trước. Các mã blue-chip như VCB, VIC, VHM đều có xu hướng tăng giá..."
}
```

### Lưu ý

- Luôn có text response (không bao giờ rỗng)
- Nếu agent không trả về text, hệ thống sẽ tạo fallback message dựa trên query
- Frontend nên hiển thị `reply` trong chat bubble hoặc message area

---

## 3. UI Effects (UI Components)

### Format

- **Type**: `FeatureInstruction[]`
- **Required**: `false` (có thể rỗng `[]`)
- **Description**: Danh sách các UI components cần render

### Các loại UI Effects

#### 3.1. SHOW_MARKET_OVERVIEW

Hiển thị tổng quan thị trường.

```json
{
  "type": "SHOW_MARKET_OVERVIEW"
}
```

**Frontend action**: Render market overview panel với:

- Chỉ số VN-Index, HNX-Index
- Biểu đồ tổng quan
- Top cổ phiếu tăng/giảm

---

#### 3.2. OPEN_BUY_STOCK

Mở form mua cổ phiếu.

```json
{
  "type": "OPEN_BUY_STOCK",
  "payload": {
    "symbol": "MWG",
    "currentPrice": 125000.0,
    "steps": [
      {
        "id": "choose_volume",
        "title": "Chọn khối lượng",
        "description": null
      },
      {
        "id": "choose_price",
        "title": "Chọn giá đặt lệnh",
        "description": null
      },
      {
        "id": "confirm",
        "title": "Xác nhận lệnh",
        "description": null
      }
    ]
  }
}
```

**Frontend action**:

- Mở modal/dialog mua cổ phiếu
- Hiển thị form với các steps: chọn khối lượng → chọn giá → xác nhận
- Pre-fill `symbol` và `currentPrice`

---

#### 3.3. OPEN_NEWS

Hiển thị tin tức.

```json
{
  "type": "OPEN_NEWS",
  "payload": {
    "symbol": "VNM",
    "items": [
      {
        "id": "news-1",
        "title": "VNM công bố kết quả kinh doanh Q3",
        "source": "VnExpress",
        "timeAgo": "2 giờ trước",
        "sentiment": "positive"
      }
    ]
  }
}
```

**Frontend action**:

- Mở news panel hoặc modal
- Hiển thị danh sách tin tức
- Filter theo `symbol` nếu có

---

#### 3.4. OPEN_STOCK_DETAIL

Hiển thị chi tiết cổ phiếu.

```json
{
  "type": "OPEN_STOCK_DETAIL",
  "payload": {
    "symbol": "VCB",
    "name": "Ngân hàng Ngoại thương Việt Nam",
    "description": "Ngân hàng thương mại cổ phần lớn nhất Việt Nam",
    "price": 95000.0,
    "changePercent": 1.5,
    "intradayChart": [
      { "time": "09:00", "price": 94000 },
      { "time": "10:00", "price": 94500 }
    ]
  }
}
```

**Frontend action**:

- Mở stock detail page/modal
- Hiển thị thông tin chi tiết, biểu đồ giá trong ngày
- Các chỉ số tài chính

---

## 4. Suggestion Messages (Gợi ý)

### Format

- **Type**: `SuggestionMessage[]`
- **Required**: `false` (nhưng luôn có ít nhất 1 item)
- **Description**: Gợi ý câu hỏi/action tiếp theo cho user

### SuggestionMessage Schema

```typescript
interface SuggestionMessage {
  text: string; // Nội dung gợi ý
  action?: string; // Action để thực hiện (VD: "query:lịch sử giá VCB")
  icon?: string; // Icon emoji (VD: "📊", "🔍")
}
```

### Ví dụ

```json
{
  "suggestion_messages": [
    {
      "text": "Xem lịch sử giá 1 tháng qua",
      "action": "query:lịch sử giá VCB",
      "icon": "📊"
    },
    {
      "text": "So sánh VCB với mã khác",
      "action": "query:so sánh VCB",
      "icon": "🔍"
    },
    {
      "text": "Xem báo cáo tài chính",
      "action": "query:báo cáo tài chính",
      "icon": "📈"
    }
  ]
}
```

### Frontend Action

- Hiển thị dưới dạng buttons/chips dưới chat message
- Khi user click, gửi `action` như một query mới đến API
- Nếu không có `action`, hiển thị `text` như một gợi ý thông thường

---

## 5. Ví dụ Response Hoàn Chỉnh

### Example 1: Market Overview

```json
{
  "reply": "Dựa trên dữ liệu thị trường hôm nay, chỉ số VN-Index đang ở mức 1,250 điểm, tăng 0.5% so với phiên trước. Các mã blue-chip như VCB, VIC, VHM đều có xu hướng tăng giá.",
  "ui_effects": [
    {
      "type": "SHOW_MARKET_OVERVIEW"
    }
  ],
  "suggestion_messages": [
    {
      "text": "Xem giá cổ phiếu VCB",
      "action": "query:Giá VCB hôm nay",
      "icon": "💹"
    },
    {
      "text": "Xem lịch sử giá 1 tháng qua",
      "action": "query:lịch sử giá",
      "icon": "📊"
    },
    {
      "text": "Tìm hiểu thêm",
      "action": "help",
      "icon": "❓"
    }
  ],
  "raw_agent_output": {
    "reply": "Dựa trên dữ liệu thị trường...",
    "events": [
      {
        "author": "model",
        "has_is_final": true,
        "text": "Dựa trên dữ liệu thị trường...",
        "type": "ContentEvent"
      }
    ]
  }
}
```

### Example 2: Buy Stock

```json
{
  "reply": "Tôi sẽ hướng dẫn bạn mua cổ phiếu MWG. Vui lòng chọn khối lượng và giá đặt lệnh.",
  "ui_effects": [
    {
      "type": "OPEN_BUY_STOCK",
      "payload": {
        "symbol": "MWG",
        "currentPrice": 125000.0,
        "steps": [
          {
            "id": "choose_volume",
            "title": "Chọn khối lượng",
            "description": null
          },
          {
            "id": "choose_price",
            "title": "Chọn giá đặt lệnh",
            "description": null
          },
          {
            "id": "confirm",
            "title": "Xác nhận lệnh",
            "description": null
          }
        ]
      }
    }
  ],
  "suggestion_messages": [
    {
      "text": "Xem chi tiết MWG",
      "action": "query:chi tiết MWG",
      "icon": "📊"
    },
    {
      "text": "Xem tin tức MWG",
      "action": "query:tin tức MWG",
      "icon": "📰"
    },
    {
      "text": "Tôi có thể hỏi gì khác?",
      "action": "help",
      "icon": "❓"
    }
  ]
}
```

---

## 6. Frontend Integration Flow

### Step 1: Gửi Request

```typescript
const response = await fetch("http://localhost:8000/api/v1/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "system", content: "Bạn là trợ lý chứng khoán Việt Nam." },
      { role: "user", content: "Cho mình xem tổng quan thị trường hôm nay." },
    ],
    meta: {
      user_id: "user-123",
      session_id: "session-456",
    },
  }),
});

const data: ChatResponse = await response.json();
```

### Step 2: Render Reply

```typescript
// Hiển thị text response
displayMessage(data.reply);
```

### Step 3: Render UI Effects

```typescript
// Xử lý từng UI effect
for (const effect of data.ui_effects) {
  switch (effect.type) {
    case "SHOW_MARKET_OVERVIEW":
      showMarketOverviewPanel();
      break;

    case "OPEN_BUY_STOCK":
      openBuyStockModal(effect.payload);
      break;

    case "OPEN_NEWS":
      showNewsPanel(effect.payload);
      break;

    case "OPEN_STOCK_DETAIL":
      navigateToStockDetail(effect.payload.symbol);
      break;
  }
}
```

### Step 4: Render Suggestions

```typescript
// Hiển thị suggestion buttons
const suggestionButtons = data.suggestion_messages.map((suggestion) => (
  <button
    key={suggestion.text}
    onClick={() => handleSuggestionClick(suggestion.action)}
  >
    {suggestion.icon} {suggestion.text}
  </button>
));

displaySuggestions(suggestionButtons);
```

---

## 7. Error Handling

### Case 1: Reply là debug message

Nếu `reply` chứa `[DEBUG]`, frontend nên:

- Vẫn hiển thị reply (có thể style khác)
- Kiểm tra `raw_agent_output.events` để debug
- Hiển thị UI effects nếu có

### Case 2: UI Effects rỗng

- Không render thêm component nào
- Chỉ hiển thị text reply và suggestions

### Case 3: Suggestion Messages rỗng

- Luôn có ít nhất 1 suggestion mặc định từ backend
- Nếu vẫn rỗng, frontend có thể hiển thị suggestions mặc định

---

## 8. Best Practices

1. **Luôn hiển thị reply**: Dù có UI effects hay không, luôn hiển thị text reply
2. **Xử lý UI effects theo thứ tự**: Nếu có nhiều effects, xử lý từng cái một
3. **Suggestion actions**: Khi user click suggestion, gửi `action` như một query mới
4. **Error handling**: Luôn có fallback UI nếu response không đúng format
5. **Loading state**: Hiển thị loading khi đang gọi API

---

## 9. Testing

Sử dụng script test để verify response format:

```bash
cd test-adk
python scripts/test_api.py
```

Script sẽ test 3 scenarios:

- `market_overview`: Test SHOW_MARKET_OVERVIEW
- `buy_stock`: Test OPEN_BUY_STOCK
- `news`: Test OPEN_NEWS

---

## 10. Changelog

### 2024-12-06

- ✅ Cải thiện parse text từ agent events
- ✅ Đảm bảo reply luôn có text (fallback message)
- ✅ Cải thiện logic generate suggestion_messages
- ✅ Đảm bảo suggestion_messages luôn có ít nhất 1 item

---

## 11. Tài liệu liên quan

- `test-adk/api.md`: API contract chi tiết
- `test-adk/app/schemas/chat.py`: Pydantic schemas
- `test-adk/app/schemas/ui.py`: UI instruction schemas
- `docs/README.md`: FastAPI + ADK Backend Guide


data = resp.json()
reply = data.get("reply", "")
ui_effects = data.get("ui_effects", [])
suggestions = data.get("suggestion_messages", [])
raw_output = data.get("raw_agent_output", {})



✅ /health: {'status': 'ok', 'service': 'vnstock-agent'}

=== Test chat: market_overview ===
Status: 200
Reply: Đây là tổng quan thị trường chứng khoán Việt Nam hôm nay.
UI Effects:
[
  {
    "type": "SHOW_MARKET_OVERVIEW"
  }
]

=== Test chat: buy_stock ===
Status: 200
Reply: Tôi sẽ hướng dẫn bạn mua cổ phiếu. Vui lòng chọn mã cổ phiếu và khối lượng bạn muốn mua.
UI Effects:
[
  {
    "type": "OPEN_BUY_STOCK",
    "payload": {
      "symbol": "MWG",
      "currentPrice": 0.0,
      "steps": [
        {
          "id": "choose_volume",
          "title": "Chọn khối lượng",
          "description": null
        },
        {
          "id": "choose_price",
          "title": "Chọn giá đặt lệnh",
          "description": null
        },
        {
          "id": "confirm",
          "title": "Xác nhận lệnh",
          "description": null
        {
          "id": "choose_price",
          "title": "Chọn giá đặt lệnh",
          "description": null
        },
        {
          "id": "confirm",
          "title": "Xác nhận lệnh",
          "description": null
        },
        {
          "id": "confirm",
          "title": "Xác nhận lệnh",
          "description": null
        {
          "id": "confirm",
          "title": "Xác nhận lệnh",
          "description": null
          "id": "confirm",
          "title": "Xác nhận lệnh",
          "description": null
          "title": "Xác nhận lệnh",
          "description": null
          "description": null
        }
      ]
      ]
    }
  }
    }
  }
  }
]

=== Test chat: news ===
Status: 200
Reply: Đây là các tin tức mới nhất về thị trường chứng khoán.
UI Effects:
[]

(p313) F:\ANHTHU\1-HCMUS\CONTEST\Univentures25\ai-core-trading\test-adk\scripts>python test_api.py
✅ /health: {'status': 'ok', 'service': 'vnstock-agent'}

============================================================
=== Test chat: market_overview ===
============================================================
Status: 200

📝 Reply (57 chars):
   Đây là tổng quan thị trường chứng khoán Việt Nam hôm nay.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ✅ has_market_keywords: True
   ✅ has_data: True

🎨 UI Effects (1):
[
  {
    "type": "SHOW_MARKET_OVERVIEW"
  }
]

💡 Suggestions (3):
   1. Xem thông tin tài khoản (👤)
   2. Xem lịch sử giao dịch (📋)
   3. Xem bảng xếp hạng (🏆)

🔍 Raw Agent Output:
   Events: 1
   Model events with text: 0

============================================================
=== Test chat: price_query ===
============================================================
Status: 200

📝 Reply (67 chars):
   Tôi đã nhận được yêu cầu của bạn. Vui lòng thử lại hoặc hỏi rõ hơn.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False
   ⚠️  WARNING: Không có dữ liệu thị trường trong reply!
   💡 Có thể agent không gọi MCP tools hoặc không trả về dữ liệu

🎨 UI Effects (0):
   (không có)

💡 Suggestions (3):
   1. So sánh VCB với mã khác (🔍)
   2. Xem báo cáo tài chính (📈)
   3. Xem tổng quan thị trường (🌐)

🔍 Raw Agent Output:
   Events: 3
   Model events with text: 0

⚠️  Issues:
   - Không có dữ liệu thị trường trong reply

============================================================
=== Test chat: price_query_multiple ===
============================================================
Status: 200

📝 Reply (67 chars):
   Tôi đã nhận được yêu cầu của bạn. Vui lòng thử lại hoặc hỏi rõ hơn.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False
   ⚠️  WARNING: Không có dữ liệu thị trường trong reply!
   💡 Có thể agent không gọi MCP tools hoặc không trả về dữ liệu

🎨 UI Effects (0):
   (không có)

💡 Suggestions (3):
   1. Xem báo cáo tài chính (📈)
   2. Xem thông tin tài khoản (👤)
   3. Xem lịch sử giao dịch (📋)

🔍 Raw Agent Output:
   Events: 3
   Model events with text: 0

⚠️  Issues:
   - Không có dữ liệu thị trường trong reply

============================================================
=== Test chat: news ===
============================================================
Status: 200

📝 Reply (54 chars):
   Đây là các tin tức mới nhất về thị trường chứng khoán.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ✅ has_market_keywords: True
   ✅ has_data: True

🎨 UI Effects (0):
   (không có)

💡 Suggestions (3):
💡 Suggestions (3):
   1. Xem tổng quan thị trường (🌐)
   2. Xem thông tin tài khoản (👤)
   3. Xem lịch sử giao dịch (📋)

🔍 Raw Agent Output:
   Events: 1
   Model events with text: 0

============================================================
=== Test chat: stock_detail ===
============================================================
Status: 500
❌ Error Body: Internal Server Error

============================================================
=== Test chat: buy_stock_incomplete ===
============================================================
Status: 200

📝 Reply (88 chars):
   Tôi sẽ hướng dẫn bạn mua cổ phiếu. Vui lòng chọn mã cổ phiếu và khối lượng bạn muốn mua.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False

🎨 UI Effects (1):
[
  {
    "type": "OPEN_BUY_STOCK",
    "payload": {
      "symbol": "MWG",
      "currentPrice": 0.0,
      "steps": [
        {
          "id": "choose_volume",
          "title": "Chọn khối lượng",
          "description": null
        },
        {
          "id": "choose_price",
          "title": "Chọn giá đặt lệnh",
          "description": null
        },
        {
          "id": "confirm",
          "title": "Xác nhận lệnh",
          "description": null
        }
      ]
    }
  }
]

💡 Suggestions (3):
   1. Xem tổng quan thị trường (🌐)
   2. Xem thông tin tài khoản (👤)
   3. Xem lịch sử giao dịch (📋)

🔍 Raw Agent Output:
   Events: 0

============================================================
=== Test chat: buy_stock_complete ===
============================================================
Status: 200

📝 Reply (88 chars):
   Tôi sẽ hướng dẫn bạn mua cổ phiếu. Vui lòng chọn mã cổ phiếu và khối lượng bạn muốn mua.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False

🎨 UI Effects (1):
[
  {
    "type": "OPEN_BUY_STOCK",
    "payload": {
      "symbol": "MWG",
      "currentPrice": 0.0,
      "steps": [
        {
          "id": "choose_volume",
          "title": "Chọn khối lượng",
          "description": null
        },
        {
          "id": "choose_price",
          "title": "Chọn giá đặt lệnh",
          "description": null
        },
        {
          "id": "confirm",
          "title": "Xác nhận lệnh",
          "description": null
        }
      ]
    }
  }
]

💡 Suggestions (3):
   1. Xem tổng quan thị trường (🌐)
   2. Xem thông tin tài khoản (👤)
   3. Xem lịch sử giao dịch (📋)

🔍 Raw Agent Output:
   Events: 0

============================================================
=== Test chat: sell_stock_incomplete ===
============================================================
Status: 200

📝 Reply (67 chars):
   Tôi đã nhận được yêu cầu của bạn. Vui lòng thử lại hoặc hỏi rõ hơn.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False

🎨 UI Effects (1):
[
  {
    "type": "OPEN_SELL_STOCK",
    "payload": {
      "symbol": "VCB",
      "currentPrice": 0.0,
      "availableQuantity": 0.0,
      "steps": [
        {
          "id": "choose_volume",
          "title": "Chọn khối lượng",
          "description": null
        },
        {
          "id": "choose_price",
          "title": "Chọn giá đặt lệnh",
          "description": null
        },
        {
          "id": "confirm",
          "title": "Xác nhận lệnh",
          "description": null
        }
      ]
    }
  }
]

💡 Suggestions (3):
   1. Xem tổng quan thị trường (🌐)
   2. Xem thông tin tài khoản (👤)
   3. Xem lịch sử giao dịch (📋)

🔍 Raw Agent Output:
   Events: 0

============================================================
=== Test chat: sell_stock_complete ===
============================================================
Status: 200

📝 Reply (67 chars):
   Tôi đã nhận được yêu cầu của bạn. Vui lòng thử lại hoặc hỏi rõ hơn.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False

🎨 UI Effects (1):
[
  {
    "type": "OPEN_SELL_STOCK",
    "payload": {
      "symbol": "VCB",
      "currentPrice": 0.0,
      "availableQuantity": 0.0,
      "steps": [
        {
          "id": "choose_volume",
          "title": "Chọn khối lượng",
          "description": null
        },
        {
          "id": "choose_price",
          "title": "Chọn giá đặt lệnh",
          "description": null
        },
        {
          "id": "confirm",
          "title": "Xác nhận lệnh",
          "description": null
        }
      ]
    }
  }
]

💡 Suggestions (3):
   1. Xem tổng quan thị trường (🌐)
   2. Xem thông tin tài khoản (👤)
   3. Xem lịch sử giao dịch (📋)

🔍 Raw Agent Output:
   Events: 0

============================================================
=== Test chat: user_profile ===
============================================================
Status: 200

📝 Reply (67 chars):
   Tôi đã nhận được yêu cầu của bạn. Vui lòng thử lại hoặc hỏi rõ hơn.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False

🎨 UI Effects (1):
[
  {
    "type": "SHOW_USER_PROFILE",
    "payload": {
      "userId": "ID",
      "fullName": null,
      "email": null,
      "balance": null,
      "avatar": null
    }
  }
]

💡 Suggestions (3):
   1. Xem lịch sử giao dịch (📋)
   2. Xem bảng xếp hạng (🏆)
   3. Xem tổng quan thị trường (🌐)

🔍 Raw Agent Output:
   Events: 0

============================================================
=== Test chat: transaction_history ===
============================================================
Status: 200

📝 Reply (67 chars):
   Tôi đã nhận được yêu cầu của bạn. Vui lòng thử lại hoặc hỏi rõ hơn.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False

🎨 UI Effects (1):
[
  {
    "type": "SHOW_TRANSACTION_HISTORY",
    "payload": {
      "userId": "ID",
      "transactions": []
    }
  }
]

💡 Suggestions (3):
   1. Xem bảng xếp hạng (🏆)
   2. Xem tổng quan thị trường (🌐)
   3. Giá cổ phiếu VCB hôm nay? (💹)

🔍 Raw Agent Output:
   Events: 0

============================================================
=== Test chat: transaction_stats ===
============================================================
Status: 200

📝 Reply (67 chars):
   Tôi đã nhận được yêu cầu của bạn. Vui lòng thử lại hoặc hỏi rõ hơn.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False

🎨 UI Effects (2):
[
  {
    "type": "SHOW_TRANSACTION_HISTORY",
    "payload": {
      "userId": "ID",
      "transactions": []
    }
  },
  {
    "type": "SHOW_TRANSACTION_STATS",
    "payload": {
      "userId": "ID",
      "totalProfit": null,
      "totalTransactions": null,
      "winRate": null
    }
  }
]

💡 Suggestions (3):
   1. Xem bảng xếp hạng (🏆)
   2. Xem tổng quan thị trường (🌐)
   3. Giá cổ phiếu VCB hôm nay? (💹)

🔍 Raw Agent Output:
   Events: 3
   Model events with text: 0

============================================================
=== Test chat: ranking ===
============================================================
Status: 200

📝 Reply (67 chars):
   Tôi đã nhận được yêu cầu của bạn. Vui lòng thử lại hoặc hỏi rõ hơn.

📊 Market Data Check:
   ❌ has_price: False
   ❌ has_number: False
   ❌ has_symbol: False
   ❌ has_market_keywords: False
   ❌ has_data: False

🎨 UI Effects (1):
[
  {
    "type": "SHOW_RANKING",
    "payload": {
      "rankings": [],
      "userRank": null
    }
  }
]

💡 Suggestions (3):
   1. Xem thông tin tài khoản (👤)
   2. Xem lịch sử giao dịch (📋)
   3. Xem tổng quan thị trường (🌐)

🔍 Raw Agent Output:
   Events: 3
   Model events with text: 0

============================================================
=== TỔNG KẾT ===
============================================================
Tổng số test: 13
✅ OK: 10
⚠️  Warning: 2
❌ Error: 1

⚠️  Tests có warning:
   - price_query: Không có dữ liệu thị trường trong reply
   - price_query_multiple: Không có dữ liệu thị trường trong reply

❌ Tests có error:
   - stock_detail: Unknown error
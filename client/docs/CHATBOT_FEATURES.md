# Chatbot Features - Hướng dẫn tính năng và Flow tương tác

Tài liệu này mô tả các tính năng chatbot hỗ trợ và flow tương tác với hệ thống thông qua chatbot.

---

## 1. Tổng quan tính năng

Chatbot hỗ trợ các nhóm tính năng chính:

### 1.1. Thông tin thị trường (Market Data)

- ✅ Tổng quan thị trường (VN-Index, HNX-Index)
- ✅ Giá cổ phiếu (hiện tại, lịch sử, trong ngày)
- ✅ Thông tin công ty (overview, tin tức, sự kiện)
- ✅ Báo cáo tài chính
- ✅ Chi tiết cổ phiếu

### 1.2. Giao dịch (Transactions)

- ✅ Mua cổ phiếu
- ✅ Bán cổ phiếu
- ✅ Xem lịch sử giao dịch
- ✅ Thống kê giao dịch
- ✅ Hủy giao dịch

### 1.3. Quản lý tài khoản (Account Management)

- ✅ Xem thông tin tài khoản
- ✅ Xem số dư
- ✅ Xem bảng xếp hạng

---

## 2. Flow tương tác - Mua/Bán cổ phiếu

### 2.1. Flow Mua cổ phiếu

```
User: "Mình muốn mua cổ phiếu MWG"
  ↓
Agent:
  - Lấy giá hiện tại MWG từ MCP tools
  - Trả về text: "Tôi sẽ hướng dẫn bạn mua cổ phiếu MWG. Giá hiện tại là 125,000 VNĐ..."
  - UI Effect: OPEN_BUY_STOCK với payload {symbol: "MWG", currentPrice: 125000, steps: [...]}
  ↓
Frontend: Mở modal mua cổ phiếu với form 3 bước
  ↓
User điền form:
  1. Chọn khối lượng (volume)
  2. Chọn giá đặt lệnh (price)
  3. Xác nhận lệnh
  ↓
Frontend: Gọi API POST /v1/api/stock-transactions/transactions
  Body: {
    userId: "...",
    symbol: "MWG",
    type: "buy",
    quantity: 100,
    price: 125000,
    ...
  }
  ↓
Backend: Tạo transaction và trả về kết quả
  ↓
Frontend: Hiển thị kết quả giao dịch cho user
```

### 2.2. Flow Bán cổ phiếu

```
User: "Mình muốn bán cổ phiếu VCB"
  ↓
Agent:
  - Lấy giá hiện tại VCB
  - Fetch số lượng cổ phiếu user đang có từ backend (GET /v1/api/stock-transactions/transactions/:userId)
  - Trả về text: "Tôi sẽ hướng dẫn bạn bán cổ phiếu VCB. Bạn đang có 500 cổ phiếu..."
  - UI Effect: OPEN_SELL_STOCK với payload {symbol: "VCB", currentPrice: 95000, availableQuantity: 500, steps: [...]}
  ↓
Frontend: Mở modal bán cổ phiếu với form 3 bước
  - Giới hạn khối lượng tối đa = availableQuantity
  ↓
User điền form và xác nhận
  ↓
Frontend: Gọi API POST /v1/api/stock-transactions/transactions
  Body: {
    userId: "...",
    symbol: "VCB",
    type: "sell",
    quantity: 200,
    price: 95000,
    ...
  }
  ↓
Backend: Tạo transaction và trả về kết quả
```

### 2.3. Flow xác nhận giao dịch (Confirm Transaction)

Khi user đã điền đủ thông tin và xác nhận:

```
Frontend: Gọi API POST /v1/api/stock-transactions/transactions
  ↓
Backend: Validate và tạo transaction
  ↓
Response: {
  statusCode: 200,
  message: "Transaction created successfully",
  metadata: {
    transactionId: "trans_123",
    symbol: "MWG",
    type: "buy",
    quantity: 100,
    price: 125000,
    totalAmount: 12500000,
    status: "pending",
    ...
  }
}
  ↓
Frontend:
  - Hiển thị kết quả giao dịch
  - UI Effect: CONFIRM_TRANSACTION với payload transaction data
  - Có thể redirect đến trang thanh toán hoặc hiển thị thông tin giao dịch
```

---

## 3. Flow tương tác - Xem thông tin tài khoản

### 3.1. Xem thông tin tài khoản

```
User: "Cho mình xem thông tin tài khoản"
  ↓
Agent:
  - Trả về text: "Đây là thông tin tài khoản của bạn..."
  - UI Effect: SHOW_USER_PROFILE với payload {userId: "..."}
  ↓
Frontend:
  - Gọi API GET /v1/api/user/profile (nếu cần fetch thêm data)
  - Hiển thị user profile panel với:
    * Tên, email, avatar
    * Số dư (balance)
    * Thông tin cá nhân
```

### 3.2. Xem lịch sử giao dịch

```
User: "Xem lịch sử giao dịch của mình"
  ↓
Agent:
  - Trả về text: "Đây là lịch sử giao dịch của bạn..."
  - UI Effect: SHOW_TRANSACTION_HISTORY với payload {userId: "..."}
  ↓
Frontend:
  - Gọi API GET /v1/api/stock-transactions/transactions/:userId
  - Hiển thị danh sách giao dịch với:
    * Mã cổ phiếu, loại (mua/bán)
    * Khối lượng, giá
    * Trạng thái (pending, completed, cancelled)
    * Thời gian
```

### 3.3. Xem thống kê giao dịch

```
User: "Thống kê giao dịch của mình"
  ↓
Agent:
  - Trả về text: "Đây là thống kê giao dịch của bạn..."
  - UI Effect: SHOW_TRANSACTION_STATS với payload {userId: "..."}
  ↓
Frontend:
  - Gọi API GET /v1/api/stock-transactions/transactions/:userId/stats
  - Hiển thị thống kê:
    * Tổng lợi nhuận (totalProfit)
    * Số lượng giao dịch (totalTransactions)
    * Tỷ lệ thắng (winRate)
    * Biểu đồ lợi nhuận theo thời gian
```

### 3.4. Xem bảng xếp hạng

```
User: "Xem bảng xếp hạng"
  ↓
Agent:
  - Trả về text: "Đây là bảng xếp hạng top người dùng..."
  - UI Effect: SHOW_RANKING với payload {}
  ↓
Frontend:
  - Gọi API GET /v1/api/stock-transactions/ranking
  - Hiển thị bảng xếp hạng:
    * Top users theo lợi nhuận
    * Vị trí của user hiện tại (nếu có)
```

---

## 4. Mapping Intent → UI Effect → API Call

### 4.1. Intent Detection

| User Query             | Intent                | UI Effect                  | Backend API                                                       |
| ---------------------- | --------------------- | -------------------------- | ----------------------------------------------------------------- |
| "Mua cổ phiếu MWG"     | `buy_stock`           | `OPEN_BUY_STOCK`           | POST `/transactions` (khi confirm)                                |
| "Bán cổ phiếu VCB"     | `sell_stock`          | `OPEN_SELL_STOCK`          | GET `/transactions/:userId` (lấy số lượng) → POST `/transactions` |
| "Thông tin tài khoản"  | `user_profile`        | `SHOW_USER_PROFILE`        | GET `/user/profile`                                               |
| "Lịch sử giao dịch"    | `transaction_history` | `SHOW_TRANSACTION_HISTORY` | GET `/transactions/:userId`                                       |
| "Thống kê giao dịch"   | `transaction_stats`   | `SHOW_TRANSACTION_STATS`   | GET `/transactions/:userId/stats`                                 |
| "Bảng xếp hạng"        | `ranking`             | `SHOW_RANKING`             | GET `/stock-transactions/ranking`                                 |
| "Tổng quan thị trường" | `market_overview`     | `SHOW_MARKET_OVERVIEW`     | GET `/market`                                                     |
| "Tin tức VNM"          | `view_news`           | `OPEN_NEWS`                | MCP tool `get_company_news`                                       |
| "Chi tiết VCB"         | `stock_detail`        | `OPEN_STOCK_DETAIL`        | GET `/market/stock/:symbol`                                       |

---

## 5. Xử lý thiếu thông tin

### 5.1. Flow khi thiếu userId

```
User: "Xem lịch sử giao dịch" (không có userId trong query)
  ↓
Agent:
  - Detect intent: transaction_history
  - Trả về UI Effect với userId: "current_user" (placeholder)
  ↓
Frontend:
  - Lấy userId từ authentication token hoặc session
  - Gọi API với userId thực tế
```

### 5.2. Flow khi thiếu thông tin giao dịch

```
User: "Mua cổ phiếu" (không có symbol)
  ↓
Agent:
  - Hỏi lại: "Bạn muốn mua cổ phiếu nào?"
  - Không trả về UI Effect (chờ user cung cấp đủ thông tin)
  ↓
User: "MWG"
  ↓
Agent:
  - Lấy giá MWG
  - Trả về UI Effect: OPEN_BUY_STOCK
```

### 5.3. Flow khi cần fetch thêm data từ backend

```
User: "Bán cổ phiếu VCB"
  ↓
Agent:
  - Detect intent: sell_stock
  - Trả về UI Effect: OPEN_SELL_STOCK với availableQuantity: 0.0 (placeholder)
  ↓
Frontend:
  - Gọi API GET /v1/api/stock-transactions/transactions/:userId để lấy số lượng cổ phiếu user đang có
  - Cập nhật availableQuantity trong UI
  - Hiển thị form bán với giới hạn khối lượng
```

---

## 6. UI Effects Schema

### 6.1. OPEN_BUY_STOCK

```json
{
  "type": "OPEN_BUY_STOCK",
  "payload": {
    "symbol": "MWG",
    "currentPrice": 125000.0,
    "steps": [
      { "id": "choose_volume", "title": "Chọn khối lượng" },
      { "id": "choose_price", "title": "Chọn giá đặt lệnh" },
      { "id": "confirm", "title": "Xác nhận lệnh" }
    ]
  }
}
```

**Frontend Action:**

1. Mở modal mua cổ phiếu
2. Pre-fill `symbol` và `currentPrice`
3. Hiển thị form với 3 steps
4. Khi user confirm, gọi `POST /v1/api/stock-transactions/transactions`

**API Request Format:**

```json
{
  "userId": "69293046bcbc4ea01b8b76ce",
  "symbol": "MWG",
  "type": "buy",
  "quantity": 100,
  "price": 125000,
  "orderType": "limit" // hoặc "market"
}
```

---

### 6.2. OPEN_SELL_STOCK

```json
{
  "type": "OPEN_SELL_STOCK",
  "payload": {
    "symbol": "VCB",
    "currentPrice": 95000.0,
    "availableQuantity": 500.0,
    "steps": [
      { "id": "choose_volume", "title": "Chọn khối lượng" },
      { "id": "choose_price", "title": "Chọn giá đặt lệnh" },
      { "id": "confirm", "title": "Xác nhận lệnh" }
    ]
  }
}
```

**Frontend Action:**

1. Mở modal bán cổ phiếu
2. Pre-fill `symbol`, `currentPrice`, và `availableQuantity`
3. Giới hạn khối lượng tối đa = `availableQuantity`
4. Khi user confirm, gọi `POST /v1/api/stock-transactions/transactions`

**API Request Format:**

```json
{
  "userId": "69293046bcbc4ea01b8b76ce",
  "symbol": "VCB",
  "type": "sell",
  "quantity": 200,
  "price": 95000,
  "orderType": "limit"
}
```

---

### 6.3. CONFIRM_TRANSACTION

```json
{
  "type": "CONFIRM_TRANSACTION",
  "payload": {
    "transactionId": "trans_123456",
    "symbol": "MWG",
    "type": "buy",
    "quantity": 100,
    "price": 125000,
    "totalAmount": 12500000,
    "userId": "69293046bcbc4ea01b8b76ce"
  }
}
```

**Frontend Action:**

1. Hiển thị thông tin giao dịch đã tạo
2. Có thể redirect đến trang thanh toán
3. Hoặc hiển thị confirmation message

---

### 6.4. SHOW_USER_PROFILE

```json
{
  "type": "SHOW_USER_PROFILE",
  "payload": {
    "userId": "69293046bcbc4ea01b8b76ce",
    "fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "balance": 100000000,
    "avatar": "https://..."
  }
}
```

**Frontend Action:**

1. Gọi `GET /v1/api/user/profile` để lấy data đầy đủ (nếu payload chưa có)
2. Hiển thị user profile panel

---

### 6.5. SHOW_TRANSACTION_HISTORY

```json
{
  "type": "SHOW_TRANSACTION_HISTORY",
  "payload": {
    "userId": "69293046bcbc4ea01b8b76ce",
    "transactions": []
  }
}
```

**Frontend Action:**

1. Gọi `GET /v1/api/stock-transactions/transactions/:userId`
2. Hiển thị danh sách giao dịch với pagination
3. Filter và sort options

---

### 6.6. SHOW_TRANSACTION_STATS

```json
{
  "type": "SHOW_TRANSACTION_STATS",
  "payload": {
    "userId": "69293046bcbc4ea01b8b76ce",
    "totalProfit": 5000000,
    "totalTransactions": 25,
    "winRate": 0.68
  }
}
```

**Frontend Action:**

1. Gọi `GET /v1/api/stock-transactions/transactions/:userId/stats`
2. Hiển thị dashboard thống kê với charts

---

### 6.7. SHOW_RANKING

```json
{
  "type": "SHOW_RANKING",
  "payload": {
    "rankings": [
      {"userId": "...", "fullName": "...", "profit": 10000000, "rank": 1},
      ...
    ],
    "userRank": 15
  }
}
```

**Frontend Action:**

1. Gọi `GET /v1/api/stock-transactions/ranking`
2. Hiển thị bảng xếp hạng
3. Highlight vị trí của user hiện tại

---

## 7. Best Practices

### 7.1. Khi user muốn thực hiện chức năng ngay

- Agent trả về UI Effect với đầy đủ thông tin có thể
- Frontend tự động gọi API backend để lấy thông tin thiếu
- Frontend render UI và cho phép user tương tác

### 7.2. Khi thiếu thông tin

- Agent hỏi lại user thay vì trả về UI Effect ngay
- Chỉ trả về UI Effect khi có đủ thông tin tối thiểu (ví dụ: symbol cho buy/sell)

### 7.3. Khi cần userId

- Agent trả về UI Effect với userId: "current_user" (placeholder)
- Frontend lấy userId từ authentication token/session
- Frontend gọi API với userId thực tế

### 7.4. Error Handling

- Nếu API backend trả về lỗi, frontend hiển thị error message
- Agent không cần handle lỗi từ backend API (frontend tự xử lý)
- Agent chỉ cần trả về UI Effect, frontend sẽ gọi API và xử lý response

---

## 8. Ví dụ tương tác hoàn chỉnh

### Example 1: Mua cổ phiếu

```
User: "Mình muốn mua 100 cổ phiếu MWG với giá 125,000 VNĐ"

Agent Response:
{
  "reply": "Tôi sẽ giúp bạn mua 100 cổ phiếu MWG với giá 125,000 VNĐ. Tổng giá trị giao dịch là 12,500,000 VNĐ. Bạn có muốn xác nhận lệnh này không?",
  "ui_effects": [
    {
      "type": "OPEN_BUY_STOCK",
      "payload": {
        "symbol": "MWG",
        "currentPrice": 125000,
        "steps": [
          {"id": "choose_volume", "title": "Chọn khối lượng"},
          {"id": "choose_price", "title": "Chọn giá đặt lệnh"},
          {"id": "confirm", "title": "Xác nhận lệnh"}
        ]
      }
    }
  ],
  "suggestion_messages": [
    {"text": "Xem chi tiết MWG", "action": "query:chi tiết MWG", "icon": "📊"},
    {"text": "Xem lịch sử giao dịch", "action": "query:lịch sử giao dịch", "icon": "📋"}
  ]
}

Frontend:
1. Mở modal mua cổ phiếu
2. Pre-fill: symbol=MWG, volume=100, price=125000
3. User click "Xác nhận"
4. Frontend gọi POST /v1/api/stock-transactions/transactions
5. Hiển thị kết quả giao dịch
```

### Example 2: Xem thống kê

```
User: "Thống kê giao dịch của mình"

Agent Response:
{
  "reply": "Đây là thống kê giao dịch của bạn. Tổng lợi nhuận: 5,000,000 VNĐ. Số lượng giao dịch: 25. Tỷ lệ thắng: 68%.",
  "ui_effects": [
    {
      "type": "SHOW_TRANSACTION_STATS",
      "payload": {
        "userId": "current_user"
      }
    }
  ],
  "suggestion_messages": [
    {"text": "Xem lịch sử giao dịch", "action": "query:lịch sử giao dịch", "icon": "📋"},
    {"text": "Xem bảng xếp hạng", "action": "query:bảng xếp hạng", "icon": "🏆"}
  ]
}

Frontend:
1. Gọi GET /v1/api/stock-transactions/transactions/:userId/stats
2. Hiển thị dashboard thống kê với charts
```

---

## 9. Checklist tính năng

### ✅ Đã implement

- [x] Mua cổ phiếu (OPEN_BUY_STOCK)
- [x] Bán cổ phiếu (OPEN_SELL_STOCK)
- [x] Xem thông tin tài khoản (SHOW_USER_PROFILE)
- [x] Xem lịch sử giao dịch (SHOW_TRANSACTION_HISTORY)
- [x] Xem thống kê giao dịch (SHOW_TRANSACTION_STATS)
- [x] Xem bảng xếp hạng (SHOW_RANKING)
- [x] Xác nhận giao dịch (CONFIRM_TRANSACTION)
- [x] Tổng quan thị trường (SHOW_MARKET_OVERVIEW)
- [x] Tin tức (OPEN_NEWS)
- [x] Chi tiết cổ phiếu (OPEN_STOCK_DETAIL)

### 🔄 Cần bổ sung (nếu cần)

- [ ] Hủy giao dịch (CANCEL_TRANSACTION) - có thể dùng API PUT trực tiếp
- [ ] Upload avatar - có thể dùng API POST trực tiếp
- [ ] Cập nhật profile - có thể dùng API PATCH trực tiếp

---

## 10. Tài liệu liên quan

- `docs/API_RESPONSE_FORMAT.md`: Format response chi tiết
- `docs/API_ENDPOINTS.md`: Danh sách endpoints backend
- `docs/FEATURE.md`: Flow tính năng
- `test-adk/app/schemas/ui.py`: UI instruction schemas
- `test-adk/app/services/ui_parser.py`: UI parser logic

---

## 11. Changelog

### 2024-12-06

- ✅ Bổ sung UI effects: OPEN_SELL_STOCK, SHOW_USER_PROFILE, SHOW_TRANSACTION_HISTORY, SHOW_TRANSACTION_STATS, SHOW_RANKING, CONFIRM_TRANSACTION
- ✅ Cập nhật agent instruction để handle các tính năng mới
- ✅ Cập nhật UI parser để detect các intents mới
- ✅ Cập nhật suggestion messages để gợi ý các tính năng mới
- ✅ Viết documentation về flow tương tác

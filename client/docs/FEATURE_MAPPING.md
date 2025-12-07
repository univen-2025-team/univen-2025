# Feature Mapping - Chatbot Intent → UI Effect → Backend API

Tài liệu này mapping các tính năng chatbot với UI effects và backend APIs tương ứng.

---

## 1. Mapping Table

| User Intent                 | Intent Code           | UI Effect                  | Backend API                                                 | MCP Tool (nếu có)                                     |
| --------------------------- | --------------------- | -------------------------- | ----------------------------------------------------------- | ----------------------------------------------------- |
| **Mua cổ phiếu**            | `buy_stock`           | `OPEN_BUY_STOCK`           | `POST /v1/api/stock-transactions/transactions`              | `get_quote_intraday_price`, `get_price_board`         |
| **Bán cổ phiếu**            | `sell_stock`          | `OPEN_SELL_STOCK`          | `GET /transactions/:userId` → `POST /transactions`          | `get_quote_intraday_price`                            |
| **Xem thông tin tài khoản** | `user_profile`        | `SHOW_USER_PROFILE`        | `GET /v1/api/user/profile`                                  | -                                                     |
| **Xem lịch sử giao dịch**   | `transaction_history` | `SHOW_TRANSACTION_HISTORY` | `GET /v1/api/stock-transactions/transactions/:userId`       | -                                                     |
| **Xem thống kê giao dịch**  | `transaction_stats`   | `SHOW_TRANSACTION_STATS`   | `GET /v1/api/stock-transactions/transactions/:userId/stats` | -                                                     |
| **Xem bảng xếp hạng**       | `ranking`             | `SHOW_RANKING`             | `GET /v1/api/stock-transactions/ranking`                    | -                                                     |
| **Tổng quan thị trường**    | `market_overview`     | `SHOW_MARKET_OVERVIEW`     | `GET /v1/api/market`                                        | `get_price_board`                                     |
| **Tin tức cổ phiếu**        | `view_news`           | `OPEN_NEWS`                | -                                                           | `get_company_news`                                    |
| **Chi tiết cổ phiếu**       | `stock_detail`        | `OPEN_STOCK_DETAIL`        | `GET /v1/api/market/stock/:symbol`                          | `get_company_overview`, `get_quote_intraday_price`    |
| **Giá cổ phiếu**            | `price_query`         | -                          | `GET /v1/api/market/stock/:symbol`                          | `get_quote_intraday_price`, `get_quote_history_price` |
| **Xác nhận giao dịch**      | `confirm_transaction` | `CONFIRM_TRANSACTION`      | `POST /v1/api/stock-transactions/transactions`              | -                                                     |

---

## 2. Chi tiết từng tính năng

### 2.1. Mua cổ phiếu (Buy Stock)

**User Query Examples:**

- "Mình muốn mua cổ phiếu MWG"
- "Mua 100 cổ phiếu VCB"
- "Đặt lệnh mua MWG với giá 125,000"

**Flow:**

1. Agent detect intent: `buy_stock`
2. Agent lấy giá hiện tại từ MCP tool: `get_quote_intraday_price` hoặc `get_price_board`
3. Agent trả về:
   - Text: "Tôi sẽ hướng dẫn bạn mua cổ phiếu MWG. Giá hiện tại là 125,000 VNĐ..."
   - UI Effect: `OPEN_BUY_STOCK` với `symbol`, `currentPrice`
4. Frontend mở modal mua cổ phiếu
5. User điền form và xác nhận
6. Frontend gọi: `POST /v1/api/stock-transactions/transactions`
7. Frontend hiển thị kết quả

**API Request:**

```json
POST /v1/api/stock-transactions/transactions
{
  "userId": "69293046bcbc4ea01b8b76ce",
  "symbol": "MWG",
  "type": "buy",
  "quantity": 100,
  "price": 125000,
  "orderType": "limit"
}
```

---

### 2.2. Bán cổ phiếu (Sell Stock)

**User Query Examples:**

- "Mình muốn bán cổ phiếu VCB"
- "Bán 200 cổ phiếu MWG"
- "Đặt lệnh bán VCB"

**Flow:**

1. Agent detect intent: `sell_stock`
2. Agent lấy giá hiện tại từ MCP tool
3. Agent trả về:
   - Text: "Tôi sẽ hướng dẫn bạn bán cổ phiếu VCB..."
   - UI Effect: `OPEN_SELL_STOCK` với `symbol`, `currentPrice`, `availableQuantity: 0.0` (placeholder)
4. Frontend:
   - Gọi `GET /v1/api/stock-transactions/transactions/:userId` để lấy số lượng cổ phiếu user đang có
   - Cập nhật `availableQuantity` trong UI
5. User điền form (khối lượng ≤ availableQuantity) và xác nhận
6. Frontend gọi: `POST /v1/api/stock-transactions/transactions`
7. Frontend hiển thị kết quả

**API Request:**

```json
POST /v1/api/stock-transactions/transactions
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

### 2.3. Xem thông tin tài khoản (User Profile)

**User Query Examples:**

- "Cho mình xem thông tin tài khoản"
- "Số dư của mình là bao nhiêu?"
- "Profile của mình"

**Flow:**

1. Agent detect intent: `user_profile`
2. Agent trả về:
   - Text: "Đây là thông tin tài khoản của bạn..."
   - UI Effect: `SHOW_USER_PROFILE` với `userId: "current_user"`
3. Frontend:
   - Lấy userId từ authentication token
   - Gọi `GET /v1/api/user/profile`
   - Hiển thị user profile panel

**API Response:**

```json
GET /v1/api/user/profile
{
  "statusCode": 200,
  "metadata": {
    "_id": "69293046bcbc4ea01b8b76ce",
    "user_fullName": "Nguyễn Văn A",
    "email": "user@example.com",
    "balance": 100000000,
    "user_avatar": "https://...",
    ...
  }
}
```

---

### 2.4. Xem lịch sử giao dịch (Transaction History)

**User Query Examples:**

- "Lịch sử giao dịch của mình"
- "Các lệnh đã đặt"
- "Giao dịch gần đây"

**Flow:**

1. Agent detect intent: `transaction_history`
2. Agent trả về:
   - Text: "Đây là lịch sử giao dịch của bạn..."
   - UI Effect: `SHOW_TRANSACTION_HISTORY` với `userId: "current_user"`
3. Frontend:
   - Lấy userId từ authentication token
   - Gọi `GET /v1/api/stock-transactions/transactions/:userId`
   - Hiển thị danh sách giao dịch

**API Response:**

```json
GET /v1/api/stock-transactions/transactions/:userId
{
  "statusCode": 200,
  "metadata": [
    {
      "transactionId": "trans_123",
      "symbol": "MWG",
      "type": "buy",
      "quantity": 100,
      "price": 125000,
      "status": "completed",
      "createdAt": "2025-01-15T10:00:00Z"
    },
    ...
  ]
}
```

---

### 2.5. Xem thống kê giao dịch (Transaction Stats)

**User Query Examples:**

- "Thống kê giao dịch"
- "Lợi nhuận của mình"
- "Tỷ lệ thắng"

**Flow:**

1. Agent detect intent: `transaction_stats`
2. Agent trả về:
   - Text: "Đây là thống kê giao dịch của bạn. Tổng lợi nhuận: 5,000,000 VNĐ..."
   - UI Effect: `SHOW_TRANSACTION_STATS` với `userId: "current_user"`
3. Frontend:
   - Gọi `GET /v1/api/stock-transactions/transactions/:userId/stats`
   - Hiển thị dashboard thống kê

**API Response:**

```json
GET /v1/api/stock-transactions/transactions/:userId/stats
{
  "statusCode": 200,
  "metadata": {
    "totalProfit": 5000000,
    "totalTransactions": 25,
    "winRate": 0.68,
    ...
  }
}
```

---

### 2.6. Xem bảng xếp hạng (Ranking)

**User Query Examples:**

- "Bảng xếp hạng"
- "Top người dùng"
- "Xếp hạng"

**Flow:**

1. Agent detect intent: `ranking`
2. Agent trả về:
   - Text: "Đây là bảng xếp hạng top người dùng..."
   - UI Effect: `SHOW_RANKING`
3. Frontend:
   - Gọi `GET /v1/api/stock-transactions/ranking`
   - Hiển thị bảng xếp hạng

**API Response:**

```json
GET /v1/api/stock-transactions/ranking
{
  "statusCode": 200,
  "metadata": [
    {
      "userId": "...",
      "user_fullName": "...",
      "profit": 10000000,
      "rank": 1
    },
    ...
  ]
}
```

---

## 3. So sánh với Endpoints từ API_ENDPOINTS.md

### ✅ Đã có UI Effect và Agent support

| Endpoint                                         | Method | Status | UI Effect                           |
| ------------------------------------------------ | ------ | ------ | ----------------------------------- |
| `/stock-transactions/transactions`               | POST   | ✅     | `OPEN_BUY_STOCK`, `OPEN_SELL_STOCK` |
| `/stock-transactions/transactions/:userId`       | GET    | ✅     | `SHOW_TRANSACTION_HISTORY`          |
| `/stock-transactions/transactions/:userId/stats` | GET    | ✅     | `SHOW_TRANSACTION_STATS`            |
| `/stock-transactions/ranking`                    | GET    | ✅     | `SHOW_RANKING`                      |
| `/user/profile`                                  | GET    | ✅     | `SHOW_USER_PROFILE`                 |
| `/market`                                        | GET    | ✅     | `SHOW_MARKET_OVERVIEW`              |
| `/market/stock/:symbol`                          | GET    | ✅     | `OPEN_STOCK_DETAIL`                 |

### ⚠️ Có thể dùng trực tiếp (không cần UI Effect)

| Endpoint                                      | Method | Status | Note                                                |
| --------------------------------------------- | ------ | ------ | --------------------------------------------------- |
| `/stock-transactions/transactions/:id`        | GET    | ⚠️     | Có thể dùng khi user hỏi về 1 giao dịch cụ thể      |
| `/stock-transactions/transactions/:id/cancel` | PUT    | ⚠️     | Frontend có thể gọi trực tiếp khi user click "Hủy"  |
| `/user/profile`                               | PATCH  | ⚠️     | Frontend có thể gọi trực tiếp khi user edit profile |
| `/user/upload-avatar`                         | POST   | ⚠️     | Frontend có thể gọi trực tiếp khi user upload       |

---

## 4. MCP Tools Coverage

### ✅ Đã có MCP Tools

- **Company Info**: `get_company_overview`, `get_company_news`, `get_company_events`, etc.
- **Quote**: `get_quote_history_price`, `get_quote_intraday_price`, `get_quote_price_depth`
- **Finance**: `get_income_statements`, `get_balance_sheets`, `get_cash_flows`, `get_finance_ratios`
- **Market**: `get_price_board`, `get_all_symbols`, `get_all_symbols_by_group`
- **Misc**: `get_gold_price`, `get_exchange_rate`

### ❌ Không có MCP Tools (cần dùng Backend API)

- **User Management**: Profile, balance, avatar
- **Transactions**: Create, get history, stats, ranking
- **Market Cache**: Cached market data (có thể dùng MCP tools thay thế)

---

## 5. Kết luận

### ✅ Đã đầy đủ

1. **Market Data**: Đầy đủ với MCP tools
2. **Transactions**: Đầy đủ với UI effects và backend API mapping
3. **User Management**: Đầy đủ với UI effects và backend API mapping
4. **Ranking & Stats**: Đầy đủ với UI effects và backend API mapping

### 📝 Lưu ý

- Agent chỉ trả về UI Effects, không gọi backend API trực tiếp
- Frontend sẽ gọi backend API dựa trên UI Effects
- Agent có thể dùng MCP tools để lấy thông tin thị trường trước khi trả về UI Effect
- Frontend cần lấy userId từ authentication token/session khi gọi API

---

## 6. Tài liệu liên quan

- `docs/CHATBOT_FEATURES.md`: Chi tiết flow tương tác
- `docs/API_RESPONSE_FORMAT.md`: Format response
- `docs/API_ENDPOINTS.md`: Backend API endpoints
- `docs/FEATURE.md`: Flow tính năng

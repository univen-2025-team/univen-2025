# 📊 Tổng Quan Hệ Thống UniVen 2025

## Mục lục

-   [1. Tổng quan](#1-tổng-quan)
-   [2. Kiến trúc hệ thống](#2-kiến-trúc-hệ-thống)
-   [3. Danh sách chức năng](#3-danh-sách-chức-năng)
-   [4. Chi tiết từng chức năng](#4-chi-tiết-từng-chức-năng)
-   [5. Hướng dẫn sử dụng](#5-hướng-dẫn-sử-dụng)
-   [6. Cấu trúc API](#6-cấu-trúc-api)
-   [7. Cấu trúc Database](#7-cấu-trúc-database)
-   [8. Scheduled Jobs](#8-scheduled-jobs)

---

## 1. Tổng quan

**UniVen 2025** là nền tảng giao dịch chứng khoán mô phỏng dành cho thị trường Việt Nam, cho phép người dùng:

-   📈 **Theo dõi thị trường chứng khoán Việt Nam real-time** (VN30 Index)
-   💰 **Giao dịch mua/bán cổ phiếu** với số dư ảo 100.000.000 VND
-   🏆 **Xem bảng xếp hạng lợi nhuận** so với các nhà đầu tư khác
-   🤖 **Chat với AI** để nhận tư vấn đầu tư
-   🏅 **Đạt huy hiệu** dựa trên thành tích giao dịch

### Tech Stack

| Thành phần       | Công nghệ                                     |
| ---------------- | --------------------------------------------- |
| **Frontend**     | Next.js 14, React, TailwindCSS, Redux Toolkit |
| **Backend API**  | Express.js, TypeScript, Socket.IO             |
| **Data Service** | Python, vnstock library, APScheduler          |
| **Database**     | MongoDB Atlas                                 |
| **Cache**        | Redis Cloud                                   |
| **Auth**         | JWT, Google OAuth 2.0                         |

---

## 2. Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js)                         │
│                           Port: 3000                              │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│   │ Market   │ │ Trade    │ │Portfolio │ │ Ranking  │           │
│   │ Page     │ │ Page     │ │ Page     │ │ Page     │           │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│   │ History  │ │ Profile  │ │ Badges   │ │ Chatbot  │           │
│   │ Page     │ │ Page     │ │ Page     │ │ Page     │           │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js/NestJS)                    │
│                           Port: 4000                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Auth Service │ │ Transaction  │ │ Market Socket Service    │ │
│  │ • Login      │ │ Service      │ │ • Real-time broadcast    │ │
│  │ • Register   │ │ • Buy/Sell   │ │ • VN30 updates           │ │
│  │ • OAuth      │ │ • History    │ │ • Socket.IO integration  │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ User Service │ │ Market Cache │ │ VNStock Service          │ │
│  │ • Profile    │ │ Service      │ │ • Connect to Python      │ │
│  │ • Avatar     │ │ • Query DB   │ │ • Fetch stock data       │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │
             ┌───────────────┴───────────────┐
             ▼                               ▼
┌────────────────────────┐       ┌────────────────────────┐
│   Python Server        │       │    MongoDB Atlas       │
│   Port: 5000           │       │                        │
│   • vnstock library    │       │ ┌────────────────────┐ │
│   • Daily data caching │       │ │ Users Collection   │ │
│   • Cronjob scheduler  │       │ │ Transactions Coll. │ │
│                        │───────▶│ │ Market Data Coll.  │ │
│                        │       │ │ Stock Data Coll.   │ │
└────────────────────────┘       │ └────────────────────┘ │
             │                   └────────────────────────┘
             ▼
┌────────────────────────┐
│  Vietnamese Stock APIs │
│  (TCBS, SSI, VND, etc.)│
└────────────────────────┘
```

---

## 3. Danh sách chức năng

### 3.1. Chức năng Xác thực (Authentication)

| #   | Chức năng        | Mô tả                                               |
| --- | ---------------- | --------------------------------------------------- |
| 1   | Đăng ký          | Tạo tài khoản mới bằng email/password               |
| 2   | Đăng nhập        | Đăng nhập bằng email/password                       |
| 3   | Đăng nhập Google | Đăng nhập nhanh bằng Google OAuth 2.0               |
| 4   | Đăng nhập Khách  | Trải nghiệm không cần đăng ký (hết hạn sau 90 ngày) |
| 5   | Làm mới Token    | Tự động refresh access token                        |
| 6   | Đăng xuất        | Logout và xóa session                               |
| 7   | Quên mật khẩu    | Reset password qua email                            |

### 3.2. Chức năng Thị trường (Market)

| #   | Chức năng             | Mô tả                               |
| --- | --------------------- | ----------------------------------- |
| 1   | Xem VN30 Index        | Hiển thị chỉ số VN30 real-time      |
| 2   | Danh sách cổ phiếu    | 30 cổ phiếu VN30 với giá, biến động |
| 3   | Top tăng/giảm         | Top 5 cổ phiếu tăng/giảm mạnh nhất  |
| 4   | Biểu đồ VN30 Intraday | Biểu đồ giá VN30 trong ngày         |
| 5   | Chi tiết cổ phiếu     | Thông tin chi tiết từng mã cổ phiếu |
| 6   | Cập nhật real-time    | Tự động cập nhật giá qua Socket.IO  |

### 3.3. Chức năng Giao dịch (Trading)

| #   | Chức năng           | Mô tả                                   |
| --- | ------------------- | --------------------------------------- |
| 1   | Mua cổ phiếu        | Đặt lệnh mua với số lượng và giá        |
| 2   | Bán cổ phiếu        | Đặt lệnh bán (kiểm tra số lượng sở hữu) |
| 3   | Xem danh mục đầu tư | Portfolio: các cổ phiếu đang nắm giữ    |
| 4   | Lịch sử giao dịch   | Xem toàn bộ lịch sử mua/bán             |
| 5   | Hủy giao dịch       | Hủy lệnh đang pending                   |
| 6   | Thống kê giao dịch  | Tổng số giao dịch, lợi nhuận, v.v.      |

### 3.4. Chức năng Người dùng (User)

| #   | Chức năng         | Mô tả                                |
| --- | ----------------- | ------------------------------------ |
| 1   | Xem profile       | Thông tin cá nhân, số dư, thống kê   |
| 2   | Cập nhật profile  | Sửa họ tên, giới tính, v.v.          |
| 3   | Upload avatar     | Tải lên ảnh đại diện                 |
| 4   | Xem bảng xếp hạng | Top nhà đầu tư có lợi nhuận cao nhất |
| 5   | Xem huy hiệu      | Các badges đã đạt được               |

### 3.5. Chức năng AI Chat

| #   | Chức năng          | Mô tả                            |
| --- | ------------------ | -------------------------------- |
| 1   | Chat với AI        | Trò chuyện để nhận tư vấn đầu tư |
| 2   | Phân tích cổ phiếu | AI phân tích xu hướng cổ phiếu   |

---

## 4. Chi tiết từng chức năng

### 4.1. Authentication (Xác thực)

#### 4.1.1. Đăng ký tài khoản

**Cách hoạt động:**

1. Người dùng nhập email, password, họ tên
2. Server validate dữ liệu đầu vào
3. Kiểm tra email đã tồn tại chưa
4. Hash password bằng bcrypt (10 rounds)
5. Tạo user mới với số dư mặc định 100.000.000 VND
6. Trả về access token + refresh token

**Luồng xử lý:**

```
Client → POST /v1/api/auth/sign-up → AuthService.signUp() → MongoDB
```

#### 4.1.2. Đăng nhập Email/Password

**Cách hoạt động:**

1. Người dùng nhập email và password
2. Server tìm user theo email
3. So sánh password với hash đã lưu
4. Tạo cặp JWT tokens (access + refresh)
5. Lưu key token vào database
6. Trả về tokens và thông tin user

**Token Configuration:**

-   Access Token: hết hạn sau 15 phút
-   Refresh Token: hết hạn sau 1 ngày

#### 4.1.3. Đăng nhập Google OAuth

**Cách hoạt động:**

1. Người dùng click "Đăng nhập bằng Google"
2. Redirect đến Google OAuth consent screen
3. Google callback với user profile
4. Server kiểm tra googleId đã tồn tại chưa
    - Nếu có: cập nhật thông tin
    - Nếu chưa: tạo user mới
5. Trả về JWT tokens

#### 4.1.4. Đăng nhập khách (Guest)

**Cách hoạt động:**

1. Tự động tạo tài khoản với email random: `guest_xxx@univen.guest`
2. Họ tên: "Khách #XXXXXX"
3. Đánh dấu `isGuest: true`
4. Đặt `guestExpiresAt` = ngày hiện tại + 90 ngày
5. Cấp tokens như user thường

**Lưu ý:** Tài khoản guest sẽ bị xóa tự động sau 90 ngày bởi scheduled job.

---

### 4.2. Market (Thị trường)

#### 4.2.1. VN30 Index Real-time

**Cách hoạt động:**

1. Python server chạy cronjob hàng ngày lúc 1:00 AM
2. Fetch dữ liệu VN30 từ vnstock library (nguồn TCBS)
3. Cache vào MongoDB collections:
    - `marketdata`: Dữ liệu tổng quan VN30
    - `stockdata`: Dữ liệu từng cổ phiếu
4. Node.js server query từ MongoDB
5. Broadcast real-time qua Socket.IO mỗi 5 giây

**Data Flow:**

```
vnstock API → Python Server (cronjob) → MongoDB
    ↓
Node.js Server (MarketCacheService) → Socket.IO → Client
```

#### 4.2.2. Chi tiết 30 mã cổ phiếu VN30

**Danh sách:**

```
ACB, BCM, BID, BVH, CTG, FPT, GAS, GVR, HDB, HPG,
KDH, MBB, MSN, MWG, NVL, PDR, PLX, POW, SAB, SSI,
STB, TCB, TPB, VCB, VHM, VIB, VIC, VJC, VNM, VPB
```

**Dữ liệu mỗi cổ phiếu:**

-   `symbol`: Mã cổ phiếu
-   `price`: Giá hiện tại
-   `change`: Thay đổi so với phiên trước
-   `changePercent`: % thay đổi
-   `volume`: Khối lượng giao dịch
-   `high`, `low`, `open`, `close`: OHLC
-   `prices[]`: Dữ liệu intraday (time, OHLCV)

---

### 4.3. Trading (Giao dịch)

#### 4.3.1. Mua cổ phiếu (BUY)

**Cách hoạt động:**

1. Client gửi request với: `stock_code`, `quantity`, `price_per_unit`
2. Server tính `total_amount = quantity × price_per_unit`
3. Kiểm tra `user.balance >= total_amount`
4. Tạo transaction record với status `COMPLETED`
5. Trừ tiền từ user balance
6. Cập nhật `balance_before`, `balance_after`

**Validation:**

-   Số lượng phải > 0
-   Giá phải > 0
-   Số dư đủ để mua

#### 4.3.2. Bán cổ phiếu (SELL)

**Cách hoạt động:**

1. Client gửi request với: `stock_code`, `quantity`, `price_per_unit`
2. Server tính số cổ phiếu user đang sở hữu:
    ```js
    holdings = SUM(BUY.quantity) - SUM(SELL.quantity);
    ```
3. Kiểm tra `holdings >= sell_quantity`
4. Tạo transaction record
5. Cộng tiền vào user balance

**Validation:**

-   Không được bán quá số cổ phiếu đang sở hữu
-   Kiểm tra bằng `TransactionService.getUserStockHoldings()`

#### 4.3.3. Tính toán lợi nhuận

**Công thức:**

```
Lợi nhuận = (Số dư hiện tại + Giá trị cổ phiếu sở hữu) - 100.000.000
```

Trong đó:

-   Số dư hiện tại = `user.balance`
-   Giá trị cổ phiếu = Σ(số lượng × giá hiện tại) cho mỗi mã
-   100.000.000 = Số dư khởi tạo ban đầu

---

### 4.4. Portfolio (Danh mục đầu tư)

**Cách hoạt động:**

1. Query tất cả transactions của user
2. Group by `stock_code`
3. Tính net holdings = `BUY.quantity - SELL.quantity`
4. Với mỗi mã có holdings > 0:
    - Fetch giá hiện tại từ cache
    - Tính giá trị = holdings × current_price
5. Tính tổng giá trị portfolio

**Response Fields:**

```json
{
    "holdings": [
        {
            "stock_code": "VCB",
            "stock_name": "Vietcombank",
            "quantity": 100,
            "avg_buy_price": 92500,
            "current_price": 95000,
            "market_value": 9500000,
            "profit_loss": 250000,
            "profit_loss_percent": 2.7
        }
    ],
    "total_value": 99250000,
    "total_profit": -750000
}
```

---

### 4.5. Ranking (Bảng xếp hạng)

**Cách hoạt động:**

1. Query tất cả users (loại trừ guests)
2. Với mỗi user, tính total_profit
3. Sort descending by profit
4. Assign rank và paginate

**Loại trừ:**

-   Tài khoản Guest (`isGuest: true`)
-   Tài khoản bị blocked

---

### 4.6. Real-time Updates (Socket.IO)

**Events được broadcast:**

| Event Name      | Interval  | Data                                |
| --------------- | --------- | ----------------------------------- |
| `market:update` | 5s        | VN30 index, stocks, gainers, losers |
| `stock:update`  | Real-time | Giá cổ phiếu cụ thể                 |

**Client subscription:**

```javascript
socket.on('market:update', (data) => {
    // Update UI với dữ liệu mới
});

socket.emit('stock:subscribe', { symbol: 'VCB' });
```

---

## 5. Hướng dẫn sử dụng

### 5.1. Dành cho End User

#### Đăng ký & Đăng nhập

1. **Đăng ký mới:**

    - Truy cập `/auth/register`
    - Nhập email, password (ít nhất 6 ký tự), họ tên
    - Click "Đăng ký"

2. **Đăng nhập:**

    - Truy cập `/auth/login`
    - Nhập email và password
    - Hoặc click "Đăng nhập bằng Google"

3. **Trải nghiệm nhanh:**
    - Click "Tiếp tục với tư cách khách"
    - Tài khoản tự động tạo với 100 triệu VND

#### Theo dõi thị trường

1. Truy cập trang **Market** (`/market`)
2. Xem chỉ số VN30 Index ở đầu trang
3. Scroll xuống để xem danh sách 30 cổ phiếu
4. Click vào mã cổ phiếu để xem chi tiết
5. Dữ liệu tự động cập nhật mỗi 5 giây

#### Thực hiện giao dịch

1. Truy cập trang **Trade** (`/trade`)
2. **Để mua:**
    - Chọn mã cổ phiếu từ dropdown
    - Nhập số lượng (bội số của 100)
    - Xem giá và tổng tiền
    - Click "Mua"
3. **Để bán:**
    - Chọn tab "Bán"
    - Chọn cổ phiếu đang sở hữu
    - Nhập số lượng muốn bán
    - Click "Bán"

#### Quản lý danh mục

1. Truy cập **Portfolio** (`/portfolio`)
2. Xem các cổ phiếu đang nắm giữ
3. Theo dõi lợi nhuận/lỗ từng mã
4. Xem tổng giá trị portfolio

#### Xem lịch sử giao dịch

1. Truy cập **History** (`/history`)
2. Filter theo: loại giao dịch, mã cổ phiếu
3. Xem chi tiết từng transaction

#### Bảng xếp hạng

1. Truy cập **Ranking** (`/ranking`)
2. Xem top 10 nhà đầu tư lợi nhuận cao nhất
3. Tìm vị trí của bạn trong bảng

---

### 5.2. Dành cho Developer

#### Khởi chạy hệ thống

```bash
# 1. Clone repository
git clone https://github.com/univen-2025-team/univen-2025.git
cd univen-2025

# 2. Chạy tự động (khuyến nghị)
./start-all.sh

# 3. Hoặc chạy thủ công từng service:

# Terminal 1: Python Server
cd python-server
source venv/bin/activate
python app.py

# Terminal 2: Node.js Server
cd server
npm run dev

# Terminal 3: Next.js Client
cd client
npm run dev
```

#### URLs sau khi khởi chạy

| Service       | URL                          |
| ------------- | ---------------------------- |
| Frontend      | http://localhost:3000        |
| Backend API   | http://localhost:4000        |
| Python Server | http://localhost:5000        |
| Market Page   | http://localhost:3000/market |

#### Environment Variables

**Server (.env):**

```env
PORT=4000
DB_URL=mongodb+srv://...
CLIENT_URL=http://localhost:3000
VNSTOCK_API_URL=http://localhost:5000
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
JWT_SECRET=...
REDIS_URL=redis://...
```

**Client (.env.local):**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/v1/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

**Python Server (.env):**

```env
MONGODB_URI=mongodb+srv://...
CRONJOB_ENABLED=true
VNSTOCK_SOURCE=TCBS
```

---

## 6. Cấu trúc API

### Base URL: `/v1/api`

### Authentication APIs

| Method | Endpoint             | Auth | Description       |
| ------ | -------------------- | ---- | ----------------- |
| POST   | `/auth/sign-up`      | ❌   | Đăng ký tài khoản |
| POST   | `/auth/login`        | ❌   | Đăng nhập         |
| GET    | `/auth/login/google` | ❌   | Google OAuth      |
| POST   | `/auth/login/guest`  | ❌   | Đăng nhập khách   |
| POST   | `/auth/new-token`    | ❌   | Refresh token     |
| POST   | `/auth/logout`       | ✅   | Đăng xuất         |

### User APIs

| Method | Endpoint              | Auth | Description        |
| ------ | --------------------- | ---- | ------------------ |
| GET    | `/user/profile`       | ✅   | Lấy thông tin user |
| PATCH  | `/user/profile`       | ✅   | Cập nhật profile   |
| POST   | `/user/upload-avatar` | ✅   | Upload avatar      |

### Transaction APIs

| Method | Endpoint                               | Auth | Description        |
| ------ | -------------------------------------- | ---- | ------------------ |
| POST   | `/stock-transactions/transactions`     | ✅   | Tạo giao dịch mới  |
| GET    | `/stock-transactions/:userId`          | ✅   | Lịch sử giao dịch  |
| GET    | `/stock-transactions/:userId/stats`    | ✅   | Thống kê giao dịch |
| GET    | `/stock-transactions/:userId/holdings` | ✅   | Danh mục sở hữu    |
| PUT    | `/stock-transactions/:id/cancel`       | ✅   | Hủy giao dịch      |
| GET    | `/stock-transactions/ranking`          | ❌   | Bảng xếp hạng      |

### Market APIs

| Method | Endpoint           | Auth | Description        |
| ------ | ------------------ | ---- | ------------------ |
| GET    | `/market/vn30`     | ❌   | Dữ liệu VN30       |
| GET    | `/market/stocks`   | ❌   | Danh sách cổ phiếu |
| GET    | `/market/:symbol`  | ❌   | Chi tiết cổ phiếu  |
| GET    | `/market/intraday` | ❌   | Dữ liệu intraday   |

---

## 7. Cấu trúc Database

### Collections

#### Users

```javascript
{
  _id: ObjectId,
  email: String,              // Email đăng nhập
  googleId: String,           // Google OAuth ID (optional)
  password: String,           // Hashed password

  user_fullName: String,      // Họ tên
  user_avatar: String,        // URL avatar
  user_gender: Boolean,       // true = Nam
  balance: Number,            // Số dư (default: 100,000,000)

  isGuest: Boolean,           // Tài khoản khách
  guestExpiresAt: Date,       // Ngày hết hạn (90 ngày)

  user_role: ObjectId,        // Reference to Role
  user_status: String,        // ACTIVE | INACTIVE | BLOCKED

  createdAt: Date,
  updatedAt: Date
}
```

#### Stock Transactions

```javascript
{
  _id: ObjectId,
  user_id: ObjectId,          // Reference to User

  stock_code: String,         // VCB, FPT, etc.
  stock_name: String,         // Tên công ty
  quantity: Number,           // Số lượng
  price_per_unit: Number,     // Giá mỗi cổ phiếu
  total_amount: Number,       // = quantity × price

  transaction_type: String,   // BUY | SELL
  transaction_status: String, // PENDING | COMPLETED | CANCELLED | FAILED

  balance_before: Number,     // Số dư trước giao dịch
  balance_after: Number,      // Số dư sau giao dịch

  notes: String,              // Ghi chú (optional)
  executed_at: Date,          // Thời điểm thực hiện

  createdAt: Date,
  updatedAt: Date
}
```

#### Market Data

```javascript
{
  _id: ObjectId,
  date: String,               // YYYY-MM-DD
  timestamp: Date,            // Thời điểm fetch

  vn30Index: {
    index: Number,            // Giá trị VN30
    change: Number,           // Thay đổi
    changePercent: Number     // % thay đổi
  },

  topGainers: Array,          // Top 5 tăng
  topLosers: Array,           // Top 5 giảm
  totalStocks: Number,        // Số lượng cổ phiếu

  metadata: {
    source: String,           // TCBS
    fetchedAt: Date
  }
}
```

#### Stock Data

```javascript
{
  _id: ObjectId,
  symbol: String,             // Mã cổ phiếu
  date: String,               // YYYY-MM-DD
  companyName: String,        // Tên công ty

  price: Number,              // Giá hiện tại
  change: Number,             // Thay đổi
  changePercent: Number,      // % thay đổi
  volume: Number,             // Khối lượng
  high: Number,               // Giá cao nhất
  low: Number,                // Giá thấp nhất
  open: Number,               // Giá mở cửa
  close: Number,              // Giá đóng cửa

  prices: [                   // Dữ liệu intraday
    {
      time: String,           // HH:MM
      open: Number,
      high: Number,
      low: Number,
      close: Number,
      volume: Number
    }
  ],

  metadata: {
    fetchedAt: Date
  }
}
```

---

## 8. Scheduled Jobs

| Job Name                      | Schedule       | Description                 |
| ----------------------------- | -------------- | --------------------------- |
| `fetch_and_cache_market_data` | 01:00 AM daily | Fetch VN30 data từ vnstock  |
| `cleanUpKeyTokenCronJob`      | Every minute   | Xóa expired JWT tokens      |
| `cleanUpExpiredGuestsCronJob` | 00:00 midnight | Xóa tài khoản guest hết hạn |

### Python Cronjob Details

```python
# Scheduled at 1:00 AM Vietnamese time
scheduler.add_job(
    func=fetch_and_cache_market_data,
    trigger=CronTrigger(hour=1, minute=0, timezone='Asia/Ho_Chi_Minh'),
    id='daily_market_cache',
    name='Daily Market Data Caching'
)
```

**Quy trình:**

1. Kết nối vnstock với source TCBS
2. Fetch dữ liệu 30 mã VN30
3. Aggregate và tính toán VN30 index
4. Lưu vào MongoDB collections
5. Log kết quả

---

## 📞 Liên hệ & Hỗ trợ

-   **GitHub**: https://github.com/univen-2025-team/univen-2025
-   **Issues**: Tạo issue trên GitHub
-   **Documentation**: Xem thêm `DOCS.md`, `TROUBLESHOOTING.md`

---

_Tài liệu này được cập nhật lần cuối: 2025-12-06_

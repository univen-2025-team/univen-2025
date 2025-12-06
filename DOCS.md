# UniVen 2025 - Tài liệu dự án chi tiết

## Mục lục

-   [Tổng quan](#tổng-quan)
-   [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
-   [Cấu trúc thư mục](#cấu-trúc-thư-mục)
-   [API Reference](#api-reference)
-   [Database Models](#database-models)
-   [Tính năng chính](#tính-năng-chính)
-   [Hướng dẫn phát triển](#hướng-dẫn-phát-triển)

---

## Tổng quan

**UniVen 2025** là nền tảng giao dịch chứng khoán mô phỏng cho phép người dùng:

-   Theo dõi dữ liệu thị trường chứng khoán Việt Nam real-time
-   Giao dịch mua/bán cổ phiếu với số dư ảo
-   Xem bảng xếp hạng lợi nhuận
-   Trò chuyện với AI để nhận tư vấn

### Tech Stack

| Component          | Technology                                    |
| ------------------ | --------------------------------------------- |
| **Frontend**       | Next.js 14, React, TailwindCSS, Redux Toolkit |
| **Backend API**    | Express.js, TypeScript, Socket.IO             |
| **Data Service**   | Python Flask, vnstock library                 |
| **Database**       | MongoDB Atlas                                 |
| **Cache**          | Redis Cloud                                   |
| **Authentication** | JWT, Google OAuth 2.0                         |

---

## Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                               │
│              Next.js 14 (React + TailwindCSS)               │
│                    Port: 3000                                │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/WebSocket
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js)                       │
│                      Port: 4000                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Auth Service│  │Transaction  │  │ Market Socket       │  │
│  │             │  │Service      │  │ Service (Socket.IO) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│  Python Server   │    │    MongoDB       │
│  (vnstock)       │    │    Atlas         │
│  Port: 5000      │    │                  │
└──────────────────┘    └──────────────────┘
```

---

## Cấu trúc thư mục

```
univen-2025/
├── client/                    # Next.js Frontend
│   ├── app/
│   │   ├── (dashboard)/      # Protected pages
│   │   │   ├── market/       # Trang thị trường
│   │   │   ├── trade/        # Trang giao dịch
│   │   │   ├── portfolio/    # Danh mục đầu tư
│   │   │   ├── ranking/      # Bảng xếp hạng
│   │   │   ├── badges/       # Huy hiệu
│   │   │   ├── history/      # Lịch sử giao dịch
│   │   │   └── profile/      # Hồ sơ cá nhân
│   │   └── auth/             # Login/Register pages
│   ├── components/           # React components
│   ├── lib/
│   │   ├── api/             # API client functions
│   │   ├── store/           # Redux slices
│   │   └── hooks/           # Custom React hooks
│   └── config/              # App configuration
│
├── server/                   # Express.js Backend
│   └── src/
│       ├── api/
│       │   ├── controllers/ # Request handlers
│       │   ├── services/    # Business logic
│       │   ├── models/      # Mongoose schemas
│       │   ├── routes/      # API routes
│       │   └── middlewares/ # Express middlewares
│       └── configs/         # Server configuration
│
├── python-server/           # Python Data Service
│   ├── app.py              # Flask application
│   └── services/
│       └── data_fetcher.py # vnstock integration
```

---

## API Reference

### Authentication (`/v1/api/auth`)

| Method  | Endpoint           | Auth | Description                   |
| ------- | ------------------ | ---- | ----------------------------- |
| `POST`  | `/sign-up`         | ❌   | Đăng ký tài khoản             |
| `POST`  | `/login`           | ❌   | Đăng nhập bằng email/password |
| `GET`   | `/login/google`    | ❌   | Đăng nhập bằng Google OAuth   |
| `POST`  | `/login/guest`     | ❌   | Đăng nhập với tư cách khách   |
| `POST`  | `/new-token`       | ❌   | Làm mới access token          |
| `POST`  | `/logout`          | ✅   | Đăng xuất                     |
| `PATCH` | `/forgot-password` | ✅   | Thay đổi mật khẩu             |

#### Request/Response Examples

**POST /auth/login**

```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "statusCode": 200,
  "message": "Login success!",
  "metadata": {
    "token": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    },
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "user_fullName": "Nguyen Van A",
      "balance": 100000000
    }
  }
}
```

**POST /auth/login/guest**

```json
// Response - Tạo tài khoản khách tự động
{
  "metadata": {
    "token": { ... },
    "user": {
      "email": "guest_abc123@univen.guest",
      "user_fullName": "Khách #123456",
      "isGuest": true,
      "guestExpiresAt": "2025-03-06T..."  // Hết hạn sau 90 ngày
    }
  }
}
```

---

### User (`/v1/api/user`)

| Method  | Endpoint         | Auth | Description        |
| ------- | ---------------- | ---- | ------------------ |
| `GET`   | `/profile`       | ✅   | Lấy thông tin user |
| `PATCH` | `/profile`       | ✅   | Cập nhật profile   |
| `POST`  | `/upload-avatar` | ✅   | Upload avatar      |

---

### Stock Transactions (`/v1/api/stock-transactions`)

| Method | Endpoint                      | Auth | Description        |
| ------ | ----------------------------- | ---- | ------------------ |
| `POST` | `/transactions`               | ✅   | Tạo giao dịch mới  |
| `GET`  | `/transactions/:userId`       | ✅   | Lịch sử giao dịch  |
| `GET`  | `/transactions/:userId/stats` | ✅   | Thống kê giao dịch |
| `PUT`  | `/transactions/:id/cancel`    | ✅   | Hủy giao dịch      |
| `GET`  | `/ranking`                    | ❌   | Bảng xếp hạng      |

#### Request Examples

**POST /stock-transactions/transactions** (Mua cổ phiếu)

```json
{
    "stock_code": "VCB",
    "stock_name": "Vietcombank",
    "quantity": 100,
    "price_per_unit": 92500,
    "transaction_type": "BUY"
}
```

**GET /stock-transactions/ranking Response**

```json
{
    "metadata": {
        "data": [
            {
                "userId": "...",
                "user_fullName": "Nguyen Van A",
                "user_avatar": "...",
                "totalProfit": 5000000,
                "profitPercentage": 5.0,
                "rank": 1
            }
        ],
        "pagination": { "total": 50, "page": 1 }
    }
}
```

---

### Market Data (`/v1/api/market`)

| Method | Endpoint         | Description        |
| ------ | ---------------- | ------------------ |
| `GET`  | `/vn30`          | Dữ liệu VN30 index |
| `GET`  | `/stocks`        | Danh sách cổ phiếu |
| `GET`  | `/stock/:symbol` | Chi tiết cổ phiếu  |

---

## Database Models

### User Model

```typescript
{
  email: string;              // Email đăng nhập
  googleId?: string;          // Google OAuth ID
  password?: string;          // Mật khẩu (hashed)

  user_fullName: string;      // Họ tên
  user_avatar?: string;       // URL avatar
  user_gender: boolean;       // true = Nam
  balance: number;            // Số dư (mặc định: 100,000,000 VND)

  isGuest?: boolean;          // Tài khoản khách
  guestExpiresAt?: Date;      // Ngày hết hạn (90 ngày)

  user_role: ObjectId;        // Role reference
  user_status: "ACTIVE" | "INACTIVE" | "BLOCKED";
}
```

### Stock Transaction Model

```typescript
{
  user_id: ObjectId;
  stock_code: string;         // VCB, VNM, FPT...
  stock_name: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;       // quantity × price

  transaction_type: "BUY" | "SELL";
  transaction_status: "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED";

  balance_before: number;
  balance_after: number;
  executed_at?: Date;
}
```

---

## Tính năng chính

### 1. Xác thực (Authentication)

-   **Email/Password**: Đăng ký và đăng nhập truyền thống
-   **Google OAuth 2.0**: Đăng nhập nhanh bằng Google
-   **Guest Login**: Trải nghiệm không cần đăng ký (tự xóa sau 90 ngày)
-   **JWT Token**: Access token (15 phút) + Refresh token (1 ngày)

### 2. Giao dịch cổ phiếu

-   **Mua cổ phiếu**: Trừ tiền từ balance, tạo giao dịch BUY
-   **Bán cổ phiếu**: Kiểm tra số lượng sở hữu, tạo giao dịch SELL
-   **Validation**: Không cho bán quá số cổ phiếu đang sở hữu

### 3. Real-time Updates (Socket.IO)

-   Cập nhật giá VN30 mỗi phút
-   Thông báo giao dịch thành công
-   Đồng bộ balance real-time

### 4. Bảng xếp hạng

-   Công thức: `Lợi nhuận = (Số dư + Giá trị CP) - 100,000,000`
-   Loại trừ tài khoản Guest
-   Top 10 người dùng có lợi nhuận cao nhất

### 5. Huy hiệu (Badges)

-   Dựa trên thành tích giao dịch
-   Sidebar hiển thị số huy hiệu chưa đạt

---

## Hướng dẫn phát triển

### Chạy dự án local

```bash
# 1. Clone repository
git clone https://github.com/univen-2025-team/univen-2025.git
cd univen-2025

# 2. Cài đặt dependencies
npm install
cd client && npm install
cd ../server && npm install

# 3. Setup Python server
cd ../python-server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Tạo file .env
# Copy từ .env.example hoặc tạo mới

# 5. Chạy tất cả services
./start-all.sh
```

### Environment Variables

**Server (.env)**

```env
PORT=4000
DB_URL=mongodb+srv://...
CLIENT_URL=http://localhost:3000
VNSTOCK_API_URL=http://localhost:5000
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
```

**Client (.env.local)**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/v1/api
```

### Deployment

-   **Client**: Vercel (auto-deploy from `master`)
-   **Server**: EC2 via GitHub Actions
-   **Python Server**: EC2 via GitHub Actions
-   **Database**: MongoDB Atlas
-   **Redis**: Redis Cloud

---

## Scheduled Jobs

| Job                           | Schedule        | Description                 |
| ----------------------------- | --------------- | --------------------------- |
| `cleanUpKeyTokenCronJob`      | Mỗi phút        | Xóa token hết hạn           |
| `cleanUpExpiredGuestsCronJob` | 00:00 hàng ngày | Xóa tài khoản Guest hết hạn |

---

## Liên hệ & Hỗ trợ

-   **GitHub**: https://github.com/univen-2025-team/univen-2025
-   **Issues**: Tạo issue trên GitHub
-   **Team**: UniVen 2025 Development Team

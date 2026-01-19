# Tính năng mới - UniVen 2025

## Tổng quan

Tài liệu này mô tả các API và tính năng mới được thêm vào hệ thống UniVen 2025.

---

## 1. API Tìm Tin Tức Theo Ngày Cụ Thể

### Mô tả

API cho phép tìm kiếm tất cả các tin tức liên quan đến một mã cổ phiếu trong khoảng thời gian xung quanh một ngày cụ thể.

### Endpoint

#### Server API (Node.js)

```
GET /v1/api/market/news/:symbol/date/:date
```

#### VNStock API (Python)

```
GET /news/{symbol}/date/{date}
```

### Parameters

| Parameter     | Type   | Required | Description                                         |
| ------------- | ------ | -------- | --------------------------------------------------- |
| `symbol`      | string | ✅       | Mã cổ phiếu (VD: FPT, VNM, VIC)                     |
| `date`        | string | ✅       | Ngày cần tìm (format: YYYY-MM-DD)                   |
| `window_days` | number | ❌       | Số ngày trước/sau để mở rộng tìm kiếm (mặc định: 2) |

### Response

```json
{
    "status": "success",
    "data": [
        {
            "id": "12345",
            "title": "FPT công bố kết quả kinh doanh Q4/2025",
            "shortContent": "Tóm tắt tin tức...",
            "fullContent": "Nội dung đầy đủ...",
            "imageUrl": "https://...",
            "sourceLink": "https://...",
            "publishedAt": "2025-04-10 14:30",
            "publishedTimestamp": 1712753400000,
            "closePrice": 125000,
            "refPrice": 124000,
            "priceChangePct": 0.81
        }
    ],
    "symbol": "FPT",
    "targetDate": "2025-04-10",
    "windowDays": 2,
    "total": 5
}
```

### Ví dụ sử dụng

```bash
# Lấy tin tức FPT xung quanh ngày 2025-04-10
curl "http://localhost:4000/v1/api/market/news/FPT/date/2025-04-10"

# Với window 5 ngày
curl "http://localhost:4000/v1/api/market/news/FPT/date/2025-04-10?window_days=5"
```

---

## 2. API Tạo Bài Học Từ Biến Động Giá (Learn Product)

### Mô tả

Tính năng tự động phân tích lịch sử giá cổ phiếu, phát hiện các sự kiện biến động bất thường, thu thập tin tức liên quan và sử dụng **Groq AI (LLaMA 3.3 70B)** để tạo bài học đầu tư phù hợp với độ tuổi người dùng.

### Luồng xử lý

```
1. Phân tích giá 1 năm →
2. Phát hiện biến động >X% →
3. Tìm tin tức liên quan →
4. Gửi Groq AI →
5. Lưu MongoDB →
6. Trả về UI
```

### Endpoints

#### 2.1. Lấy/Tạo Bài Học

```
GET /v1/api/learn/product
```

**Query Parameters:**

| Parameter      | Type   | Required | Default | Description                              |
| -------------- | ------ | -------- | ------- | ---------------------------------------- |
| `symbol`       | string | ✅       | -       | Mã cổ phiếu                              |
| `userAge`      | number | ✅       | -       | Tuổi người dùng (để điều chỉnh nội dung) |
| `threshold`    | number | ❌       | 3       | Ngưỡng % biến động (VD: 3 = ±3%)         |
| `lookbackDays` | number | ❌       | 365     | Số ngày lịch sử cần phân tích            |
| `limit`        | number | ❌       | 10      | Số bài học tối đa trả về                 |

**Response:**

```json
{
  "statusCode": 200,
  "message": "Lessons generated successfully",
  "metadata": {
    "symbol": "FPT",
    "lessons": [
      {
        "_id": "...",
        "symbol": "FPT",
        "eventDate": "2025-04-10",
        "priceChangePercent": 6.92,
        "title": "Bài học từ sự kiện tăng giá FPT ngày 10/04/2025",
        "content": "Nội dung bài học...",
        "summary": "Tóm tắt...",
        "difficulty": "intermediate",
        "ageGroup": "adult",
        "keyTakeaways": ["Điểm 1", "Điểm 2", "Điểm 3"],
        "relatedNews": [...],
        "createdAt": "2025-04-15T10:30:00Z"
      }
    ],
    "total": 5,
    "generated": 3,
    "cached": 2
  }
}
```

#### 2.2. Lấy Bài Học Đã Có (Không tạo mới)

```
GET /v1/api/learn/product/:symbol
```

#### 2.3. Tạo Lại Bài Học (Admin)

```
POST /v1/api/learn/product/regenerate
```

**Body:**

```json
{
    "symbol": "FPT",
    "userAge": 25,
    "threshold": 5
}
```

#### 2.4. Xóa Bài Học (Admin)

```
DELETE /v1/api/learn/product/:symbol
```

### Cách tính biến động giá

```
Biến động (%) = ((Giá đóng cửa hôm nay - Giá đóng cửa hôm qua) / Giá đóng cửa hôm qua) × 100
```

- Nếu biến động > +threshold% → Sự kiện TĂNG bất thường
- Nếu biến động < -threshold% → Sự kiện GIẢM bất thường

### Phân loại độ tuổi

| Tuổi  | Nhóm        | Đặc điểm nội dung                |
| ----- | ----------- | -------------------------------- |
| < 18  | teen        | Ngôn ngữ đơn giản, ví dụ gần gũi |
| 18-35 | young_adult | Chuyên sâu vừa phải, thực tiễn   |
| 36-55 | adult       | Phân tích chi tiết, chiến lược   |
| > 55  | senior      | An toàn, bảo toàn vốn            |

### Cấu hình

```env
# .env.development
GROQ_API_KEY=your_groq_api_key_here
```

### Ví dụ sử dụng

```bash
# Lấy bài học cho FPT, người dùng 25 tuổi, ngưỡng 5%
curl "http://localhost:4000/v1/api/learn/product?symbol=FPT&userAge=25&threshold=5&limit=5"

# Chỉ lấy bài học đã có
curl "http://localhost:4000/v1/api/learn/product/FPT"
```

---

## 3. API Lấy Lịch Sử Giá Cổ Phiếu

### Endpoint (VNStock API)

```
GET /history/{symbol}
```

### Parameters

| Parameter  | Type   | Required | Default     | Description                       |
| ---------- | ------ | -------- | ----------- | --------------------------------- |
| `symbol`   | string | ✅       | -           | Mã cổ phiếu                       |
| `start`    | string | ❌       | 1 năm trước | Ngày bắt đầu (YYYY-MM-DD)         |
| `end`      | string | ❌       | Hôm nay     | Ngày kết thúc (YYYY-MM-DD)        |
| `interval` | string | ❌       | "1D"        | Khoảng thời gian (1D = hàng ngày) |

### Response

```json
{
    "status": "success",
    "data": [
        {
            "date": "2025-04-10",
            "open": 120000,
            "high": 127000,
            "low": 119500,
            "close": 125000,
            "volume": 5230000
        }
    ],
    "symbol": "FPT",
    "total": 262,
    "start": "2024-04-10",
    "end": "2025-04-10",
    "interval": "1D"
}
```

---

## 4. Cấu hình Docker

### docker-compose.dev.yml

Đã cập nhật để server container load biến môi trường từ file `.env.development`:

```yaml
server:
    build:
        context: ./server
        dockerfile: Dockerfile.dev
    container_name: univen-server-dev
    env_file:
        - ./server/.env.development
    # ... other configs
```

---

## 5. Kiến trúc hệ thống

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │────▶│   Node.js       │────▶│   VNStock API   │
│   Frontend      │     │   Server        │     │   (Python)      │
│   Port: 3000    │     │   Port: 4000    │     │   Port: 8000    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌─────────┐  ┌─────────┐  ┌─────────────┐
              │ MongoDB │  │  Redis  │  │  Groq API   │
              │ :27017  │  │  :6379  │  │ (LLaMA 3.3) │
              └─────────┘  └─────────┘  └─────────────┘
```

---

## 6. Files đã thay đổi/thêm mới

### Server (Node.js)

| File                                               | Mô tả                                 |
| -------------------------------------------------- | ------------------------------------- |
| `src/api/routes/market-cache.route.ts`             | Thêm route `/news/:symbol/date/:date` |
| `src/api/controllers/market-cache.controller.ts`   | Thêm `getStockNewsByDate`             |
| `src/api/services/market-cache.service.ts`         | Thêm `getStockNewsByDate()`           |
| `src/api/routes/learn/index.ts`                    | Routes cho Learn Product API          |
| `src/api/controllers/learn-product.controller.ts`  | Controller xử lý request              |
| `src/api/services/learn-product.service.ts`        | Logic chính tạo bài học               |
| `src/api/services/price-analysis.service.ts`       | Phân tích biến động giá               |
| `src/api/services/groq.service.ts`                 | Tích hợp Groq AI (LLaMA 3.3 70B)      |
| `src/api/services/news.service.ts`                 | Fetch tin tức theo sự kiện            |
| `src/api/repositories/learn-product.repository.ts` | CRUD MongoDB                          |
| `src/api/models/learn-product.model.ts`            | Schema MongoDB                        |
| `src/types/learn-product.types.ts`                 | TypeScript types                      |

### VNStock API (Python)

| File          | Mô tả                                                             |
| ------------- | ----------------------------------------------------------------- |
| `src/main.py` | Thêm endpoint `/news/{symbol}/date/{date}` và `/history/{symbol}` |

### Client (Next.js)

| File | Mô tả |
| --- | --- |
| `lib/api/market-cache.ts` | Thêm functions `generateStockLessons()`, `getStockLessons()` |
| `features/learn-stock/components/LearnStockPage.tsx` | Kết nối với API thật |

### Config

| File                      | Mô tả                                |
| ------------------------- | ------------------------------------ |
| `docker-compose.dev.yml`  | Thêm `env_file` cho server container |
| `server/.env.development` | Thêm `GROQ_API_KEY`                  |

---

## 7. Yêu cầu

### Dependencies

**Server (Node.js):**

```bash
# Không cần cài thêm package - sử dụng fetch API có sẵn
```

**VNStock API (Python):**

```bash
pip install vnstock fastapi uvicorn
```

### Environment Variables

```env
# Server
GROQ_API_KEY=gsk_xxx...  # Groq API Key (https://console.groq.com)
VNSTOCK_API_URL=http://vnstock-api:8000

# VNStock API
MONGODB_URI=mongodb://...
```

---

## 8. Ghi chú

### Rate Limits (Groq API Free Tier)

- 30 requests/minute
- 14,400 requests/day
- 6,000 tokens/minute (input + output)

### Lưu ý khi triển khai

1. API key Groq được tạo từ https://console.groq.com
2. Groq sử dụng model LLaMA 3.3 70B - nhanh và chất lượng cao
3. Nên có rate limiting ở server để tránh vượt quota
4. Lessons được cache trong MongoDB để giảm số lần gọi API

---

## Changelog

### v1.1.0 (2026-01-20)

- ✅ Chuyển từ Google Gemini sang Groq AI (LLaMA 3.3 70B)
- ✅ Cải thiện tốc độ xử lý (Groq nhanh hơn nhiều)
- ✅ Rate limit cao hơn (30 req/min vs 15 req/min)

### v1.0.0 (2026-01-20)

- ✅ Thêm API tìm tin tức theo ngày cụ thể
- ✅ Thêm API tạo bài học từ biến động giá (Learn Product)
- ✅ Phân tích giá với ngưỡng tùy chỉnh (mặc định 3%)
- ✅ Hỗ trợ phân loại nội dung theo độ tuổi
- ✅ Cập nhật Docker Compose để load environment variables

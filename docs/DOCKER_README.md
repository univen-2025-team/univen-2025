# Docker Setup cho univen-2025

## Quick Start

### Production Mode (Linux/macOS)

```bash
docker compose build
docker compose up -d
```

### Production Mode (Windows)

```bash
docker compose -f docker-compose.windows.yml up -d
```

### Development Mode (macOS Optimized)
If you are on macOS, use this command to avoid port conflicts (AirPlay uses port 5000) and improve performance:
```bash
docker compose -f docker-compose.mac.yml up
```
```bash
docker compose -f docker-compose.mac.yml up
```
*   **Server URL**: `http://localhost:4000` 
*   **Client URL**: `http://localhost:3000` 

### Development Mode (Standard)
```bash
docker compose -f docker-compose.dev.yml up
```

> ⚡ Development mode mount source code để có **hot reload** / **fast refresh**

## Services

| Service | URL                   | Description           |
| ------- | --------------------- | --------------------- |
| Client  | http://localhost:3000 | Next.js frontend      |
| Server  | http://localhost:4000 | Node.js API           |
| MongoDB | localhost:27017       | Database              |
| Redis   | localhost:6379        | Cache                 |
| VNStock | http://localhost:8000 | Python cronjob worker |
| MinIO   | http://localhost:9001 | Object storage UI     |

## Environment Setup (QUAN TRỌNG!)

### 1. Tạo file `.env` ở thư mục root:

```env
# ==============================================================================
# Docker Environment Configuration
# ==============================================================================
COMPOSE_PROJECT_NAME=univen-2025

# ==============================================================================
# MongoDB - QUAN TRỌNG: Dùng service name "mongodb" cho Docker network
# ==============================================================================
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=password123
MONGO_INITDB_DATABASE=univen2025
MONGODB_URI=mongodb://admin:password123@mongodb:27017/univen2025?authSource=admin

# ==============================================================================
# Redis
# ==============================================================================
REDIS_URL=redis://redis:6379

# ==============================================================================
# Server (Node.js) - Internal port luôn là 4000
# ==============================================================================
NODE_ENV=production
SERVER_PORT=4000

# ==============================================================================
# Client (Next.js) - NEXT_PUBLIC_ vars được bake vào lúc BUILD
# Dùng localhost cho browser access, KHÔNG dùng Docker service name
# ==============================================================================
CUSTOMER_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:4000/v1/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==============================================================================
# Google OAuth (thay bằng giá trị thật)
# ==============================================================================
OAUTH2_CLIENT_ID=your-client-id
OAUTH2_CLIENT_SECRET=your-client-secret

# ==============================================================================
# VNStock Python Service
# ==============================================================================
CRONJOB_ENABLED=true
VNSTOCK_SOURCE=TCBS
VNSTOCK_API_KEY=your-vnstock-api-key

# ==============================================================================
# MinIO (Object Storage)
# ==============================================================================
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=password123
```

### 2. Các biến quan trọng cần hiểu:

| Variable | Giá trị | Giải thích |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb://...@mongodb:27017/...` | Dùng `mongodb` (service name) vì các container communicate qua Docker network |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/v1/api` | Dùng `localhost` vì browser chạy trên host machine, không phải trong Docker |
| `SERVER_PORT` | `4000` | Port expose ra host, internal Docker port luôn là 4000 |

## Commands

```bash
# === WINDOWS ===
docker compose -f docker-compose.windows.yml up -d
docker compose -f docker-compose.windows.yml down
docker compose -f docker-compose.windows.yml logs -f

# === LINUX/macOS ===
docker compose up -d
docker compose down

# === DEVELOPMENT (Fast Refresh) ===
docker compose -f docker-compose.dev.yml up
docker compose -f docker-compose.dev.yml down

# Build lại images (BẮT BUỘC sau khi thay đổi NEXT_PUBLIC_ vars)
docker compose -f docker-compose.windows.yml build --no-cache

# Build một service cụ thể
docker compose -f docker-compose.windows.yml build server
docker compose -f docker-compose.windows.yml build client --no-cache

# Restart một service
docker compose -f docker-compose.windows.yml restart server

# Xem logs của một service
docker compose -f docker-compose.windows.yml logs -f server
docker compose -f docker-compose.windows.yml logs -f client
docker compose -f docker-compose.windows.yml logs -f mongodb

# Truy cập vào container
docker compose -f docker-compose.windows.yml exec server sh
docker compose -f docker-compose.windows.yml exec mongodb mongosh

# Xóa volumes (cẩn thận - mất dữ liệu!)
docker compose -f docker-compose.windows.yml down -v
```

## Development Mode Features

| Service | Hot Reload                    |
| ------- | ----------------------------- |
| Server  | ✅ `bun --watch` auto-restart |
| Client  | ✅ Next.js Fast Refresh       |
| Python  | ✅ Volume mounted             |

## Troubleshooting

### Windows - Client không connect được server

**Nguyên nhân phổ biến:**

1. `NEXT_PUBLIC_API_URL` sai - phải là `http://localhost:4000/v1/api` (localhost, không phải service name)
2. Server chưa healthy
3. Chưa rebuild client sau khi đổi env

```bash
# 1. Kiểm tra các container đang chạy
docker compose -f docker-compose.windows.yml ps

# 2. Kiểm tra server healthy
curl http://localhost:4000/v1/api/health

# 3. Nếu đổi NEXT_PUBLIC_API_URL, PHẢI rebuild client
docker compose -f docker-compose.windows.yml build client --no-cache
docker compose -f docker-compose.windows.yml up -d
```

### MongoDB connection refused / không start

```bash
# 1. Xem logs MongoDB
docker compose -f docker-compose.windows.yml logs mongodb

# 2. Đợi MongoDB healthy trước rồi mới start services khác
docker compose -f docker-compose.windows.yml up mongodb -d
# Đợi ~30s cho MongoDB init xong
docker compose -f docker-compose.windows.yml up -d

# 3. Nếu vẫn lỗi, reset volume
docker compose -f docker-compose.windows.yml down -v
docker compose -f docker-compose.windows.yml up -d
```

### Server không start (healthcheck failed)

```bash
# 1. Kiểm tra logs chi tiết
docker compose -f docker-compose.windows.yml logs server

# 2. Kiểm tra health endpoint từ host
curl http://localhost:4000/v1/api/health

# 3. Vào container debug
docker compose -f docker-compose.windows.yml exec server sh
# Trong container:
node -e "require('http').get('http://localhost:4000/v1/api/health', r => console.log(r.statusCode))"

# 4. Test MongoDB connection từ server container
docker compose -f docker-compose.windows.yml exec server sh
# Trong container:
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('OK')).catch(e => console.log(e))"
```

### CORS Error khi client gọi API

Thêm `CLIENT_URL` vào server environment trong docker-compose:

```yaml
environment:
    CLIENT_URL: http://localhost:3000
```

### Hot reload không hoạt động (Windows/WSL)

Development mode dùng polling. Nếu vẫn không hoạt động:

```bash
# Ensure WATCHPACK_POLLING is set
docker compose -f docker-compose.dev.yml up --build
```

### Python vnstock error

```bash
docker compose -f docker-compose.windows.yml exec vnstock-api python -c "import vnstock; print(vnstock.__version__)"
```

## Step-by-Step cho Windows (từ đầu)

```bash
# 1. Tạo file .env (copy nội dung từ phần Environment Setup ở trên)

# 2. Build tất cả images
docker compose -f docker-compose.windows.yml build

# 3. Start MongoDB và Redis trước
docker compose -f docker-compose.windows.yml up mongodb redis -d

# 4. Đợi 30s cho MongoDB init, rồi start tất cả
docker compose -f docker-compose.windows.yml up -d

# 5. Kiểm tra trạng thái
docker compose -f docker-compose.windows.yml ps

# 6. Xem logs nếu có lỗi
docker compose -f docker-compose.windows.yml logs -f
```

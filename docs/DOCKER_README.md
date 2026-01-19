# Docker Setup cho univen-2025

## Quick Start

### Production Mode
```bash
docker compose build
```

### Development Mode (macOS Optimized)
If you are on macOS, use this command to avoid port conflicts (AirPlay uses port 5000) and improve performance:
```bash
docker compose -f docker-compose.mac.yml up
```
```bash
docker compose -f docker-compose.mac.yml up
```
*   **Server URL**: `http://localhost:4000` (Avoids AirPlay port 5000 conflict)
*   **Client URL**: `http://localhost:3000` (Running in Docker)

### Development Mode (Standard)
```bash
docker compose -f docker-compose.dev.yml up
```

> ⚡ Development mode mount source code để có **hot reload** / **fast refresh**

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Client | http://localhost:3000 | Next.js frontend |
| Server | http://localhost:5000 | Node.js API |
| MongoDB | localhost:27017 | Database |
| Redis | localhost:6379 | Cache |
| Python | - | Cronjob worker |

## Environment

Copy và chỉnh sửa file `.env.docker`:

```bash
cp .env.docker .env
```

## Commands

```bash
# === PRODUCTION ===
docker compose up -d
docker compose down

# === DEVELOPMENT (Fast Refresh) ===
docker compose -f docker-compose.dev.yml up
docker compose -f docker-compose.dev.yml down

# Build lại images
docker compose build

# Build một service cụ thể
docker compose build server

# Restart một service
docker compose restart server

# Xem logs của một service
docker compose logs -f server

# Truy cập vào container
docker compose exec server sh
docker compose exec mongodb mongosh

# Xóa volumes (cẩn thận - mất dữ liệu!)
docker compose down -v
```

## Development Mode Features

| Service | Hot Reload |
|---------|------------|
| Server | ✅ `bun --watch` auto-restart |
| Client | ✅ Next.js Fast Refresh |
| Python | ✅ Volume mounted |

## Troubleshooting

### MongoDB connection refused
```bash
# Đợi MongoDB healthy trước
docker compose up mongodb -d
docker compose logs mongodb -f
# Sau đó mới start các services khác
docker compose up -d
```

### Hot reload không hoạt động (Windows/WSL)
Development mode dùng polling. Nếu vẫn không hoạt động:
```bash
# Ensure WATCHPACK_POLLING is set
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Python vnstock error
Container đã pre-accept license. Nếu vẫn lỗi:
```bash
docker compose exec python-server python -c "import vnai; vnai.setup()"
```

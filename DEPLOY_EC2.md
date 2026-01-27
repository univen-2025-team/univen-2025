# Hướng Dẫn Deploy Lên AWS EC2 (Backend + Cloud IO)

Tài liệu hướng dẫn deploy version sử dụng services chuyên nghiệp:
- **MongoDB Atlas** (Database)
- **Redis Cloud** (Cache)
- **MinIO** (Self-hosted Object Storage)
- **Server Node.js** & **VNStock API**

> **Note:** Client (Next.js) deploy riêng.

## 1. Chuẩn bị VPS (EC2)

- **OS**: Ubuntu 22.04 LTS.
- **Inbound Rules**: Port 22 (SSH), 80 (API), 8000 (VNStock), 9000-9001 (MinIO).

## 2. Setup Cơ Bản

SSH vào server và chạy:

```bash
# Cài Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Clone Code
git clone https://github.com/tranconcoder/univen-2025.git
cd univen-2025
```

## 3. Cấu hình Env (QUAN TRỌNG)

Bạn cần lấy connection string từ MongoDB Atlas và Redis Cloud.

Tạo file `.env`:
```bash
nano .env
```

**Nội dung `.env`:** (Hãy điền thông tin thật của bạn)

```ini
# --- External Services ---
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/1111venture?retryWrites=true&w=majority

# Redis Cloud Connection String
REDIS_URL=redis://:<password>@redis-12345.c1.us-east-1-2.ec2.cloud.redislabs.com:12345

# --- MinIO (Self-hosted) ---
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=secure_minio_password

# --- App URLs ---
NEXT_PUBLIC_APP_URL=http://your-domain.duckdns.org

# --- API Keys ---
VNSTOCK_API_URL=http://vnstock-api:8000
HF_TOKEN=
GROQ_API_KEY=
```

## 4. Deploy

Do dùng services bên ngoài nên server EC2 sẽ nhẹ gánh hơn rất nhiều.

```bash
# Deploy bằng file prod (đã map port 80 -> 4000)
docker compose -f docker-compose.prod.yml up -d --build
```

### Các lệnh quản lý:

- Xem logs server:
  ```bash
  docker compose -f docker-compose.prod.yml logs -f server
  ```
- Restart khi đổi env:
  ```bash
  docker compose -f docker-compose.prod.yml down
  docker compose -f docker-compose.prod.yml up -d
  ```

## 5. Kiểm tra

Truy cập: `http://<EC2_IP_or_Domain>/v1/api/health`

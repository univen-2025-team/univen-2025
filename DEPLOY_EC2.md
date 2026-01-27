# Hướng Dẫn Deploy Lên AWS EC2 (Backend Services)

Tài liệu này hướng dẫn cách deploy phần Backend (Server, Python Service, Database) lên máy chủ AWS EC2 sử dụng `docker-compose.prod.yml`.

> **Lưu ý:** Tệp cấu hình này **KHÔNG** deploy Next.js Client. Bạn cần deploy Client riêng (ví dụ trên Vercel hoặc một container riêng).

## 1. Chuẩn bị VPS (EC2)

- **OS**: Ubuntu 22.04 LTS hoặc mới hơn.
- **Inbound Rules (Security Group)**:
    - SSH (22): My IP
    - Custom TCP (4000): Anywhere (API Server)
    - Custom TCP (8000): Anywhere (VNStock API)
    - Custom TCP (9000-9001): Cho MinIO (nếu cần access admin)

## 2. Cài đặt Docker & Git

```bash
# Cập nhật hệ thống
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git

# Cài đặt Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Phân quyền
sudo usermod -aG docker $USER
newgrp docker
```

## 3. Setup Project

```bash
cd ~
git clone https://github.com/tranconcoder/univen-2025.git
cd univen-2025
```

## 4. Cấu hình Env

Tạo file `.env` từ mẫu:

```bash
cp .env.docker.example .env
nano .env
```

Điền các thông số thực tế:

```ini
# Database
MONGO_INITDB_ROOT_PASSWORD=your_secure_password
MONGODB_URI=mongodb://admin:your_secure_password@mongodb:27017/univen2025?authSource=admin
MINIO_ROOT_PASSWORD=your_secure_minio_password

# Client URL (Để server biết cho phép CORS từ đâu)
NEXT_PUBLIC_APP_URL=https://your-domain.com

# APIs
VNSTOCK_API_URL=http://vnstock-api:8000
```

## 5. Chạy Docker Compose

Chạy lệnh sau để build và start các service backend (sử dụng file `docker-compose.prod.yml`):

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Các lệnh hữu ích:

- Xem logs: `docker compose -f docker-compose.prod.yml logs -f`
- Restart server: `docker compose -f docker-compose.prod.yml restart server`
- Stop toàn bộ: `docker compose -f docker-compose.prod.yml down`

## 6. Kiểm tra

Truy cập: `http://YOUR_EC2_IP:4000/v1/api/health` để xem server đã chạy chưa.

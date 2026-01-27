# Hướng Dẫn Cài Đặt HTTPS (DuckDNS + Nginx + Certbot)

Tài liệu này hướng dẫn bạn biến website từ `http://` thành `https://` bảo mật, sử dụng tên miền DuckDNS.

## 1. Cập Nhật Docker Compose (Trên EC2)

Đầu tiên, phải chắc chắn bạn đã cập nhật file `docker-compose.prod.yml` mới nhất (bind port `127.0.0.1:4000`).

```bash
cd ~/univen-2025
git pull origin master
# Restart lại để release port 80
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## 2. Cài Đặt Nginx và Certbot

Chạy lần lượt các lệnh sau trên terminal EC2:

```bash
# Cập nhật và cài đặt
sudo apt update
sudo apt install nginx python3-certbot-nginx -y
```

## 3. Cấu Hình Nginx (Reverse Proxy)

Tạo file cấu hình cho domain của bạn:

```bash
sudo nano /etc/nginx/sites-available/univen
```

Dán nội dung sau vào (Thay `YOUR_DOMAIN.duckdns.org` bằng tên miền thật của bạn):

```nginx
server {
    listen 80;
    server_name univen-1111-api.duckdns.org; # <--- SỬA TÊN MIỀN CỦA BẠN Ở ĐÂY

    location / {
        proxy_pass http://127.0.0.1:4000; # Chuyển tiếp về Node Server đang chạy local
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Lưu file (`Ctrl+O` -> `Enter` -> `Ctrl+X`).

Kích hoạt cấu hình:
```bash
sudo ln -s /etc/nginx/sites-available/univen /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # Xóa config mặc định
sudo nginx -t # Kiểm tra lỗi (Nếu báo OK là ngon)
sudo systemctl restart nginx
```

> 💡 **Test thử:** Lúc này truy cập `http://your-domain.duckdns.org` sẽ vào được web, nhưng vẫn chưa có khóa xanh (HTTPS).

## 4. Kích Hoạt HTTPS (SSL)

Dùng Certbot để tự động xin chứng chỉ và cài vào Nginx:

```bash
sudo certbot --nginx -d univen-1111-api.duckdns.org
```

- Nhập email (để nhận thông báo hết hạn).
- Nhập `Y` (đồng ý điều khoản).
- Certbot sẽ tự động cấu hình HTTPS cho bạn.

## 5. Hoàn Tất

Truy cập lại website: `https://your-domain.duckdns.org`.
Bạn sẽ thấy biểu tượng 🔒 an toàn.

---

### Lưu ý Auto-Renew
Chứng chỉ Let's Encrypt hết hạn sau 90 ngày. Certbot đã tự cài cronjob để gia hạn.
Kiểm tra thử xem nó chạy ổn không:
```bash
sudo certbot renew --dry-run
```

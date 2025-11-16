# Univen 2025 - Vietnamese Stock Market Platform

A comprehensive web application for tracking Vietnamese stock market data with real-time updates from the VN30 index.

## 🚀 Features

- **Real-time Stock Data**: Live updates from Vietnamese stock market using vnstock library
- **VN30 Index Tracking**: Monitor the top 30 stocks by market capitalization
- **Interactive Charts**: Beautiful visualizations of market trends and individual stocks
- **Technical Analysis**: Moving averages, RSI, MACD indicators
- **Socket.IO Integration**: Real-time data streaming to connected clients
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

The application consists of four main components:

1. **Python Flask Server** (`python-server/`): Fetches real data from vnstock library
2. **NestJS Backend** (`server/`): Business logic, Socket.IO server, API gateway
3. **Next.js Frontend** (`client-new/`): Modern React-based user interface
4. **Legacy Client** (`client/`): Previous version (optional)

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Next.js UI  │─────▶│  Next.js API │─────▶│ Python Flask │
│  (Frontend)  │      │   Routes     │      │    Server    │
└──────────────┘      └──────────────┘      └──────────────┘
       │                                            │
       │                                            ▼
       │                                     ┌──────────────┐
       │                                     │   vnstock    │
       │                                     │   Library    │
       │                                     └──────────────┘
       ▼
┌──────────────┐
│ NestJS Server│◀──── Socket.IO ────┐
│  (Backend)   │                    │
└──────────────┘              Real-time Updates
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **MongoDB** (for user data and authentication)
- **Redis** (optional, for caching)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/univen-2025-team/univen-2025.git
cd univen-2025

# Run the setup script
./start-all.sh
```

This will:
- Set up Python virtual environment
- Install all dependencies
- Start all services
- Create necessary configuration files

### Option 2: Manual Setup

See [QUICKSTART.md](QUICKSTART.md) for detailed manual setup instructions.

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Step-by-step setup guide
- **[VNSTOCK_INTEGRATION.md](VNSTOCK_INTEGRATION.md)** - Detailed architecture and integration docs
- **[python-server/README.md](python-server/README.md)** - Python server documentation

## 🌐 Service URLs

After starting all services:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Python Server**: http://localhost:5000
- **Market Page**: http://localhost:3000/market

## 🛠️ Development

### Starting Individual Services

**Python Server:**
```bash
cd python-server
source venv/bin/activate
python app.py
```

**NestJS Backend:**
```bash
cd server
npm run dev
```

**Next.js Frontend:**
```bash
cd client-new
npm run dev
```

### Stopping All Services

```bash
./stop-all.sh
```

## 📁 Project Structure

```
univen-2025/
├── python-server/          # Python Flask server with vnstock
│   ├── app.py             # Main Flask application
│   ├── requirements.txt   # Python dependencies
│   └── README.md          # Python server docs
├── server/                # NestJS backend
│   ├── src/
│   │   ├── api/
│   │   │   └── services/
│   │   │       ├── vnstock.service.ts
│   │   │       └── market-socket.service.ts
│   │   └── server.ts
│   └── package.json
├── client-new/            # Next.js frontend
│   ├── app/
│   │   ├── api/market/   # API routes
│   │   └── (dashboard)/market/  # Market pages
│   └── package.json
├── start-all.sh          # Automated startup script
├── stop-all.sh           # Stop all services
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables

**Python Server** (`python-server/.env`):
```env
FLASK_PORT=5000
FLASK_HOST=0.0.0.0
FLASK_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:4000
```

**NestJS Server** (`server/.env`):
```env
VNSTOCK_API_URL=http://localhost:5000
PORT=4000
# ... other config
```

**Next.js Frontend** (`client-new/.env.local`):
```env
PYTHON_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🧪 Testing

### Test Python Server
```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/market
curl http://localhost:5000/api/market/VCB
```

### Test Next.js API
```bash
curl http://localhost:3000/api/market
```

## 📊 Key Features

### Market Page
- Real-time VN30 index display
- Top gainers and losers
- Sortable stock list
- Interactive charts
- Real-time updates toggle

### Stock Detail Page
- Comprehensive stock information
- Multiple timeframe charts (15s to 1Y)
- Technical indicators (MA, RSI, MACD)
- Price and volume charts
- Real-time updates

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5000  # or :4000, :3000

# Kill the process
kill -9 <PID>
```

### Python Server Issues
```bash
# Reinstall dependencies
cd python-server
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

### vnstock Data Issues
The vnstock library connects to Vietnamese stock market APIs. If you experience:
- Slow responses: Normal, depends on API availability
- No data: Check internet connection and API status
- Rate limiting: Wait a moment between requests

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- [tranconcoder](https://github.com/tranconcoder)

## 🙏 Acknowledgments

- [vnstock](https://github.com/thinh-vu/vnstock) - Vietnamese stock data library
- [Next.js](https://nextjs.org/) - React framework
- [NestJS](https://nestjs.com/) - Node.js framework
- [Flask](https://flask.palletsprojects.com/) - Python web framework
- [Socket.IO](https://socket.io/) - Real-time communication

## 📞 Support

For issues or questions:
- Check the [documentation](VNSTOCK_INTEGRATION.md)
- Review [troubleshooting guide](QUICKSTART.md#troubleshooting)
- Open an [issue](https://github.com/univen-2025-team/univen-2025/issues)

---

Made with ❤️ by the Univen 2025 Team

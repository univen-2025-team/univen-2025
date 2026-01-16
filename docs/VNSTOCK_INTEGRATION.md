# Python VNStock Server Integration

This document describes the integration of a Python Flask server with the vnstock library to fetch real Vietnamese stock market data.

## Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│              │      │              │      │              │      │              │
│  Next.js UI  │─────▶│  Next.js API │─────▶│ Python Flask │─────▶│   vnstock    │
│  (Frontend)  │      │   Routes     │      │    Server    │      │   Library    │
│              │      │              │      │              │      │              │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
       │                                            │
       │                                            │
       ▼                                            ▼
┌──────────────┐                            ┌──────────────┐
│              │                            │              │
│ NestJS Server│◀───────Socket.IO───────────│  Real-time   │
│  (Backend)   │                            │  Data Stream │
│              │                            │              │
└──────────────┘                            └──────────────┘
```

## Components

### 1. Python Flask Server (`python-server/`)

Location: `/python-server/`

**Purpose**: Fetches real-time stock data from Vietnamese stock market using vnstock library.

**Key Features**:
- RESTful API endpoints for market data
- Real-time stock prices from VN30 index
- Historical price data with multiple time ranges
- Technical indicators (MA, RSI, MACD)
- CORS enabled for cross-origin requests

**Endpoints**:
- `GET /health` - Health check
- `GET /api/market` - Get all VN30 stocks with sorting
- `GET /api/market/{symbol}` - Get detailed stock information

**Setup**:
```bash
cd python-server
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

### 2. NestJS Server Integration

Location: `/server/src/api/services/`

**New Service**: `vnstock.service.ts`

This service acts as a client to communicate with the Python server:
- HTTP client for fetching data
- Error handling and retry logic
- Caching support
- Health check monitoring

**Updated Service**: `market-socket.service.ts`

Modified to:
- Use VnstockService for real data
- Fallback to mock data if Python server is unavailable
- Real-time broadcasting of stock updates via Socket.IO

**Environment Variable**:
Add to `server/.env`:
```
VNSTOCK_API_URL=http://localhost:5000
```

### 3. Next.js API Routes

Location: `/client-new/app/api/market/`

**Modified Routes**:
- `/api/market/route.ts` - Now proxies to Python server
- `/api/market/[symbol]/route.ts` - Fetches stock details from Python server

**Environment Variable**:
Add to `client-new/.env.local`:
```
PYTHON_SERVER_URL=http://localhost:5000
```

## Data Flow

### Market Data Request
1. User opens market page in Next.js UI
2. UI calls `/api/market` Next.js API route
3. Next.js API route forwards request to Python Flask server
4. Python server uses vnstock library to fetch real data
5. Data flows back through the chain to the UI

### Real-time Updates (Socket.IO)
1. Client connects to NestJS Socket.IO server
2. Client subscribes to market updates
3. NestJS server periodically fetches data from Python server
4. Updates are broadcast to all connected clients via Socket.IO

## Running the Complete System

### 1. Start Python Server
```bash
cd python-server
./start.sh
# Or manually:
source venv/bin/activate
python app.py
```

The Python server will start on `http://localhost:5000`

### 2. Start NestJS Server
```bash
cd server
npm run dev
# Or with bun:
bun run dev
```

The NestJS server will start on `http://localhost:4000`

### 3. Start Next.js Frontend
```bash
cd client-new
npm run dev
```

The frontend will start on `http://localhost:3000`

## Environment Configuration

### Python Server (`.env`)
```
FLASK_PORT=5000
FLASK_HOST=0.0.0.0
FLASK_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:4000
```

### NestJS Server (`.env`)
```
VNSTOCK_API_URL=http://localhost:5000
```

### Next.js Frontend (`.env.local`)
```
PYTHON_SERVER_URL=http://localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Features

### Real Data Sources
- **VN30 Index**: Real-time index values and changes
- **Stock Prices**: Live prices for all 30 VN30 stocks
- **Historical Data**: Price history for multiple time ranges
- **Technical Indicators**: MA5, MA10, MA20, RSI, MACD
- **Company Information**: Names, market cap, P/E ratios

### Time Ranges Supported
- 15 seconds (real-time)
- 1 minute, 3 minutes, 5 minutes
- 15 minutes, 30 minutes
- 1 hour, 6 hours, 12 hours
- 1 day, 1 week, 1 month, 3 months, 1 year

## Error Handling

### Fallback Strategy
1. **Primary**: Fetch from Python vnstock server
2. **Fallback**: Use cached data or mock data if server unavailable
3. **User Feedback**: Clear error messages when data unavailable

### Health Checks
- Python server includes `/health` endpoint
- NestJS service monitors Python server health
- Automatic reconnection attempts

## Security Considerations

1. **CORS**: Properly configured to allow only trusted origins
2. **Rate Limiting**: Consider adding rate limiting on Python server
3. **Input Validation**: All inputs validated before processing
4. **Error Messages**: Generic error messages to avoid information leakage

## Performance Optimization

1. **Caching**: Results cached in NestJS service
2. **Connection Pooling**: HTTP client reuses connections
3. **Timeouts**: Appropriate timeouts prevent hanging requests
4. **Async Operations**: Non-blocking async/await throughout

## Monitoring and Logging

### Python Server Logs
- Request/response logging
- Error tracking
- Performance metrics

### NestJS Server Logs
- vnstock service operations
- Socket.IO connections
- Data fetch success/failure

## Troubleshooting

### Python Server Not Responding
```bash
# Check if server is running
curl http://localhost:5000/health

# Check logs
cd python-server
tail -f *.log

# Restart server
./start.sh
```

### No Data in UI
1. Verify Python server is running
2. Check browser console for errors
3. Verify environment variables are set
4. Check CORS configuration

### Socket.IO Not Updating
1. Check NestJS server logs
2. Verify Socket.IO connection in browser DevTools
3. Check network tab for WebSocket connection

## Future Enhancements

1. **Database Caching**: Store historical data in database
2. **Redis Caching**: Add Redis for distributed caching
3. **Rate Limiting**: Implement rate limiting for API requests
4. **Authentication**: Add API key authentication
5. **Load Balancing**: Support multiple Python server instances
6. **Monitoring**: Add Prometheus/Grafana monitoring
7. **Alerting**: Set up alerts for server failures

## References

- [vnstock Documentation](https://github.com/thinh-vu/vnstock)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

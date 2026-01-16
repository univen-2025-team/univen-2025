# Quick Start Guide: Python VNStock Server

## Prerequisites

- Python 3.8 or higher
- pip package manager
- Internet connection for vnstock data

## Installation Steps

### 1. Set Up Python Server

```bash
cd python-server

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env if needed (optional)
# Default settings should work for local development
```

### 2. Start Python Server

```bash
# Make sure you're in the python-server directory with venv activated
python app.py
```

You should see:
```
2024-XX-XX XX:XX:XX,XXX - __main__ - INFO - Starting Flask server on 0.0.0.0:5000
 * Serving Flask app 'app'
 * Debug mode: on
...
 * Running on http://0.0.0.0:5000
```

### 3. Test Python Server

Open a new terminal and test:

```bash
# Health check
curl http://localhost:5000/health

# Get market data
curl "http://localhost:5000/api/market?sortBy=price&order=desc&limit=10"

# Get specific stock
curl "http://localhost:5000/api/market/VCB?timeRange=1D"
```

### 4. Configure NestJS Server

```bash
cd ../server

# Add to .env file:
echo "VNSTOCK_API_URL=http://localhost:5000" >> .env

# Start server
npm run dev
# or
bun run dev
```

### 5. Configure Next.js Frontend

```bash
cd ../client-new

# Create .env.local file
echo "PYTHON_SERVER_URL=http://localhost:5000" > .env.local

# Start frontend
npm run dev
```

## Verifying the Integration

1. **Python Server**: Visit http://localhost:5000/health - should return JSON with status "healthy"

2. **Next.js API**: Visit http://localhost:3000/api/market - should return market data from Python server

3. **Frontend**: Visit http://localhost:3000/market - should display real stock market data

## Troubleshooting

### Python Server Won't Start

**Port already in use:**
```bash
# Check what's using port 5000
lsof -i :5000

# Change port in .env file
FLASK_PORT=5001
```

**vnstock errors:**
```bash
# Reinstall vnstock
pip uninstall vnstock3
pip install vnstock3==3.2.1
```

**Permission errors:**
```bash
# Make sure you're in the virtual environment
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### No Data in Frontend

1. Check Python server is running: `curl http://localhost:5000/health`
2. Check browser console for errors
3. Check Next.js API response: `curl http://localhost:3000/api/market`
4. Verify environment variables are set correctly

### Socket.IO Not Working

1. Verify NestJS server is running
2. Check browser DevTools → Network → WS (WebSocket)
3. Look for Socket.IO connection
4. Check NestJS server logs for errors

## Production Deployment

### Using Gunicorn (Recommended)

```bash
cd python-server
source venv/bin/activate

# Start with 4 workers
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Or with better logging
gunicorn -w 4 -b 0.0.0.0:5000 \
  --access-logfile - \
  --error-logfile - \
  --log-level info \
  app:app
```

### Using Docker (Coming Soon)

A Dockerfile will be added for containerized deployment.

### Environment Variables for Production

```bash
# python-server/.env
FLASK_PORT=5000
FLASK_HOST=0.0.0.0
FLASK_ENV=production
CORS_ORIGINS=https://your-domain.com,https://api.your-domain.com
```

## API Documentation

### Endpoints

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000000"
}
```

#### GET /api/market
Get VN30 market data.

**Query Parameters:**
- `sortBy`: price | change | changePercent | volume (default: price)
- `order`: asc | desc (default: desc)
- `limit`: number of stocks to return (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "vn30Index": {
      "index": 1250.50,
      "change": 5.25,
      "changePercent": 0.42
    },
    "stocks": [...],
    "topGainers": [...],
    "topLosers": [...],
    "total": 30,
    "timestamp": "2024-01-01T00:00:00.000000"
  }
}
```

#### GET /api/market/{symbol}
Get detailed stock information.

**Path Parameters:**
- `symbol`: Stock symbol (e.g., VCB, FPT, etc.)

**Query Parameters:**
- `timeRange`: 1D | 1W | 1M | 3M | 1Y (default: 1D)

**Response:**
```json
{
  "success": true,
  "data": {
    "stock": {
      "symbol": "VCB",
      "companyName": "Ngân hàng TMCP Ngoại thương Việt Nam",
      "price": 85000,
      "change": 500,
      "changePercent": 0.59,
      ...
    },
    "priceHistory": [...],
    "technicalIndicators": {
      "ma5": 84500,
      "ma10": 84000,
      "ma20": 83500,
      "rsi": 55.5,
      "macd": 100
    }
  }
}
```

## Performance Tips

1. **Caching**: Consider implementing Redis caching for frequently accessed data
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Load Balancing**: Run multiple instances with a load balancer
4. **Monitoring**: Add application monitoring (e.g., Prometheus, DataDog)

## Support

For issues or questions:
1. Check the main documentation: `VNSTOCK_INTEGRATION.md`
2. Review vnstock library docs: https://github.com/thinh-vu/vnstock
3. Check server logs for detailed error messages

## Next Steps

After successful setup:
1. ✅ Test all API endpoints
2. ✅ Verify real-time updates via Socket.IO
3. ✅ Check data accuracy against official sources
4. ✅ Configure monitoring and alerting
5. ✅ Set up automated backups if needed

# Python Server for VNStock Data

This Python Flask server fetches real Vietnamese stock market data using the `vnstock` library and provides RESTful APIs for the NestJS backend.

## Features

- Real-time stock data from Vietnamese stock market
- VN30 index tracking
- Individual stock details with historical data
- Technical indicators (MA, RSI, MACD)
- RESTful API endpoints

## Setup

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Create a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Edit `.env` to configure:
```
FLASK_PORT=5000
FLASK_HOST=0.0.0.0
FLASK_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:4000
```

### Running the Server

#### Development
```bash
python app.py
```

#### Production
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Health Check
```
GET /health
```

### Get Market Data
```
GET /api/market?sortBy=price&order=desc&limit=30
```

Query Parameters:
- `sortBy`: price, change, changePercent, volume (default: price)
- `order`: asc, desc (default: desc)
- `limit`: number of stocks to return (default: 30)

Response:
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
    "timestamp": "2024-01-01T00:00:00"
  }
}
```

### Get Stock Detail
```
GET /api/market/{symbol}?timeRange=1D
```

Query Parameters:
- `timeRange`: 1D, 1W, 1M, 3M, 1Y (default: 1D)

Response:
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

## Integration with NestJS

The NestJS server should proxy requests to this Python server to fetch real stock data.

## Troubleshooting

### vnstock library issues
If you encounter issues with vnstock, make sure you're using vnstock3:
```bash
pip install --upgrade vnstock3
```

### CORS issues
Make sure CORS_ORIGINS in .env includes your frontend URL.

## License

MIT

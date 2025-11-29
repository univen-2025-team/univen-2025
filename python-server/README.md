# Python VNStock Data Caching Server

Automated cronjob service that fetches stock market data from VNStock and caches it in MongoDB.

## Purpose

This Python server runs a daily cronjob to:

-   Fetch latest VN30 stock market data from VNStock (TCBS source)
-   Save data to MongoDB in two collections: `market_data` and `stock_data`
-   Provide cached data with minute-level price intervals

**Note**: This server has NO API endpoints. API access is provided by the Node.js server which reads from the same MongoDB database.

## Features

-   **Daily Auto-Update**: Scheduled cronjob runs at 1:00 AM (Vietnam time)
-   **Minute-Level Data**: Fetches ~257 minute intervals per trading day (9:15 AM - 3:00 PM)
-   **VN30 Coverage**: All 30 VN30 index stocks
-   **MongoDB Storage**: Two schemas for market overview and individual stock data
-   **Auto-Cleanup**: Keeps last 30 days of data

## MongoDB Schemas

### `market_data` Collection

Stores daily market overview:

```javascript
{
  date: "2025-11-28",
  vn30Index: { index, change, changePercent },
  topGainers: [...],
  topLosers: [...],
  totalStocks: 30
}
```

### `stock_data` Collection

Stores individual stock data with minute prices:

```javascript
{
  symbol: "ACB",
  date: "2025-11-28",
  price: 24.25,
  prices: [
    { time: "2025-11-28 09:15:00", price: 24.40, volume: 22800 },
    // ~257 minute data points
  ],
  change, changePercent, volume, high, low, open, close
}
```

## Setup

1. **Install Dependencies**

```bash
conda activate steganography  # Or your Python environment
pip install -r requirements.txt
```

2. **Configure Environment**

```bash
cp .env.example .env
# Edit .env with your MongoDB connection string
```

3. **Run Server**

```bash
python app.py
```

The server will:

-   Check if today's data exists
-   Run initial fetch if needed
-   Schedule daily updates at 1:00 AM

## Environment Variables

```
DB_URL=mongodb://localhost:27017/stock-db
DB_MIN_POOL_SIZE=10
DB_MAX_POOL_SIZE=50
CRONJOB_ENABLED=true
VNSTOCK_SOURCE=TCBS  # Free source, no API key needed
```

## Architecture

```
python-server/
├── app.py                      # Main cronjob scheduler
├── db.py                       # MongoDB connection manager
├── requirements.txt            # Python dependencies
├── .env                        # Configuration
├── jobs/
│   └── daily_cache_job.py     # Daily caching logic
└── services/
    ├── data_fetcher.py         # VNStock data fetching
    └── data_storage.py         # MongoDB storage operations
```

## Tech Stack

-   **Python 3.10+**
-   **VNStock3**: Vietnam stock market data API
-   **PyMongo**: MongoDB driver
-   **APScheduler**: Cron job scheduling
-   **TCBS API**: Data source (via VNStock)

## License

MIT

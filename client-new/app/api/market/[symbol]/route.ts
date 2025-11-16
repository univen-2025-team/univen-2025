import { NextRequest, NextResponse } from 'next/server';

// Python server URL
const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || 'http://localhost:5000';

interface StockDetailData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  previousClose: number;
  marketCap: number;
  pe: number;
  eps: number;
  lastUpdate: string;
}

interface PriceHistoryPoint {
  time: string;
  price: number;
  volume: number;
}

interface TechnicalIndicator {
  ma5: number;
  ma10: number;
  ma20: number;
  rsi: number;
  macd: number;
}

interface StockDetailResponse {
  stock: StockDetailData;
  priceHistory: PriceHistoryPoint[];
  technicalIndicators: TechnicalIndicator;
}

/**
 * Fetch stock detail from Python vnstock server
 */
async function fetchStockDetailFromPython(
  symbol: string,
  timeRange: string
): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  let numPoints = 0;
  let timeFormat: (index: number) => string;

  switch (timeRange) {
    case '15s':
      numPoints = 20; // 20 points in last 5 minutes
      timeFormat = (i) => {
        const now = new Date();
        now.setSeconds(now.getSeconds() - (19 - i) * 15);
        return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      };
      break;
    case '1m':
      numPoints = 30; // 30 minutes
      timeFormat = (i) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - (29 - i));
        return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      };
      break;
    case '3m':
      numPoints = 30; // 3 hours (6-minute intervals)
      timeFormat = (i) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - (29 - i) * 6);
        return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      };
      break;
    case '5m':
      numPoints = 30; // 2.5 hours (5-minute intervals)
      timeFormat = (i) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - (29 - i) * 5);
        return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      };
      break;
    case '15m':
      numPoints = 24; // 6 hours (15-minute intervals)
      timeFormat = (i) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - (23 - i) * 15);
        return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      };
      break;
    case '30m':
      numPoints = 24; // 12 hours (30-minute intervals)
      timeFormat = (i) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - (23 - i) * 30);
        return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      };
      break;
    case '1h':
      numPoints = 24; // 1 day (hourly intervals)
      timeFormat = (i) => {
        const now = new Date();
        now.setHours(now.getHours() - (23 - i));
        return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      };
      break;
    case '6h':
      numPoints = 28; // 1 week (6-hour intervals)
      timeFormat = (i) => {
        const now = new Date();
        now.setHours(now.getHours() - (27 - i) * 6);
        return `${now.getDate()}/${now.getMonth() + 1} ${now.getHours().toString().padStart(2, '0')}:00`;
      };
      break;
    case '12h':
      numPoints = 28; // 2 weeks (12-hour intervals)
      timeFormat = (i) => {
        const now = new Date();
        now.setHours(now.getHours() - (27 - i) * 12);
        return `${now.getDate()}/${now.getMonth() + 1} ${now.getHours().toString().padStart(2, '0')}:00`;
      };
      break;
    case '1D':
      numPoints = 30; // 30 days (daily intervals)
      timeFormat = (i) => {
        const now = new Date();
        now.setDate(now.getDate() - (29 - i));
        return `${now.getDate()}/${now.getMonth() + 1}`;
      };
      break;
    case '1W':
      numPoints = 12; // 12 weeks
      timeFormat = (i) => {
        const now = new Date();
        now.setDate(now.getDate() - (11 - i) * 7);
        return `${now.getDate()}/${now.getMonth() + 1}`;
      };
      break;
    case '1M':
      numPoints = 30; // 30 days
      timeFormat = (i) => {
        const now = new Date();
        now.setDate(now.getDate() - (29 - i));
        return `${now.getDate()}/${now.getMonth() + 1}`;
      };
      break;
    case '3M':
      numPoints = 90; // 90 days
      timeFormat = (i) => {
        const date = new Date();
        date.setDate(date.getDate() - (89 - i));
        return `${date.getDate()}/${date.getMonth() + 1}`;
      };
      break;
    case '1Y':
      numPoints = 52; // 52 weeks
      timeFormat = (i) => {
        const now = new Date();
        now.setDate(now.getDate() - (51 - i) * 7);
        return `${now.getDate()}/${now.getMonth() + 1}`;
      };
      break;
    default:
      numPoints = 30;
      timeFormat = (i) => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - (29 - i));
        return now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      };
  }

  const volatility = currentPrice * 0.02; // 2% volatility
  let price = currentPrice * (0.95 + Math.random() * 0.1); // Start near current price

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Python server responded with status: ${response.status}`);
      return null;
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    }

    console.error('Python server response was not successful');
    return null;
  } catch (error) {
    console.error(`Error fetching detail for ${symbol} from Python server:`, error);
    return null;
  }
}

/**
 * GET /api/market/[symbol]
 * Fetches detailed stock data including price history and technical indicators from Python vnstock server
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol: rawSymbol } = await params;
    const symbol = rawSymbol.toUpperCase();
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1D';

    // Fetch stock detail from Python server
    const stockDetail = await fetchStockDetailFromPython(symbol, timeRange);

    if (stockDetail) {
      return NextResponse.json({
        success: true,
        data: stockDetail,
      });
    }

    // If Python server is not available, return error
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch data for ${symbol}`,
        message: 'Python vnstock server is not available or returned no data.',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error in stock detail API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stock detail',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}


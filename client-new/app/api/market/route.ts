import { NextRequest, NextResponse } from 'next/server';

// VN30 stock list - these are the 30 largest stocks on Vietnam stock market
// This list is fetched from a reference source but can be updated dynamically
const VN30_SYMBOLS = [
  'ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
  'KDH', 'MBB', 'MSN', 'MWG', 'NVL', 'PDR', 'PLX', 'POW', 'SAB', 'SSI',
  'STB', 'TCB', 'TPB', 'VCB', 'VHM', 'VIB', 'VIC', 'VJC', 'VNM', 'VPB'
];

// Python server URL
const PYTHON_SERVER_URL = process.env.PYTHON_SERVER_URL || 'http://localhost:5000';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

interface VN30Index {
  index: number;
  change: number;
  changePercent: number;
}

interface MarketData {
  vn30Index: VN30Index;
  stocks: StockData[];
  topGainers: StockData[];
  topLosers: StockData[];
  total: number;
  timestamp: string;
}

/**
 * Fetch market data from Python vnstock server
 */
async function fetchMarketDataFromPython(
  sortBy: string = 'price',
  order: string = 'desc',
  limit: number = 30
): Promise<MarketData | null> {
  try {
    const url = new URL('/api/market', PYTHON_SERVER_URL);
    url.searchParams.set('sortBy', sortBy);
    url.searchParams.set('order', order);
    url.searchParams.set('limit', limit.toString());

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
    console.error('Error fetching data from Python server:', error);
    return null;
  }
}

/**
 * GET /api/market
 * Fetches VN30 stock data sorted by price from Python vnstock server
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'price';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '30');

    // Fetch data from Python server
    const marketData = await fetchMarketDataFromPython(sortBy, order, limit);

    if (marketData) {
      return NextResponse.json({
        success: true,
        data: marketData,
      });
    }

    // If Python server is not available, return error
    return NextResponse.json(
      {
        success: false,
        error: 'Python vnstock server is not available',
        message: 'Unable to fetch real market data. Please ensure the Python server is running.',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error in market API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch market data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

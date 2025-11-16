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
): Promise<StockDetailResponse | null> {
  try {
    const url = new URL(`/api/market/${symbol}`, PYTHON_SERVER_URL);
    url.searchParams.set('timeRange', timeRange);

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


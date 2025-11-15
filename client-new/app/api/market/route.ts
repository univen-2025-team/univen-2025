import { NextRequest, NextResponse } from 'next/server';

// VN30 stock list - these are the 30 largest stocks on Vietnam stock market
// This list is fetched from a reference source but can be updated dynamically
const VN30_SYMBOLS = [
  'ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
  'KDH', 'MBB', 'MSN', 'MWG', 'NVL', 'PDR', 'PLX', 'POW', 'SAB', 'SSI',
  'STB', 'TCB', 'TPB', 'VCB', 'VHM', 'VIB', 'VIC', 'VJC', 'VNM', 'VPB'
];

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

/**
 * Fetch stock data from SSI or alternative Vietnamese stock API
 * For now, we'll use a mock implementation that can be replaced with real API calls
 */
async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    // Mock implementation - in production, replace with actual API call
    // Example: fetch from SSI iBoard API or similar service
    
    // Generate realistic mock data for demonstration
    const basePrice = Math.random() * 100000 + 10000; // Random price between 10,000 and 110,000 VND
    const change = (Math.random() - 0.5) * 5000; // Random change
    const changePercent = (change / basePrice) * 100;
    
    return {
      symbol,
      price: Math.round(basePrice),
      change: Math.round(change),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.round(Math.random() * 10000000), // Random volume
      high: Math.round(basePrice + Math.abs(change)),
      low: Math.round(basePrice - Math.abs(change)),
      open: Math.round(basePrice - change / 2),
      close: Math.round(basePrice),
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch VN30 index data
 */
async function fetchVN30Index() {
  // Mock VN30 index data
  const baseIndex = 1200 + Math.random() * 50;
  const change = (Math.random() - 0.5) * 20;
  
  return {
    index: parseFloat(baseIndex.toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(((change / baseIndex) * 100).toFixed(2)),
  };
}

/**
 * GET /api/market
 * Fetches VN30 stock data sorted by price
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'price';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '30');

    // Fetch data for all VN30 stocks
    const stockPromises = VN30_SYMBOLS.map(symbol => fetchStockData(symbol));
    const stockResults = await Promise.all(stockPromises);
    
    // Filter out null results and sort
    let stocks = stockResults.filter((stock): stock is StockData => stock !== null);
    
    // Sort stocks
    stocks.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'price':
          compareValue = a.price - b.price;
          break;
        case 'change':
          compareValue = a.change - b.change;
          break;
        case 'changePercent':
          compareValue = a.changePercent - b.changePercent;
          break;
        case 'volume':
          compareValue = a.volume - b.volume;
          break;
        default:
          compareValue = a.price - b.price;
      }
      
      return order === 'desc' ? -compareValue : compareValue;
    });
    
    // Limit results
    stocks = stocks.slice(0, limit);
    
    // Get VN30 index data
    const vn30Index = await fetchVN30Index();
    
    // Find top gainers and losers
    const allStocks = stockResults.filter((stock): stock is StockData => stock !== null);
    const topGainers = [...allStocks]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 5);
    const topLosers = [...allStocks]
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 5);
    
    return NextResponse.json({
      success: true,
      data: {
        vn30Index,
        stocks,
        topGainers,
        topLosers,
        total: stocks.length,
        timestamp: new Date().toISOString(),
      },
    });
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

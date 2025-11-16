import { NextRequest, NextResponse } from 'next/server';

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

// Company names mapping for VN30 stocks
const COMPANY_NAMES: Record<string, string> = {
  'ACB': 'Ngân hàng TMCP Á Châu',
  'BCM': 'Tổng Công ty Đầu tư và Phát triển Công nghiệp',
  'BID': 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
  'BVH': 'Tập đoàn Bảo Việt',
  'CTG': 'Ngân hàng TMCP Công thương Việt Nam',
  'FPT': 'Tổng Công ty Cổ phần FPT',
  'GAS': 'Tổng Công ty Khí Việt Nam',
  'GVR': 'Tập đoàn Công nghiệp Cao su Việt Nam',
  'HDB': 'Ngân hàng TMCP Phát triển TP.HCM',
  'HPG': 'Tổng Công ty Cổ phần Tập đoàn Hòa Phát',
  'KDH': 'Công ty Cổ phần Đầu tư và Kinh doanh Nhà Khang Điền',
  'MBB': 'Ngân hàng TMCP Quân đội',
  'MSN': 'Tổng Công ty Cổ phần Dịch vụ Số Viettel',
  'MWG': 'Công ty Cổ phần Đầu tư Thế Giới Di Động',
  'NVL': 'Công ty Cổ phần Tập đoàn Đầu tư Địa ốc No Va',
  'PDR': 'Công ty Cổ phần Phát triển Bất động sản Phát Đạt',
  'PLX': 'Tập đoàn Xăng dầu Việt Nam',
  'POW': 'Tổng Công ty Điện lực Dầu khí Việt Nam',
  'SAB': 'Tổng Công ty Cổ phần Bia - Rượu - Nước giải khát Sài Gòn',
  'SSI': 'Công ty Cổ phần Chứng khoán SSI',
  'STB': 'Ngân hàng TMCP Sài Gòn Thương Tín',
  'TCB': 'Ngân hàng TMCP Kỹ thương Việt Nam',
  'TPB': 'Ngân hàng TMCP Tiên Phong',
  'VCB': 'Ngân hàng TMCP Ngoại thương Việt Nam',
  'VHM': 'Công ty Cổ phần Vinhomes',
  'VIB': 'Ngân hàng TMCP Quốc tế',
  'VIC': 'Tập đoàn Vingroup',
  'VJC': 'Công ty Cổ phần Hàng không Vietjet',
  'VNM': 'Công ty Cổ phần Sữa Việt Nam',
  'VPB': 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
};

/**
 * Generate mock price history data
 */
function generatePriceHistory(
  symbol: string,
  currentPrice: number,
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

  for (let i = 0; i < numPoints; i++) {
    // Random walk with slight upward trend
    const change = (Math.random() - 0.48) * volatility;
    price = Math.max(price + change, currentPrice * 0.8); // Don't go below 80% of current
    price = Math.min(price, currentPrice * 1.2); // Don't go above 120% of current
    
    points.push({
      time: timeFormat(i),
      price: Math.round(price),
      volume: Math.round(Math.random() * 5000000 + 1000000),
    });
  }

  // Ensure the last point is close to current price
  points[points.length - 1].price = currentPrice;

  return points;
}

/**
 * Calculate technical indicators
 */
function calculateTechnicalIndicators(
  priceHistory: PriceHistoryPoint[],
  currentPrice: number
): TechnicalIndicator {
  const prices = priceHistory.map(p => p.price);
  
  // Moving Averages
  const ma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
  const ma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10;
  const ma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
  
  // RSI calculation (simplified)
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < Math.min(14, prices.length); i++) {
    const change = prices[prices.length - i] - prices[prices.length - i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  // MACD (simplified)
  const ema12 = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;
  const ema26 = prices.slice(-26).reduce((a, b) => a + b, 0) / 26;
  const macd = ema12 - ema26;
  
  return {
    ma5: Math.round(ma5),
    ma10: Math.round(ma10),
    ma20: Math.round(ma20),
    rsi: Math.round(rsi * 100) / 100,
    macd: Math.round(macd * 100) / 100,
  };
}

/**
 * Fetch detailed stock data
 */
async function fetchStockDetail(symbol: string, timeRange: string): Promise<StockDetailData> {
  // Mock implementation - in production, replace with actual API call
  const basePrice = Math.random() * 100000 + 10000;
  const change = (Math.random() - 0.5) * 5000;
  const changePercent = (change / basePrice) * 100;
  const previousClose = basePrice - change;
  
  return {
    symbol: symbol.toUpperCase(),
    companyName: COMPANY_NAMES[symbol.toUpperCase()] || 'Công ty Cổ phần',
    price: Math.round(basePrice),
    change: Math.round(change),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: Math.round(Math.random() * 10000000 + 1000000),
    high: Math.round(basePrice + Math.abs(change) * 1.2),
    low: Math.round(basePrice - Math.abs(change) * 1.2),
    open: Math.round(previousClose),
    close: Math.round(basePrice),
    previousClose: Math.round(previousClose),
    marketCap: Math.round(basePrice * (Math.random() * 1000000000 + 100000000)),
    pe: parseFloat((15 + Math.random() * 10).toFixed(2)),
    eps: Math.round(basePrice / (15 + Math.random() * 10)),
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * GET /api/market/[symbol]
 * Fetches detailed stock data including price history and technical indicators
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

    // Fetch stock detail
    const stockData = await fetchStockDetail(symbol, timeRange);
    
    // Generate price history
    const priceHistory = generatePriceHistory(symbol, stockData.price, timeRange);
    
    // Calculate technical indicators
    const technicalIndicators = calculateTechnicalIndicators(priceHistory, stockData.price);

    return NextResponse.json({
      success: true,
      data: {
        stock: stockData,
        priceHistory,
        technicalIndicators,
      },
    });
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

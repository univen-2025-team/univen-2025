"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";

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

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;
  
  const [stockData, setStockData] = useState<StockDetailData | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [technicalIndicators, setTechnicalIndicators] = useState<TechnicalIndicator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1D');

  const fetchStockDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/market/${symbol}?timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setStockData(result.data.stock);
        setPriceHistory(result.data.priceHistory);
        setTechnicalIndicators(result.data.technicalIndicators);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch stock data');
      }
    } catch (err) {
      setError('Network error: Unable to fetch stock data');
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (symbol) {
      fetchStockDetail();
      // Auto-refresh every 15 seconds
      const interval = setInterval(fetchStockDetail, 15000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, timeRange]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPrice = (price: number): string => {
    return formatNumber(price) + ' ₫';
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000000000) {
      return (num / 1000000000000).toFixed(2) + ' T';
    } else if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + ' B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + ' M';
    }
    return formatNumber(num);
  };

  const getChangeColor = (change: number): string => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getChangeBgColor = (change: number): string => {
    if (change > 0) return 'bg-green-50 border-green-200';
    if (change < 0) return 'bg-red-50 border-red-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  if (loading && !stockData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu cổ phiếu {symbol}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
            <button
              onClick={fetchStockDetail}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mr-2"
            >
              Thử lại
            </button>
            <button
              onClick={() => router.push('/market')}
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Quay lại thị trường
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/market')}
        className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Quay lại thị trường
      </button>

      {/* Stock Header */}
      {stockData && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{stockData.symbol}</h1>
                <span className="text-lg text-blue-100">{stockData.companyName}</span>
              </div>
              <div className="flex items-baseline gap-4">
                <p className="text-4xl font-bold">{formatPrice(stockData.price)}</p>
                <div className={`text-xl font-semibold ${stockData.change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {stockData.change > 0 ? '+' : ''}{formatNumber(stockData.change)}
                  <span className="ml-2">
                    ({stockData.changePercent > 0 ? '+' : ''}{stockData.changePercent}%)
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-sm text-blue-100 mb-1">Cập nhật lần cuối</div>
              <div className="font-semibold">{new Date(stockData.lastUpdate).toLocaleString('vi-VN')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      {stockData && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Mở cửa</p>
            <p className="text-lg font-bold text-gray-900">{formatPrice(stockData.open)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Cao nhất</p>
            <p className="text-lg font-bold text-green-600">{formatPrice(stockData.high)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Thấp nhất</p>
            <p className="text-lg font-bold text-red-600">{formatPrice(stockData.low)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Đóng cửa</p>
            <p className="text-lg font-bold text-gray-900">{formatPrice(stockData.close)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Khối lượng</p>
            <p className="text-lg font-bold text-gray-900">{formatLargeNumber(stockData.volume)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4">
            <p className="text-gray-600 text-sm mb-1">Vốn hóa</p>
            <p className="text-lg font-bold text-gray-900">{formatLargeNumber(stockData.marketCap)}</p>
          </div>
        </div>
      )}

      {/* Price Chart with Time Range Selector */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-7 h-7 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Biểu đồ giá
          </h2>
          <div className="flex gap-2">
            {(['1D', '1W', '1M', '3M', '1Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-96">
          {priceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceHistory}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => formatLargeNumber(value)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [formatPrice(value), 'Giá']}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                  name="Giá"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Đang thu thập dữ liệu biểu đồ...</p>
            </div>
          )}
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg className="w-7 h-7 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Khối lượng giao dịch
        </h2>
        <div className="h-64">
          {priceHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => formatLargeNumber(value)}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: number) => [formatLargeNumber(value), 'Khối lượng']}
                />
                <Bar 
                  dataKey="volume" 
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  name="Khối lượng"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Đang thu thập dữ liệu...</p>
            </div>
          )}
        </div>
      </div>

      {/* Technical Indicators */}
      {technicalIndicators && stockData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-7 h-7 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Phân tích kỹ thuật
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Moving Averages */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-4">Đường trung bình</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">MA5:</span>
                  <span className={`font-bold ${stockData.price > technicalIndicators.ma5 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice(technicalIndicators.ma5)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">MA10:</span>
                  <span className={`font-bold ${stockData.price > technicalIndicators.ma10 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice(technicalIndicators.ma10)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">MA20:</span>
                  <span className={`font-bold ${stockData.price > technicalIndicators.ma20 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPrice(technicalIndicators.ma20)}
                  </span>
                </div>
              </div>
            </div>

            {/* RSI */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-4">RSI (Relative Strength Index)</h3>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className={
                    technicalIndicators.rsi > 70 ? 'text-red-600' :
                    technicalIndicators.rsi < 30 ? 'text-green-600' :
                    'text-yellow-600'
                  }>
                    {technicalIndicators.rsi.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      technicalIndicators.rsi > 70 ? 'bg-red-600' :
                      technicalIndicators.rsi < 30 ? 'bg-green-600' :
                      'bg-yellow-600'
                    }`}
                    style={{ width: `${technicalIndicators.rsi}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {technicalIndicators.rsi > 70 ? 'Quá mua' :
                   technicalIndicators.rsi < 30 ? 'Quá bán' :
                   'Trung lập'}
                </p>
              </div>
            </div>

            {/* MACD */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-4">MACD</h3>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className={technicalIndicators.macd > 0 ? 'text-green-600' : 'text-red-600'}>
                    {technicalIndicators.macd.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {technicalIndicators.macd > 0 ? 'Tín hiệu mua' : 'Tín hiệu bán'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Info */}
      {stockData && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <svg className="w-7 h-7 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Thông tin công ty
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-gray-600 text-sm mb-1">P/E Ratio</p>
              <p className="text-2xl font-bold text-gray-900">{stockData.pe.toFixed(2)}</p>
            </div>
            <div className="border-l-4 border-indigo-500 pl-4">
              <p className="text-gray-600 text-sm mb-1">EPS</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stockData.eps)}</p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-gray-600 text-sm mb-1">Giá trước đó</p>
              <p className="text-2xl font-bold text-gray-900">{formatPrice(stockData.previousClose)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

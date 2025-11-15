"use client";

import { useEffect, useState } from "react";
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
} from "recharts";

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

interface IndexHistoryPoint {
  time: string;
  index: number;
}

export default function MarketPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'changePercent' | 'volume'>('price');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [indexHistory, setIndexHistory] = useState<IndexHistoryPoint[]>([]);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/market?sortBy=${sortBy}&order=${order}`);
      const result = await response.json();
      
      if (result.success) {
        setMarketData(result.data);
        setError(null);
        
        // Update index history for the chart (keep last 20 points)
        const now = new Date();
        const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        setIndexHistory(prev => {
          const newHistory = [...prev, { time: timeStr, index: result.data.vn30Index.index }];
          return newHistory.slice(-20); // Keep only last 20 data points
        });
      } else {
        setError(result.error || 'Failed to fetch market data');
      }
    } catch (err) {
      setError('Network error: Unable to fetch market data');
      console.error('Error fetching market data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, order]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const formatPrice = (price: number): string => {
    return formatNumber(price) + ' ₫';
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

  if (loading && !marketData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu thị trường...</p>
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
              onClick={fetchMarketData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Thị trường VN30</h1>
            <p className="text-blue-100 text-lg">
              Theo dõi 30 mã cổ phiếu vốn hóa lớn nhất thị trường Việt Nam
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* VN30 Index Card */}
      {marketData && (
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">Chỉ số VN30</p>
              <h2 className="text-3xl font-bold text-gray-900">
                {formatNumber(marketData.vn30Index.index)}
              </h2>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${getChangeColor(marketData.vn30Index.change)}`}>
                {marketData.vn30Index.change > 0 ? '+' : ''}
                {formatNumber(marketData.vn30Index.change)}
              </p>
              <p className={`text-lg font-semibold ${getChangeColor(marketData.vn30Index.changePercent)}`}>
                {marketData.vn30Index.changePercent > 0 ? '+' : ''}
                {marketData.vn30Index.changePercent}%
              </p>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-4">
            Cập nhật lần cuối: {new Date(marketData.timestamp).toLocaleString('vi-VN')}
          </p>
        </div>
      )}

      {/* Charts Section */}
      {marketData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VN30 Index Trend Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              Biểu đồ VN30 Index
            </h2>
            <div className="h-64">
              {indexHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={indexHistory}>
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
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="index" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', r: 3 }}
                      activeDot={{ r: 5 }}
                      name="VN30"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Đang thu thập dữ liệu...</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Stocks Performance Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Top 10 cổ phiếu
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketData.stocks.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="symbol" 
                    stroke="#6b7280"
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
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
                  <Bar 
                    dataKey="price" 
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                    name="Giá"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Top Gainers and Losers */}
      {marketData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Gainers */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Top mã tăng mạnh
            </h2>
            <div className="space-y-3">
              {marketData.topGainers.map((stock) => (
                <div
                  key={stock.symbol}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getChangeBgColor(stock.change)}`}
                >
                  <div>
                    <p className="font-bold text-gray-900">{stock.symbol}</p>
                    <p className="text-sm text-gray-600">{formatPrice(stock.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +{formatNumber(stock.change)}
                    </p>
                    <p className="text-sm font-semibold text-green-600">
                      +{stock.changePercent}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Top mã giảm mạnh
            </h2>
            <div className="space-y-3">
              {marketData.topLosers.map((stock) => (
                <div
                  key={stock.symbol}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getChangeBgColor(stock.change)}`}
                >
                  <div>
                    <p className="font-bold text-gray-900">{stock.symbol}</p>
                    <p className="text-sm text-gray-600">{formatPrice(stock.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatNumber(stock.change)}
                    </p>
                    <p className="text-sm font-semibold text-red-600">
                      {stock.changePercent}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sorting Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900">Danh sách cổ phiếu VN30</h2>
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-medium text-gray-700">Sắp xếp theo:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'change' | 'changePercent' | 'volume')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">Giá</option>
              <option value="change">Thay đổi</option>
              <option value="changePercent">% Thay đổi</option>
              <option value="volume">Khối lượng</option>
            </select>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>
            <button
              onClick={fetchMarketData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Làm mới
            </button>
          </div>
        </div>

        {/* Stock Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Mã CK</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Giá</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Thay đổi</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">% Thay đổi</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Khối lượng</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Cao</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Thấp</th>
              </tr>
            </thead>
            <tbody>
              {marketData?.stocks.map((stock) => (
                <tr
                  key={stock.symbol}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900">{stock.symbol}</span>
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${getChangeColor(stock.change)}`}>
                    {formatPrice(stock.price)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${getChangeColor(stock.change)}`}>
                    {stock.change > 0 ? '+' : ''}{formatNumber(stock.change)}
                  </td>
                  <td className={`px-4 py-3 text-right font-semibold ${getChangeColor(stock.changePercent)}`}>
                    {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatNumber(stock.volume)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatPrice(stock.high)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {formatPrice(stock.low)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Building2, Globe, Users, TrendingUp, TrendingDown,
  DollarSign, Maximize2, Minimize2, ShoppingCart, X, History, Wallet, Newspaper
} from 'lucide-react';
import Image from 'next/image';
import { io } from 'socket.io-client';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
// Fix: Ensure SOCKET_URL is just the origin, stripping any API path suffix like /v1/api or /api
const SOCKET_URL = API_URL.replace(/\/v1\/api|\/api\/v1|\/api$/, '') || 'http://localhost:4000'; // Connect to root for socket namespaces
import ErrorMessage from '@/components/common/ErrorMessage';
import CandlestickChart from '@/components/market/charts/CandlestickChart';
import NewsFeed from '@/components/market/NewsFeed';
import { formatPrice } from '@/components/market/utils';
import api from '@/lib/axios';
import { useAppSelector } from '@/lib/store/hooks';
import { transactionApi } from '@/lib/api/transaction.api';
import { TransactionHistoryItem } from '@/lib/types/transactions';
import { useToast } from '@/components/toast/toast-provider';

const StockDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const symbol = (params.symbol as string).toUpperCase();
  const { user, accessToken } = useAppSelector(state => state.auth);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('1D');

  // Transaction state
  const [transactions, setTransactions] = useState<TransactionHistoryItem[]>([]);
  const [positionLoading, setPositionLoading] = useState(false);

  const TIME_RANGES = ['1D', '1W', '1M', '3M', '6M', '1Y'];
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newsFilterRange, setNewsFilterRange] = useState<{ start: Date; end: Date } | null>(null);
  const newsSectionRef = useRef<HTMLDivElement>(null);

  const handleNewsFilter = ({ start, end }: { start: string; end: string }) => {
    setNewsFilterRange({
      start: new Date(start),
      end: new Date(end)
    });
    setIsFullscreen(false);

    // Small timeout to allow modal close render
    setTimeout(() => {
      if (newsSectionRef.current) {
        newsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Fetch Stock Details
  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/market/details/${symbol}`);
        if (response.data && response.data.metadata) {
          setStockData(response.data.metadata);
        }
      } catch (err: any) {
        console.error('Error fetching stock details:', err);
        setError(err.message || 'Failed to load stock details');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchStockDetails();
    }
  }, [symbol]);

  // Fetch Chart Data
  const fetchChartData = useCallback(async (options?: { refresh?: boolean }) => {
    if (!symbol) return;
    try {
      setChartLoading(true);
      const refreshParam = options?.refresh ? '&refresh=true' : '';
      const response = await api.get(`/market/stock/${symbol}/intraday?filter=${selectedRange}${refreshParam}`);
      if (response.data?.metadata?.history) {
        setChartData(response.data.metadata.history);
        if (options?.refresh) {
          showToast('success', 'Đã làm mới dữ liệu');
        }
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      if (options?.refresh) {
        showToast('error', 'Làm mới thất bại');
      }
    } finally {
      setChartLoading(false);
    }
  }, [symbol, selectedRange, showToast]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const handleRefresh = useCallback(() => {
    fetchChartData({ refresh: true });
  }, [fetchChartData]);

  // API URL Env
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Socket Connection
  useEffect(() => {
    if (!symbol) return;

    // Must provide auth token if server requires it
    const socket = io(`${SOCKET_URL}/market`, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token: accessToken // Send token for middleware
      }
    });

    socket.on('connect', () => {
      console.log('Connected to Market Socket');
      socket.emit('subscribe:stock', { symbol });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket Connection Error:', err.message);
    });

    socket.on('stock:update', (data: any) => {
      // data matches StockDetailUpdate interface from backend
      // { symbol, price, change, changePercent, volume, high, low, timestamp }

      setChartData((prevData: any[]) => {
        if (!prevData || prevData.length === 0) return prevData;

        const lastCandle = prevData[prevData.length - 1];
        // Identify if update belongs to current candle or new one
        // Simulation: Timestamp is "Now".
        // Charts usually group by minute.
        const now = new Date();
        const currentMinuteStr = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"

        // Simplified: Always update "latest" candle if time diff is small, or append if new minute
        // But since this is simulation, let's just Append/Update last

        // Check if last candle time matches current minute
        const lastTime = lastCandle.date ? `${lastCandle.date} ${lastCandle.time}` : lastCandle.time;
        // Parse lastTime to compare minutes might be complex due to formats.

        // APPROACH: Just REPLACE/UPDATE the last candle with new price for animation effect
        // OR if new minute -> append.

        // For smoother demo, let's assume we update the last candle's Close/High/Low/Vol
        const updatedLast = {
          ...lastCandle,
          close: data.price,
          high: Math.max(lastCandle.high, data.price),
          low: Math.min(lastCandle.low, data.price),
          volume: data.volume, // Accumulate or Replace? Backend sends TOTAL volume usually.
          // If backend sends Accumulated Volume for the day, we replace.
          // Simulation backend sends Volume of that specific bar (1m).
        };

        // If time has jumped significantly (new candle needed), we would push new.
        // But getting exact sync of "When to push new" vs "Update existing" without simplified params is hard.
        // Let's stick to updating the very last candle to show "Live" movement.

        const newData = [...prevData];
        newData[newData.length - 1] = updatedLast;
        return newData;
      });

      // Update Header Data as well
      setStockData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          marketData: {
            ...prev.marketData,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            high: data.high,
            low: data.low,
            volume: data.volume
          }
        }
      });
    });

    return () => {
      socket.off('stock:update');
      socket.emit('unsubscribe:stock', { symbol });
      socket.disconnect();
    };
  }, [symbol]);

  // Fetch User Transactions for this symbol
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!symbol || !user?._id) return;
      try {
        setPositionLoading(true);
        const response = await transactionApi.getTransactionHistory(user._id, {
          filters: { stock_code: symbol }
        });
        if (response.transactions) {
          setTransactions(response.transactions);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setPositionLoading(false);
      }
    };

    fetchTransactions();
  }, [symbol, user?._id]);

  // Handle Load More (Mocking older data)
  const handleLoadMore = async (direction: 'left' | 'right') => {
    if (chartLoading || direction === 'right') return; // Only mocking historic data for now

    showToast('info', "Đang tải thêm dữ liệu quá khứ...", 2000);

    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 800));

    setChartData((prev: any[]) => {
      if (!prev.length) return prev;

      // Generate 50 dummy candles before the first one
      const first = prev[0];
      const newCandles = [];
      let currentPrice = first.open || first.price;
      const oneMinute = 60 * 1000;
      let currentTime = new Date(first.date ? `${first.date} ${first.time}` : first.time).getTime();

      for (let i = 0; i < 50; i++) {
        currentTime -= oneMinute;
        const open = currentPrice;
        const close = open * (1 + (Math.random() * 0.01 - 0.005));
        const high = Math.max(open, close) * (1 + Math.random() * 0.002);
        const low = Math.min(open, close) * (1 - Math.random() * 0.002);

        // Format time back to string matches source format mostly
        const dateObj = new Date(currentTime);
        // Simple hacky format to match typical API response structure if needed, 
        // but our transformer handles ISO strings or "YYYY-MM-DD HH:mm:ss"
        const timeStr = dateObj.toISOString().replace('T', ' ').substring(0, 19);

        newCandles.unshift({
          time: timeStr,
          open, high, low, close,
          price: close, // fallback
          volume: Math.floor(Math.random() * 10000)
        });
        currentPrice = close; // continuity
      }

      return [...newCandles, ...prev];
    });
  };

  // Transform chart data
  const candlestickData = useMemo(() => {
    if (!chartData.length) return [];
    return chartData.map((point: any) => ({
      time: point.date ? `${point.date} ${point.time}` : point.time,
      open: point.open ?? point.price,
      close: point.close ?? point.price,
      high: point.high ?? point.price,
      low: point.low ?? point.price,
    }));
  }, [chartData]);

  // Calculate quick position summary
  const positionSummary = useMemo(() => {
    let totalShares = 0;
    // Note: This is an estimation based on history since we don't have a direct portfolio API endpoint for single stock
    // Real portfolio calculation should be done backend-side or via a proper Portfolio API
    // Here we just list recent transactions and basic stats
    return transactions.reduce((acc, tx) => {
      if (tx.transaction_status === 'COMPLETED') {
        if (tx.transaction_type === 'BUY') acc += tx.quantity;
        else if (tx.transaction_type === 'SELL') acc -= tx.quantity;
      }
      return acc;
    }, 0);
  }, [transactions]);

  // Calculate change based on visible chart data (User Request: Start to End of chart)
  const calculatedChange = useMemo(() => {
    if (!candlestickData.length) return { change: 0, percent: 0, price: 0 };
    const first = candlestickData[0];
    const last = candlestickData[candlestickData.length - 1]; // Use last candle

    // Ensure we handle potentially missing data gracefully
    if (!first || !last) return { change: 0, percent: 0, price: 0 };

    const startPrice = first.open;
    const currentPrice = last.close;
    const change = currentPrice - startPrice;
    const percent = startPrice > 0 ? ((change / startPrice) * 100) : 0;

    return { change, percent, price: currentPrice };
  }, [candlestickData]);

  // Flash Animation State
  const [priceFlash, setPriceFlash] = useState<'green' | 'red' | null>(null);
  const prevPriceRef = useRef<number>(0);

  useEffect(() => {
    if (calculatedChange.price !== prevPriceRef.current) {
      if (prevPriceRef.current > 0) {
        setPriceFlash(calculatedChange.price > prevPriceRef.current ? 'green' : 'red');
        setTimeout(() => setPriceFlash(null), 1000); // Reset after 1s
      }
      prevPriceRef.current = calculatedChange.price;
    }
  }, [calculatedChange.price]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stockData) return <ErrorMessage message="Stock not found" />;

  const { profile, info, marketData } = stockData;


  // Use calculated data over socket data for critical stats to ensure consistency with chart
  const displayData = {
    price: calculatedChange.price || marketData?.price || 0,
    change: calculatedChange.change,
    changePercent: calculatedChange.percent
  };

  const isPositive = displayData.change >= 0;

  // Shared Card Styles
  const cardClassName = "bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300";

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* 1. Header & Quick Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative bg-white rounded-lg p-1 flex items-center justify-center border border-gray-100 shadow-sm">
              {profile?.logo ? (
                <img
                  src={profile.logo}
                  alt={symbol}
                  className="object-contain w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${symbol}&background=random`;
                  }}
                />
              ) : (
                <span className="text-lg font-bold text-gray-700">{symbol}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">{symbol}</h1>
              <p className="text-sm text-gray-500 font-medium truncate max-w-[200px] md:max-w-md">
                {info?.organShortName || profile?.companyShortName || symbol}
              </p>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-start px-4 border-l border-gray-200">
            <div className={`transition-all duration-500 rounded px-2 ${priceFlash === 'green' ? 'bg-emerald-100' : priceFlash === 'red' ? 'bg-red-100' : ''}`}>
              <div className={`text-2xl font-bold flex items-center leading-none ${priceFlash === 'green' ? 'text-emerald-700' : priceFlash === 'red' ? 'text-red-700' : 'text-gray-900'}`}>
                {(displayData.price * 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}
                <span className="text-xs font-medium text-gray-500 ml-1">VND</span>
              </div>
            </div>
            <div className={`flex items-center text-sm font-semibold mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              <span>{isPositive ? '+' : ''}{(displayData.change * 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}</span>
              <span className="ml-1 opacity-90">({displayData.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {!isFullscreen && (
            <>
              <button
                onClick={() => router.push(`/dashboard/trade?symbol=${symbol}&action=buy`)}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                Mua
              </button>
              <button
                onClick={() => router.push(`/dashboard/trade?symbol=${symbol}&action=sell`)}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                <DollarSign className="w-4 h-4" />
                Bán
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Price Display (Visible only on mobile) */}
      <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="text-3xl font-bold text-gray-900">
          {marketData?.price ? (marketData.price * 1000).toLocaleString('vi-VN') : '---'}
          <span className="text-sm font-medium text-gray-500 ml-1">VND</span>
        </div>
        <div className={`flex items-center font-bold px-3 py-1 rounded-lg ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          <span>{marketData?.changePercent?.toFixed(2)}%</span>
        </div>
      </div>

      {/* 2. Full Width Chart */}
      <div className={`${cardClassName} h-[80vh] flex flex-col p-0 overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-500" />
            Biểu đồ giá
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
              {TIME_RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${selectedRange === range
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0 relative">
          {chartLoading ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <LoadingSpinner />
            </div>
          ) : candlestickData.length > 0 ? (
            <CandlestickChart
              key="normal"
              data={candlestickData}
              valueFormatter={formatPrice}
              onLoadMore={handleLoadMore}
              onNewsFilter={handleNewsFilter}
              onRefresh={handleRefresh}
              selectedRange={selectedRange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Không có dữ liệu biểu đồ
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal Portal */}
      {isFullscreen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-white flex flex-col w-screen h-screen">
          <div className="w-full h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900">{symbol}</h3>
                <div className={`flex items-center font-semibold px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {marketData?.price ? (marketData.price * 1000).toLocaleString('vi-VN') : '---'}
                  <span className="text-xs ml-1">VND</span>
                  <span className="text-xs ml-2 opacity-80">({marketData?.changePercent?.toFixed(2)}%)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {TIME_RANGES.map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedRange(range)}
                      className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${selectedRange === range
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIsFullscreen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            {/* Chart Body */}
            <div className="flex-1 min-h-0">
              {chartLoading ? (<LoadingSpinner />) : (
                <CandlestickChart
                  key="fullscreen"
                  data={candlestickData}
                  valueFormatter={formatPrice}
                  onLoadMore={handleLoadMore}
                  onNewsFilter={handleNewsFilter}
                  onRefresh={handleRefresh}
                  selectedRange={selectedRange}
                />
              )}
            </div>
            {/* Footer Actions */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button
                onClick={() => router.push(`/dashboard/trade?symbol=${symbol}&action=buy`)}
                className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
              >Mua Ngay</button>
              <button
                onClick={() => router.push(`/dashboard/trade?symbol=${symbol}&action=sell`)}
                className="px-8 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-sm"
              >Bán Ngay</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 3. Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Financial Stats */}
          <div className={cardClassName}>
            <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Thống kê tài chính
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
              {/* Row 1 */}
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1">Tham chiếu</span>
                <span className="font-semibold text-lg">{(marketData?.reference * 1000).toLocaleString() || '---'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1">Mở cửa</span>
                <span className="font-semibold text-lg">{(marketData?.open * 1000).toLocaleString() || '---'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-500 mb-1">Khối lượng</span>
                <span className="font-semibold text-lg">{marketData?.volume?.toLocaleString() || '---'}</span>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col border-t border-gray-100 pt-3">
                <span className="text-gray-500 mb-1">Cao nhất</span>
                <span className="font-semibold text-emerald-600 text-lg">{(marketData?.high * 1000).toLocaleString() || '---'}</span>
              </div>
              <div className="flex flex-col border-t border-gray-100 pt-3">
                <span className="text-gray-500 mb-1">Thấp nhất</span>
                <span className="font-semibold text-red-500 text-lg">{(marketData?.low * 1000).toLocaleString() || '---'}</span>
              </div>
              <div className="flex flex-col border-t border-gray-100 pt-3">
                <span className="text-gray-500 mb-1">Vốn hóa</span>
                <span className="font-semibold text-lg">
                  {marketData?.price && profile?.outstandingShare ?
                    ((marketData.price * profile.outstandingShare * 1000) / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' Tỷ'
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* About Company */}
          <div className={`${cardClassName} space-y-6`}>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Về doanh nghiệp
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-4 font-normal text-justify">
                {profile?.company_profile || profile?.industry || 'Chưa có mô tả chi tiết.'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100 mb-4">
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Ngành</span>
                  <p className="font-medium text-gray-900 text-sm">{profile?.industry || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Thành lập</span>
                  <p className="font-medium text-gray-900 text-sm">{profile?.establishedYear || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Vốn điều lệ</span>
                  <p className="font-medium text-gray-900 text-sm">
                    {profile?.charter_capital ? (profile.charter_capital / 1000000000).toLocaleString('vi-VN') + ' tỷ' : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase font-bold block mb-1">KL Niêm yết</span>
                  <p className="font-medium text-gray-900 text-sm">
                    {profile?.issueShare ? profile.issueShare.toLocaleString('vi-VN') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* History Section */}
            {profile?.history && (
              <div className="pt-2">
                <h4 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-500" />
                  Lịch sử hình thành
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {profile.history.split('- ').map((item: string, index: number) => {
                    if (!item.trim()) return null;
                    // Try to identify date pattern at the start (e.g., "Ngày 03/05/2002:", "Tháng 11/2004:")
                    const match = item.match(/^((?:Ngày|Tháng|Năm) \d{1,2}(?:\/\d{1,2})?(?:\/\d{4})?):?(.*)/);
                    if (match) {
                      return (
                        <div key={index} className="flex gap-2">
                          <div className="min-w-[4px] mt-1.5 h-1.5 rounded-full bg-purple-300 shrink-0" />
                          <p>
                            <span className="font-bold text-gray-900">{match[1]}:</span>
                            {match[2]}
                          </p>
                        </div>
                      );
                    }
                    return (
                      <div key={index} className="flex gap-2">
                        <div className="min-w-[4px] mt-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                        <p>{item}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* News Section */}
          <div ref={newsSectionRef} className={`${cardClassName} overflow-hidden scroll-mt-20`}>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-orange-500" />
              Tin tức & Sự kiện
            </h3>
            <NewsFeed
              symbol={symbol}
              filterRange={newsFilterRange}
              onClearFilter={() => setNewsFilterRange(null)}
            />
          </div>

        </div>

        {/* Right Column: User Info & Company Sidebar */}
        <div className="lg:col-span-1 space-y-6">

          {/* YOUR POSITION CARD (New Feature) */}
          <div className={`${cardClassName} border-l-4 border-l-blue-500`}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-500" />
              Vị thế của bạn
            </h3>

            {positionLoading ? (
              <div className="py-8"><LoadingSpinner /></div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <span className="text-sm text-gray-500 block mb-1">Tổng SL ước tính</span>
                  <span className="text-2xl font-bold text-gray-900">{positionSummary.toLocaleString()} <span className="text-xs font-normal text-gray-500">CP</span></span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <History className="w-3 h-3" /> Giao dịch gần đây
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx._id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-100 transition-colors">
                        <div className="flex flex-col">
                          <span className={`font-bold text-xs ${tx.transaction_type === 'BUY' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {tx.transaction_type === 'BUY' ? 'MUA' : 'BÁN'}
                          </span>
                          <span className="text-[10px] text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{tx.quantity.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">@{tx.price_per_unit.toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {transactions.length > 5 && (
                    <button className="w-full text-center text-xs text-blue-600 mt-2 hover:underline">Xem tất cả</button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm">Bạn chưa có giao dịch nào với mã này.</p>
                <button
                  onClick={() => router.push(`/dashboard/trade?symbol=${symbol}`)}
                  className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-700"
                >
                  Giao dịch ngay
                </button>
              </div>
            )}
          </div>

          {/* Company Contact */}
          <div className={cardClassName}>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Thông tin liên hệ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-gray-400 mt-0.5" />
                <a href={profile?.website} target="_blank" className="text-blue-600 hover:underline truncate">{profile?.website || 'N/A'}</a>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-600">{info?.exchange || 'HOSE'}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StockDetailPage;

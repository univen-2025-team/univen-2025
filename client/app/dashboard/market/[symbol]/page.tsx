'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, Globe, Users, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Image from 'next/image';
import LoadingSpinner from '@/components/dashboard/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';
import StockChart from '@/components/market/StockChart';
import api from '@/lib/axios';

const StockDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const symbol = params.symbol as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockData, setStockData] = useState<any>(null);

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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!stockData) return <ErrorMessage message="Stock not found" />;

  const { profile, info, marketData } = stockData;
  const isPositive = marketData?.change >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Market
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stock Overview Card */}
          <div className="bg-[#1e1e1e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 relative bg-white rounded-lg p-2 flex items-center justify-center overflow-hidden">
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
                  <span className="text-xl font-bold text-gray-800">{symbol}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{symbol}</h1>
                <p className="text-gray-400 text-sm">{info?.organShortName || profile?.companyShortName || symbol}</p>
                <div className="mt-1 inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-300">
                  {info?.exchange || profile?.exchange || 'HOSE'}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold flex items-center">
                {marketData?.price ? (marketData.price * 1000).toLocaleString('vi-VN') : '---'}
                <span className="text-sm font-normal text-gray-400 ml-1">VND</span>
              </div>
              <div className={`flex items-center mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span className="font-semibold">{marketData?.change > 0 ? '+' : ''}{marketData?.change * 1000}</span>
                <span className="ml-1 opacity-80">({marketData?.changePercent}%)</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-800">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Open</span>
                <span className="font-medium text-white">{(marketData?.open * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">High</span>
                <span className="font-medium text-white">{(marketData?.high * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Low</span>
                <span className="font-medium text-white">{(marketData?.low * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Volume</span>
                <span className="font-medium text-white">{marketData?.volume?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Company Profile Card */}
          <div className="bg-[#1e1e1e] rounded-xl p-6 border border-gray-800 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Company Profile</h3>

            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <span className="block text-gray-400 text-xs uppercase tracking-wider">Industry</span>
                <span className="text-sm">{profile?.industry || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <span className="block text-gray-400 text-xs uppercase tracking-wider">Employees</span>
                <span className="text-sm">{profile?.noEmployees?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Globe className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <span className="block text-gray-400 text-xs uppercase tracking-wider">Website</span>
                <a
                  href={profile?.website?.startsWith('http') ? profile.website : `https://${profile?.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-400 hover:underline truncate block max-w-[200px]"
                >
                  {profile?.website || 'N/A'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chart & Additional Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section */}
          <div className="bg-[#1e1e1e] rounded-xl p-6 border border-gray-800 h-[500px]">
            <h3 className="text-lg font-semibold mb-4 text-white">Price History</h3>
            <div className="h-[400px] w-full">
              <StockChart refreshTrigger={0} symbol={symbol} />
            </div>
          </div>

          {/* About Section */}
          <div className="bg-[#1e1e1e] rounded-xl p-6 border border-gray-800 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-white">About {info?.organName || profile?.companyName}</h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {profile?.company_profile || profile?.industry || 'No description available.'}
              </p>
            </div>

            {profile?.history && (
              <div>
                <h4 className="text-md font-medium text-gray-200 mb-2">History</h4>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {profile.history}
                </p>
              </div>
            )}
          </div>

          {/* Detailed Stats Grid */}
          <div className="bg-[#1e1e1e] rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-white">Financial & Market Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Market Cap</span>
                  <span>{marketData?.price && profile?.outstandingShare ?
                    ((marketData.price * profile.outstandingShare * 1000) / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' Tỷ'
                    : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Charter Capital</span>
                  <span>{profile?.charter_capital ? (profile.charter_capital / 1000000000).toLocaleString('vi-VN') + ' Tỷ' : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Established</span>
                  <span>{profile?.establishedYear || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Outstanding Shares</span>
                  <span>{profile?.outstandingShare ? (profile.outstandingShare * 1000000).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Foreign Ownership</span>
                  <span>{profile?.foreignPercent ? (profile.foreignPercent * 100).toFixed(2) + '%' : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Sector (ICB Level 2)</span>
                  <span>{profile?.icb_name2 || info?.icbCode2 || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Stock Rating</span>
                  <span>{profile?.stockRating ? `${profile.stockRating}/5` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Sub-Sector</span>
                  <span className="truncate max-w-[120px]" title={profile?.icb_name4 || ''}>{profile?.icb_name4 || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-400">Listing Date</span>
                  <span>{info?.updated_at ? new Date(info.updated_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;

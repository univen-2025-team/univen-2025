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

  // Shared Card Styles
  const cardClassName = "bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300";

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors font-medium"
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
          <div className={cardClassName}>
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 relative bg-gray-50 rounded-lg p-2 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
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
                  <span className="text-xl font-bold text-gray-700">{symbol}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{symbol}</h1>
                <p className="text-gray-500 text-sm font-medium">{info?.organShortName || profile?.companyShortName || symbol}</p>
                <div className="mt-1 inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                  {info?.exchange || profile?.exchange || 'HOSE'}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-3xl font-bold flex items-center text-gray-900">
                {marketData?.price ? (marketData.price * 1000).toLocaleString('vi-VN') : '---'}
                <span className="text-sm font-medium text-gray-500 ml-1">VND</span>
              </div>
              <div className={`flex items-center mt-1 font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                <span>{marketData?.change > 0 ? '+' : ''}{marketData?.change * 1000}</span>
                <span className="ml-1 opacity-90">({marketData?.changePercent}%)</span>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Open</span>
                <span className="font-semibold text-gray-900">{(marketData?.open * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">High</span>
                <span className="font-semibold text-gray-900">{(marketData?.high * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Low</span>
                <span className="font-semibold text-gray-900">{(marketData?.low * 1000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Volume</span>
                <span className="font-semibold text-gray-900">{marketData?.volume?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Company Profile Card */}
          <div className={`${cardClassName} space-y-4`}>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              Company Profile
            </h3>

            <div className="flex items-start space-x-3 group">
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold">Industry</span>
                <span className="text-sm font-medium text-gray-900">{profile?.industry || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 group">
              <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold">Employees</span>
                <span className="text-sm font-medium text-gray-900">{profile?.noEmployees?.toLocaleString() || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 group">
              <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                <Globe className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <span className="block text-gray-500 text-xs uppercase tracking-wider font-semibold">Website</span>
                <a
                  href={profile?.website?.startsWith('http') ? profile.website : `https://${profile?.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-[200px] font-medium"
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
          <div className={`${cardClassName} h-[500px] flex flex-col`}>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Price History</h3>
            <div className="flex-1 w-full min-h-0">
              {/* Pass styles or ensure StockChart handles light mode properly. StockChart looks neutral enough or adaptable. */}
              <StockChart refreshTrigger={0} symbol={symbol} />
            </div>
          </div>

          {/* About Section */}
          <div className={`${cardClassName} space-y-6`}>
            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-900">About {info?.organName || profile?.companyName}</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {profile?.company_profile || profile?.industry || 'No description available.'}
              </p>
            </div>

            {profile?.history && (
              <div>
                <h4 className="text-md font-bold text-gray-900 mb-2">History</h4>
                <div className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {profile.history.split(/ - |;  - /).map((item: string, index: number) => {
                    const cleanItem = item.trim();
                    if (!cleanItem) return null;

                    const isBullet = index > 0 || profile.history.startsWith(' - ');
                    const content = cleanItem.replace(/^[-•]\s*/, '');

                    // Check for date pattern (starts with Ngày/Tháng/Năm followed by colon)
                    const dateMatch = content.match(/^((?:Ngày|Tháng|Năm)\s[^:]+):/);

                    if (dateMatch) {
                      const datePart = dateMatch[1];
                      const remainingPart = content.substring(dateMatch[0].length);
                      return (
                        <div key={index} className="mb-2">
                          {isBullet ? <span className="mr-2">•</span> : ''}
                          <span className="font-bold text-gray-900">{datePart}:</span>
                          {remainingPart}
                        </div>
                      );
                    }

                    return (
                      <div key={index} className="mb-2">
                        {isBullet ? <span className="mr-2">•</span> : ''}{content}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Stats Grid */}
          <div className={cardClassName}>
            <h3 className="text-lg font-bold mb-4 text-gray-900">Financial & Market Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Market Cap</span>
                  <span className="font-semibold text-gray-900">{marketData?.price && profile?.outstandingShare ?
                    ((marketData.price * profile.outstandingShare * 1000) / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' Tỷ'
                    : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Charter Capital</span>
                  <span className="font-semibold text-gray-900">{profile?.charter_capital ? (profile.charter_capital / 1000000000).toLocaleString('vi-VN') + ' Tỷ' : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Established</span>
                  <span className="font-semibold text-gray-900">{profile?.establishedYear || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Outstanding Shares</span>
                  <span className="font-semibold text-gray-900">{profile?.outstandingShare ? (profile.outstandingShare * 1000000).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Foreign Ownership</span>
                  <span className="font-semibold text-gray-900">{profile?.foreignPercent ? (profile.foreignPercent * 100).toFixed(2) + '%' : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Sector</span>
                  <span className="font-semibold text-gray-900">{profile?.icb_name2 || info?.icbCode2 || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Stock Rating</span>
                  <span className="font-semibold text-gray-900 flex items-center">
                    {profile?.stockRating ? (
                      <>
                        <span className="text-yellow-500 mr-1">★</span>
                        {profile.stockRating}/5
                      </>
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Sub-Sector</span>
                  <span className="truncate max-w-[120px] font-semibold text-gray-900" title={profile?.icb_name4 || ''}>{profile?.icb_name4 || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Listing Date</span>
                  <span className="font-semibold text-gray-900">{info?.updated_at ? new Date(info.updated_at).toLocaleDateString('vi-VN') : 'N/A'}</span>
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

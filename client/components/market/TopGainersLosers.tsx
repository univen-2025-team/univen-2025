"use client";

import { useRouter } from "next/navigation";
import { StockData } from "@/lib/types/market";
import { formatNumber, formatPrice, getChangeBgColor } from "./utils";

type TopGainersLosersProps = {
  topGainers: StockData[];
  topLosers: StockData[];
};

export default function TopGainersLosers({ topGainers, topLosers }: TopGainersLosersProps) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Gainers */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 text-success mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Top mã tăng mạnh
        </h2>
        <div className="space-y-3">
          {topGainers.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => router.push(`/market/${stock.symbol}`)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getChangeBgColor(stock.change)}`}
            >
              <div>
                <p className="font-bold text-gray-900">{stock.symbol}</p>
                <p className="text-sm text-gray-600">{formatPrice(stock.price)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-success">
                  +{formatNumber(stock.change)}
                </p>
                <p className="text-sm font-semibold text-success">
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
          <svg className="w-6 h-6 text-error mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          Top mã giảm mạnh
        </h2>
        <div className="space-y-3">
          {topLosers.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => router.push(`/market/${stock.symbol}`)}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${getChangeBgColor(stock.change)}`}
            >
              <div>
                <p className="font-bold text-gray-900">{stock.symbol}</p>
                <p className="text-sm text-gray-600">{formatPrice(stock.price)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-error">
                  {formatNumber(stock.change)}
                </p>
                <p className="text-sm font-semibold text-error">
                  {stock.changePercent}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


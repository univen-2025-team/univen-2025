'use client';

import { useRouter } from 'next/navigation';
import { StockData } from '@/lib/types/market';
import { formatNumber, formatPrice, getChangeBgColor } from './utils';

type TopGainersLosersProps = {
    topGainers: StockData[];
    topLosers: StockData[];
};

export default function TopGainersLosers({ topGainers, topLosers }: TopGainersLosersProps) {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Gainers */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 ring-1 ring-white/5 p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <svg
                            className="w-6 h-6 text-emerald-400 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                        </svg>
                        Top mã tăng mạnh
                    </h2>
                    <div className="space-y-3">
                        {topGainers.map((stock) => (
                            <div
                                key={stock.symbol}
                                onClick={() => router.push(`/dashboard/market/${stock.symbol}`)}
                                className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 cursor-pointer hover:bg-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/10 transition-all"
                            >
                                <div>
                                    <p className="font-bold text-white">{stock.symbol}</p>
                                    <p className="text-sm text-slate-400">
                                        {formatPrice(stock.price)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-emerald-400">
                                        +{formatNumber(stock.change)}
                                    </p>
                                    <p className="text-sm font-semibold text-emerald-400">
                                        +{stock.changePercent}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Losers */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-[#0F111A]/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 ring-1 ring-white/5 p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                        <svg
                            className="w-6 h-6 text-red-400 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                        Top mã giảm mạnh
                    </h2>
                    <div className="space-y-3">
                        {topLosers.map((stock) => (
                            <div
                                key={stock.symbol}
                                onClick={() => router.push(`/dashboard/market/${stock.symbol}`)}
                                className="flex items-center justify-between p-3 rounded-xl border border-red-500/20 bg-red-500/10 cursor-pointer hover:bg-red-500/20 hover:shadow-md hover:shadow-red-500/10 transition-all"
                            >
                                <div>
                                    <p className="font-bold text-white">{stock.symbol}</p>
                                    <p className="text-sm text-slate-400">
                                        {formatPrice(stock.price)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-400">
                                        {formatNumber(stock.change)}
                                    </p>
                                    <p className="text-sm font-semibold text-red-400">
                                        {stock.changePercent}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart2,
    Clock,
    Monitor,
    Layers,
    Grid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketStats } from './market-stats';
import { VN30IndexCard } from './vn30-index-card';
import { VN30TrendChart } from './vn30-trend-chart';
import { TopGainersLosers } from './top-gainers-losers';
import { StockTableWithTabs } from './stock-table-with-tabs';
import { MarketHeatmap } from './market-heatmap';
import { SelectionOverlay } from './selection-overlay';
import { DollarSign } from 'lucide-react';

interface MarketDashboardV2Props {
    marketData: any;
    marketStats: any;
    indexHistory: any[];
    isConnected: boolean;
    realtimeEnabled: boolean;
    onToggleRealtime: () => void;
    historyRange: string;
    onHistoryRangeChange: (range: string) => void;
    onStockClick: (stock: any) => void;
    onQuickView: (stock: any) => void;
    watchlist: string[];
    isInWatchlist: (symbol: string) => boolean;
    toggleWatchlist: (symbol: string) => void;
    viewMode: string;
    onViewModeChange: (mode: any) => void;
    filteredStocks: any[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

// Helper for Clean Card (previously GlassCard)
const CleanCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",
        className
    )}>
        {children}
    </div>
);

export function MarketDashboardV2({
    marketData,
    marketStats,
    indexHistory,
    isConnected,
    realtimeEnabled,
    onToggleRealtime,
    historyRange,
    onHistoryRangeChange,
    onStockClick,
    onQuickView,
    watchlist,
    isInWatchlist,
    toggleWatchlist,
    viewMode,
    onViewModeChange,
    filteredStocks,
    searchTerm,
    onSearchChange
}: MarketDashboardV2Props) {

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 space-y-6 text-gray-900 font-sans">
            {/* Selection Overlay for Drag Select */}
            <SelectionOverlay
                isSelecting={false} // Hook logic needed if implemented at this level
                selectionBox={null}
            />

            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 sticky top-0 z-30 bg-gray-50/80 backdrop-blur-md py-2 -mx-2 px-2 transition-all">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Tổng quan thị trường
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm font-medium">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        Dữ liệu thị trường trực tuyến • {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-2 shadow-sm",
                        isConnected
                            ? "bg-white border-emerald-200 text-emerald-700"
                            : "bg-white border-red-200 text-red-700"
                    )}>
                        <span className="relative flex h-2 w-2">
                            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isConnected ? "bg-emerald-400" : "bg-red-400")}></span>
                            <span className={cn("relative inline-flex rounded-full h-2 w-2", isConnected ? "bg-emerald-500" : "bg-red-500")}></span>
                        </span>
                        {isConnected ? "Hệ thống hoạt động" : "Mất kết nối"}
                    </div>
                </div>
            </header>

            {/* Quick Stats Ticker */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <CleanCard className="p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Tổng khối lượng</p>
                        <p className="text-lg md:text-xl font-bold text-gray-900 mt-1">
                            {marketStats?.totalVolume ? (marketStats.totalVolume / 1000000).toFixed(2) : '0.00'}M
                        </p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                        <BarChart2 className="w-5 h-5" />
                    </div>
                </CleanCard>

                <CleanCard className="p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Mã tăng</p>
                        <p className="text-lg md:text-xl font-bold text-emerald-600 mt-1">
                            {marketStats?.advancing || 0}
                        </p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </CleanCard>

                <CleanCard className="p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Mã giảm</p>
                        <p className="text-lg md:text-xl font-bold text-red-600 mt-1">
                            {marketStats?.declining || 0}
                        </p>
                    </div>
                    <div className="p-2 bg-red-50 rounded-lg text-red-600 group-hover:bg-red-100 transition-colors">
                        <TrendingDown className="w-5 h-5" />
                    </div>
                </CleanCard>

                <CleanCard className="p-4 flex items-center justify-between hover:shadow-md transition-shadow cursor-default group">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Tham chiếu</p>
                        <p className="text-lg md:text-xl font-bold text-yellow-600 mt-1">
                            {marketStats?.unchanged || 0}
                        </p>
                    </div>
                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 group-hover:bg-yellow-100 transition-colors">
                        <Activity className="w-5 h-5" />
                    </div>
                </CleanCard>
            </motion.div>

            {/* Main Grid Layout */}
            <div className="grid grid-cols-12 gap-6 h-auto">

                {/* Left Column: Index Card & Status */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <div className="sticky top-20 space-y-6">
                        <VN30IndexCard
                            {...marketData?.vn30Index}
                            isConnected={isConnected}
                            realtimeEnabled={realtimeEnabled}
                            onToggleRealtime={onToggleRealtime}
                            lastUpdate={new Date().toLocaleTimeString('vi-VN')}
                        />

                        <CleanCard className="p-4 bg-white">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <Monitor className="w-4 h-4 text-blue-600" /> Trạng thái thị trường
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Phiên</span>
                                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs">Mở cửa</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Trạng thái</span>
                                    <span className="font-medium text-gray-900">Khớp lệnh liên tục</span>
                                </div>
                                <div className="h-px bg-gray-100 my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Tổng mã CP</span>
                                    <span className="font-mono font-medium text-gray-900">{marketStats?.totalStocks || 0}</span>
                                </div>
                            </div>
                        </CleanCard>
                    </div>
                </div>

                {/* Center Column: Main Chart */}
                <div className="col-span-12 lg:col-span-6">
                    <CleanCard className="h-[450px] p-4 flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-600" />
                                Xu hướng VN30
                            </h2>
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <VN30TrendChart
                                data={indexHistory}
                                onRangeChange={onHistoryRangeChange}
                                selectedRange={historyRange}
                            />
                        </div>
                    </CleanCard>
                </div>

                {/* Right Column: Top Lists */}
                <div className="col-span-12 lg:col-span-3">
                    <CleanCard className="h-[450px] overflow-hidden flex flex-col">
                        <TopGainersLosers
                            gainers={marketData?.topGainers || []}
                            losers={marketData?.topLosers || []}
                            onStockClick={onStockClick}
                            onBuyClick={onQuickView}
                        />
                    </CleanCard>
                </div>
            </div>

            {/* Bottom Section: Heatmap & Table */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 xl:col-span-4 h-[500px]">
                    <MarketHeatmap
                        stocks={marketData?.stocks ? [...marketData.stocks].filter(s => s.symbol !== 'VN30').sort((a, b) => b.volume - a.volume) : []}
                    />
                </div>

                <div className="col-span-12 xl:col-span-8">
                    <CleanCard className="h-[500px] flex flex-col p-0 overflow-hidden">
                        <div className="flex-1 overflow-auto bg-white">
                            <StockTableWithTabs
                                stocks={filteredStocks}
                                viewMode={viewMode as "watchlist" | "all" | "news"}
                                watchlist={watchlist}
                                searchTerm={searchTerm}
                                onSearchChange={onSearchChange}
                                onViewModeChange={onViewModeChange}
                                onStockClick={onStockClick}
                                onBuyClick={onQuickView}
                                isInWatchlist={isInWatchlist}
                                toggleWatchlist={toggleWatchlist}
                            />
                        </div>
                    </CleanCard>
                </div>
            </div>
        </div>
    );
}

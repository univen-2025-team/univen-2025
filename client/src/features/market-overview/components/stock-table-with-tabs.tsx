import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, Eye, EyeOff, Layers, ArrowUpDown, ArrowUp, ArrowDown, Filter, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MarketNews } from './market-news';
import { MiniSparkline } from '@/components/market/charts/MiniSparkline';

interface StockTableWithTabsProps {
    stocks: any[];
    viewMode: 'watchlist' | 'all' | 'news';
    watchlist: string[];
    searchTerm: string;
    onViewModeChange: (mode: 'watchlist' | 'all' | 'news') => void;
    onStockClick: (stock: any) => void;
    onBuyClick: (stock: any) => void;
    isInWatchlist: (symbol: string) => boolean;
    toggleWatchlist: (symbol: string) => void;
    onSearchChange: (term: string) => void;
}

const StockLogo = ({ symbol, logoUrl, isUp, isDown }: { symbol: string, logoUrl?: string | null, isUp: boolean, isDown: boolean }) => {
    const [imageError, setImageError] = useState(false);

    if (imageError || (!logoUrl && !symbol)) {
        return (
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 transition-colors",
                isUp ? "bg-indigo-50 text-indigo-600" :
                    isDown ? "bg-red-50 text-red-600" :
                        "bg-amber-50 text-amber-600"
            )}>
                {symbol.substring(0, 1)}
            </div>
        );
    }

    return (
        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-white relative">
            <img
                src={logoUrl || `https://static.fireant.vn/symbols/${symbol}.jpg`}
                alt={symbol}
                className="w-full h-full object-contain p-1"
                onError={() => setImageError(true)}
                loading="lazy"
                referrerPolicy="no-referrer"
            />
        </div>
    );
};

export function StockTableWithTabs({
    stocks,
    viewMode,
    watchlist,
    searchTerm,
    onViewModeChange,
    onStockClick,
    onBuyClick,
    isInWatchlist,
    toggleWatchlist,
    onSearchChange
}: StockTableWithTabsProps) {
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'price', direction: 'desc' });
    const [statusFilter, setStatusFilter] = useState<'up' | 'down' | 'ref' | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Virtual scrolling
    const parentRef = useRef<HTMLDivElement>(null);

    // Sorting Logic
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    // Derived State: filtered -> sorted
    const displayStocks = [...(stocks || [])].filter(s => {
        if (s.symbol === 'VN30') return false; // Exclude VN30 index from the list
        if (!statusFilter) return true;
        if (statusFilter === 'up') return s.change > 0;
        if (statusFilter === 'down') return s.change < 0;
        if (statusFilter === 'ref') return s.change === 0;
        return true;
    }).sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;

        let valA = a[key];
        let valB = b[key];

        // Specific handling for 'volume' or numeric fields if needed, 
        // but Typescript might complain if keys are not consistent.
        // Assuming passed stocks are proper objects.

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const SortIcon = ({ colKey }: { colKey: string }) => {
        if (sortConfig?.key !== colKey) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-3 h-3 text-indigo-600" />
            : <ArrowDown className="w-3 h-3 text-indigo-600" />;
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(num * 1000);
    };

    const formatVolume = (vol: number) => {
        if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
        if (vol >= 1000) return `${(vol / 1000).toFixed(2)}K`;
        return vol.toString();
    };

    // Virtual scrolling configuration
    const rowVirtualizer = useVirtualizer({
        count: displayStocks.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 88, // Approximate row height in pixels
        overscan: 5, // Render 5 extra rows above/below viewport
    });

    // Fullscreen content renderer (used in both normal and portal modes)
    const renderContent = (inFullscreen: boolean) => (
        <div className={cn(
            "flex flex-col bg-white transition-all duration-300",
            inFullscreen ? "h-full" : "h-full"
        )}>
            {/* New Modern Header */}
            <div className="px-6 py-4 flex flex-col gap-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h3 className={cn("font-bold text-gray-900 flex items-center gap-2", inFullscreen ? "text-2xl" : "text-lg")}>
                        <Layers className={cn("text-indigo-600", inFullscreen ? "w-6 h-6" : "w-5 h-5")} /> Dữ liệu thị trường
                    </h3>
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 transition-colors"
                        title={isFullscreen ? 'Thu nhỏ' : 'Phóng to'}
                    >
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex bg-gray-100/50 p-1 rounded-xl">
                        {(['all', 'watchlist', 'news'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => onViewModeChange(mode)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                                    viewMode === mode
                                        ? "bg-white text-indigo-700 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200/50"
                                )}
                            >
                                {mode === 'all' && `Tất cả (${stocks?.length || 0})`}
                                {mode === 'watchlist' && `Danh mục (${watchlist?.length || 0})`}
                                {mode === 'news' && 'Tin tức'}
                            </button>
                        ))}
                    </div>

                </div>

                {/* Search Input & Legend */}
                {viewMode !== 'news' && (
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className="relative group w-full sm:w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm cổ phiếu..."
                                value={searchTerm}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* Filter Legend */}
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-400 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                            <Filter className="w-3 h-3 text-gray-400 mr-1" />
                            <button onClick={() => setStatusFilter(prev => prev === 'up' ? null : 'up')} className={cn("flex items-center gap-1 px-2 py-0.5 rounded transition-all", statusFilter === 'up' ? "bg-white shadow-sm text-indigo-700 ring-1 ring-indigo-500/20" : "hover:text-indigo-600")}>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Tăng
                            </button>
                            <button onClick={() => setStatusFilter(prev => prev === 'down' ? null : 'down')} className={cn("flex items-center gap-1 px-2 py-0.5 rounded transition-all", statusFilter === 'down' ? "bg-white shadow-sm text-red-700 ring-1 ring-red-500/20" : "hover:text-red-600")}>
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Giảm
                            </button>
                            <button onClick={() => setStatusFilter(prev => prev === 'ref' ? null : 'ref')} className={cn("flex items-center gap-1 px-2 py-0.5 rounded transition-all", statusFilter === 'ref' ? "bg-white shadow-sm text-amber-700 ring-1 ring-amber-500/20" : "hover:text-amber-600")}>
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> TC
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Header Columns for Sorting */}
            {
                viewMode !== 'news' && (
                    <div className="px-6 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500">
                        <div className="cursor-pointer hover:text-indigo-600 flex items-center gap-2" onClick={() => handleSort('symbol')}>Mã <SortIcon colKey="symbol" /></div>

                        <div className="flex items-center gap-6 md:gap-12">
                            <div className="hidden sm:flex w-24 justify-end gap-2 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('price')}>Giá <SortIcon colKey="price" /></div>
                            <div className="min-w-[80px] flex justify-end gap-2 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('changePercent')}>% <SortIcon colKey="changePercent" /></div>
                            <div className="hidden md:flex w-24 justify-end gap-2 cursor-pointer hover:text-indigo-600" onClick={() => handleSort('volume')}>KL <SortIcon colKey="volume" /></div>
                            <div className="w-10"></div>{/* Watchlist action placeholder */}
                        </div>
                    </div>
                )
            }


            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-gray-50/30">
                {viewMode === 'news' ? (
                    <div className="h-full overflow-auto p-4 custom-scrollbar">
                        <MarketNews />
                    </div>
                ) : (
                    <div
                        ref={parentRef}
                        className="h-full overflow-auto custom-scrollbar"
                    >
                        {displayStocks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p>Không tìm thấy mã "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                    width: '100%',
                                    position: 'relative',
                                }}
                            >
                                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                    const stock = displayStocks[virtualRow.index];
                                    const isUp = stock.change > 0;
                                    const isDown = stock.change < 0;

                                    return (
                                        <div
                                            key={stock.symbol}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: `${virtualRow.size}px`,
                                                transform: `translateY(${virtualRow.start}px)`,
                                                padding: '4px 8px',
                                            }}
                                        >
                                            <div
                                                onClick={() => onStockClick(stock)}
                                                className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer flex items-center justify-between h-full"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <StockLogo symbol={stock.symbol} logoUrl={stock.logo} isUp={isUp} isDown={isDown} />
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-gray-900 text-lg">{stock.symbol}</h4>
                                                            <span className="text-xs text-gray-400 font-medium px-2 py-0.5 bg-gray-100 rounded-full">HOSE</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[200px]">
                                                            {stock.companyName || 'Không xác định'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Sparkline Chart */}
                                                <div className="hidden sm:block">
                                                    <MiniSparkline
                                                        changePercent={stock.changePercent || 0}
                                                        width={50}
                                                        height={24}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-4 md:gap-8">
                                                    <div className="text-right hidden sm:block w-24">
                                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Giá</p>
                                                        <p className="font-mono font-bold text-gray-900 text-base">{formatNumber(stock.price)}</p>
                                                    </div>

                                                    <div className="text-right min-w-[80px]">
                                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5 text-right">%</p>
                                                        <div className={cn(
                                                            "inline-flex items-center justify-end gap-1 font-bold text-base px-2 py-0.5 rounded-lg",
                                                            isUp ? "bg-indigo-50 text-indigo-600" : isDown ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                                                        )}>
                                                            {isUp && '+'}{stock.changePercent}%
                                                        </div>
                                                    </div>

                                                    <div className="text-right hidden md:block w-24">
                                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">KL</p>
                                                        <p className="font-mono text-gray-700 text-sm">{formatVolume(stock.volume)}</p>
                                                    </div>

                                                    <div onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}>
                                                        <div className={cn(
                                                            "p-2 rounded-lg transition-colors cursor-pointer",
                                                            isInWatchlist(stock.symbol) ? "text-indigo-600 bg-indigo-50" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                                                        )}>
                                                            {isInWatchlist(stock.symbol) ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // Main return: either render in portal (fullscreen) or inline (normal)
    if (isFullscreen && typeof document !== 'undefined') {
        return createPortal(
            <div className="fixed inset-0 z-[99999] bg-white flex flex-col animate-fade-in">
                {renderContent(true)}
            </div>,
            document.body
        );
    }

    return renderContent(false);
}

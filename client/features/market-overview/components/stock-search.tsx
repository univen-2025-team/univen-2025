'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useCallback, useEffect, useRef } from 'react';

interface StockData {
    symbol: string;
    companyName?: string;
    price: number;
    change: number;
    changePercent: number;
}

interface StockSearchProps {
    stocks: StockData[];
    onSelect?: (stock: StockData) => void;
    placeholder?: string;
    className?: string;
}

export function StockSearch({
    stocks,
    onSelect,
    placeholder = 'Tìm kiếm mã cổ phiếu...',
    className = ''
}: StockSearchProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Filter stocks based on search term
    const filteredStocks = useCallback(() => {
        if (!searchTerm.trim()) return [];

        const term = searchTerm.toLowerCase();
        return stocks
            .filter(
                (stock) =>
                    stock.symbol.toLowerCase().includes(term) ||
                    (stock.companyName && stock.companyName.toLowerCase().includes(term))
            )
            .slice(0, 10); // Limit to 10 results
    }, [searchTerm, stocks]);

    const results = filteredStocks();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (stock: StockData) => {
        setSearchTerm(stock.symbol);
        setShowResults(false);
        onSelect?.(stock);
    };

    const handleClear = () => {
        setSearchTerm('');
        setShowResults(false);
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-yellow-600';
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowResults(true);
                    }}
                    onFocus={() => searchTerm && setShowResults(true)}
                    className="pl-10 pr-10"
                />
                {searchTerm && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Autocomplete Dropdown */}
            {showResults && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {results.map((stock) => (
                        <button
                            key={stock.symbol}
                            onClick={() => handleSelect(stock)}
                            className="w-full px-4 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between group text-left"
                        >
                            <div className="flex-1">
                                <div className="font-semibold text-foreground group-hover:text-primary">
                                    {stock.symbol}
                                </div>
                                {stock.companyName && (
                                    <div className="text-sm text-muted-foreground truncate">
                                        {stock.companyName}
                                    </div>
                                )}
                            </div>
                            <div className="text-right ml-4">
                                <div className="font-medium text-foreground">
                                    {stock.price.toLocaleString('vi-VN')} ₫
                                </div>
                                <div
                                    className={`text-sm font-medium ${getChangeColor(
                                        stock.change
                                    )}`}
                                >
                                    {stock.change > 0 ? '+' : ''}
                                    {stock.changePercent}%
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results */}
            {showResults && searchTerm && results.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-border rounded-lg shadow-lg p-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Không tìm thấy kết quả cho "{searchTerm}"
                    </p>
                </div>
            )}
        </div>
    );
}

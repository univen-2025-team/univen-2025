'use client';

import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WatchlistButtonProps {
    symbol: string;
    isInWatchlist: boolean;
    onToggle: () => void;
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'ghost';
}

export function WatchlistButton({
    symbol,
    isInWatchlist,
    onToggle,
    size = 'sm',
    variant = 'ghost'
}: WatchlistButtonProps) {
    return (
        <Button
            onClick={(e) => {
                e.stopPropagation();
                onToggle();
            }}
            size={size}
            variant={variant}
            className={`gap-1 ${
                isInWatchlist
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-400 hover:text-yellow-500'
            }`}
            title={isInWatchlist ? `Xóa ${symbol} khỏi watchlist` : `Thêm ${symbol} vào watchlist`}
        >
            <Star className={`h-4 w-4 ${isInWatchlist ? 'fill-yellow-500' : ''}`} />
            {size !== 'sm' && (
                <span className="text-xs">{isInWatchlist ? 'Đang theo dõi' : 'Theo dõi'}</span>
            )}
        </Button>
    );
}

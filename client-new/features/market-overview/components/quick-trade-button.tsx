'use client';

import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickTradeButtonProps {
    symbol: string;
    price: number;
    onClick: () => void;
    variant?: 'buy' | 'sell';
    size?: 'sm' | 'default';
}

export function QuickTradeButton({
    symbol,
    price,
    onClick,
    variant = 'buy',
    size = 'sm'
}: QuickTradeButtonProps) {
    const isBuy = variant === 'buy';

    return (
        <Button
            onClick={(e) => {
                e.stopPropagation(); // Prevent row click when clicking button
                onClick();
            }}
            size={size}
            variant={isBuy ? 'default' : 'destructive'}
            className={`gap-2 ${size === 'sm' ? 'h-8 px-3 text-xs' : ''}`}
        >
            <ShoppingCart className="h-4 w-4" />
            {isBuy ? 'Mua' : 'Bán'}
        </Button>
    );
}

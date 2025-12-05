'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/toast/toast-provider';

const WATCHLIST_STORAGE_KEY = 'univen_watchlist';

export function useWatchlist() {
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const { showToast } = useToast();

    // Load watchlist from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setWatchlist(parsed);
            }
        } catch (error) {
            console.error('Error loading watchlist:', error);
        }
    }, []);

    // Save watchlist to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
        } catch (error) {
            console.error('Error saving watchlist:', error);
        }
    }, [watchlist]);

    const addToWatchlist = useCallback(
        (symbol: string) => {
            setWatchlist((prev) => {
                if (prev.includes(symbol)) {
                    return prev;
                }
                showToast('success', `Đã thêm ${symbol} vào danh sách theo dõi`, 3000);
                return [...prev, symbol];
            });
        },
        [showToast]
    );

    const removeFromWatchlist = useCallback(
        (symbol: string) => {
            setWatchlist((prev) => {
                const filtered = prev.filter((s) => s !== symbol);
                if (filtered.length < prev.length) {
                    showToast('info', `Đã xóa ${symbol} khỏi danh sách theo dõi`, 3000);
                }
                return filtered;
            });
        },
        [showToast]
    );

    const toggleWatchlist = useCallback(
        (symbol: string) => {
            if (watchlist.includes(symbol)) {
                removeFromWatchlist(symbol);
            } else {
                addToWatchlist(symbol);
            }
        },
        [watchlist, addToWatchlist, removeFromWatchlist]
    );

    const isInWatchlist = useCallback(
        (symbol: string) => {
            return watchlist.includes(symbol);
        },
        [watchlist]
    );

    const clearWatchlist = useCallback(() => {
        setWatchlist([]);
        showToast('info', 'Đã xóa toàn bộ danh sách theo dõi', 3000);
    }, [showToast]);

    return {
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        clearWatchlist,
        count: watchlist.length
    };
}

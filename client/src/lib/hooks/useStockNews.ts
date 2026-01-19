/**
 * Hook to fetch stock news
 */

import { useState, useEffect, useCallback } from 'react';
import { getStockNews, StockNewsItem } from '@/lib/api/market-cache';

export interface UseStockNewsResult {
  news: StockNewsItem[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
}

export function useStockNews(symbol: string | undefined, limit: number = 20): UseStockNewsResult {
  const [news, setNews] = useState<StockNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchNews = useCallback(async () => {
    if (!symbol) {
      setNews([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getStockNews(symbol, limit);
      setNews(result.items || []);
      setTotal(result.total || 0);
    } catch (err) {
      console.error('Error fetching stock news:', err);
      setError('Không thể tải tin tức');
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [symbol, limit]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    total,
    refetch: fetchNews,
  };
}

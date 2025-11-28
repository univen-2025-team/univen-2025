import { MarketData } from "@/lib/types/market";
import {
  PriceHistoryPoint,
  StockDetailData,
  TechnicalIndicator,
  TimeRange,
} from "@/lib/types/stock-detail";

export type MarketSortField = "price" | "change" | "changePercent" | "volume";
export type MarketSortOrder = "asc" | "desc";

export interface FetchMarketDataParams {
  sortBy?: MarketSortField;
  order?: MarketSortOrder;
  limit?: number;
  signal?: AbortSignal;
}

export interface MarketApiResponse {
  success: boolean;
  data?: MarketData;
  error?: string;
  message?: string;
}

export interface FetchStockDetailParams {
  symbol: string;
  timeRange?: TimeRange;
  signal?: AbortSignal;
}

export interface StockDetailApiResponse {
  success: boolean;
  data?: {
    stock: StockDetailData;
    priceHistory: PriceHistoryPoint[];
    technicalIndicators: TechnicalIndicator;
  };
  error?: string;
  message?: string;
}

// Helper function to convert stock data to StockDetailData
const convertToStockDetailData = (stock: {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}): StockDetailData => {
  return {
    symbol: stock.symbol,
    companyName: stock.symbol, // Use symbol as fallback
    price: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    volume: stock.volume,
    high: stock.high,
    low: stock.low,
    open: stock.open,
    close: stock.close,
    previousClose: stock.close - stock.change, // Calculate from change
    marketCap: 0, // Not available
    pe: 0, // Not available
    eps: 0, // Not available
    lastUpdate: new Date().toISOString(),
  };
};

// Note: Helper functions for date range and price history conversion removed
// as they are no longer needed since we're using Socket.IO instead of REST API

const getApiBasePath = () => {
  if (typeof window === "undefined") {
    // On the server (during SSR) we need an absolute URL
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    return "http://localhost:3000";
  }
  return "";
};

export const fetchMarketDataService = async (
  params?: FetchMarketDataParams
): Promise<MarketApiResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.order) searchParams.set("order", params.order);
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const basePath = getApiBasePath();
    const response = await fetch(
      `${basePath}/api/market${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
      {
        method: "GET",
        cache: "no-store",
        signal: params?.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch market data (${response.status})`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data as MarketData,
      };
    }

    return {
      success: false,
      error: result.error || result.message || "Failed to fetch market data",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network error: Unable to fetch market data";
    return {
      success: false,
      error: message,
    };
  }
};

export const fetchStockDetail = async (
  params: FetchStockDetailParams
): Promise<StockDetailApiResponse> => {
  try {
    const { symbol, timeRange = "1m", signal } = params;
    const basePath = getApiBasePath();
    const response = await fetch(
      `${basePath}/api/market/${symbol}?timeRange=${encodeURIComponent(timeRange)}`,
      {
        method: "GET",
        cache: "no-store",
        signal,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stock data (${response.status})`);
    }

    const result = await response.json();

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
      };
    }

    return {
      success: false,
      error: result.error || result.message || "Failed to fetch stock data",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network error: Unable to fetch stock data";
    return {
      success: false,
      error: message,
    };
  }
};


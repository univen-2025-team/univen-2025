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
  /**
   * Provide a baseUrl when using this service outside of the browser (e.g. in server components or scripts).
   * Defaults to window-relative calls on the client and a best-effort origin guess on the server.
   */
  baseUrl?: string;
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
  baseUrl?: string;
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

const DEFAULT_LIMIT = 30;
const MARKET_ENDPOINT = "/api/market";
const STOCK_DETAIL_ENDPOINT = (symbol: string) => `/api/market/${encodeURIComponent(symbol)}`;

const getDefaultBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
};

const buildMarketUrl = (params: FetchMarketDataParams = {}) => {
  const query = new URLSearchParams({
    sortBy: params.sortBy ?? "price",
    order: params.order ?? "desc",
    limit: String(params.limit ?? DEFAULT_LIMIT),
  });

  const baseUrl = (params.baseUrl ?? getDefaultBaseUrl()).replace(/\/$/, "");

  return `${baseUrl}${MARKET_ENDPOINT}?${query.toString()}`;
};

const buildStockDetailUrl = (params: FetchStockDetailParams) => {
  const query = new URLSearchParams();
  if (params.timeRange) {
    query.set("timeRange", params.timeRange);
  }

  const baseUrl = (params.baseUrl ?? getDefaultBaseUrl()).replace(/\/$/, "");
  const path = STOCK_DETAIL_ENDPOINT(params.symbol);
  const queryString = query.toString();

  return queryString ? `${baseUrl}${path}?${queryString}` : `${baseUrl}${path}`;
};

export const fetchMarketDataService = async (
  params?: FetchMarketDataParams
): Promise<MarketApiResponse> => {
  const url = buildMarketUrl(params);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: params?.signal,
    });

    const payload: MarketApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || payload.message || "Failed to fetch market data");
    }

    return payload;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while fetching market data";
    console.error("[marketService] fetchMarketDataService error:", message);
    throw new Error(message);
  }
};

export const fetchStockDetail = async (
  params: FetchStockDetailParams
): Promise<StockDetailApiResponse> => {
  const url = buildStockDetailUrl(params);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: params.signal,
    });

    const payload: StockDetailApiResponse = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || payload.message || "Failed to fetch stock detail");
    }

    return payload;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected error while fetching stock detail";
    console.error("[marketService] fetchStockDetail error:", message);
    throw new Error(message);
  }
};


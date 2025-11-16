import axios, { AxiosInstance } from 'axios';
import LoggerService from './logger.service.js';

interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
}

interface VN30Index {
    index: number;
    change: number;
    changePercent: number;
}

interface MarketData {
    vn30Index: VN30Index;
    stocks: StockData[];
    topGainers: StockData[];
    topLosers: StockData[];
    total: number;
    timestamp: string;
}

interface StockDetailData {
    symbol: string;
    companyName: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    open: number;
    close: number;
    previousClose: number;
    marketCap: number;
    pe: number;
    eps: number;
    lastUpdate: string;
}

interface PriceHistoryPoint {
    time: string;
    price: number;
    volume: number;
}

interface TechnicalIndicator {
    ma5: number;
    ma10: number;
    ma20: number;
    rsi: number;
    macd: number;
}

interface StockDetailResponse {
    stock: StockDetailData;
    priceHistory: PriceHistoryPoint[];
    technicalIndicators: TechnicalIndicator;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export default class VnstockService {
    private static instance: VnstockService;
    private httpClient: AxiosInstance;
    private readonly baseUrl: string;
    private readonly timeout: number = 10000;

    private constructor() {
        // Get Python server URL from environment or use default
        this.baseUrl = process.env.VNSTOCK_API_URL || 'http://localhost:5000';
        
        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor
        this.httpClient.interceptors.request.use(
            (config) => {
                LoggerService.getInstance().info(`Requesting ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                LoggerService.getInstance().error(`Request error: ${error.message}`);
                return Promise.reject(error);
            }
        );

        // Add response interceptor
        this.httpClient.interceptors.response.use(
            (response) => {
                LoggerService.getInstance().info(
                    `Response from ${response.config.url}: ${response.status}`
                );
                return response;
            },
            (error) => {
                if (error.response) {
                    LoggerService.getInstance().error(
                        `Response error from ${error.config?.url}: ${error.response.status} - ${error.response.data?.message || error.message}`
                    );
                } else if (error.request) {
                    LoggerService.getInstance().error(
                        `No response from ${error.config?.url}: ${error.message}`
                    );
                } else {
                    LoggerService.getInstance().error(`Error: ${error.message}`);
                }
                return Promise.reject(error);
            }
        );

        LoggerService.getInstance().info(`VnstockService initialized with base URL: ${this.baseUrl}`);
    }

    public static getInstance(): VnstockService {
        if (!VnstockService.instance) {
            VnstockService.instance = new VnstockService();
        }
        return VnstockService.instance;
    }

    /**
     * Check if the Python server is healthy
     */
    public async healthCheck(): Promise<boolean> {
        try {
            const response = await this.httpClient.get('/health');
            return response.status === 200;
        } catch (error) {
            LoggerService.getInstance().error('Python server health check failed');
            return false;
        }
    }

    /**
     * Fetch market data from Python server
     */
    public async getMarketData(
        sortBy: string = 'price',
        order: string = 'desc',
        limit: number = 30
    ): Promise<MarketData | null> {
        try {
            const response = await this.httpClient.get<ApiResponse<MarketData>>('/api/market', {
                params: { sortBy, order, limit },
            });

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            LoggerService.getInstance().warn('Market data request was not successful');
            return null;
        } catch (error) {
            LoggerService.getInstance().error(`Failed to fetch market data: ${error}`);
            return null;
        }
    }

    /**
     * Fetch stock detail from Python server
     */
    public async getStockDetail(
        symbol: string,
        timeRange: string = '1D'
    ): Promise<StockDetailResponse | null> {
        try {
            const response = await this.httpClient.get<ApiResponse<StockDetailResponse>>(
                `/api/market/${symbol}`,
                {
                    params: { timeRange },
                }
            );

            if (response.data.success && response.data.data) {
                return response.data.data;
            }

            LoggerService.getInstance().warn(`Stock detail request for ${symbol} was not successful`);
            return null;
        } catch (error) {
            LoggerService.getInstance().error(`Failed to fetch stock detail for ${symbol}: ${error}`);
            return null;
        }
    }

    /**
     * Fetch single stock data
     */
    public async getStockData(symbol: string): Promise<StockData | null> {
        try {
            const detail = await this.getStockDetail(symbol, '1D');
            if (!detail) return null;

            const { stock } = detail;
            return {
                symbol: stock.symbol,
                price: stock.price,
                change: stock.change,
                changePercent: stock.changePercent,
                volume: stock.volume,
                high: stock.high,
                low: stock.low,
                open: stock.open,
                close: stock.close,
            };
        } catch (error) {
            LoggerService.getInstance().error(`Failed to fetch stock data for ${symbol}: ${error}`);
            return null;
        }
    }

    /**
     * Get the base URL of the Python server
     */
    public getBaseUrl(): string {
        return this.baseUrl;
    }

    /**
     * Test connection to Python server
     */
    public async testConnection(): Promise<boolean> {
        try {
            const isHealthy = await this.healthCheck();
            if (isHealthy) {
                LoggerService.getInstance().info('Successfully connected to Python server');
                return true;
            }
            LoggerService.getInstance().warn('Python server is not healthy');
            return false;
        } catch (error) {
            LoggerService.getInstance().error(`Failed to connect to Python server: ${error}`);
            return false;
        }
    }
}

import LoggerService from './logger.service.js';

// VNStock data types
interface VNStockData {
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

interface VN30IndexData {
    index: number;
    change: number;
    changePercent: number;
}

interface MarketData {
    vn30Index: VN30IndexData;
    stocks: VNStockData[];
    topGainers: VNStockData[];
    topLosers: VNStockData[];
    total: number;
    timestamp: string;
}

export default class VNStockService {
    private static instance: VNStockService;
    private vnstock: any = null;
    private initialized: boolean = false;
    private initPromise: Promise<void> | null = null;
    private pythonServerUrl: string;

    private constructor() {
        this.pythonServerUrl = process.env.VNSTOCK_API_URL || 'http://localhost:5000';
        this.initPromise = this.initialize();
    }

    public static getInstance(): VNStockService {
        if (!VNStockService.instance) {
            VNStockService.instance = new VNStockService();
        }
        return VNStockService.instance;
    }

    private async initialize(): Promise<void> {
        try {
            // Dynamic import for vnstock-js
            const vnstockModule = await import('vnstock-js');
            this.vnstock = vnstockModule;
            this.initialized = true;

            LoggerService.getInstance().info('VNStock service initialized successfully');
        } catch (error: any) {
            LoggerService.getInstance().error('Failed to initialize VNStock service', error);
            this.initialized = false;
        }
    }

    private async waitForInitialization(): Promise<void> {
        if (this.initPromise) {
            await this.initPromise;
        }
    }

    public async getStockPrice(symbol: string): Promise<VNStockData | null> {
        await this.waitForInitialization();

        if (!this.initialized || !this.vnstock) {
            return null;
        }

        try {
            // Fetch price board data for the stock
            const data = await this.vnstock.stock.priceBoard({ ticker: symbol });

            if (!data || !data.price) {
                return null;
            }

            // Calculate change and percent from the data
            const currentPrice = parseFloat(data.price) || 0;
            const referencePrice = parseFloat(data.ref) || currentPrice;
            const change = currentPrice - referencePrice;
            const changePercent = referencePrice > 0 ? (change / referencePrice) * 100 : 0;

            return {
                symbol: symbol.toUpperCase(),
                price: currentPrice,
                change: change,
                changePercent: parseFloat(changePercent.toFixed(2)),
                volume: parseFloat(data.vol) || 0,
                high: parseFloat(data.high) || currentPrice,
                low: parseFloat(data.low) || currentPrice,
                open: parseFloat(data.open) || currentPrice,
                close: currentPrice
            };
        } catch (error: any) {
            // Silently fail and return null - let caller handle fallback
            LoggerService.getInstance().debug(`Failed to fetch stock data for ${symbol}`, error);
            return null;
        }
    }

    public async getVN30Index(): Promise<VN30IndexData | null> {
        await this.waitForInitialization();

        if (!this.initialized || !this.vnstock) {
            return null;
        }

        try {
            // Fetch VN30 index data using price board
            const data = await this.vnstock.stock.priceBoard({ ticker: 'VN30' });

            if (!data || !data.price) {
                return null;
            }

            const currentIndex = parseFloat(data.price) || 0;
            const referenceIndex = parseFloat(data.ref) || currentIndex;
            const change = currentIndex - referenceIndex;
            const changePercent = referenceIndex > 0 ? (change / referenceIndex) * 100 : 0;

            return {
                index: currentIndex,
                change: change,
                changePercent: parseFloat(changePercent.toFixed(2))
            };
        } catch (error: any) {
            // Silently fail and return null
            LoggerService.getInstance().debug('Failed to fetch VN30 index data', error);
            return null;
        }
    }

    public async getHistoricalData(
        symbol: string,
        startDate: string,
        endDate: string
    ): Promise<any[]> {
        await this.waitForInitialization();

        if (!this.initialized || !this.vnstock) {
            return [];
        }

        try {
            const data = await this.vnstock.stock.quote({
                ticker: symbol,
                start: startDate,
                end: endDate
            });

            return data || [];
        } catch (error: any) {
            LoggerService.getInstance().debug(
                `Failed to fetch historical data for ${symbol}`,
                error
            );
            return [];
        }
    }

    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Test connection to Python vnstock server
     */
    public async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.pythonServerUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                LoggerService.getInstance().info('Successfully connected to Python vnstock server');
                return true;
            } else {
                LoggerService.getInstance().warn(
                    `Python vnstock server health check failed with status ${response.status}`
                );
                return false;
            }
        } catch (error: any) {
            LoggerService.getInstance().warn('Failed to connect to Python vnstock server', error);
            return false;
        }
    }

    /**
     * Get market data from Python vnstock server
     */
    public async getMarketData(
        sortBy: string = 'price',
        order: string = 'desc',
        limit: number = 30
    ): Promise<MarketData | null> {
        try {
            const url = new URL('/api/market', this.pythonServerUrl);
            url.searchParams.set('sortBy', sortBy);
            url.searchParams.set('order', order);
            url.searchParams.set('limit', limit.toString());

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                LoggerService.getInstance().error(
                    `Python server responded with status: ${response.status}`
                );
                return null;
            }

            const result: any = await response.json();

            if (result.success && result.data) {
                LoggerService.getInstance().debug(
                    'Successfully fetched market data from Python server'
                );
                return result.data;
            }

            LoggerService.getInstance().error('Python server response was not successful');
            return null;
        } catch (error: any) {
            LoggerService.getInstance().error(
                'Error fetching market data from Python server',
                error
            );
            return null;
        }
    }

    /**
     * Get detailed stock data from Python vnstock server
     */
    public async getStockDetail(symbol: string, timeRange: string = '1D'): Promise<any | null> {
        try {
            const url = new URL(`/api/market/${symbol}`, this.pythonServerUrl);
            url.searchParams.set('timeRange', timeRange);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                LoggerService.getInstance().error(
                    `Python server responded with status: ${response.status} for ${symbol}`
                );
                return null;
            }

            const result: any = await response.json();

            if (result.success && result.data) {
                LoggerService.getInstance().debug(
                    `Successfully fetched stock detail for ${symbol}`
                );
                return result.data;
            }

            LoggerService.getInstance().error(
                `Python server response was not successful for ${symbol}`
            );
            return null;
        } catch (error: any) {
            LoggerService.getInstance().error(`Error fetching stock detail for ${symbol}`, error);
            return null;
        }
    }
}

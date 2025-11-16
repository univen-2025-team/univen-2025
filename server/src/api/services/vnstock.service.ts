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

export default class VNStockService {
    private static instance: VNStockService;
    private vnstock: any = null;
    private initialized: boolean = false;
    private initPromise: Promise<void> | null = null;

    private constructor() {
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
        } catch (error) {
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
                close: currentPrice,
            };
        } catch (error) {
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
                changePercent: parseFloat(changePercent.toFixed(2)),
            };
        } catch (error) {
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
                end: endDate,
            });
            
            return data || [];
        } catch (error) {
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
}

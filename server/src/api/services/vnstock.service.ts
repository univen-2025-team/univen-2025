import LoggerService from './logger.service.js';

// Note: vnstock-js is a CommonJS module, we'll use dynamic import
let VNStock: any = null;

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
    private vnstockClient: any = null;
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
            // Dynamic import for CommonJS module
            const vnstockModule = await import('vnstock-js');
            VNStock = vnstockModule.default || vnstockModule;
            
            this.vnstockClient = new VNStock();
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
        
        if (!this.initialized || !this.vnstockClient) {
            return null;
        }

        try {
            // Fetch real-time stock data
            const data = await this.vnstockClient.stock(symbol).quote();
            
            if (!data || !data.price) {
                return null;
            }

            return {
                symbol: symbol.toUpperCase(),
                price: parseFloat(data.price) || 0,
                change: parseFloat(data.change) || 0,
                changePercent: parseFloat(data.changePercent) || 0,
                volume: parseFloat(data.volume) || 0,
                high: parseFloat(data.high) || parseFloat(data.price) || 0,
                low: parseFloat(data.low) || parseFloat(data.price) || 0,
                open: parseFloat(data.open) || parseFloat(data.price) || 0,
                close: parseFloat(data.close) || parseFloat(data.price) || 0,
            };
        } catch (error) {
            // Silently fail and return null - let caller handle fallback
            return null;
        }
    }

    public async getVN30Index(): Promise<VN30IndexData | null> {
        await this.waitForInitialization();
        
        if (!this.initialized || !this.vnstockClient) {
            return null;
        }

        try {
            // Fetch VN30 index data
            const data = await this.vnstockClient.index('VN30').quote();
            
            if (!data || !data.index) {
                return null;
            }

            return {
                index: parseFloat(data.index) || 0,
                change: parseFloat(data.change) || 0,
                changePercent: parseFloat(data.changePercent) || 0,
            };
        } catch (error) {
            // Silently fail and return null
            return null;
        }
    }

    public async getHistoricalData(
        symbol: string,
        startDate: string,
        endDate: string
    ): Promise<any[]> {
        await this.waitForInitialization();
        
        if (!this.initialized || !this.vnstockClient) {
            return [];
        }

        try {
            const data = await this.vnstockClient
                .stock(symbol)
                .history({ start: startDate, end: endDate });
            
            return data || [];
        } catch (error) {
            return [];
        }
    }

    public isInitialized(): boolean {
        return this.initialized;
    }
}

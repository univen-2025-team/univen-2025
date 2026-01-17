import SocketIOService from './socketio.service.js';
import LoggerService from './logger.service.js';
import VNStockService from './vnstock.service.js';
import StockHistoryModel from '@/models/stock-history.model.js';

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

interface MarketUpdate {
    vn30Index: VN30Index;
    stocks: StockData[];
    topGainers: StockData[];
    topLosers: StockData[];
    timestamp: string;
}

interface StockDetailUpdate {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    timestamp: string;
}

// VN30 stock symbols
const VN30_SYMBOLS = [
    'ACB', 'BCM', 'BID', 'BVH', 'CTG',
    'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
    'MBB', 'MSN', 'MWG', 'PLX', 'POW',
    'SAB', 'SHB', 'SSB', 'SSI', 'STB',
    'TCB', 'TPB', 'VCB', 'VHM', 'VIC',
    'VIB', 'VJC', 'VNM', 'VPB', 'VRE'
];

export default class MarketSocketService {
    private static instance: MarketSocketService;
    private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
    private stockPriceCache: Map<string, StockData> = new Map();
    private vn30IndexCache: VN30Index | null = null;
    private vnstockService: VNStockService;
    private useRealData: boolean = true;

    private constructor() {
        this.vnstockService = VNStockService.getInstance();
    }

    public static getInstance(): MarketSocketService {
        if (!MarketSocketService.instance) {
            MarketSocketService.instance = new MarketSocketService();
        }
        return MarketSocketService.instance;
    }

    public initialize(): void {
        const io = SocketIOService.getInstance().getSocketIO();
        if (!io) {
            LoggerService.getInstance().error('Socket.IO not initialized');
            return;
        }

        this.initializeStockCache();

        io.of('/market').on('connection', (socket) => {
            LoggerService.getInstance().info(`Client connected to market: ${socket.id}`);

            socket.on('subscribe:market', async () => {
                socket.join('market');
                LoggerService.getInstance().info(`Client ${socket.id} subscribed to market updates`);
                await this.sendMarketUpdate();
                if (!this.updateIntervals.has('market')) {
                    this.startMarketBroadcast();
                }
            });

            socket.on('subscribe:stock', async (data: { symbol: string; interval?: number }) => {
                const { symbol, interval = 15000 } = data;
                const room = `stock:${symbol.toUpperCase()}`;
                socket.join(room);
                LoggerService.getInstance().info(`Client ${socket.id} subscribed to ${symbol}`);
                await this.sendStockUpdate(symbol.toUpperCase());
                const key = `stock:${symbol.toUpperCase()}:${interval}`;
                if (!this.updateIntervals.has(key)) {
                    this.startStockBroadcast(symbol.toUpperCase(), interval);
                }
            });

            socket.on('unsubscribe:market', () => {
                socket.leave('market');
            });

            socket.on('unsubscribe:stock', (data: { symbol: string }) => {
                socket.leave(`stock:${data.symbol.toUpperCase()}`);
            });

            socket.on('disconnect', () => {
                LoggerService.getInstance().info(`Client disconnected from market: ${socket.id}`);
            });
        });

        LoggerService.getInstance().info('Market Socket Service initialized');
    }

    /**
     * Initialize stock cache from stock_history collection
     */
    private async initializeStockCache(): Promise<void> {
        try {
            const stocks = await StockHistoryModel.find({
                symbol: { $in: VN30_SYMBOLS },
                interval: '1m'
            })
                .sort({ date: -1 })
                .lean()
                .exec();

            const latestBySymbol = new Map<string, any>();
            for (const stock of stocks) {
                if (!latestBySymbol.has(stock.symbol)) {
                    latestBySymbol.set(stock.symbol, stock);
                }
            }

            for (const [symbol, stockData] of latestBySymbol) {
                const prices = stockData.prices || [];
                if (prices.length > 0) {
                    const latestPrice = prices[prices.length - 1];
                    const firstPrice = prices[0];
                    const change = latestPrice.close - firstPrice.open;
                    const changePercent = firstPrice.open > 0 ? (change / firstPrice.open) * 100 : 0;

                    this.stockPriceCache.set(symbol, {
                        symbol: stockData.symbol,
                        price: latestPrice.close || 0,
                        change: change,
                        changePercent: parseFloat(changePercent.toFixed(2)),
                        volume: prices.reduce((acc: number, p: any) => acc + (p.volume || 0), 0),
                        high: Math.max(...prices.map((p: any) => p.high || 0)),
                        low: Math.min(...prices.filter((p: any) => p.low > 0).map((p: any) => p.low)),
                        open: firstPrice.open || 0,
                        close: latestPrice.close || 0
                    });
                }
            }

            VN30_SYMBOLS.forEach((symbol) => {
                if (!this.stockPriceCache.has(symbol)) {
                    this.stockPriceCache.set(symbol, this.generateMockStockData(symbol));
                }
            });

            LoggerService.getInstance().info(`Stock cache initialized with ${latestBySymbol.size} real stocks`);
        } catch (error) {
            LoggerService.getInstance().error('Error initializing stock cache', error as any);
            VN30_SYMBOLS.forEach((symbol) => {
                this.stockPriceCache.set(symbol, this.generateMockStockData(symbol));
            });
        }

        this.vn30IndexCache = await this.getVN30FromDB();
    }

    private generateMockStockData(symbol: string): StockData {
        const basePrice = Math.random() * 100 + 10;
        const change = (Math.random() - 0.5) * 5;
        return {
            symbol,
            price: parseFloat(basePrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(((change / basePrice) * 100).toFixed(2)),
            volume: Math.round(Math.random() * 1000000),
            high: parseFloat((basePrice + Math.abs(change)).toFixed(2)),
            low: parseFloat((basePrice - Math.abs(change)).toFixed(2)),
            open: parseFloat((basePrice - change / 2).toFixed(2)),
            close: parseFloat(basePrice.toFixed(2))
        };
    }

    /**
     * Get VN30 index from stock_history collection
     */
    private async getVN30FromDB(): Promise<VN30Index | null> {
        try {
            const latestStock = await StockHistoryModel.findOne({
                symbol: { $in: ['VN30', 'VCB'] },
                interval: '1m'
            })
                .sort({ date: -1 })
                .lean()
                .exec();

            if (!latestStock) return null;

            const prices = (latestStock as any).prices || [];
            if (prices.length === 0) return null;

            const latestPrice = prices[prices.length - 1];
            const firstPrice = prices[0];
            const change = latestPrice.close - firstPrice.open;
            const changePercent = firstPrice.open > 0 ? (change / firstPrice.open) * 100 : 0;

            return {
                index: parseFloat(latestPrice.close.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                changePercent: parseFloat(changePercent.toFixed(2))
            };
        } catch (error: any) {
            LoggerService.getInstance().error('Error fetching VN30 from DB', error);
            return null;
        }
    }

    private async updateStockData(symbol: string): Promise<StockData> {
        if (this.useRealData && this.vnstockService.isInitialized()) {
            try {
                const realData = await this.vnstockService.getStockPrice(symbol);
                if (realData) {
                    this.stockPriceCache.set(symbol, realData);
                    return realData;
                }
            } catch (error: any) {
                LoggerService.getInstance().warn(`Failed to fetch real data for ${symbol}`);
            }
        }

        const current = this.stockPriceCache.get(symbol);
        if (!current) return this.generateMockStockData(symbol);

        // Small random change
        const priceChange = (Math.random() - 0.5) * current.price * 0.01;
        const newPrice = Math.max(current.price + priceChange, current.price * 0.5);
        const change = newPrice - current.open;
        const changePercent = (change / current.open) * 100;

        const updated: StockData = {
            ...current,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            close: parseFloat(newPrice.toFixed(2))
        };

        this.stockPriceCache.set(symbol, updated);
        return updated;
    }

    private async updateVN30Index(): Promise<VN30Index> {
        const dbData = await this.getVN30FromDB();
        if (dbData) {
            this.vn30IndexCache = dbData;
            return dbData;
        }
        if (this.vn30IndexCache) return this.vn30IndexCache;
        return { index: 0, change: 0, changePercent: 0 };
    }

    private startMarketBroadcast(interval: number = 5000): void {
        const updateInterval = setInterval(async () => {
            await this.sendMarketUpdate();
        }, interval);
        this.updateIntervals.set('market', updateInterval);
        LoggerService.getInstance().info(`Market broadcast started with interval ${interval}ms`);
    }

    private startStockBroadcast(symbol: string, interval: number): void {
        const key = `stock:${symbol}:${interval}`;
        const updateInterval = setInterval(async () => {
            await this.sendStockUpdate(symbol);
        }, interval);
        this.updateIntervals.set(key, updateInterval);
    }

    private async sendMarketUpdate(): Promise<void> {
        const io = SocketIOService.getInstance().getSocketIO();
        if (!io) return;

        try {
            const stocks = await Promise.all(VN30_SYMBOLS.map((s) => this.updateStockData(s)));
            const vn30Index = await this.updateVN30Index();
            const sortedByChange = [...stocks].sort((a, b) => b.changePercent - a.changePercent);

            const marketUpdate: MarketUpdate = {
                vn30Index,
                stocks,
                topGainers: sortedByChange.slice(0, 5),
                topLosers: sortedByChange.slice(-5).reverse(),
                timestamp: new Date().toISOString()
            };

            io.of('/market').to('market').emit('market:update', marketUpdate);
        } catch (error: any) {
            LoggerService.getInstance().error('Error sending market update', error);
        }
    }

    private async sendStockUpdate(symbol: string): Promise<void> {
        const io = SocketIOService.getInstance().getSocketIO();
        if (!io) return;

        try {
            const stockData = await this.updateStockData(symbol);
            const stockUpdate: StockDetailUpdate = {
                symbol: stockData.symbol,
                price: stockData.price,
                change: stockData.change,
                changePercent: stockData.changePercent,
                volume: stockData.volume,
                high: stockData.high,
                low: stockData.low,
                timestamp: new Date().toISOString()
            };
            io.of('/market').to(`stock:${symbol}`).emit('stock:update', stockUpdate);
        } catch (error: any) {
            LoggerService.getInstance().error(`Error sending stock update for ${symbol}`, error);
        }
    }

    public stopAllBroadcasts(): void {
        this.updateIntervals.forEach((interval, key) => {
            clearInterval(interval);
            LoggerService.getInstance().info(`Stopped broadcast for ${key}`);
        });
        this.updateIntervals.clear();
    }

    public stopStockBroadcast(symbol: string, interval: number): void {
        const key = `stock:${symbol}:${interval}`;
        const updateInterval = this.updateIntervals.get(key);
        if (updateInterval) {
            clearInterval(updateInterval);
            this.updateIntervals.delete(key);
        }
    }
}

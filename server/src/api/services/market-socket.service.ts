import SocketIOService from './socketio.service.js';
import LoggerService from './logger.service.js';
import VNStockService from './vnstock.service.js';
import StockDataModel from '@/models/stock-data.model';

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
    'ACB',
    'BCM',
    'BID',
    'BVH',
    'CTG',
    'FPT',
    'GAS',
    'GVR',
    'HDB',
    'HPG',
    'KDH',
    'MBB',
    'MSN',
    'MWG',
    'NVL',
    'PDR',
    'PLX',
    'POW',
    'SAB',
    'SSI',
    'STB',
    'TCB',
    'TPB',
    'VCB',
    'VHM',
    'VIB',
    'VIC',
    'VJC',
    'VNM',
    'VPB'
];

export default class MarketSocketService {
    private static instance: MarketSocketService;
    private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
    private stockPriceCache: Map<string, StockData> = new Map();
    private vn30IndexCache: VN30Index | null = null;
    private vnstockService: VNStockService;
    private useRealData: boolean = true; // Flag to enable/disable real data

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

        // Initialize stock price cache
        this.initializeStockCache();

        // Handle market room connections (no authentication required for public market data)
        io.of('/market').on('connection', (socket) => {
            LoggerService.getInstance().info(`Client connected to market: ${socket.id}`);

            // Subscribe to market updates
            socket.on('subscribe:market', async () => {
                socket.join('market');
                LoggerService.getInstance().info(
                    `Client ${socket.id} subscribed to market updates`
                );

                // Send initial data
                await this.sendMarketUpdate();

                // Start broadcasting if not already started
                if (!this.updateIntervals.has('market')) {
                    this.startMarketBroadcast();
                }
            });

            // Subscribe to specific stock updates
            socket.on('subscribe:stock', async (data: { symbol: string; interval?: number }) => {
                const { symbol, interval = 15000 } = data;
                const room = `stock:${symbol.toUpperCase()}`;
                socket.join(room);
                LoggerService.getInstance().info(
                    `Client ${socket.id} subscribed to ${symbol} with interval ${interval}ms`
                );

                // Send initial stock data
                await this.sendStockUpdate(symbol.toUpperCase());

                // Start broadcasting for this stock if not already started
                const key = `stock:${symbol.toUpperCase()}:${interval}`;
                if (!this.updateIntervals.has(key)) {
                    this.startStockBroadcast(symbol.toUpperCase(), interval);
                }
            });

            // Unsubscribe from market updates
            socket.on('unsubscribe:market', () => {
                socket.leave('market');
                LoggerService.getInstance().info(
                    `Client ${socket.id} unsubscribed from market updates`
                );
            });

            // Unsubscribe from stock updates
            socket.on('unsubscribe:stock', (data: { symbol: string }) => {
                const { symbol } = data;
                const room = `stock:${symbol.toUpperCase()}`;
                socket.leave(room);
                LoggerService.getInstance().info(`Client ${socket.id} unsubscribed from ${symbol}`);
            });

            socket.on('disconnect', () => {
                LoggerService.getInstance().info(`Client disconnected from market: ${socket.id}`);
            });
        });

        LoggerService.getInstance().info('Market Socket Service initialized');
    }

    private async initializeStockCache(): Promise<void> {
        try {
            // Load stock data from MongoDB
            const stocks = await StockDataModel.find({
                symbol: { $in: VN30_SYMBOLS }
            })
                .sort({ date: -1 })
                .lean()
                .exec();

            // Group by symbol and get latest for each
            const latestBySymbol = new Map<string, any>();
            for (const stock of stocks) {
                if (!latestBySymbol.has(stock.symbol)) {
                    latestBySymbol.set(stock.symbol, stock);
                }
            }

            // Populate cache with real data
            for (const [symbol, stockData] of latestBySymbol) {
                this.stockPriceCache.set(symbol, {
                    symbol: stockData.symbol,
                    price: stockData.price || stockData.close || 0,
                    change: stockData.change || 0,
                    changePercent: stockData.changePercent || 0,
                    volume: stockData.volume || 0,
                    high: stockData.high || 0,
                    low: stockData.low || 0,
                    open: stockData.open || 0,
                    close: stockData.close || stockData.price || 0
                });
            }

            // Fill missing symbols with mock data
            VN30_SYMBOLS.forEach((symbol) => {
                if (!this.stockPriceCache.has(symbol)) {
                    this.stockPriceCache.set(symbol, this.generateStockData(symbol));
                }
            });

            LoggerService.getInstance().info(`Stock cache initialized with ${latestBySymbol.size} real stocks`);
        } catch (error) {
            LoggerService.getInstance().error('Error initializing stock cache from MongoDB, using mock data', error as any);
            // Fallback to mock data
            VN30_SYMBOLS.forEach((symbol) => {
                this.stockPriceCache.set(symbol, this.generateStockData(symbol));
            });
        }

        // Initialize VN30 index from MongoDB
        this.vn30IndexCache = await this.getVN30FromMongoDB();
    }

    private generateStockData(symbol: string): StockData {
        const basePrice = Math.random() * 100000 + 10000;
        const change = (Math.random() - 0.5) * 5000;
        const changePercent = (change / basePrice) * 100;

        return {
            symbol,
            price: Math.round(basePrice),
            change: Math.round(change),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: Math.round(Math.random() * 10000000),
            high: Math.round(basePrice + Math.abs(change)),
            low: Math.round(basePrice - Math.abs(change)),
            open: Math.round(basePrice - change / 2),
            close: Math.round(basePrice)
        };
    }

    private async updateStockData(symbol: string): Promise<StockData> {
        // Try to fetch real data if enabled
        if (this.useRealData && this.vnstockService.isInitialized()) {
            try {
                const realData = await this.vnstockService.getStockPrice(symbol);
                if (realData) {
                    this.stockPriceCache.set(symbol, realData);
                    return realData;
                }
            } catch (error: any) {
                LoggerService.getInstance().warn(
                    `Failed to fetch real data for ${symbol}, using mock data`,
                    error
                );
            }
        }

        // Fallback to mock data generation
        const current = this.stockPriceCache.get(symbol);
        if (!current) {
            return this.generateStockData(symbol);
        }

        // Small random change based on current price
        const priceChange = (Math.random() - 0.5) * current.price * 0.01; // 1% max change
        const newPrice = Math.max(current.price + priceChange, current.price * 0.5); // Don't drop below 50%
        const change = newPrice - current.open;
        const changePercent = (change / current.open) * 100;

        const updated: StockData = {
            ...current,
            price: Math.round(newPrice),
            change: Math.round(change),
            changePercent: parseFloat(changePercent.toFixed(2)),
            volume: current.volume + Math.round(Math.random() * 1000000),
            high: Math.max(current.high, Math.round(newPrice)),
            low: Math.min(current.low, Math.round(newPrice)),
            close: Math.round(newPrice)
        };

        this.stockPriceCache.set(symbol, updated);
        return updated;
    }

    private async getVN30FromMongoDB(): Promise<VN30Index | null> {
        try {
            // Import StockTicksModel for tick queries
            const StockTicksModel = (await import('@/models/stock-ticks.model')).default;

            // Get current time for Vietnam timezone (UTC+7)
            // Server runs in UTC (Docker), so we need to add 7 hours
            const now = new Date();
            const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
            const currentHour = vietnamTime.getUTCHours().toString().padStart(2, '0');
            const currentMinute = vietnamTime.getUTCMinutes().toString().padStart(2, '0');
            const timePattern = `${currentHour}:${currentMinute}`;

            // Find latest date from any stock (VCB as reference)
            const latestStock = await StockDataModel.findOne({
                symbol: { $in: ['VN30', 'VCB'] }
            })
                .sort({ date: -1 })
                .select('date symbol price open close')
                .lean()
                .exec();

            if (!latestStock) {
                return null;
            }

            const latestDate = (latestStock as any).date;

            // Try VN30 ticks first, then VCB as proxy
            let tick = await StockTicksModel.findOne({
                symbol: 'VN30',
                date: latestDate,
                time: { $regex: timePattern }
            }).lean().exec();

            if (!tick) {
                tick = await StockTicksModel.findOne({
                    symbol: 'VCB',
                    date: latestDate,
                    time: { $regex: timePattern }
                }).lean().exec();
            }

            // Fallback to latest tick of the day
            if (!tick) {
                tick = await StockTicksModel.findOne({
                    symbol: { $in: ['VN30', 'VCB'] },
                    date: latestDate
                })
                    .sort({ time: -1 })
                    .lean()
                    .exec();
            }

            if (tick) {
                const openPrice = (latestStock as any).open || (tick as any).price;
                const currentPrice = (tick as any).price;
                const change = currentPrice - openPrice;
                const changePercent = openPrice > 0 ? (change / openPrice) * 100 : 0;

                return {
                    index: parseFloat(currentPrice.toFixed(2)),
                    change: parseFloat(change.toFixed(2)),
                    changePercent: parseFloat(changePercent.toFixed(2))
                };
            }

            // Final fallback: use stock_data close price
            if (latestStock) {
                const stock = latestStock as any;
                const price = stock.close || stock.price || 0;
                return {
                    index: parseFloat(price.toFixed(2)),
                    change: stock.change || 0,
                    changePercent: stock.changePercent || 0
                };
            }

            return null;
        } catch (error: any) {
            LoggerService.getInstance().error('Error fetching VN30 from MongoDB', error);
            return null;
        }
    }

    private async updateVN30Index(): Promise<VN30Index> {
        // Fetch VN30 data from MongoDB matching current minute
        const mongoData = await this.getVN30FromMongoDB();

        if (mongoData) {
            this.vn30IndexCache = mongoData;
            return mongoData;
        }

        // Fallback: if we have cache, return it
        if (this.vn30IndexCache) {
            return this.vn30IndexCache;
        }

        // Last resort: return a default value
        return {
            index: 0,
            change: 0,
            changePercent: 0
        };
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
        LoggerService.getInstance().info(
            `Stock broadcast started for ${symbol} with interval ${interval}ms`
        );
    }

    private async sendMarketUpdate(): Promise<void> {
        const io = SocketIOService.getInstance().getSocketIO();
        if (!io) return;

        try {
            // Update all stocks in parallel
            const stockPromises = VN30_SYMBOLS.map((symbol) => this.updateStockData(symbol));
            const stocks = await Promise.all(stockPromises);

            // Update VN30 index
            const vn30Index = await this.updateVN30Index();

            // Calculate top gainers and losers
            const sortedByChange = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
            const topGainers = sortedByChange.slice(0, 5);
            const topLosers = sortedByChange.slice(-5).reverse();

            const marketUpdate: MarketUpdate = {
                vn30Index,
                stocks,
                topGainers,
                topLosers,
                timestamp: new Date().toISOString()
            };

            io.of('/market').to('market').emit('market:update', marketUpdate);
            LoggerService.getInstance().debug('Market update sent to clients');
        } catch (error: any) {
            LoggerService.getInstance().error('Error sending market update', error);
        }
    }

    private async sendStockUpdate(symbol: string): Promise<void> {
        const io = SocketIOService.getInstance().getSocketIO();
        if (!io) return;

        try {
            const stockData = await this.updateStockData(symbol);
            const room = `stock:${symbol}`;

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

            io.of('/market').to(room).emit('stock:update', stockUpdate);
            LoggerService.getInstance().debug(`Stock update sent for ${symbol}`);
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
            LoggerService.getInstance().info(`Stopped broadcast for ${key}`);
        }
    }
}

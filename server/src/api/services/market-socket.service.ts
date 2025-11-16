import SocketIOService from './socketio.service.js';
import LoggerService from './logger.service.js';
import VnstockService from './vnstock.service.js';

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
    'ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
    'KDH', 'MBB', 'MSN', 'MWG', 'NVL', 'PDR', 'PLX', 'POW', 'SAB', 'SSI',
    'STB', 'TCB', 'TPB', 'VCB', 'VHM', 'VIB', 'VIC', 'VJC', 'VNM', 'VPB'
];

export default class MarketSocketService {
    private static instance: MarketSocketService;
    private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
    private stockPriceCache: Map<string, StockData> = new Map();
    private vn30IndexCache: VN30Index | null = null;
    private vnstockService: VnstockService;
    private useRealData: boolean = true; // Flag to use real data from Python server

    private constructor() {
        this.vnstockService = VnstockService.getInstance();
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
            socket.on('subscribe:market', () => {
                socket.join('market');
                LoggerService.getInstance().info(`Client ${socket.id} subscribed to market updates`);
                
                // Send initial data
                this.sendMarketUpdate();
                
                // Start broadcasting if not already started
                if (!this.updateIntervals.has('market')) {
                    this.startMarketBroadcast();
                }
            });

            // Subscribe to specific stock updates
            socket.on('subscribe:stock', (data: { symbol: string; interval?: number }) => {
                const { symbol, interval = 15000 } = data;
                const room = `stock:${symbol.toUpperCase()}`;
                socket.join(room);
                LoggerService.getInstance().info(
                    `Client ${socket.id} subscribed to ${symbol} with interval ${interval}ms`
                );

                // Send initial stock data
                this.sendStockUpdate(symbol.toUpperCase());

                // Start broadcasting for this stock if not already started
                const key = `stock:${symbol.toUpperCase()}:${interval}`;
                if (!this.updateIntervals.has(key)) {
                    this.startStockBroadcast(symbol.toUpperCase(), interval);
                }
            });

            // Unsubscribe from market updates
            socket.on('unsubscribe:market', () => {
                socket.leave('market');
                LoggerService.getInstance().info(`Client ${socket.id} unsubscribed from market updates`);
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

    private initializeStockCache(): void {
        // Check if Python server is available
        this.vnstockService.testConnection().then((isConnected) => {
            if (isConnected) {
                LoggerService.getInstance().info('Using real data from vnstock Python server');
                // Load real data from Python server
                this.loadRealMarketData();
            } else {
                LoggerService.getInstance().warn('Python server not available, using mock data');
                this.useRealData = false;
                this.loadMockData();
            }
        }).catch(() => {
            LoggerService.getInstance().warn('Failed to connect to Python server, using mock data');
            this.useRealData = false;
            this.loadMockData();
        });
    }

    private loadMockData(): void {
        // Initialize cache with mock data
        VN30_SYMBOLS.forEach(symbol => {
            this.stockPriceCache.set(symbol, this.generateStockData(symbol));
        });

        // Initialize VN30 index
        this.vn30IndexCache = this.generateVN30Index();
    }

    private async loadRealMarketData(): Promise<void> {
        try {
            const marketData = await this.vnstockService.getMarketData();
            if (marketData) {
                // Update cache with real data
                marketData.stocks.forEach(stock => {
                    this.stockPriceCache.set(stock.symbol, stock);
                });
                this.vn30IndexCache = marketData.vn30Index;
                LoggerService.getInstance().info('Loaded real market data from vnstock');
            } else {
                LoggerService.getInstance().warn('Failed to load real market data, using mock data');
                this.useRealData = false;
                this.loadMockData();
            }
        } catch (error) {
            LoggerService.getInstance().error(`Error loading real market data: ${error}`);
            this.useRealData = false;
            this.loadMockData();
        }
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
            close: Math.round(basePrice),
        };
    }

    private updateStockData(symbol: string): StockData {
        // If using real data, fetch from Python server periodically
        if (this.useRealData) {
            // Use cached data but refresh it asynchronously
            this.vnstockService.getStockData(symbol).then(stockData => {
                if (stockData) {
                    this.stockPriceCache.set(symbol, stockData);
                }
            }).catch(error => {
                LoggerService.getInstance().error(`Error fetching real data for ${symbol}: ${error}`);
            });
        }

        const current = this.stockPriceCache.get(symbol);
        if (!current) {
            return this.generateStockData(symbol);
        }

        // If not using real data, simulate small changes
        if (!this.useRealData) {
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
                close: Math.round(newPrice),
            };

            this.stockPriceCache.set(symbol, updated);
            return updated;
        }

        return current;
    }

    private generateVN30Index(): VN30Index {
        const baseIndex = 1200 + Math.random() * 50;
        const change = (Math.random() - 0.5) * 20;

        return {
            index: parseFloat(baseIndex.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(((change / baseIndex) * 100).toFixed(2)),
        };
    }

    private updateVN30Index(): VN30Index {
        if (!this.vn30IndexCache) {
            return this.generateVN30Index();
        }

        const indexChange = (Math.random() - 0.5) * 2; // Small change
        const newIndex = this.vn30IndexCache.index + indexChange;
        const change = newIndex - 1200; // Assume base is 1200

        const updated: VN30Index = {
            index: parseFloat(newIndex.toFixed(2)),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(((change / 1200) * 100).toFixed(2)),
        };

        this.vn30IndexCache = updated;
        return updated;
    }

    private startMarketBroadcast(interval: number = 5000): void {
        const updateInterval = setInterval(() => {
            this.sendMarketUpdate();
        }, interval);

        this.updateIntervals.set('market', updateInterval);
        LoggerService.getInstance().info(`Market broadcast started with interval ${interval}ms`);
    }

    private startStockBroadcast(symbol: string, interval: number): void {
        const key = `stock:${symbol}:${interval}`;
        
        const updateInterval = setInterval(() => {
            this.sendStockUpdate(symbol);
        }, interval);

        this.updateIntervals.set(key, updateInterval);
        LoggerService.getInstance().info(`Stock broadcast started for ${symbol} with interval ${interval}ms`);
    }

    private sendMarketUpdate(): void {
        const io = SocketIOService.getInstance().getSocketIO();
        if (!io) return;

        // If using real data, fetch fresh data periodically
        if (this.useRealData) {
            this.vnstockService.getMarketData().then(marketData => {
                if (marketData) {
                    // Update cache
                    marketData.stocks.forEach(stock => {
                        this.stockPriceCache.set(stock.symbol, stock);
                    });
                    this.vn30IndexCache = marketData.vn30Index;

                    // Broadcast the data
                    io.of('/market').to('market').emit('market:update', marketData);
                }
            }).catch(error => {
                LoggerService.getInstance().error(`Error fetching market update: ${error}`);
            });
        } else {
            // Use mock data updates
            const stocks = VN30_SYMBOLS.map(symbol => this.updateStockData(symbol));
            const vn30Index = this.updateVN30Index();
            const sortedByChange = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
            const topGainers = sortedByChange.slice(0, 5);
            const topLosers = sortedByChange.slice(-5).reverse();

            const marketUpdate: MarketUpdate = {
                vn30Index,
                stocks,
                topGainers,
                topLosers,
                timestamp: new Date().toISOString(),
            };

            io.of('/market').to('market').emit('market:update', marketUpdate);
        }
    }

    private sendStockUpdate(symbol: string): void {
        const io = SocketIOService.getInstance().getSocketIO();
        if (!io) return;

        const stockData = this.updateStockData(symbol);
        const room = `stock:${symbol}`;

        const stockUpdate: StockDetailUpdate = {
            symbol: stockData.symbol,
            price: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            volume: stockData.volume,
            high: stockData.high,
            low: stockData.low,
            timestamp: new Date().toISOString(),
        };

        io.of('/market').to(room).emit('stock:update', stockUpdate);
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

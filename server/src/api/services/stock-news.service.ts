
import StockNewsModel from '../models/stock-news.model';
import QueueService from './queue.service';
import LoggerService from './logger.service';

class StockNewsService {
    private static instance: StockNewsService;
    private queueService: QueueService;
    private logger: any;

    private constructor() {
        this.queueService = QueueService.getInstance();
        this.logger = LoggerService.getInstance();
    }

    public static getInstance(): StockNewsService {
        if (!StockNewsService.instance) {
            StockNewsService.instance = new StockNewsService();
        }
        return StockNewsService.instance;
    }

    /**
     * Get news for a symbol (returns last 7 days for UI)
     * Triggers sync if data is missing in the last 30 days window.
     * @param symbol Stock symbol or 'MARKET'
     */
    public async getNews(symbol: string) {
        try {
            const upperSymbol = symbol.toUpperCase();

            // 1. Trigger Async Check & Sync (Fire and Forget)
            this.queueService.ensureNewsForLast30Days(upperSymbol)
                .catch(err => this.logger.error(`[NewsService] Background sync failed: ${err.message}`));

            // 2. Return whatever we have for the last 30 days (User requirement)
            const today = new Date();
            const datesToReturn: string[] = [];
            for (let i = 0; i < 30; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                datesToReturn.push(d.toISOString().split('T')[0]);
            }

            const docs = await StockNewsModel.find({
                symbol: upperSymbol,
                date: { $in: datesToReturn }
            }).sort({ date: -1 });

            // Transform to easier structure if needed, or return raw docs
            // UI expects grouped by date or flat list? 
            // Let's return raw list of daily objects, client can flatmap if needed.
            return docs;

        } catch (error: any) {
            this.logger.error(`[NewsService] Error getting news for ${symbol}: ${error.message}`);
            return [];
        }
    }
}

export default StockNewsService;

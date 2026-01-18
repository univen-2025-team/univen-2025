import Redis from 'ioredis';
import LoggerService from './logger.service';
import { REDIS_CONFIG } from '@/configs/redis.config';

class QueueService {
    private static instance: QueueService;
    private redis: Redis;
    private logger: any;
    private readonly QUEUE_NAME = 'vnstock_sync_queue';

    private constructor() {
        this.logger = LoggerService.getInstance();

        // Initialize Redis
        this.redis = new Redis({
            host: REDIS_CONFIG.socket.host,
            port: REDIS_CONFIG.socket.port,
            password: REDIS_CONFIG.password,
            username: REDIS_CONFIG.username
        });

        this.redis.on('error', (err) => {
            this.logger.error(`Redis Queue Error: ${err.message}`);
        });

        this.redis.on('connect', () => {
            this.logger.info('Connected to Redis for QueueService');
        });
    }

    public static getInstance(): QueueService {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    /**
     * Add a stock sync job to the queue
     * @param symbol Stock symbol
     * @param priority (Not used in simple list, but kept for interface compatibility)
     */
    public async addStockSyncJob(symbol: string, date?: string, priority: number = 0) {
        try {
            const jobData = JSON.stringify({
                symbol: symbol.toUpperCase(),
                date,
                timestamp: Date.now(),
                source: 'nodejs_queue'
            });

            // Push to the tail of the list
            await this.redis.rpush(this.QUEUE_NAME, jobData);

            this.logger.info(`[Queue] Pushed sync job for ${symbol} to ${this.QUEUE_NAME}`);
            return true;
        } catch (error: any) {
            this.logger.error(`[Queue] Failed to add job for ${symbol}: ${error.message}`);
            return false;
        }
    }

    private readonly NEWS_QUEUE_NAME = 'vnstock_news_queue';

    /**
     * Add a news sync job to the queue
     * @param symbol Stock symbol
     * @param missingDates Array of dates to fetch
     */
    public async addNewsSyncJob(symbol: string, missingDates: string[]) {
        try {
            const jobData = JSON.stringify({
                symbol: symbol.toUpperCase(),
                missing_dates: missingDates, // Snake case for Python worker
                timestamp: Date.now(),
                source: 'nodejs_queue'
            });

            await this.redis.rpush(this.NEWS_QUEUE_NAME, jobData);
            this.logger.info(`[Queue] Pushed NEWS sync job for ${symbol} (Missing: ${missingDates.length} days)`);
            return true;
        } catch (error: any) {
            this.logger.error(`[Queue] Failed to add news job for ${symbol}: ${error.message}`);
            return false;
        }
    }

    /**
     * Ensure news data exists for the last 30 days.
     * Checks MongoDB and queues only missing dates.
     */
    public async ensureNewsForLast30Days(symbol: string) {
        try {
            const datesToCheck: string[] = [];
            const today = new Date();

            // Generate list of last 30 days (YYYY-MM-DD)
            for (let i = 0; i < 30; i++) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                datesToCheck.push(d.toISOString().split('T')[0]);
            }

            // Find existing records in DB
            const StockNewsModel = require('../models/stock-news.model').default;

            const existingDocs = await StockNewsModel.find({
                symbol: symbol.toUpperCase(),
                date: { $in: datesToCheck }
            }, { date: 1 }); // Select only date field

            const existingDates = new Set(existingDocs.map((doc: any) => doc.date));

            // Identify missing dates
            const missingDates = datesToCheck.filter(date => !existingDates.has(date));

            if (missingDates.length > 0) {
                this.logger.info(`[News] ${symbol} missing ${missingDates.length}/30 days. Queueing job.`);
                await this.addNewsSyncJob(symbol, missingDates);
                return true; // Queued
            }

            return false; // No need to queue

        } catch (error: any) {
            this.logger.error(`[Queue] Error ensuring news for ${symbol}: ${error.message}`);
            return false;
        }
    }
}

export default QueueService;

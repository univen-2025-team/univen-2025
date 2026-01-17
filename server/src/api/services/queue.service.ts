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
}

export default QueueService;

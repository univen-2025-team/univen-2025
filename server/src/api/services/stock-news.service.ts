
import mongoose from 'mongoose';
import LoggerService from './logger.service';

// Direct access to market_news collection from Multi-RSS system
const MarketNewsSchema = new mongoose.Schema({}, { strict: false });
const MarketNewsModel = mongoose.models.MarketNews || mongoose.model('MarketNews', MarketNewsSchema, 'market_news');

class StockNewsService {
    private static instance: StockNewsService;
    private logger: any;

    private constructor() {
        this.logger = LoggerService.getInstance();
    }

    public static getInstance(): StockNewsService {
        if (!StockNewsService.instance) {
            StockNewsService.instance = new StockNewsService();
        }
        return StockNewsService.instance;
    }

    /**
     * Get market news from the new Multi-RSS market_news collection
     * @param symbol Stock symbol or 'MARKET' for general news
     * @param limit Number of items to return
     */
    public async getNews(symbol: string, limit: number = 50) {
        try {
            const upperSymbol = symbol.toUpperCase();

            let query: any = {};

            // For specific stock symbol, filter by matched_symbols
            if (upperSymbol !== 'MARKET' && upperSymbol !== 'ALL') {
                query.matched_symbols = upperSymbol;
            }

            // Query from market_news collection (Multi-RSS)
            const docs = await MarketNewsModel.find(query)
                .sort({ pub_date: -1, fetched_at: -1 })
                .limit(limit)
                .lean();

            // Transform to client-friendly format
            const news = docs.map((doc: any) => ({
                id: doc._id?.toString() || doc.url_hash,
                title: doc.title,
                source_link: doc.link,
                public_date: doc.pub_date,
                source: doc.source,
                source_domain: doc.domain,
                short_content: doc.summary,
                image_url: doc.thumbnail,
                full_content: doc.full_content,
                author: doc.author,
                images: doc.images || [],
                matched_symbols: doc.matched_symbols || [],
                category: doc.category,
                is_scraped: doc.is_scraped
            }));

            // Group by date for backward compatibility
            const grouped = this.groupByDate(news);

            return grouped;

        } catch (error: any) {
            this.logger.error(`[NewsService] Error getting news for ${symbol}: ${error.message}`);
            return [];
        }
    }

    /**
     * Get news by symbol and specific date
     * @param symbol Stock symbol
     * @param date Date string in YYYY-MM-DD format
     * @param limit Number of items to return
     */
    public async getNewsByDate(symbol: string, date: string, limit: number = 50) {
        try {
            const upperSymbol = symbol.toUpperCase();
            const targetDate = new Date(date);
            const startDate = new Date(targetDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(targetDate);
            endDate.setHours(23, 59, 59, 999);

            let query: any = {
                pub_date: {
                    $gte: startDate,
                    $lte: endDate
                }
            };

            // For specific stock symbol, filter by matched_symbols
            if (upperSymbol !== 'MARKET' && upperSymbol !== 'ALL') {
                query.matched_symbols = upperSymbol;
            }

            // Query from market_news collection (Multi-RSS)
            const docs = await MarketNewsModel.find(query)
                .sort({ pub_date: -1, fetched_at: -1 })
                .limit(limit)
                .lean();

            // Transform to client-friendly format
            const news = docs.map((doc: any) => ({
                id: doc._id?.toString() || doc.url_hash,
                title: doc.title,
                source_link: doc.link,
                public_date: doc.pub_date,
                source: doc.source,
                source_domain: doc.domain,
                short_content: doc.summary,
                image_url: doc.thumbnail,
                full_content: doc.full_content,
                author: doc.author,
                images: doc.images || [],
                matched_symbols: doc.matched_symbols || [],
                category: doc.category,
                is_scraped: doc.is_scraped
            }));

            return news;

        } catch (error: any) {
            this.logger.error(`[NewsService] Error getting news for ${symbol} on ${date}: ${error.message}`);
            return [];
        }
    }

    /**
     * Get news by category
     */
    public async getNewsByCategory(category: string, limit: number = 30) {
        try {
            const docs = await MarketNewsModel.find({ category })
                .sort({ pub_date: -1 })
                .limit(limit)
                .lean();

            return docs.map((doc: any) => ({
                id: doc._id?.toString() || doc.url_hash,
                title: doc.title,
                source_link: doc.link,
                public_date: doc.pub_date,
                source: doc.source,
                source_domain: doc.domain,
                short_content: doc.summary,
                image_url: doc.thumbnail,
                full_content: doc.full_content,
                matched_symbols: doc.matched_symbols || [],
                category: doc.category
            }));

        } catch (error: any) {
            this.logger.error(`[NewsService] Error getting news by category ${category}: ${error.message}`);
            return [];
        }
    }

    /**
     * Get single news article with full content
     */
    public async getNewsDetail(id: string) {
        try {
            const doc = await MarketNewsModel.findById(id).lean();
            if (!doc) return null;

            return {
                id: (doc as any)._id?.toString(),
                title: (doc as any).title,
                source_link: (doc as any).link,
                public_date: (doc as any).pub_date,
                source: (doc as any).source,
                source_domain: (doc as any).domain,
                short_content: (doc as any).summary,
                image_url: (doc as any).thumbnail,
                full_content: (doc as any).full_content,
                author: (doc as any).author,
                images: (doc as any).images || [],
                matched_symbols: (doc as any).matched_symbols || [],
                category: (doc as any).category
            };

        } catch (error: any) {
            this.logger.error(`[NewsService] Error getting news detail ${id}: ${error.message}`);
            return null;
        }
    }

    /**
     * Group news by date for backward compatibility
     */
    private groupByDate(news: any[]) {
        const grouped: { [key: string]: any } = {};

        for (const item of news) {
            const dateKey = item.public_date ?
                new Date(item.public_date).toISOString().split('T')[0] :
                'unknown';

            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    date: dateKey,
                    news: []
                };
            }
            grouped[dateKey].news.push(item);
        }

        // Convert to array sorted by date desc
        return Object.values(grouped).sort((a: any, b: any) =>
            b.date.localeCompare(a.date)
        );
    }
}

export default StockNewsService;

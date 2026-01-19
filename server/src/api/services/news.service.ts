/**
 * News Service
 * Fetches and filters news articles related to stock events
 */

import axios from 'axios';
import { addDays, subDays, format, parseISO, isWithinInterval } from 'date-fns';
import LoggerService from './logger.service';
import { VNSTOCK_API_URL } from '@/configs/vnstock.config';
import type { NewsArticle } from '@/types/learn-product.types';

const CONFIG = {
    NEWS_WINDOW_DAYS: 2,        // ±2 days from event
    MAX_ARTICLES: 5,
    MIN_RELEVANCE: 0.2,
    API_TIMEOUT: 15000
};

export default class NewsService {
    private static logger = LoggerService.getInstance();

    /**
     * Fetch news for a symbol around an event date
     */
    static async fetchForEvent(
        symbol: string,
        eventDate: string,
        windowDays: number = CONFIG.NEWS_WINDOW_DAYS
    ): Promise<NewsArticle[]> {
        try {
            const eventDateObj = parseISO(eventDate);
            const startDate = subDays(eventDateObj, windowDays);
            const endDate = addDays(eventDateObj, windowDays);

            const allNews = await this.fetchFromApi(symbol);
            const filtered = this.filterByDateWindow(allNews, startDate, endDate);
            const ranked = this.rankByRelevance(filtered, symbol);

            this.logger.info(
                `News for ${symbol} on ${eventDate}: ${ranked.length} relevant articles`
            );

            return ranked.slice(0, CONFIG.MAX_ARTICLES);
        } catch (error) {
            this.logger.error(`Failed to fetch news for ${symbol}`, error as Error);
            return [];
        }
    }

    /**
     * Fetch news from vnstock-api
     */
    private static async fetchFromApi(symbol: string): Promise<NewsArticle[]> {
        try {
            const response = await axios.get(`${VNSTOCK_API_URL}/news/${symbol}`, {
                params: { limit: 50 },
                timeout: CONFIG.API_TIMEOUT
            });

            if (!response.data?.data || !Array.isArray(response.data.data)) {
                return [];
            }

            return response.data.data.map((item: any) => this.normalizeArticle(item));
        } catch (error) {
            this.logger.warn(`News API failed for ${symbol}`);
            return [];
        }
    }

    /**
     * Normalize news article from API response
     */
    private static normalizeArticle(item: any): NewsArticle {
        let publishedAt = '';

        if (item.publishedAt) {
            publishedAt = item.publishedAt;
        } else if (item.publishedTimestamp) {
            publishedAt = format(new Date(item.publishedTimestamp), 'yyyy-MM-dd HH:mm');
        } else if (item.public_date) {
            publishedAt = format(new Date(item.public_date), 'yyyy-MM-dd HH:mm');
        }

        return {
            id: item.id || item.news_id || String(Date.now() + Math.random()),
            title: item.title || item.news_title || '',
            shortContent: item.shortContent || item.news_short_content || '',
            fullContent: item.fullContent || item.news_full_content,
            sourceLink: item.sourceLink || item.news_source_link || '',
            publishedAt,
            imageUrl: item.imageUrl || item.news_image_url
        };
    }

    /**
     * Filter news by date window
     */
    private static filterByDateWindow(
        news: NewsArticle[],
        startDate: Date,
        endDate: Date
    ): NewsArticle[] {
        return news.filter(article => {
            if (!article.publishedAt) return false;

            try {
                const articleDate = parseISO(article.publishedAt.split(' ')[0]);
                return isWithinInterval(articleDate, { start: startDate, end: endDate });
            } catch {
                return false;
            }
        });
    }

    /**
     * Calculate relevance score for an article
     */
    private static calculateRelevance(article: NewsArticle, symbol: string): number {
        const title = article.title.toLowerCase();
        const content = (article.shortContent || '').toLowerCase();
        const symbolLower = symbol.toLowerCase();

        let score = 0;

        // Symbol in title (high weight)
        if (title.includes(symbolLower)) score += 0.4;

        // Symbol in content
        if (content.includes(symbolLower)) score += 0.2;

        // Price movement keywords
        const keywords = [
            'tăng', 'giảm', 'biến động', 'kỷ lục', 'đột biến', 'bứt phá',
            'lao dốc', 'tăng trần', 'giảm sàn', 'cổ phiếu', 'chứng khoán'
        ];

        for (const keyword of keywords) {
            if (title.includes(keyword)) score += 0.1;
            if (content.includes(keyword)) score += 0.05;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Rank articles by relevance
     */
    private static rankByRelevance(
        news: NewsArticle[],
        symbol: string
    ): NewsArticle[] {
        return news
            .map(article => ({
                ...article,
                relevanceScore: this.calculateRelevance(article, symbol)
            }))
            .filter(article => (article.relevanceScore || 0) >= CONFIG.MIN_RELEVANCE)
            .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    /**
     * Batch fetch news for multiple events
     */
    static async fetchForEvents(
        symbol: string,
        eventDates: string[]
    ): Promise<Map<string, NewsArticle[]>> {
        const allNews = await this.fetchFromApi(symbol);
        const result = new Map<string, NewsArticle[]>();

        for (const eventDate of eventDates) {
            const eventDateObj = parseISO(eventDate);
            const startDate = subDays(eventDateObj, CONFIG.NEWS_WINDOW_DAYS);
            const endDate = addDays(eventDateObj, CONFIG.NEWS_WINDOW_DAYS);

            const filtered = this.filterByDateWindow(allNews, startDate, endDate);
            const ranked = this.rankByRelevance(filtered, symbol);

            result.set(eventDate, ranked.slice(0, CONFIG.MAX_ARTICLES));
        }

        return result;
    }
}


'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ExternalLink, Newspaper, Calendar, Globe, Tag, User, TrendingUp } from 'lucide-react';
import NewsDetailModal from './NewsDetailModal';

interface NewsItem {
    id?: string;
    title: string;
    short_content?: string;
    summary?: string;
    full_content?: string;
    source_link?: string;
    link?: string;
    image_url?: string;
    thumbnail?: string;
    public_date?: string;
    pub_date?: string;
    source?: string;
    source_domain?: string;
    domain?: string;
    author?: string;
    category?: string;
    matched_symbols?: string[];
    images?: string[];
}

interface DailyNews {
    date: string;
    news: NewsItem[];
}

interface NewsFeedProps {
    symbol: string;
    className?: string;
    filterRange?: { start: Date; end: Date } | null;
    onClearFilter?: () => void;
}

const NewsFeed: React.FC<NewsFeedProps> = ({ symbol, className = '', filterRange, onClearFilter }) => {
    const [newsData, setNewsData] = useState<DailyNews[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [displayLimit, setDisplayLimit] = useState(5);

    useEffect(() => {
        const fetchNews = async () => {
            if (!symbol) return;
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/market/news/${symbol}`);
                if (response.data && response.data.metadata && response.data.metadata.news) {
                    setNewsData(response.data.metadata.news);
                } else {
                    setNewsData([]);
                }
            } catch (err: any) {
                console.error('Failed to fetch news:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [symbol]);

    // Derived filtered content
    const filteredContent = React.useMemo(() => {
        if (!filterRange || !newsData.length) return newsData;

        const start = new Date(filterRange.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(filterRange.end);
        end.setHours(23, 59, 59, 999);

        return newsData.map(day => {
            const dayDate = new Date(day.date);
            dayDate.setHours(12, 0, 0, 0);

            if (dayDate >= start && dayDate <= end) {
                return day;
            }
            return null;
        }).filter(Boolean) as DailyNews[];

    }, [newsData, filterRange]);

    // Helper to get image URL
    const getImageUrl = (item: NewsItem) => item.image_url || item.thumbnail;

    // Helper to get description
    const getDescription = (item: NewsItem) => item.short_content || item.summary || '';

    // Helper to get domain
    const getDomain = (item: NewsItem) => {
        if (item.domain) return item.domain;
        if (item.source_domain) return item.source_domain;
        if (item.source && item.source !== 'Google News') return item.source;

        const link = item.source_link || item.link;
        if (link) {
            try {
                return new URL(link).hostname.replace('www.', '');
            } catch (e) { return 'Nguồn tin'; }
        }
        return 'Nguồn tin';
    };

    // Helper to get category label
    const getCategoryLabel = (category?: string) => {
        switch (category) {
            case 'stock': return 'Chứng khoán';
            case 'finance': return 'Tài chính';
            case 'business': return 'Kinh doanh';
            case 'realestate': return 'Bất động sản';
            default: return category || '';
        }
    };

    // Helper to get category color
    const getCategoryColor = (category?: string) => {
        switch (category) {
            case 'stock': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'finance': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'business': return 'bg-purple-50 text-purple-600 border-purple-200';
            case 'realestate': return 'bg-orange-50 text-orange-600 border-orange-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 bg-white/50 rounded-xl ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const allNewsItems = (filteredContent || newsData)
        .flatMap(day => day.news.map(item => ({ ...item, date: day.date })))
        .sort((a, b) => new Date(b.public_date || b.pub_date || b.date).getTime() - new Date(a.public_date || a.pub_date || a.date).getTime());

    const displayedNews = allNewsItems.slice(0, displayLimit);
    const hasMore = allNewsItems.length > displayLimit;

    if (allNewsItems.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center p-12 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-dashed border-gray-200 ${className}`}>
                {filterRange && (
                    <div className="mb-4 text-center">
                        <p className="text-sm font-medium text-blue-600 mb-2">
                            Lọc từ {filterRange.start.toLocaleDateString('vi-VN')} - {filterRange.end.toLocaleDateString('vi-VN')}
                        </p>
                        <button
                            onClick={onClearFilter}
                            className="text-xs text-gray-500 underline hover:text-gray-800"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
                <Newspaper className="w-12 h-12 mb-3 opacity-40" />
                <p className="text-sm font-medium">Chưa có tin tức nào {filterRange ? 'trong khoảng thời gian này' : 'gần đây'}</p>
                <p className="text-xs text-gray-400 mt-1">Tin tức sẽ được cập nhật tự động</p>
            </div>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {filterRange && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between mb-4 animate-fade-in">
                    <span className="text-sm text-blue-700 font-medium">
                        Đang lọc: {filterRange.start.toLocaleDateString('vi-VN')} - {filterRange.end.toLocaleDateString('vi-VN')}
                    </span>
                    <button
                        onClick={onClearFilter}
                        className="text-xs bg-white text-blue-600 px-2 py-1 rounded border border-blue-100 font-medium hover:bg-blue-50"
                    >
                        Xóa lọc
                    </button>
                </div>
            )}

            {displayedNews.map((item, idx) => (
                <div
                    key={item.id || idx}
                    onClick={() => setSelectedNews(item)}
                    className="group flex gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer"
                >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-24 h-20 rounded-lg overflow-hidden bg-gray-100">
                        {getImageUrl(item) ? (
                            <img
                                src={getImageUrl(item)}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Newspaper className="w-8 h-8" />
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                            {/* Meta Tags */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                {/* Domain */}
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                    <Globe className="w-2.5 h-2.5" />
                                    {getDomain(item)}
                                </span>

                                {/* Date */}
                                <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {new Date(item.public_date || item.pub_date || (item as any).date).toLocaleDateString('vi-VN')}
                                </span>

                                {/* Category */}
                                {item.category && (
                                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                                        {getCategoryLabel(item.category)}
                                    </span>
                                )}
                            </div>

                            {/* Title */}
                            <h5 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
                                {item.title}
                            </h5>

                            {/* Description */}
                            {getDescription(item) && (
                                <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">
                                    {getDescription(item)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {hasMore && (
                <div className="text-center pt-2">
                    <button
                        onClick={() => setDisplayLimit(prev => prev + 5)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        Xem thêm tin tức
                    </button>
                </div>
            )}

            <NewsDetailModal
                isOpen={!!selectedNews}
                newsItem={selectedNews}
                onClose={() => setSelectedNews(null)}
            />
        </div>
    );
};

export default NewsFeed;

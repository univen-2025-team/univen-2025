
'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ExternalLink, Newspaper, Calendar } from 'lucide-react';
import NewsDetailModal from './NewsDetailModal';

interface NewsItem {
    id?: string;
    title: string;
    short_content?: string;
    full_content?: string;
    source_link?: string;
    image_url?: string;
    public_date?: string;
    source?: string;
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
                // Don't show error explicitly to user for news, just empty or log
                // setError('Không thể tải tin tức'); 
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

        // Filter valid days
        return newsData.map(day => {
            // Check if day matches
            // day.date is YYYY-MM-DD string
            const dayDate = new Date(day.date);
            dayDate.setHours(12, 0, 0, 0); // safe middle of day

            if (dayDate >= start && dayDate <= end) {
                return day;
            }
            return null;
        }).filter(Boolean) as DailyNews[]; // remove nulls

    }, [newsData, filterRange]);

    // Helper to extract source
    const getSource = (item: NewsItem) => {
        // If source exists and is not generic Google News, use it
        if (item.source && item.source !== 'Google News') return item.source;

        // Try parsing title "Title - Source"
        if (item.title && item.title.includes(' - ')) {
            const parts = item.title.split(' - ');
            const candidate = parts[parts.length - 1].trim();
            // Basic validation: shouldn't be too long
            if (candidate.length < 30) return candidate;
        }

        // Fallback to hostname
        if (item.source_link) {
            try {
                return new URL(item.source_link).hostname.replace('www.', '');
            } catch (e) { return 'Nguồn tin'; }
        }
        return 'Nguồn tin';
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center p-8 bg-white/50 rounded-xl ${className}`}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Filter out days with no news effectively
    const daysWithNews = (filteredContent || newsData).filter(day => day.news && day.news.length > 0);

    if (daysWithNews.length === 0) {
        return (
            <div className={`flex flex-col items-center justify-center p-8 text-gray-500 bg-white/50 rounded-xl border border-dashed border-gray-200 ${className}`}>
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
                <Newspaper className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-sm">Chưa có tin tức nào {filterRange ? 'trong khoảng thời gian này' : 'gần đây'}</p>
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

            {daysWithNews.map((day) => (
                <div key={day.date} className="relative pl-4 border-l-2 border-gray-100 last:border-0 pb-0">
                    {/* Date Header */}
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-50 border-2 border-blue-500 box-content"></div>
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center pt-0.5 transform -translate-y-1">
                        <Calendar className="w-3.5 h-3.5 mr-2 text-blue-500" />
                        {new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </h4>

                    <div className="space-y-3">
                        {day.news.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedNews(item)}
                                className="group block bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex justify-between items-start gap-3">
                                    <h5 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                                        {item.title}
                                    </h5>
                                    <div className="flex-shrink-0">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt="" className="w-16 h-16 object-cover rounded-md bg-gray-50" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                                <Newspaper className="w-8 h-8 opacity-50" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {item.short_content && (
                                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                                        {item.short_content}
                                    </p>
                                )}
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {getSource(item)}
                                    </span>
                                    <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-blue-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <NewsDetailModal
                isOpen={!!selectedNews}
                newsItem={selectedNews}
                onClose={() => setSelectedNews(null)}
            />
        </div>
    );
};

export default NewsFeed;

'use client';

import { useEffect, useState } from 'react';
import { fetchStockNews } from '@/lib/services/marketService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, ExternalLink, RefreshCcw, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

// ... (existing constants)

// ... imports
import NewsDetailModal from '@/components/market/NewsDetailModal';

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const ITEMS_PER_PAGE = 10;

    const loadNews = async () => {
        try {
            setLoading(true);
            // Fetch general market news
            const result = await fetchStockNews('MARKET');
            if (result.success && result.data && Array.isArray(result.data)) {
                setNews(result.data);
            }
        } catch (error) {
            console.error("Failed to load market news", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadNews();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadNews();
        setCurrentPage(1); // Reset to page 1 on refresh
    };

    // ... (Loading state check remains same)

    // Featured news (first item)
    const featuredNews = news[0];
    const otherNews = news.slice(1);

    const totalPages = Math.ceil(otherNews.length / ITEMS_PER_PAGE);
    const paginatedNews = otherNews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8 pb-10 animate-fade-in relative">
            {/* Header */}
            {/* ... (Header remains same) */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Newspaper className="w-8 h-8 text-blue-600" />
                        Tin Tức Thị Trường
                    </h1>
                    <p className="text-gray-500 mt-1">Cập nhật thông tin tài chính - chứng khoán mới nhất</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-70"
                >
                    <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Làm mới</span>
                </button>
            </div>

            {news.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Không có tin tức nào</h3>
                    <p className="text-gray-500">Hiện tại chưa có tin tức mới, vui lòng thử lại sau.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Featured News */}
                        {featuredNews && currentPage === 1 && (
                            <div
                                onClick={() => setSelectedNews(featuredNews)}
                                className="group block relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
                            >
                                <div className="aspect-video relative bg-gray-100">
                                    {featuredNews.image_url ? (
                                        <img
                                            src={featuredNews.image_url}
                                            alt={featuredNews.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                                            <TrendingUp className="w-16 h-16 text-blue-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg">
                                            Tin nổi bật
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-6 bg-white relative">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                        <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-100">
                                            {featuredNews.source || 'VNStock'}
                                        </Badge>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(featuredNews.publishDate!).toLocaleDateString('vi-VN', {
                                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors leading-tight">
                                        {featuredNews.title}
                                    </h2>
                                    <p className="text-gray-600 line-clamp-3 mb-4">
                                        {featuredNews.description || 'Xem chi tiết tin tức này trên trang nguồn...'}
                                    </p>
                                    <div className="flex items-center text-blue-600 font-medium group-hover:underline">
                                        Đọc tiếp <ExternalLink className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent News Grid */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-500" />
                                Tin Mới Nhất
                            </h3>
                            <div className="grid gap-4">
                                {paginatedNews.map((item, index) => (
                                    <div
                                        key={item.id || index}
                                        onClick={() => setSelectedNews(item)}
                                        className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group cursor-pointer"
                                    >
                                        <div className="w-full sm:w-48 h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                                                    <Newspaper className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="secondary" className="text-xs font-normal">
                                                        {item.source}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">
                                                        {item.publishDate ? new Date(item.publishDate).toLocaleDateString('vi-VN') : ''}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                                                    {item.title}
                                                </h4>
                                                <p className="text-sm text-gray-500 line-clamp-2">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-8">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm font-medium text-gray-600">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage >= totalPages}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Trending / Categories */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    Xu Hướng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-gray-500 italic">Tính năng đang phát triển...</p>
                            </CardContent>
                        </Card>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center">
                            <h3 className="font-bold text-xl mb-2">Bạn cần hỗ trợ?</h3>
                            <p className="text-blue-100 text-sm mb-4">Chat với trợ lý AI để phân tích tin tức chuyên sâu.</p>
                            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors text-sm shadow-lg">
                                Chat Ngay
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <NewsDetailModal
                isOpen={!!selectedNews}
                newsItem={selectedNews}
                onClose={() => setSelectedNews(null)}
            />
        </div>
    );
}

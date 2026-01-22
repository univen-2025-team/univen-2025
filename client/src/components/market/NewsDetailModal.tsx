'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles, X, Calendar, Newspaper, ArrowRight, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_URL } from '@/config/app';

interface NewsItem {
    id?: string;
    title: string;
    short_content?: string;
    full_content?: string;
    source_link?: string;
    source?: string;
    source_domain?: string;
    public_date?: string;
    image_url?: string;
    images?: string[];
}

interface NewsDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    newsItem: NewsItem | null;
}

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ isOpen, onClose, newsItem }) => {
    const [summary, setSummary] = useState<string | null>(null);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [summaryError, setSummaryError] = useState<string | null>(null);

    // Reset state when modal closes or newsItem changes
    useEffect(() => {
        if (!isOpen || !newsItem) {
            setSummary(null);
            setSummaryError(null);
            setIsLoadingSummary(false);
        }
    }, [isOpen, newsItem]);

    if (!newsItem) return null;

    const sourceName = newsItem.source_domain || (newsItem.source && newsItem.source !== 'Google News' ? newsItem.source : 'Nguồn tin');

    const handleSummarize = async () => {
        // Check if we have content or URL
        if (!newsItem.source_link && !newsItem.full_content && !newsItem.short_content) {
            setSummaryError('Không có nội dung hoặc link bài viết để tóm tắt');
            return;
        }

        setIsLoadingSummary(true);
        setSummaryError(null);
        setSummary(null);

        try {
            // Prepare request body - prioritize using existing content
            const requestBody: any = {
                title: newsItem.title
            };

            // Use full_content or short_content if available (prefer full_content)
            if (newsItem.full_content) {
                // Extract text from HTML if needed
                const textContent = newsItem.full_content
                    .replace(/<[^>]+>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();
                
                if (textContent.length > 100) {
                    requestBody.content = textContent;
                    console.log('Using full_content from news item:', textContent.length, 'chars');
                }
            } else if (newsItem.short_content && newsItem.short_content.length > 100) {
                requestBody.content = newsItem.short_content;
                console.log('Using short_content from news item:', newsItem.short_content.length, 'chars');
            }

            // Add URL as fallback if content extraction fails
            if (newsItem.source_link) {
                requestBody.url = newsItem.source_link;
            }

            console.log('Calling summarize API:', `${API_URL}/market/news/summarize`);
            console.log('Request body:', { 
                ...requestBody, 
                content: requestBody.content ? `${requestBody.content.substring(0, 100)}...` : undefined 
            });

            const response = await fetch(`${API_URL}/market/news/summarize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status, response.statusText);

            if (!response.ok) {
                let errorMessage = 'Không thể tóm tắt bài viết';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                    console.error('Error response:', errorData);
                } catch (e) {
                    const errorText = await response.text();
                    console.error('Error text:', errorText);
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Response data:', data);

            // Handle different response formats
            if (data.metadata?.summary) {
                setSummary(data.metadata.summary);
            } else if (data.summary) {
                setSummary(data.summary);
            } else if (data.data?.summary) {
                setSummary(data.data.summary);
            } else {
                console.error('Unexpected response format:', data);
                throw new Error('Không nhận được nội dung tóm tắt từ server');
            }
        } catch (error: any) {
            console.error('Error summarizing news:', error);
            setSummaryError(error.message || 'Đã xảy ra lỗi khi tóm tắt bài viết. Vui lòng thử lại sau.');
        } finally {
            setIsLoadingSummary(false);
        }
    };
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-2 shrink-0 border-b border-gray-100 bg-white/50 z-10">
                    <div className="pr-8 w-full">
                        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                <Newspaper className="w-3 h-3 mr-1.5" />
                                {sourceName}
                            </span>
                            <span className="flex items-center text-gray-400">
                                <Calendar className="w-3 h-3 mr-1.5" />
                                {newsItem.public_date ? new Date(newsItem.public_date).toLocaleDateString('vi-VN', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                }) : ''}
                            </span>
                        </div>
                        <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                            {newsItem.title}
                        </DialogTitle>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100/80 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Hero Image */}
                    {newsItem.image_url && (
                        <div className="w-full h-64 md:h-80 relative">
                            <img
                                src={newsItem.image_url}
                                alt={newsItem.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-50"></div>
                        </div>
                    )}

                    <div className="p-6 md:p-8 pt-4">
                        {/* AI Summary Section */}
                        {summary && (
                            <div className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-indigo-600 fill-indigo-200" />
                                    <h3 className="text-lg font-semibold text-indigo-900">Tóm tắt với AI</h3>
                                </div>
                                <div
                                    className="news-summary-markdown text-gray-700 leading-relaxed
                                        prose prose-sm max-w-none prose-p:my-2 prose-p:first:mt-0 prose-p:last:mb-0
                                        prose-strong:text-indigo-800 prose-strong:font-semibold [&_blockquote>p]:my-0"
                                >
                                    <ReactMarkdown
                                        components={{
                                            blockquote: ({ children, ...props }) => (
                                                <blockquote
                                                    {...props}
                                                    className="my-3 py-2 px-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-md text-gray-800 font-medium"
                                                >
                                                    {children}
                                                </blockquote>
                                            ),
                                        }}
                                    >
                                        {summary}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {summaryError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <span className="text-red-600 font-semibold">⚠️</span>
                                    <div>
                                        <p className="text-sm font-medium text-red-800 mb-1">Lỗi khi tóm tắt</p>
                                        <p className="text-sm text-red-700">{summaryError}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoadingSummary && (
                            <div className="mb-6 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">Đang tóm tắt bài viết...</p>
                                        <p className="text-xs text-blue-600 mt-1">Vui lòng đợi trong giây lát</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Content - Only show if we have content and no summary */}
                        {newsItem.full_content ? (
                            <div
                                className="prose prose-blue prose-lg max-w-none 
                                    prose-headings:font-bold prose-headings:text-gray-800 
                                    prose-p:text-gray-600 prose-p:leading-relaxed 
                                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                    prose-img:rounded-xl prose-img:shadow-md prose-img:w-full prose-img:object-cover
                                    [&>img]:max-h-[500px]"
                                dangerouslySetInnerHTML={{ __html: newsItem.full_content }}
                            />
                        ) : newsItem.short_content ? (
                            <div className="space-y-6">
                                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                                    {newsItem.short_content}
                                </p>
                                {/* Only show "read more" message if no summary exists */}
                                {!summary && (
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex flex-col items-center text-center gap-3">
                                        <p className="text-sm text-gray-500">
                                            Bài viết đầy đủ chưa được tải. Vui lòng xem tiếp tại nguồn gốc.
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-blue-600"
                                            onClick={() => window.open(newsItem.source_link, '_blank')}
                                        >
                                            Đọc tiếp tại {sourceName}
                                            <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : !summary ? (
                            // Only show "no content" message if we don't have summary
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 py-10">
                                <div className="bg-gray-50 p-6 rounded-full">
                                    <ExternalLink className="w-12 h-12 opacity-20" />
                                </div>
                                <p className="text-center max-w-md">
                                    Nội dung chi tiết chưa được tải hoặc không khả dụng cho tin này.
                                    <br />Vui lòng xem trực tiếp tại nguồn.
                                </p>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 backdrop-blur-sm flex justify-between items-center shrink-0 gap-4">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 md:hidden"
                    >
                        Đóng
                    </Button>

                    <div className="flex items-center gap-3 w-full md:w-auto ml-auto">
                        <Button
                            variant="outline"
                            className="flex-1 md:flex-none border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 gap-2"
                            onClick={() => window.open(newsItem.source_link, '_blank')}
                        >
                            <ExternalLink className="w-4 h-4" />
                            Xem bài gốc
                        </Button>

                        <Button
                            className="flex-1 md:flex-none bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-200 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleSummarize}
                            disabled={
                                isLoadingSummary ||
                                !(
                                    newsItem.source_link ||
                                    (newsItem.full_content &&
                                        newsItem.full_content.replace(/\s+/g, ' ').trim().length > 100) ||
                                    (newsItem.short_content && newsItem.short_content.length > 100)
                                )
                            }
                        >
                            {isLoadingSummary ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Đang tóm tắt...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 fill-white/20" />
                                    {summary ? 'Tóm tắt lại' : 'Tóm tắt với AI'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NewsDetailModal;

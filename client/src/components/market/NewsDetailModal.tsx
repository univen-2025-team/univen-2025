'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles, X, Calendar, Newspaper } from 'lucide-react';

interface NewsItem {
    id?: string;
    title: string;
    full_content?: string;
    source_link?: string;
    source?: string;
    public_date?: string;
    images?: string[];
}

interface NewsDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    newsItem: NewsItem | null;
}

const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ isOpen, onClose, newsItem }) => {
    if (!newsItem) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-2 shrink-0 border-b border-gray-100 bg-white/50">
                    <div className="pr-8">
                        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                                <Newspaper className="w-3 h-3 mr-1.5" />
                                {newsItem.source || 'Tin tức'}
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
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
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
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 py-20">
                            <div className="bg-gray-50 p-6 rounded-full">
                                <ExternalLink className="w-12 h-12 opacity-20" />
                            </div>
                            <p className="text-center max-w-md">
                                Nội dung chi tiết chưa được tải hoặc không khả dụng cho tin này.
                                <br />Vui lòng xem trực tiếp tại nguồn.
                            </p>
                        </div>
                    )}
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
                            className="flex-1 md:flex-none bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-200 gap-2"
                            onClick={() => alert("Tính năng tóm tắt AI đang phát triển!")}
                        >
                            <Sparkles className="w-4 h-4 fill-white/20" />
                            Tóm tắt AI
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default NewsDetailModal;

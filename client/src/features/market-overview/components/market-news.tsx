'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Clock, Newspaper } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    link: string;
    publishDate: string;
    source: string;
    description?: string;
}

export function MarketNews() {
    // Mock data for immediate display
    const [news, setNews] = useState<NewsItem[]>([
        {
            id: '1',
            title: 'Thị trường chứng khoán Việt Nam đón nhận dòng vốn ngoại tích cực',
            link: '#',
            publishDate: new Date().toISOString(),
            source: 'VnExpress',
            description: 'Khối ngoại quay lại mua ròng mạnh mẽ trong phiên giao dịch hôm nay, tập trung vào nhóm ngân hàng và bất động sản.'
        },
        {
            id: '2',
            title: 'VN-Index vượt mốc 1280 điểm, thanh khoản bùng nổ',
            link: '#',
            publishDate: new Date(Date.now() - 3600000).toISOString(),
            source: 'CafeF',
            description: 'Sắc xanh lan tỏa toàn thị trường với động lực chính từ nhóm VN30.'
        },
        {
            id: '3',
            title: 'Báo cáo vĩ mô: GDP quý 1/2026 tăng trưởng ấn tượng',
            link: '#',
            publishDate: new Date(Date.now() - 7200000).toISOString(),
            source: 'Vietstock',
            description: 'Số liệu mới nhất cho thấy nền kinh tế đang phục hồi mạnh mẽ vượt dự báo.'
        },
        {
            id: '4',
            title: 'Giá dầu thế giới biến động mạnh trước căng thẳng địa chính trị',
            link: '#',
            publishDate: new Date(Date.now() - 10800000).toISOString(),
            source: 'Bloomberg',
            description: 'Thị trường hàng hóa toàn cầu đang chịu áp lực lớn từ các tin tức quốc tế.'
        },
        {
            id: '5',
            title: 'Lãi suất huy động có dấu hiệu tăng nhẹ tại một số ngân hàng',
            link: '#',
            publishDate: new Date(Date.now() - 14400000).toISOString(),
            source: 'Thanh Nien',
            description: 'Nhu cầu vốn cuối năm khiến lãi suất đầu vào rục rịch tăng.'
        }
    ]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric'
        }).format(date);
    };

    return (
        <div className="bg-white rounded-xl">
            <div className="space-y-4">
                {news.map((item) => (
                    <div
                        key={item.id}
                        className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                    >
                        {/* Icon / Leading Image Placeholder */}
                        <div className="shrink-0 hidden sm:flex h-16 w-16 rounded-lg bg-gray-100 items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                            <Newspaper className="w-8 h-8 opacity-50" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                                    {item.source}
                                </span>
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(item.publishDate)}
                                </span>
                            </div>

                            <h3 className="text-sm font-bold text-gray-900 leading-snug mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">
                                {item.title}
                            </h3>

                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                                {item.description}
                            </p>
                        </div>

                        {/* Action Icon */}
                        <div className="shrink-0 flex items-center self-center sm:self-start">
                            <div className="p-2 text-gray-300 group-hover:text-indigo-600 transition-colors">
                                <ExternalLink className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View More Logic could go here */}
            <div className="mt-4 text-center">
                <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-2">
                    Xem thêm tin tức
                </button>
            </div>
        </div>
    );
}

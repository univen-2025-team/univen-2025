'use client';

import { useEffect, useState } from 'react';
import { fetchStockNews } from '@/lib/services/marketService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NewsItem {
    id: string;
    title: string;
    link: string;
    publishDate: string;
    source: string;
    description?: string;
}

export default function MarketNews() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNews = async () => {
            try {
                // Fetch news for special symbol "MARKET"
                const result = await fetchStockNews('MARKET');
                if (result.success && result.data && Array.isArray(result.data)) {
                    setNews(result.data.slice(0, 6)); // Show top 6
                }
            } catch (error) {
                console.error("Failed to load market news", error);
            } finally {
                setLoading(false);
            }
        };
        loadNews();
    }, []);

    // Display skeleton or empty state instead of null to prove UI exists
    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader><CardTitle>Market News (Loading...)</CardTitle></CardHeader>
                <CardContent>Loading news...</CardContent>
            </Card>
        );
    }

    if (news.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader><CardTitle>Market News</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">No market news available at the moment.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Market News</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {news.map((item, index) => (
                        <a
                            key={index}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="secondary" className="text-xs">{item.source || 'News'}</Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(item.publishDate).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="font-semibold line-clamp-2 mb-1">{item.title}</h3>
                            {item.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {item.description}
                                </p>
                            )}
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

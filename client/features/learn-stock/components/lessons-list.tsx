'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';
import type { Lesson } from '@/lib/types';
import { useLearnStockStore } from '../stores/useLearnStockStore';

interface LessonsListProps {
    lessons: Lesson[];
}

export default function LessonsList({ lessons }: LessonsListProps) {
    const { selectedEventDate, setSelectedEventDate } = useLearnStockStore();
    const listRef = useRef<HTMLDivElement>(null);

    // Filter lessons based on selection
    const filteredLessons = selectedEventDate
        ? lessons.filter((l) => l.event_date === selectedEventDate)
        : lessons;

    // Group lessons by event_date (for normal view)
    const groupedLessons = filteredLessons.reduce(
        (acc, lesson) => {
            const date = lesson.event_date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(lesson);
            return acc;
        },
        {} as Record<string, Lesson[]>
    );

    const sortedDates = Object.keys(groupedLessons).sort().reverse();

    // Auto-scroll when filtered
    useEffect(() => {
        if (selectedEventDate && listRef.current) {
            listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [selectedEventDate]);

    if (lessons.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-400 text-lg">
                    Click "Generate Lessons" to create learning content based on price movements
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6" ref={listRef}>
            {/* Active Filter Banner */}
            {selectedEventDate && (
                <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 ring-1 ring-violet-500/10">
                    <div>
                        <h3 className="font-semibold text-violet-400">
                            Filtered by Date: {selectedEventDate}
                        </h3>
                        <p className="text-sm text-slate-400">
                            Showing {filteredLessons.length} lessons for this event
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEventDate(null)}
                        className="gap-2 border-white/10 hover:bg-white/5 text-slate-300"
                    >
                        <X className="w-4 h-4" />
                        Clear Filter
                    </Button>
                </div>
            )}

            {/* Date Groups */}
            <div className="space-y-8">
                {sortedDates.map((date) => {
                    const dateObj = new Date(date);
                    const formattedDate = dateObj.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });

                    return (
                        <div key={date} className={selectedEventDate ? 'block' : 'block'}>
                            <div className="mb-4 pb-3 border-b border-white/10">
                                <h3 className="text-lg font-semibold text-white">
                                    {formattedDate}
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    {groupedLessons[date].length} learning{' '}
                                    {groupedLessons[date].length === 1 ? 'event' : 'events'}
                                </p>
                            </div>

                            <div className="grid gap-4">
                                {groupedLessons[date].map((lesson) => (
                                    <Link
                                        key={lesson.id}
                                        href={`/lesson/${lesson.id}`}
                                        className="block group"
                                    >
                                        <Card className="p-5 bg-white/5 hover:bg-white/10 border-white/10 ring-1 ring-white/5 transition-all duration-300 cursor-pointer hover:ring-violet-500/20 hover:border-violet-500/30 rounded-xl">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <h4 className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                                                            {lesson.lesson_title}
                                                        </h4>
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs whitespace-nowrap ${
                                                                lesson.volatility_type.includes(
                                                                    'up'
                                                                )
                                                                    ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                                                                    : 'border-red-500/50 text-red-400 bg-red-500/10'
                                                            }`}
                                                        >
                                                            {lesson.volatility_type === 'strong_up'
                                                                ? '📈 Strong Up'
                                                                : lesson.volatility_type ===
                                                                    'strong_down'
                                                                  ? '📉 Strong Down'
                                                                  : lesson.volatility_type}
                                                        </Badge>
                                                    </div>

                                                    <p className="text-sm text-slate-400 line-clamp-2">
                                                        {lesson.news_summary}
                                                    </p>

                                                    <div className="flex gap-4 mt-3 text-xs text-slate-500">
                                                        <span>
                                                            Level: {lesson.difficulty_level}
                                                        </span>
                                                        <span>
                                                            Confidence:{' '}
                                                            {(
                                                                lesson.confidence_score * 100
                                                            ).toFixed(0)}
                                                            %
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0 text-slate-400 group-hover:text-violet-400 transition-colors">
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

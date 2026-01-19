"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useLessons } from "../hooks/use-lessons";

export function LessonList() {
    const { lessons, isLoading, error } = useLessons();

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Đang tải bài học...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;
    }

    return (
        <div className="flex flex-col gap-4">
            {lessons.map((lesson) => (
                <Link href={`/dashboard/learn-trading/${lesson.id}`} key={lesson.id} className="block group">
                    <Card className="transition-colors group-hover:bg-muted/50 cursor-pointer flex flex-col md:flex-row overflow-hidden">
                        {/* Image Section */}
                        <div className="w-full md:w-48 h-48 md:h-auto relative shrink-0">
                            {lesson.image_url ? (
                                <img
                                    src={lesson.image_url}
                                    alt={lesson.lesson_title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                    <span className="text-4xl">📚</span>
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="flex flex-col flex-grow">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <div className="flex gap-2">
                                        <Badge variant={getDifficultyColor(lesson.difficulty_level)}>
                                            {lesson.difficulty_level}
                                        </Badge>
                                        <Badge variant="outline">
                                            {lesson.symbol}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(lesson.event_date).toLocaleDateString()}
                                    </div>
                                </div>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                    {lesson.lesson_title}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                    <span className="capitalize">{lesson.volatility_type.replace('_', ' ')}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {lesson.news_summary}
                                </p>
                            </CardContent>
                            <CardFooter className="mt-auto pt-0">
                                <div className="w-full text-xs text-muted-foreground flex justify-between items-center">
                                    <span>Độ tin cậy: {(lesson.confidence_score * 100).toFixed(0)}%</span>
                                    <span className="group-hover:translate-x-1 transition-transform text-primary font-medium">Xem bài học →</span>
                                </div>
                            </CardFooter>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

function getDifficultyColor(level: string): "default" | "secondary" | "destructive" | "outline" {
    switch (level.toLowerCase()) {
        case 'beginner':
            return 'secondary';
        case 'intermediate':
            return 'default';
        case 'advanced':
            return 'destructive';
        default:
            return 'outline';
    }
}

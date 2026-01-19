"use client";

import { useLesson } from "../hooks/use-lessons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface LessonDetailProps {
    id: string;
}

export function LessonDetail({ id }: LessonDetailProps) {
    const { lesson, isLoading, error } = useLesson(id);

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Đang tải bài học...</div>;
    }

    if (error || !lesson) {
        return (
            <div className="flex flex-col items-center gap-4 p-8">
                <div className="text-red-500">Lỗi: {error || "Không tìm thấy bài học"}</div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/learn-trading">Quay lại danh sách</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button asChild variant="ghost" size="icon" className="shrink-0">
                    <Link href="/dashboard/learn-trading">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{lesson.symbol}</Badge>
                        <Badge variant="secondary">{lesson.difficulty_level}</Badge>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        {lesson.lesson_title}
                    </h1>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Phân Tích</CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <ReactMarkdown>
                                {lesson.lesson_content}
                            </ReactMarkdown>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Điểm Chính</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-4 space-y-2 text-sm text-muted-foreground">
                                {lesson.key_takeaways.map((takeaway, index) => (
                                    <li key={index}>{takeaway}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Chi Tiết</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Ngày</span>
                                <span className="font-medium">{new Date(lesson.event_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Biến động</span>
                                <span className="font-medium capitalize">{lesson.volatility_type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-muted-foreground">Độ tin cậy</span>
                                <span className="font-medium">{(lesson.confidence_score * 100).toFixed(1)}%</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

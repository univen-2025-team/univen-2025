"use client";

import { LessonList } from "@/features/learn-trading/components/LessonList";

export default function LearnTradingPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Học Đầu Tư</h2>
                <p className="text-muted-foreground">
                    Nắm vững phân tích kỹ thuật với các bài học và ví dụ toàn diện.
                </p>
            </div>
            <LessonList />
        </div>
    );
}

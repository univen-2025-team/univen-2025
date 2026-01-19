"use client";

import { LessonDetail } from "@/features/learn-trading/components/LessonDetail";
import { use } from "react";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function LessonDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);

    return (
        <div className="p-6">
            <LessonDetail id={resolvedParams.id} />
        </div>
    );
}

import { useState, useEffect } from "react";
import { Lesson } from "@/lib/types";
import { LessonService } from "../services/lesson-service";

export const useLessons = () => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setIsLoading(true);
                const data = await LessonService.getLessons();
                setLessons(data);
            } catch (err) {
                setError("Failed to fetch lessons");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessons();
    }, []);

    return { lessons, isLoading, error };
};

export const useLesson = (id: string) => {
    const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchLesson = async () => {
            try {
                setIsLoading(true);
                const data = await LessonService.getLessonById(id);
                if (!data) {
                    setError("Lesson not found");
                } else {
                    setLesson(data);
                }
            } catch (err) {
                setError("Failed to fetch lesson");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLesson();
    }, [id]);

    return { lesson, isLoading, error };
};

import { mockLessons } from "@/lib/mock-data";
import { Lesson } from "@/lib/types";

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const LessonService = {
    getLessons: async (): Promise<Lesson[]> => {
        // Simulate network request
        await delay(500);
        return mockLessons;
    },

    getLessonById: async (id: string): Promise<Lesson | undefined> => {
        await delay(300);
        return mockLessons.find((lesson) => lesson.id === id);
    },
};

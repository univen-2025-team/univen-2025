import { API_URL } from '@/config/app';

/**
 * Get media URL by ID
 * Returns the full URL to fetch media from the server
 */
export const getMediaUrl = (mediaId: string | null | undefined): string | null => {
    if (!mediaId || mediaId.trim() === '') return null;

    // If it's already a full URL (e.g. Google avatar), return it as is
    if (mediaId.startsWith('http://') || mediaId.startsWith('https://')) {
        return mediaId;
    }

    return `${API_URL}/media/${mediaId}`;
};

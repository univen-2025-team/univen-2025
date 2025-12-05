import { API_URL } from '@/config/app';

/**
 * Get media URL by ID
 * Returns the full URL to fetch media from the server
 */
export const getMediaUrl = (mediaId: string | null | undefined): string | null => {
    if (!mediaId || mediaId.trim() === '') return null;
    return `${API_URL}/media/${mediaId}`;
};

import { OkResponse } from '@/response/success.response.js';
import mediaService from '@/services/media.service.js';
import { RequestWithParams } from '@/types/request.js';
import { RequestHandler, Response } from 'express';
import fs from 'fs';
import path from 'path';

export default new (class MediaController {
    /* ---------------------------------------------------------- */
    /*                      Get media by ID                       */
    /* ---------------------------------------------------------- */
    getMediaById: RequestWithParams<{ id: string }> = async (req, res, _) => {
        const { id } = req.params;
        const filePath = await mediaService.getMediaFile(id);

        // Get file extension for content type
        const ext = path.extname(filePath).toLowerCase();
        const contentTypeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml'
        };

        const contentType = contentTypeMap[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year

        // Stream the file
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    };
})();

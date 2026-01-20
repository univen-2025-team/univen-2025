import { Request, Response } from 'express';

export class ToolsController {
    // POST /api/tools/resolve-news-url
    static async resolveNewsUrl(req: Request, res: Response) {
        // Deprecated: Logic moved to Python Service (vnstock-api)
        return res.status(410).json({ error: 'This endpoint is deprecated. Use Python service.' });
    }
}

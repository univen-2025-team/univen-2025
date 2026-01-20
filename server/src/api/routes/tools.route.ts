import express from 'express';
import { ToolsController } from '../controllers/tools.controller';

const router = express.Router();

router.post('/resolve-news-url', (req, res) => {
    ToolsController.resolveNewsUrl(req, res);
});

export default router;

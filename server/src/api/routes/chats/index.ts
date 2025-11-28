import express from 'express';

import chatController from '../../controllers/chats.controller.js';

const router = express.Router();

router.post("/getChat", chatController.postChatSuggestions);

export default router;
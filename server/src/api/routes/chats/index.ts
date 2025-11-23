import express from 'express';

import chatController from '../../controllers/chats.controller.js';

const router = express.Router();

router.get('/', chatController.getChats);

router.post("/suggestions", chatController.postChatSuggestions);

export default router;
import express from 'express';

import * as chatController from '../../controllers/chats.controller.js';

const router = express.Router();

router.get('/', chatController.getChats);

export default router;
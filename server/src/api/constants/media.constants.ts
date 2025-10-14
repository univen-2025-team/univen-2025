import {
    AVATAR_BASE_PATH,
    CATEGORY_BASE_PATH,
    CATEGORY_INIT_BASE_PATH,
    SPU_BASE_PATH
} from '@/configs/media.config.js';
import { MediaMimeTypes, MediaTypes } from '@/enums/media.enum.js';
import { getRandomFilename } from '@/utils/multer.util.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import multer from 'multer';

/* ---------------------------------------------------------- */
/*                           Avatar                           */
/* ---------------------------------------------------------- */
export const avatarStorage = multer.diskStorage({
    destination: async (_req, _file, cb) => {
        await fs.mkdir(AVATAR_BASE_PATH, { recursive: true });
        cb(null, AVATAR_BASE_PATH);
    },
    filename: getRandomFilename
});

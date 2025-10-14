import multer from 'multer';
import path from 'path';
import { MediaExtensions, MediaMimeTypes } from '@/enums/media.enum.js';
import { InvalidPayloadErrorResponse } from '@/response/error.response.js';
import { Request } from 'express';
import { avatarStorage } from '@/constants/media.constants';
import { AVATAR_MAX_SIZE } from '@/configs/media.config';

function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
    /* -------------------- Check extension  -------------------- */
    const extname = path.extname(file.originalname).toLowerCase().replace('.', '');

    if (!Object.values(MediaExtensions).includes(extname as any))
        return cb(
            new InvalidPayloadErrorResponse({
                message: 'Invalid file extension'
            }) as any as Error
        );

    /* --------------------- Check mimetype --------------------- */
    const mimetype = file.mimetype;
    if (!Object.values(MediaMimeTypes).includes(mimetype as any))
        return cb(
            new InvalidPayloadErrorResponse({
                message: 'Invalid file mime type'
            }) as any as Error
        );

    cb(null, true);
}

/* ---------------------------------------------------------- */
/*                           Avatar                           */
/* ---------------------------------------------------------- */
export const uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fields: AVATAR_MAX_SIZE },
    fileFilter
});

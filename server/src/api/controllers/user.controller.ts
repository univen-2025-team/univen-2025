import { BadRequestErrorResponse } from '@/response/error.response';
import { OkResponse } from '@/response/success.response.js';
import UserService from '@/services/user.service.js';
import { RequestWithBody, RequestWithParams } from '@/types/request.js';
import { UpdateProfileSchema } from '@/validations/zod/user.zod.js';
import { RequestHandler } from 'express';

export default new (class UserController {
    /* ---------------------------------------------------------- */
    /*                         Get profile                        */
    /* ---------------------------------------------------------- */
    getProfile: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Get user profile success!',
            metadata: await UserService.getUserById(req.userId || '')
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                       Update profile                       */
    /* ---------------------------------------------------------- */
    updateProfile: RequestWithBody<UpdateProfileSchema> = async (req, res, _) => {
        new OkResponse({
            message: 'Update profile success!',
            metadata: await UserService.updateProfile(req.userId!, req.body)
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                       Upload avatar                       */
    /* ---------------------------------------------------------- */
    uploadAvatar: RequestWithBody<{ avatar: string }> = async (req, res, _) => {
        if (!req.mediaId) throw new BadRequestErrorResponse({ message: 'Upload avatar failed!' });

        new OkResponse({
            message: 'Upload avatar success!',
            metadata: await UserService.uploadAvatar(req.userId!, req.mediaId)
        }).send(res);
    };
})();

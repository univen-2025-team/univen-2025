import type { RequestWithBody } from '@/types/request.js';
import type { RequestHandler } from 'express';

import AuthService from '@/services/auth.service.js';
import { CreatedResponse, OkResponse } from '@/response/success.response.js';
import { ForbiddenErrorResponse } from '@/response/error.response.js';
import { Profile } from 'passport-google-oauth20';
import { CLIENT_URL } from '@/configs/server.config';

export default class AuthController {
    /* ------------------------------------------------------ */
    /*                        Sign up                         */
    /* ------------------------------------------------------ */
    public static signUp: RequestHandler = async (req, res, _) => {
        new CreatedResponse({
            message: 'Sign up success!',
            metadata: await AuthService.signUp(req.body)
        }).send(res);
    };

    /* ------------------------------------------------------ */
    /*                         Login                          */
    /* ------------------------------------------------------ */
    public static login: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Login success!',
            metadata: await AuthService.login(req.body)
        }).send(res);
    };

    /* ------------------------------------------------------ */
    /*                    Login with google                   */
    /* ------------------------------------------------------ */
    public static loginWithGoogle: RequestHandler = async (req, res, _) => {
        if (!req.user) throw new ForbiddenErrorResponse({ message: 'Login failed!' });

        const user = await AuthService.loginWithGoogle(req.user as Profile);

        new OkResponse({
            message: 'Login with Google success!',
            metadata: user
        }).sendAuth(res, `${CLIENT_URL}/auth/google/callback`);
    };

    /* ------------------------------------------------------ */
    /*                    Login as Guest                      */
    /* ------------------------------------------------------ */
    public static loginAsGuest: RequestHandler = async (req, res, _) => {
        new OkResponse({
            message: 'Login as guest success!',
            metadata: await AuthService.loginAsGuest()
        }).send(res);
    };

    /* ------------------------------------------------------ */
    /*                         Logout                         */
    /* ------------------------------------------------------ */
    public static logout: RequestHandler = async (req, res, _) => {
        await AuthService.logout(req.userId as string);

        new OkResponse({
            name: 'Logout',
            message: 'Logout success!'
        }).send(res);
    };

    /* ---------------------------------------------------------- */
    /*                       Forgot password                      */
    /* ---------------------------------------------------------- */
    public static forgotPassword: RequestWithBody<joiTypes.auth.ForgotPasswordSchema> = async (
        req,
        res,
        _
    ) => {
        const { email, newPassword } = req.body;

        await AuthService.forgotPassword({ email, newPassword });

        new OkResponse({
            message: 'Change password success!'
        }).send(res);
    };

    /* ------------------------------------------------------ */
    /*                  Handle refresh token                  */
    /* ------------------------------------------------------ */
    public static newToken: RequestWithBody<joiTypes.auth.NewTokenSchema> = async (req, res, _) => {
        new OkResponse({
            message: 'Get new token pair success!',
            metadata: await AuthService.newToken(req.body)
        }).send(res);
    };
}

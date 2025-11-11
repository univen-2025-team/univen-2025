import { Router } from 'express';

/* --------------------- Controllers -------------------- */
import AuthController from '@/controllers/auth.controller.js';

/* ------------------------- Joi ------------------------ */
import {
    validateForgotPassword,
    validateLogin,
    validateNewToken,
    validateSignUp
} from '@/validations/zod/auth.zod.js';

/* --------------------- Middlewares -------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import passport from 'passport';
import LoggerService from '@/services/logger.service';

const authRoute = Router();
const authRouteValidate = Router();

authRoute.post('/sign-up', validateSignUp, catchError(AuthController.signUp));

authRoute.post('/login', validateLogin, catchError(AuthController.login));

authRoute.get(
    '/login/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

authRoute.get(
    '/login/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    catchError(AuthController.loginWithGoogle)
);

authRoute.post('/new-token', validateNewToken, catchError(AuthController.newToken));

/* ------------------------------------------------------ */
/*                    Validate routes                     */
/* ------------------------------------------------------ */
authRoute.use(authenticate, authRouteValidate);

authRouteValidate.post('/logout', catchError(AuthController.logout));

authRouteValidate.patch(
    '/forgot-password',
    validateForgotPassword,
    catchError(AuthController.forgotPassword)
);

export default authRoute;

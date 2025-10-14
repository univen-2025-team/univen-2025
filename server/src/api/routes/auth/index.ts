import { Router } from 'express';

/* --------------------- Controllers -------------------- */
import AuthController from '@/controllers/auth.controller.js';

/* ------------------------- Joi ------------------------ */
import {
    forgotPasswordSchema,
    loginSchema,
    newTokenSchema,
    signUpSchema,
    validateForgotPassword,
    validateLogin,
    validateNewToken,
    validateSignUp
} from '@/validations/zod/auth.zod.js';

/* --------------------- Middlewares -------------------- */
import catchError from '@/middlewares/catchError.middleware.js';
import { authenticate } from '@/middlewares/jwt.middleware.js';
import { AvatarFields } from '@/enums/media.enum.js';
import { checkCustomerAccountToRegisterShop } from '@/middlewares/auth.middleware.js';

const authRoute = Router();
const authRouteValidate = Router();

authRoute.post('/sign-up', validateSignUp, catchError(AuthController.signUp));

authRoute.post('/login', validateLogin, catchError(AuthController.login));

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

import z from 'zod';
import _ from 'lodash';
import { mongooseId, passwordType, phoneNumber } from '@/configs/joi.config.js';
import { UserStatus } from '@/enums/user.enum.js';
import { generateValidateWithBody } from '@/middlewares/zod.middleware';
import { email } from 'zod/v4';

/* ------------------------------------------------------ */
/*                      User schema                       */
/* ------------------------------------------------------ */
const userBase = z.object({
    /* -------------------------- Auth -------------------------- */
    _id: mongooseId,
    email: z.string().email().min(5).max(50),
    password: passwordType,

    /* ----------------------- Information ---------------------- */
    user_fullName: z.string().min(4).max(30),
    user_avatar: z.string().optional().nullable(),
    user_gender: z.boolean().optional().nullable(),

    /* ------------------------ Metadata ------------------------ */
    user_status: z.nativeEnum(UserStatus).optional(),
    user_role: z.string().optional()
});
export type UserBase = z.infer<typeof userBase>;

/* ------------------------------------------------------ */
/*                      Login schema                      */
/* ------------------------------------------------------ */
export const loginSchema = userBase.pick({
    email: true,
    password: true
});
export type LoginSchema = z.infer<typeof loginSchema>;

/* ------------------------------------------------------ */
/*                Login with google schema                */
/* ------------------------------------------------------ */
export const loginWithGoogleSchema = z.object({
    googleId: z.string().min(1),
    email: z.string().email(),
    user_fullName: z.string().min(4).max(30),
    user_avatar: z.string().url().optional().nullable()
});
export type LoginWithGoogleSchema = z.infer<typeof loginWithGoogleSchema>;

/* ------------------------------------------------------ */
/*                    Sign up schema                      */
/* ------------------------------------------------------ */
export const signUpSchema = userBase.pick({
    user_fullName: true,
    email: true,
    password: true
});
export type SignUpSchema = z.infer<typeof signUpSchema>;

/* ------------------------------------------------------ */
/*                    New token schema                    */
/* ------------------------------------------------------ */
export const newTokenSchema = z.object({
    refreshToken: z.string().min(1)
});
export type NewTokenSchema = z.infer<typeof newTokenSchema>;

/* ------------------------------------------------------ */
/*                    Forgot password schema              */
/* ------------------------------------------------------ */
export const forgotPasswordSchema = z.object({
    email: z.string().email(),
    newPassword: passwordType
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const validateLogin = generateValidateWithBody(loginSchema);
export const validateSignUp = generateValidateWithBody(signUpSchema);
export const validateNewToken = generateValidateWithBody(newTokenSchema);
export const validateForgotPassword = generateValidateWithBody(forgotPasswordSchema);

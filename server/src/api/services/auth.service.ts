// Libs
import bcrypt from 'bcrypt';
import _, { get } from 'lodash';

// Handle error
import {
    NotFoundErrorResponse,
    ForbiddenErrorResponse,
    ConflictErrorResponse,
    BadRequestErrorResponse
} from '@/response/error.response.js';

// Configs
import { BCRYPT_SALT_ROUND } from '@/configs/bcrypt.config.js';

// Services
import UserService from './user.service.js';
import KeyTokenService from './keyToken.service.js';
import JwtService from './jwt.service.js';
import LoggerService from './logger.service.js';

// Models
import { getRoleIdByName } from '@/models/repository/rbac/index.js';
import { findOneAndUpdateUser, findOneUser, findUserById } from '@/models/repository/user/index.js';
import { RoleNames } from '@/enums/rbac.enum.js';
import { deleteKeyToken } from './redis.service.js';
import { findOneAndUpdateKeyToken } from '@/models/repository/keyToken/index.js';
import { USER_INIT_BALANCE, USER_PUBLIC_FIELDS } from '@/configs/user.config.js';
import { roleService } from './rbac.service.js';
import { changeMediaOwner } from '@/models/repository/media/index.js';
import { NODE_ENV } from '@/configs/server.config.js';
import { ObjectId } from '@/configs/mongoose.config.js';
import { Profile } from 'passport-google-oauth20';
import { LoginWithGoogleSchema, loginWithGoogleSchema } from '@/validations/zod/auth.zod.js';
import { keyof } from 'zod/v4';

export default class AuthService {
    /* ------------------------------------------------------ */
    /*                        Sign up                         */
    /* ------------------------------------------------------ */
    public static signUp = async ({
        email,
        password,
        user_fullName
    }: service.auth.arguments.SignUp) => {
        /* --------------- Check if user is exists -------------- */
        const userIsExist = await UserService.checkUserExist({
            $or: [{ email }]
        });
        if (userIsExist) throw new ConflictErrorResponse({ message: 'User is exists!' });

        /* ------------- Save new user to database ------------ */
        const hashPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUND);

        let userRole = RoleNames.USER;

        /* ---------------------------------------------------------- */
        /*                             Dev                            */
        /* ---------------------------------------------------------- */
        const userInstance = UserService.newInstance({
            email,
            password: hashPassword,
            balance: USER_INIT_BALANCE, // init balance

            user_avatar: '',
            user_fullName,
            user_role: await getRoleIdByName(userRole),
            user_gender: false
        });
        if (!userInstance) throw new ForbiddenErrorResponse({ message: 'Create user failed!' });

        /* ------------ Generate key and jwt token ------------ */
        const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
        const jwtTokenPair = await JwtService.signJwtPair({
            privateKey,
            payload: {
                id: userInstance.id,
                role: userInstance.user_role.toString()
            }
        });
        if (!jwtTokenPair)
            throw new ForbiddenErrorResponse({ message: 'Generate jwt token failed!' });

        /* ------------ Save key token to database ------------ */
        await Promise.all([
            UserService.saveInstance(userInstance),
            KeyTokenService.findOneAndReplace({
                userId: userInstance.id,
                privateKey,
                publicKey,
                refreshToken: jwtTokenPair.refreshToken
            })
        ]).catch(async () => {
            await KeyTokenService.deleteKeyTokenByUserId(userInstance.id);
            await UserService.removeUser(userInstance.id);

            throw new ForbiddenErrorResponse({ message: 'Error on save user or key token!' });
        });

        return {
            token: jwtTokenPair,
            user: _.pick(userInstance.toObject(), USER_PUBLIC_FIELDS)
        };
    };

    /* ------------------------------------------------------ */
    /*                         Login                          */
    /* ------------------------------------------------------ */
    public static login = async ({ email, password }: service.auth.arguments.Login) => {
        /* -------------- Check if user is exists ------------- */
        const user = await findOneUser({
            query: { email },
            select: ['password'],
            options: { lean: true }
        });
        if (!user)
            throw new NotFoundErrorResponse({ message: 'Username or password is not correct!' });

<<<<<<< HEAD
        if (!user.password) 
            throw new ForbiddenErrorResponse({ message: 'This account already uses Google login!' });
=======
        if (!user.password)
            throw new ForbiddenErrorResponse({
                message: 'This account already uses Google login!'
            });
>>>>>>> ea92ef4d712de077556c73c19678cf028ca8fded

        /* ------------------ Check password ------------------ */
        const hashPassword = user.password;
        if (!hashPassword)
            throw new ForbiddenErrorResponse({
                message: 'Username or password is not correct!'
            });

        const isPasswordMatch = await bcrypt.compare(password, hashPassword);
        if (!isPasswordMatch)
            throw new ForbiddenErrorResponse({ message: 'Username or password is not correct!' });

        /* --------- Generate token and send response --------- */
        return await AuthService.generateAuth(user);

        /* --------------------- Add role data  --------------------- */
        // const roleData = await roleService.getUserRoleData({
        //     userId: user._id.toString(),
        //     roleId: user.user_role.toString()
        // });
        // if (roleData && roleData.role_name !== RoleNames.USER)
        //     result[roleData.role_name] = roleData.role_data || true;
    };

    /* ------------------------------------------------------ */
    /*                    Login with google                   */
    /* ------------------------------------------------------ */
    public static loginWithGoogle = async (profile: Profile) => {
        const googleProfile: { [k in keyof LoginWithGoogleSchema]: any } = {
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            user_fullName: profile.displayName,
            user_avatar: profile.photos?.[0]?.value
        };

        LoggerService.getInstance().info(
            `Google Profile: ${JSON.stringify(googleProfile, null, 2)}`
        );

        if (loginWithGoogleSchema.safeParse(googleProfile).success === false) {
            throw new BadRequestErrorResponse({ message: 'Google profile is invalid!' });
        }

        const userExists = await findOneUser({
            query: { $or: [{ email: googleProfile.email }, { googleId: googleProfile.googleId }] }
        });
        let userResponse: model.auth.UserSchema;

        if (userExists) {
            if (!userExists.googleId) {
                userExists.googleId = googleProfile.googleId;
            }

            if (userExists.email !== googleProfile.email) {
                throw new ConflictErrorResponse({
                    message: 'Google account is already in use by another email!'
                });
            }

            userResponse = await userExists.save();
        } else {
            const newUser = UserService.newInstance({
                googleId: googleProfile.googleId,
                email: googleProfile.email,
<<<<<<< HEAD
=======
                balance: USER_INIT_BALANCE,
>>>>>>> ea92ef4d712de077556c73c19678cf028ca8fded
                password: '',

                user_fullName: googleProfile.user_fullName,
                user_avatar: googleProfile.user_avatar || '',
                user_role: await getRoleIdByName(RoleNames.USER),
                user_gender: false
            });

            userResponse = await newUser.save();
        }

        return await AuthService.generateAuth(userResponse);
    };

    /* ------------------------------------------------------ */
    /*                         Logout                         */
    /* ------------------------------------------------------ */
    public static logout = async (userId: string) => {
        /* ----- Handle remove refresh token in valid list ---- */
        await KeyTokenService.deleteKeyTokenByUserId(userId);
        await deleteKeyToken(userId);

        return true;
    };

    /* ------------------------------------------------------ */
    /*                         Forgot password                */
    /* ------------------------------------------------------ */
    public static forgotPassword = async ({
        email,
        newPassword
    }: service.auth.arguments.ForgotPassword) => {
        const user = await findOneUser({
            query: { user_email: email },
            options: { lean: true }
        });
        if (!user) throw new NotFoundErrorResponse({ message: 'User not found' });

        const hashPassword = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUND);

        await findOneAndUpdateUser({
            query: { user_email: email },
            update: { password: hashPassword }
        });

        /* ----------------- Logout all user's token ---------------- */
        await KeyTokenService.deleteKeyTokenByUserId(user._id.toString());

        return true;
    };

    /* ------------------------------------------------------ */
    /*                  Handle refresh token                  */
    /* ------------------------------------------------------ */
    public static newToken = async ({ refreshToken }: service.auth.arguments.NewToken) => {
        /* -------------- Get user info in token -------------- */
        const payload = JwtService.parseJwtPayload(refreshToken);
        if (!payload)
            throw new ForbiddenErrorResponse({ message: 'Token is not generate by server!' });

        /* ------------- Find key token by user id ------------ */
        const keyToken = await KeyTokenService.findTokenByUserId(payload.id);
        if (!keyToken) throw new NotFoundErrorResponse({ message: 'Key token not found!' });

        /* ---------- Check refresh is current token ---------- */
        const isRefreshTokenUsed = keyToken.refresh_tokens_used?.includes(refreshToken);

        // Token is valid but it was deleted on valid list (because token was used before to get new token)
        if (isRefreshTokenUsed) {
            // ALERT: Token was stolen!!!
            // Clean up keyToken
            await KeyTokenService.deleteKeyTokenByUserId(payload.id);
            await deleteKeyToken(payload.id);

            LoggerService.getInstance().error(`Token was stolen! User id: ${payload.id}`);

            throw new ForbiddenErrorResponse({ message: 'Token was deleted!' });
        }

        /* --------------- Verify refresh token --------------- */
        const decoded = await JwtService.verifyJwt({
            publicKey: keyToken.public_key,
            token: refreshToken
        });
        if (!decoded) throw new ForbiddenErrorResponse({ message: 'Token is invalid!' });
        if (refreshToken !== keyToken.refresh_token)
            throw new ForbiddenErrorResponse({ message: 'Token is invalid!' });

        /* ------------ Generate new jwt token pair ----------- */
        const user = await findUserById({ id: decoded.id });
        const { privateKey, publicKey } = KeyTokenService.generateTokenPair();
        const newJwtTokenPair = await JwtService.signJwtPair({
            privateKey,
            payload: {
                id: user._id.toString(),
                role: user.user_role.toString()
            }
        });
        if (!newJwtTokenPair)
            throw new ForbiddenErrorResponse({ message: 'Generate token failed!' });

        const newKeyToken = await findOneAndUpdateKeyToken({
            query: { user: payload.id },
            update: {
                private_key: privateKey,
                public_key: publicKey,
                refresh_token: newJwtTokenPair.refreshToken,
                $push: { refresh_tokens_used: refreshToken }
            },
            options: { new: true }
        });
        if (!newKeyToken) throw new ForbiddenErrorResponse({ message: 'Save key token failed!' });

        return newJwtTokenPair;
    };

    private static async generateAuth(user: model.auth.UserSchema) {
        /* --------- Generate token and send response --------- */
        const { privateKey, publicKey } = KeyTokenService.generateTokenPair(); // RSA
        const jwtPair = await JwtService.signJwtPair({
            privateKey,
            payload: {
                id: user._id.toString(),
                role: user.user_role.toString()
            }
        });
        if (!jwtPair) throw new ForbiddenErrorResponse({ message: 'Generate jwt token failed!' });

        /* ---------------- Save new key token ---------------- */
        const keyTokenId = await KeyTokenService.findOneAndReplace({
            userId: user._id.toString(),
            privateKey,
            publicKey,
            refreshToken: jwtPair.refreshToken
        });
        if (!keyTokenId) throw new ForbiddenErrorResponse({ message: 'Save key token failed!' });

        const result: commonTypes.object.ObjectAnyKeys = {
            token: jwtPair,
            user: _.pick(user, USER_PUBLIC_FIELDS)
        };

        return result;
    }
}

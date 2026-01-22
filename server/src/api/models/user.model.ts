import { Schema, model } from 'mongoose';
import { ObjectId } from '@/configs/mongoose.config.js';
import { ROLE_MODEL_NAME } from './role.model.js';
import { required, unique, timestamps } from '@/configs/mongoose.config.js';
import { UserStatus } from '@/enums/user.enum.js';
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from '@/enums/subscription.enum.js';
import { USER_SUBSCRIPTION_MODEL_NAME } from './user-subscription.model.js';

export const USER_MODEL_NAME = 'User';
export const USER_COLLECTION_NAME = 'users';

const userSchema = new Schema<model.auth.UserSchema>(
    {
        /* ---------------------- Authenticate ---------------------- */
        email: { type: String, unique },
        googleId: { type: String, unique },
        password: { type: String, select: false },

        /* ---------------------- Information  ---------------------- */
        user_avatar: { type: String, default: undefined },
        user_fullName: { type: String, required },
        user_dayOfBirth: Date,
        user_gender: { type: Boolean, default: false }, // true => male, false => female
        balance: {
            type: Number,
            default: SUBSCRIPTION_LIMITS[SubscriptionTier.FREEMIUM].virtualCapital // 10M VND for Freemium
        },

        /* ------------------------ Guest Account ------------------------ */
        isGuest: { type: Boolean, default: false },
        guestExpiresAt: { type: Date, default: undefined },

        /* ------------------------ Metadata ------------------------ */
        user_role: { type: ObjectId, required, ref: ROLE_MODEL_NAME },
        user_status: { type: String, enum: UserStatus, default: UserStatus.ACTIVE },

        /* ----------------------- Subscription ----------------------- */
        subscription_tier: {
            type: String,
            enum: SubscriptionTier,
            default: SubscriptionTier.FREEMIUM,
            index: true
        },
        subscription_id: { type: ObjectId, ref: USER_SUBSCRIPTION_MODEL_NAME }
    },
    {
        collection: USER_COLLECTION_NAME,
        timestamps
    }
);

export const userModel = model(USER_MODEL_NAME, userSchema);


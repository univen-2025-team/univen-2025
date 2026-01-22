import mongoose from 'mongoose';
import { RoleNames } from '@/enums/rbac.enum.js';

type RoleHandleGetDataStrategy = {
    [key in RoleNames]: (id: string) => Promise<mongoose.Document | null>;
};
export const roleHandleGetDataStrategy: RoleHandleGetDataStrategy = {
    // Subscription-based user roles
    [RoleNames.USER_FREEMIUM]: async (id) => null,
    [RoleNames.USER_STANDARD]: async (id) => null,
    [RoleNames.USER_ADVANCED]: async (id) => null,
    [RoleNames.USER_ACADEMIC]: async (id) => null,
    // Legacy role
    [RoleNames.USER]: async (id) => null,
    // Admin roles
    [RoleNames.ADMIN]: async (id) => null,
    [RoleNames.SUPER_ADMIN]: async (id) => null
};


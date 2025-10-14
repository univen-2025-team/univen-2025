import mongoose from 'mongoose';
import { RoleNames } from '@/enums/rbac.enum.js';

type RoleHandleGetDataStrategy = {
    [key in RoleNames]: (id: string) => Promise<mongoose.Document | null>;
};
export const roleHandleGetDataStrategy: RoleHandleGetDataStrategy = {
    [RoleNames.ADMIN]: async (id) => null,
    [RoleNames.SUPER_ADMIN]: async (id) => null,
    [RoleNames.USER]: async (id) => null
};

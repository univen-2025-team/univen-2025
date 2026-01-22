import { roleHandleGetDataStrategy } from '@/configs/rbac.config.js';
import { Resources, RoleActions, RoleNames, RoleStatus } from '@/enums/rbac.enum.js';
import {
    findOneAndUpdateResource,
    findOneAndUpdateRole,
    findRoleById,
    findRoles
} from '@/models/repository/rbac/index.js';
import { findUserById } from '@/models/repository/user/index.js';
import slugify from 'slugify';

class RBACService {
    public static instance: RBACService;

    private constructor() { }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new RBACService();
        }

        return this.instance;
    }

    async initRBAC() {
        /* --------------------- Init resources --------------------- */
        const resources = Object.values(Resources);
        const resourcesId = await Promise.all(
            resources.map(async (resource, index) => {
                const resourceSlug = slugify(resource, { lower: true, locale: 'vi' });
                const id = (
                    await findOneAndUpdateResource({
                        query: { resource_name: resource },
                        update: { resource_name: resource, resource_slug: resourceSlug },
                        options: { upsert: true, new: true }
                    })
                )._id;

                return { id, name: resource };
            })
        );

        /* ---------------------------------------------------------- */
        /*                         INIT ROLES                         */
        /* ---------------------------------------------------------- */
        /* ----------------------- Super admin ---------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.SUPER_ADMIN },
            update: {
                role_name: RoleNames.SUPER_ADMIN,
                role_desc: 'Super Administrator',
                role_granted: resourcesId.map((resource) => ({
                    resource: resource.id,
                    actions: [
                        RoleActions.CREATE_ANY,
                        RoleActions.READ_ANY,
                        RoleActions.UPDATE_ANY,
                        RoleActions.DELETE_ANY
                    ],
                    attributes: '*'
                }))
            },
            options: { upsert: true, new: true }
        });

        /* -------------------------- Admin ------------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.ADMIN },
            update: {
                role_name: RoleNames.ADMIN,
                role_desc: 'Administrator',
                role_granted: [
                    {
                        resource: resourcesId.find((resource) => resource.name === Resources.SHOP)
                            ?.id,
                        actions: [
                            RoleActions.READ_ANY,
                            RoleActions.UPDATE_ANY,
                            RoleActions.DELETE_ANY
                        ],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find(
                            (resource) => resource.name === Resources.CATEGORY
                        )?.id,
                        actions: [
                            RoleActions.CREATE_ANY,
                            RoleActions.READ_ANY,
                            RoleActions.UPDATE_ANY,
                            RoleActions.DELETE_ANY
                        ],
                        attributes: '*'
                    }
                ]
            },
            options: { upsert: true, new: true }
        });

        /* -------------------------- User -------------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.USER },
            update: {
                role_name: RoleNames.USER,
                role_desc: 'User role (Legacy)',
                role_status: RoleStatus.ACTIVE,
                role_granted: [
                    {
                        resource: resourcesId.find(
                            (resource) => resource.name === Resources.PRODUCT
                        )?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_OWN,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN
                        ],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((resource) => resource.name === Resources.ORDER)
                            ?.id,
                        actions: [
                            RoleActions.CREATE_OWN,
                            RoleActions.READ_OWN,
                            RoleActions.UPDATE_OWN,
                            RoleActions.DELETE_OWN
                        ],
                        attributes: '*'
                    }
                ]
            },
            options: { upsert: true, new: true }
        });

        /* ---------------------------------------------------------- */
        /*              SUBSCRIPTION-BASED USER ROLES                 */
        /* ---------------------------------------------------------- */

        /* -------------------- User Freemium -------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.USER_FREEMIUM },
            update: {
                role_name: RoleNames.USER_FREEMIUM,
                role_desc: 'Freemium User - Basic access, 10M VND virtual capital',
                role_status: RoleStatus.ACTIVE,
                role_granted: [
                    {
                        resource: resourcesId.find((r) => r.name === Resources.PORTFOLIO)?.id,
                        actions: [RoleActions.CREATE_OWN, RoleActions.READ_OWN],
                        attributes: 'max:1' // 1 portfolio only
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.PORTFOLIO_RESET)?.id,
                        actions: [RoleActions.UPDATE_OWN],
                        attributes: 'limit:1' // 1 reset per month
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.MARKET_VN)?.id,
                        actions: [RoleActions.READ_ANY],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.AI_MENTOR)?.id,
                        actions: [RoleActions.READ_OWN],
                        attributes: 'level:basic'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.SOCIAL_TRADING)?.id,
                        actions: [RoleActions.READ_ANY],
                        attributes: 'join_public_only'
                    }
                ]
            },
            options: { upsert: true, new: true }
        });

        /* -------------------- User Standard -------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.USER_STANDARD },
            update: {
                role_name: RoleNames.USER_STANDARD,
                role_desc: 'Standard User - 99,000 VND/month, 100M VND virtual capital',
                role_status: RoleStatus.ACTIVE,
                role_granted: [
                    {
                        resource: resourcesId.find((r) => r.name === Resources.PORTFOLIO)?.id,
                        actions: [RoleActions.CREATE_OWN, RoleActions.READ_OWN, RoleActions.UPDATE_OWN, RoleActions.DELETE_OWN],
                        attributes: 'max:3' // 3 portfolios
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.PORTFOLIO_RESET)?.id,
                        actions: [RoleActions.UPDATE_OWN],
                        attributes: 'limit:3' // 3 resets per month
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.MARKET_VN)?.id,
                        actions: [RoleActions.READ_ANY],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.AI_MENTOR)?.id,
                        actions: [RoleActions.READ_OWN, RoleActions.CREATE_OWN],
                        attributes: 'level:standard'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.SOCIAL_TRADING)?.id,
                        actions: [RoleActions.CREATE_OWN, RoleActions.READ_ANY],
                        attributes: 'private_room:10' // Create rooms with max 10 users
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.CERTIFICATION)?.id,
                        actions: [RoleActions.READ_OWN, RoleActions.CREATE_OWN],
                        attributes: 'type:course_completion'
                    }
                ]
            },
            options: { upsert: true, new: true }
        });

        /* -------------------- User Advanced -------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.USER_ADVANCED },
            update: {
                role_name: RoleNames.USER_ADVANCED,
                role_desc: 'Advanced User - 349,000 VND/month, Unlimited features',
                role_status: RoleStatus.ACTIVE,
                role_granted: [
                    {
                        resource: resourcesId.find((r) => r.name === Resources.PORTFOLIO)?.id,
                        actions: [RoleActions.CREATE_OWN, RoleActions.READ_OWN, RoleActions.UPDATE_OWN, RoleActions.DELETE_OWN],
                        attributes: 'max:10' // 10+ portfolios
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.PORTFOLIO_RESET)?.id,
                        actions: [RoleActions.UPDATE_OWN],
                        attributes: 'unlimited'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.VIRTUAL_CAPITAL)?.id,
                        actions: [RoleActions.READ_OWN, RoleActions.UPDATE_OWN],
                        attributes: 'customizable'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.MARKET_VN)?.id,
                        actions: [RoleActions.READ_ANY],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.MARKET_CRYPTO)?.id,
                        actions: [RoleActions.READ_ANY],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.MARKET_US)?.id,
                        actions: [RoleActions.READ_ANY],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.AI_MENTOR)?.id,
                        actions: [RoleActions.READ_OWN, RoleActions.CREATE_OWN, RoleActions.UPDATE_OWN],
                        attributes: 'level:advanced'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.SOCIAL_TRADING)?.id,
                        actions: [RoleActions.CREATE_ANY, RoleActions.READ_ANY, RoleActions.UPDATE_OWN],
                        attributes: 'host_contests:unlimited'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.AD_FREE)?.id,
                        actions: [RoleActions.READ_OWN],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.CERTIFICATION)?.id,
                        actions: [RoleActions.READ_OWN, RoleActions.CREATE_OWN],
                        attributes: 'type:verified_skill_badge'
                    }
                ]
            },
            options: { upsert: true, new: true }
        });

        /* -------------------- User Academic -------------------- */
        await findOneAndUpdateRole({
            query: { role_name: RoleNames.USER_ACADEMIC },
            update: {
                role_name: RoleNames.USER_ACADEMIC,
                role_desc: 'Academic License - For universities and training centers',
                role_status: RoleStatus.ACTIVE,
                role_granted: [
                    {
                        resource: resourcesId.find((r) => r.name === Resources.PORTFOLIO)?.id,
                        actions: [RoleActions.CREATE_OWN, RoleActions.READ_OWN, RoleActions.UPDATE_OWN, RoleActions.DELETE_OWN],
                        attributes: 'max:3'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.PORTFOLIO_RESET)?.id,
                        actions: [RoleActions.UPDATE_OWN],
                        attributes: 'unlimited'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.MARKET_VN)?.id,
                        actions: [RoleActions.READ_ANY],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.AI_MENTOR)?.id,
                        actions: [RoleActions.READ_OWN, RoleActions.CREATE_OWN],
                        attributes: 'level:standard'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.AD_FREE)?.id,
                        actions: [RoleActions.READ_OWN],
                        attributes: '*'
                    },
                    {
                        resource: resourcesId.find((r) => r.name === Resources.CERTIFICATION)?.id,
                        actions: [RoleActions.READ_OWN, RoleActions.CREATE_OWN],
                        attributes: 'type:course_completion'
                    }
                ]
            },
            options: { upsert: true, new: true }
        });
    }

    async getAccessControlList() {
        const roles = await findRoles({
            query: {},
            options: { populate: 'role_granted.resource', lean: true }
        });

        const result = roles.flatMap((role) =>
            role.role_granted.flatMap((granted) => {
                const resource = granted.resource as any as model.rbac.ResourceSchema;

                return granted.actions.map((action) => ({
                    role: role.role_name,
                    resource: resource.resource_name,
                    action,
                    attributes: granted.attributes
                }));
            })
        );

        return result;
    }
}

class RoleService {
    async getUserRoleData({ userId, roleId }: service.rbac.arguments.GetUserRoleData) {
        const roleName: RoleNames = await findRoleById({
            id: roleId,
            options: { lean: true }
        }).then((role) => role.role_name);

        if (!roleName) return null;
        if (!roleHandleGetDataStrategy[roleName]) return null;

        return {
            role_name: roleName,
            role_data: await roleHandleGetDataStrategy[roleName](userId)
        };
    }

    async userIsAdmin(userId: string) {
        const user = await findUserById({
            id: userId,
            only: ['user_role'],
            options: { lean: true }
        });
        if (!user) return false;

        const role = await findRoleById({
            id: user.user_role,
            options: { lean: true }
        });
        if (!role) return false;
        if (role.role_name === RoleNames.SUPER_ADMIN) return true;
        if (role.role_name === RoleNames.ADMIN) return true;

        return false;
    }
}

export default RBACService;

export const roleService = new RoleService();

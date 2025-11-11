import type mongoose, { Document } from 'mongoose';
import { joiTypes } from '../joi';
import type { UserStatus } from '@/enums/user.enum.ts';

declare global {
    namespace model {
        namespace chat {
            type ChatSchema<isModel = false, isDoc = false> = moduleTypes.mongoose.MongooseType<
                {
                    user: moduleTypes.mongoose.ObjectId;
                    chat_messages: Array<{
                        content: string;
                        timestamp: Date;
                    }>;
                },
                isModel,
                isDoc,
                {
                    _id: string;
                }
            >;
        }
    }
}

import ms from 'ms';

export const PESSIMISTIC_EXPIRE_TIME = ms('10 seconds');
export const PESSIMISTIC_QUERY_TIME = ms('7 seconds');
export const PESSIMISTIC_WAITING_TIME = ms('30 ms');
export const PESSIMISTIC_RETRY_TIMES = ms('50 ms');

import { getEnv } from '../api/utils/env.util';
import { EnvKeyEnum } from '../api/enums/env.enum';

export const REDIS_CONFIG = {
    username: getEnv({ key: EnvKeyEnum.REDIS_USERNAME }),
    password: getEnv({ key: EnvKeyEnum.REDIS_PASSWORD }),
    socket: {
        host: getEnv({ key: EnvKeyEnum.REDIS_HOST }),
        port: getEnv({ key: EnvKeyEnum.REDIS_PORT, type: 'number' })
    }
};
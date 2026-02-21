import { getEnv } from '../api/utils/env.util';
import { EnvKeyEnum } from '../api/enums/env.enum';
import ms from 'ms';

export const OTP_EXPIRATION_TIME = ms('5 minutes');

export const OTP_RETRY_TIME = ms('30 seconds');

export const OTP_EMAIL = getEnv({ key: EnvKeyEnum.OAUTH2_USER });
export const OTP_CLIENT_ID = getEnv({ key: EnvKeyEnum.OAUTH2_CLIENT_ID });
export const OTP_CLIENT_SECRET = getEnv({ key: EnvKeyEnum.OAUTH2_CLIENT_SECRET });
export const OTP_REFRESH_TOKEN = getEnv({ key: EnvKeyEnum.OAUTH2_REFRESH_TOKEN });
export const OTP_ACCESS_TOKEN = getEnv({ key: EnvKeyEnum.OAUTH2_ACCESS_TOKEN });

// if (!OTP_EMAIL || !OTP_CLIENT_ID || !OTP_CLIENT_SECRET || !OTP_REFRESH_TOKEN) {
//     throw new Error("Missing OTP credentials");
// }

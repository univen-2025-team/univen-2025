import { getEnv } from '../api/utils/env.util';
import { EnvKeyEnum } from '../api/enums/env.enum';

export const GOOGLE_OAUTH_CLIENT_ID = getEnv({ key: EnvKeyEnum.GOOGLE_OAUTH_CLIENT_ID });
export const GOOGLE_OAUTH_CLIENT_SECRET = getEnv({ key: EnvKeyEnum.GOOGLE_OAUTH_CLIENT_SECRET });
export const GOOGLE_OAUTH_REDIRECT_URI = getEnv({ key: EnvKeyEnum.GOOGLE_OAUTH_REDIRECT_URI, default: 'https://univen-1111-api.duckdns.org/v1/api/auth/login/google/callback' });
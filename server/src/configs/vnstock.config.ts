import { getEnv } from '../api/utils/env.util';
import { EnvKeyEnum } from '../api/enums/env.enum';

export const VNSTOCK_API_URL = getEnv({ key: EnvKeyEnum.VNSTOCK_API_URL, default: 'http://vnstock-api:8000' });

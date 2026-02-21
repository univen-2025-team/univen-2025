import path from 'path';

// Version control
export const API_VERSION = 'v1';

import { getEnv } from '../api/utils/env.util';
import { EnvKeyEnum } from '../api/enums/env.enum';

// Server configs
// NOTE: In Docker, internal port is always 4000. Use SERVER_PORT for external mapping.
export const PORT = getEnv({ key: EnvKeyEnum.PORT, type: "number", default: 4000 })
export const HOST = getEnv({ key: EnvKeyEnum.HOST, default: '0.0.0.0' });
export const BASE_URL = `http://${HOST}:${PORT}`;

// Client config
export const CLIENT_URL = getEnv({ key: EnvKeyEnum.CLIENT_URL, default: 'https://www.univen-1111.duckdns.org' });

// Environment
export const NODE_ENV = getEnv({ key: EnvKeyEnum.NODE_ENV, default: 'development' }) as 'development' | 'production';

// Database
export const MONGODB_URL = getEnv({ key: EnvKeyEnum.MONGODB_URL });
export const MONGODB_MIN_POOL_SIZE = 100;
export const MONGODB_MAX_POOL_SIZE = 500;

// Paginate
export const ITEM_PER_PAGE = 48; // Chia hết cho tá để dễ phân layout

// File
export const PUBLIC_PATH = path.join(import.meta.dirname, '../../public');

//AI 
export const AI_CHAT_SERVICE_URL = getEnv({ key: EnvKeyEnum.AI_CHAT_SERVICE_URL, default: 'https://webhook.site/62ec403c-a431-4b74-97ff-b6179e18956e' });

import path from 'path';

// Version control
export const API_VERSION = 'v1';

// Server configs
// NOTE: In Docker, internal port is always 4000. Use SERVER_PORT for external mapping.
export const PORT = process.env.PORT || process.env.SERVER_PORT || 4000;
export const HOST = process.env.HOST || '0.0.0.0';
export const BASE_URL = `http://${HOST}:${PORT}`;

// Client config
export const CLIENT_URL = process.env.CLIENT_URL || 'https://www.univen-1111.duckdns.org';

// Environment
export const NODE_ENV = (process.env.NODE_ENV || 'development') as 'development' | 'production';

// Database
export const DB_URL = process.env.DB_URL || 'mongodb+srv://univenadmin:7anDtT3SJNX2zgDj@cluster0.qhpwdw3.mongodb.net/test?appName=Cluster0';
export const DB_MIN_POOL_SIZE = 100;
export const DB_MAX_POOL_SIZE = 500;

// Paginate
export const ITEM_PER_PAGE = 48; // Chia hết cho tá để dễ phân layout

// File
export const PUBLIC_PATH = path.join(import.meta.dirname, '../../public');

//AI 
export const AI_CHAT_SERVICE_URL = process.env.AI_CHAT_SERVICE_URL || 'https://webhook.site/62ec403c-a431-4b74-97ff-b6179e18956e';

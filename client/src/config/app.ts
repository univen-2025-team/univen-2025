import { EnvKeys, EnvManager } from '../utils/env.util';

export const APP_URL = EnvManager.parseEnv(process.env.NEXT_PUBLIC_APP_URL, EnvKeys.NEXT_PUBLIC_APP_URL, { required: true });
export const API_URL = EnvManager.parseEnv(process.env.NEXT_PUBLIC_API_URL, EnvKeys.NEXT_PUBLIC_API_URL, { required: true });
export const NEXT_PUBLIC_AGENT_API = EnvManager.parseEnv(process.env.NEXT_PUBLIC_AGENT_API, EnvKeys.NEXT_PUBLIC_AGENT_API, { required: true });
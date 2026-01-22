import { EnvKeys, EnvManager } from '../utils/env.util';

// Server-side only configuration
export const GROQ_API_KEY = EnvManager.parseEnv(process.env.GROQ_API_KEY, EnvKeys.GROQ_API_KEY, { required: false });
export const HF_TOKEN = EnvManager.parseEnv(process.env.HF_TOKEN, EnvKeys.HF_TOKEN, { required: false });

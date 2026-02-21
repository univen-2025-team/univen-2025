import { getEnv } from '../utils/env.util';
import { EnvKeyEnum } from '../enums/env.enum';
import dotenv from 'dotenv';
import path from 'path';

const NODE_ENV = getEnv({ key: EnvKeyEnum.NODE_ENV, default: 'development' });
const envPath = path.join(import.meta.dirname, `../../../.env.${NODE_ENV}`);

dotenv.config({
    path: envPath,
    // IMPORTANT:
    // - In Docker/Compose, environment variables passed to the container should win.
    // - `override: true` would overwrite Compose-provided env (e.g., PORT), causing port mismatch/unhealthy containers.
    // If you really need overriding for local dev, set DOTENV_OVERRIDE=true.
    override: getEnv({ key: EnvKeyEnum.DOTENV_OVERRIDE, type: 'boolean', isRequired: false, default: false })
});

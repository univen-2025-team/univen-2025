import dotenv from 'dotenv';
import path from 'path';

const NODE_ENV = process.env.NODE_ENV || 'development';
const envPath = path.join(import.meta.dirname, `../../../.env.${NODE_ENV}`);

dotenv.config({
    path: envPath,
    // IMPORTANT:
    // - In Docker/Compose, environment variables passed to the container should win.
    // - `override: true` would overwrite Compose-provided env (e.g., PORT), causing port mismatch/unhealthy containers.
    // If you really need overriding for local dev, set DOTENV_OVERRIDE=true.
    override: process.env.DOTENV_OVERRIDE === 'true'
});

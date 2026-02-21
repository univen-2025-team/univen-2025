import { EnvKeyEnum } from '../enums/env.enum';

type EnvType = 'string' | 'number' | 'boolean';

interface IGetEnvParams<T extends EnvType = 'string'> {
    key: EnvKeyEnum;
    isRequired?: boolean;
    default?: T extends 'number' ? number : T extends 'boolean' ? boolean : string;
    type?: T;
}

/**
 * Utility to safely get environment variables with type casting and strict checks
 */
export function getEnv(params: IGetEnvParams<'string'> & { type?: 'string' }): string;
export function getEnv(params: IGetEnvParams<'number'> & { type: 'number' }): number;
export function getEnv(params: IGetEnvParams<'boolean'> & { type: 'boolean' }): boolean;
export function getEnv(params: IGetEnvParams<any>): string | number | boolean {
    const { key, isRequired = true, default: defaultValue, type = 'string' } = params;
    const value = process.env[key];

    // Handle missing value
    if (value === undefined || value === '') {
        if (isRequired) {
            throw new Error(`Environment variable "${key}" is required but missing.`);
        }
        
        if (defaultValue !== undefined) {
            return defaultValue;
        }

        // Strict requirement: Throw error if missing and no default provided
        throw new Error(`Environment variable "${key}" is not set and no default value was provided.`);
    }

    // Cast and validate value if found
    if (type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
            throw new Error(`Environment variable "${key}" must be a valid number, but got "${value}"`);
        }
        return num;
    }

    if (type === 'boolean') {
        const lowerValue = value.toLowerCase();
        if (lowerValue === 'true') return true;
        if (lowerValue === 'false') return false;
        throw new Error(`Environment variable "${key}" must be "true" or "false", but got "${value}"`);
    }

    return value;
}

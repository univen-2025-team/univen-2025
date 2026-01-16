
export enum EnvKeys {
    NEXT_PUBLIC_APP_URL = 'NEXT_PUBLIC_APP_URL',
    NEXT_PUBLIC_API_URL = 'NEXT_PUBLIC_API_URL',
    NEXT_PUBLIC_AGENT_API = 'NEXT_PUBLIC_AGENT_API'
}

export class EnvManager {
    static parseEnv(value: string | undefined, key: EnvKeys | string, options?: { defaultValue?: string; required?: boolean }): string {
        if (options?.required && !value && !options.defaultValue) {
            throw new Error(`Environment variable ${key} is required but missing`);
        }

        return value || options?.defaultValue || '';
    }
}

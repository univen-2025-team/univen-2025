import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '4000',
                pathname: '/**'
            }
        ]
    },
    // Fix warning about multiple lockfiles in monorepo
    turbopack: {
        root: __dirname
    }
};

export default nextConfig;

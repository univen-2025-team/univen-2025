const path = require('path');

module.exports = {
    apps: [
        {
            name: 'univen-2025-server',
            script: 'server.ts',
            interpreter: 'tsx',
            cwd: __dirname,
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 4000,
                HOST: '0.0.0.0'
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: 4000,
                HOST: '0.0.0.0'
            },
            // Logging
            log_file: './logs/pm2/combined.log',
            out_file: './logs/pm2/out.log',
            error_file: './logs/pm2/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

            // Auto restart settings
            watch: false,
            ignore_watch: ['node_modules', 'logs', 'public'],
            max_memory_restart: '1G',

            // Restart settings
            restart_delay: 4000,
            max_restarts: 10,
            min_uptime: '10s',

            // Advanced settings
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 8000,

            // Health monitoring
            health_check_grace_period: 3000,

            // Source map support
            source_map_support: true,

            // Merge logs
            merge_logs: true,

            // Time zone
            time: true
        }
    ],

    deploy: {
        production: {
            user: process.env.DEPLOY_USER || 'ubuntu',
            host: process.env.DEPLOY_HOST || 'localhost',
            ref: 'origin/master',
            repo: 'https://github.com/univen-2025-team/univen-2025.git',
            path: process.env.DEPLOY_PATH || '/var/www/univen-2025',
            'pre-deploy-local': '',
            'post-deploy':
                'cd server && npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
};

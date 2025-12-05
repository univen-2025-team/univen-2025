// Load env
import './src/api/helpers/loadEnv.helper';

import fs from 'fs/promises';
import https from 'https';

// Configs
import { BASE_URL, PORT } from './src/configs/server.config.js';

// App
import path from 'path';
import loggerService from './src/api/services/logger.service.js';
import app from './src/app.js';
import MongoDB from './src/app/db.app.js';

// Socket.IO
import SocketIOService from '@/services/socketio.service.js';
import MarketSocketService from '@/services/market-socket.service.js';
import RBACService from '@/services/rbac.service';

// await new Promise((resolve) => {
//     // kill 4000 with bun
//     try {
//         console.log('Attempting to kill port 4000...');
//         child_process.execSync('bun run kill-port 4000');
//         console.log('Port 4000 killed successfully.');
//         resolve(null);
//     } catch (error: any) {
//         console.error(`Failed to kill port 4000: ${error.message}`);
//     }
// });

// const server = https
//     .createServer(
//         {
//             key: await fs.readFile(path.join(import.meta.dirname, './src/api/assets/ssl/key.pem')),
//             cert: await fs.readFile(path.join(import.meta.dirname, './src/api/assets/ssl/key.cert'))
//         },
//         app
//     )
//     .listen(Number(PORT), async () => {
//         console.log(`Server is running at ${BASE_URL}`);
//     });

const server = app.listen(Number(PORT), () => {
    console.log(`Server is running at ${BASE_URL}`);
});

/* ---------------------------------------------------------- */
/*                       Socket.IO Setup                     */
/* ---------------------------------------------------------- */
// Initialize Socket.IO service
SocketIOService.getInstance().initialize(server);
console.log('CICD Test 2');

// Initialize Market Socket service for real-time stock data
MarketSocketService.getInstance().initialize();

server.on('close', () => {
    // Close database connection
    MongoDB.getInstance().disconnect();

    // Logging
    loggerService.getInstance().info('Server closed');

    process.exit(0);
});

process.on('SIGINT', async () => {
    // Close database connection
    MongoDB.getInstance().disconnect();

    console.log('Server closing...');

    // Close server
    server.close(() => {
        // Close database connection
        MongoDB.getInstance().disconnect();

        // Logging
        loggerService.getInstance().info('Server closed');

        process.exit(0);
    });
});

/* ---------------------------------------------------------- */
/*                        Initial data                        */
/* ---------------------------------------------------------- */
// await RBACService.getInstance().initRBAC();

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';
import JwtService from './jwt.service.js';
import KeyTokenService from './keyToken.service.js';
import LoggerService from './logger.service.js';
import { ForbiddenErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';

// Chat related imports
import { findUserById } from '@/models/repository/user/index.js';

export default class SocketIOService {
    private static instance: SocketIOService;
    private io: SocketIOServer | null = null;
    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

    private constructor() {}

    public static getInstance(): SocketIOService {
        if (!SocketIOService.instance) {
            SocketIOService.instance = new SocketIOService();
        }
        return SocketIOService.instance;
    }

    public initialize(server: HTTPServer | HTTPSServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                await this.authenticateSocket(socket);
                next();
            } catch (error) {
                LoggerService.getInstance().error(`Socket authentication failed: ${error}`);
                next(new Error('Authentication failed'));
            }
        });

        // Connection handling
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });

        LoggerService.getInstance().info('Socket.IO service initialized');
    }

    private async authenticateSocket(socket: any): Promise<void> {
        const token =
            socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

        if (!token) {
            throw new ForbiddenErrorResponse({ message: 'Token not found!' });
        }

        /* --------------- Parse token payload -------------- */
        const payloadParsed = JwtService.parseJwtPayload(token);
        if (!payloadParsed) {
            throw new ForbiddenErrorResponse({ message: 'Invalid token payload!' });
        }

        /* ------------ Check key token is valid ------------- */
        const keyToken = await KeyTokenService.findTokenByUserId(payloadParsed.id);
        if (!keyToken) {
            throw new ForbiddenErrorResponse({ message: 'Invalid token!' });
        }

        /* -------------------- Verify token ------------------- */
        const payload = await JwtService.verifyJwt({
            token,
            publicKey: keyToken.public_key
        });
        if (!payload) {
            throw new ForbiddenErrorResponse({ message: 'Token is expired or invalid!' });
        }

        /* ----------- Check if user exists ----------- */
        const user = await findUserById({
            id: payload.id,
            options: { lean: true },
            only: ['_id', 'user_fullName', 'user_email', 'user_avatar']
        });
        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found!' });
        }

        /* --------------- Attach user to socket ------------ */
        socket.userId = payload.id;
        socket.user = user;
        socket.role = payload.role;
    }

    private handleConnection(socket: any): void {}

    /* -------------------- Public Methods -------------------- */
    public sendToUser(userId: string, event: string, data: any): boolean {
        const socketId = this.connectedUsers.get(userId);
        if (socketId && this.io) {
            this.io.to(socketId).emit(event, data);
            return true;
        }
        return false;
    }

    public sendToConversation(conversationId: string, event: string, data: any): boolean {
        if (this.io) {
            this.io.to(`conversation_${conversationId}`).emit(event, data);
            return true;
        }
        return false;
    }

    public getConnectedUsers(): string[] {
        return Array.from(this.connectedUsers.keys());
    }

    public isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }

    public getSocketIO(): SocketIOServer | null {
        return this.io;
    }
}

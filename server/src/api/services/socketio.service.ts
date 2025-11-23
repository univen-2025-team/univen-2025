import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';
import JwtService from './jwt.service.js';
import KeyTokenService from './keyToken.service.js';
import LoggerService from './logger.service.js';
import { ForbiddenErrorResponse, NotFoundErrorResponse } from '@/response/error.response.js';

// Chat related imports
import { findUserById } from '@/models/repository/user/index.js';
import { createMessage } from '@/models/repository/message/index.js';
import { addMessageToCache } from "@/services/redis/message.cache.service";

export default class SocketIOService {
    private static instance: SocketIOService;
    private io: SocketIOServer | null = null;
    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

    private constructor() { }

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
            console.log(`User connected`);
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
            only: ['_id', 'user_fullName', 'email', 'user_avatar', 'user_role', 'user_gender', 'user_status', 'user_dayOfBirth']
        });

        if (!user) {
            throw new NotFoundErrorResponse({ message: 'User not found!' });
        }

        /* --------------- Attach user to socket ------------ */
        socket.userId = payload.id;
        socket.user = user;
        socket.role = payload.role;
    }

    private handleConnection(socket: any): void {
        const userId = socket.userId as string;

        this.connectedUsers.set(userId, socket.id);

        socket.join(`user_${userId}`)

        //Client send message 
        socket.on('message-send', async (
            payload: { conversationId: string, text: string },
            ack?: (res: { ok: boolean; error?: string }) => void
            ) => {
                try {
                    const text = payload.text?.trim();
                    if (!text) {
                        ack?.({ ok: false, error: 'Null text' });
                        return;
                    }

                    const saved = await createMessage({
                        conversationId: payload.conversationId,
                        senderId: userId,
                        text,
                    });

                    
                    const message = {
                        _id: saved._id,
                        text: saved.text,
                        senderId: saved.senderId,
                        sender: socket.user,
                        conversationId: saved.conversationId,
                        createdAt: saved.createdAt,
                    };
                    
                    //Cache to Redis
                    await addMessageToCache(userId, {
                        role: "user",
                        content: saved.text,
                        createdAt: saved.createdAt.toISOString(),
                        metadata: { senderId: saved.senderId },
                    });

                    this.io?.to(`conversation_${payload.conversationId}`).emit('message-new', message);
                    ack?.({ ok: true });
                } catch (err: any) {
                    ack?.({ ok: false, error: err?.message || 'Send failed' });
                }
            }
        );
        
        //Send message to one user
        socket.on('message-on-toUser', async (
            payload: { toUserId: string, conversationId: string, text: string },
            ack?: (res: { ok: boolean; error?: string }) => void
            ) => {
                try {
                    const text = payload.text?.trim();
                    if (!payload.toUserId || !payload.text) {
                        ack?.({ ok: false, error: "toUser or text is null" });
                        return;
                    }

                    const savedMessage = await createMessage({
                        senderId: userId,
                        receiverId: payload.toUserId,
                        conversationId: payload.conversationId,
                        text,
                    });

                    const message = {
                        _id: savedMessage._id,
                        text: savedMessage.text,
                        senderId: savedMessage.senderId,
                        receiverId: savedMessage.receiverId,
                        conversationId: savedMessage.conversationId,
                        sender: socket.user,
                        createdAt: savedMessage.createdAt,
                    };

                    await addMessageToCache(userId, {
                        role: "user",
                        content: savedMessage.text,
                        createdAt: savedMessage.createdAt.toISOString(),
                        metadata: { senderId: savedMessage.senderId },
                    });

                    const targetSocketId = this.connectedUsers.get(payload.toUserId);
                    if (!targetSocketId) {
                        ack?.({ ok: false, error: "Offline user" })
                        return;
                    }

                    this.io?.to(targetSocketId).emit("message-new-direct", message);
                    socket.emit('message-new-direct', message);

                    ack?.({ ok: true });
                } catch (err: any) {
                    ack?.({ ok: false, error: err?.message || 'Send failed' });
                }
            }
        )

        socket.on('disconnect', () => {
            if (this.connectedUsers.get(userId) === socket.id) {
                this.connectedUsers.delete(userId);
            }
        });
    }

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

import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { env } from '../config/env';

let io: SocketServer | null = null;

export const initSocket = (server: HTTPServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: env.CORS_ORIGINS.split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // JWT auth middleware for socket
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) { next(new Error('Token requerido')); return; }
    try {
      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`[Socket] Conectado: ${user.userId}`);

    // Join personal room
    socket.join(`user:${user.userId}`);

    socket.on('track:join', ({ orderId }: { orderId: string }) => socket.join(`order:${orderId}`));
    socket.on('track:leave', ({ orderId }: { orderId: string }) => socket.leave(`order:${orderId}`));
    socket.on('chat:join', ({ serviceId }: { serviceId: string }) => socket.join(`service:${serviceId}`));
    socket.on('chat:leave', ({ serviceId }: { serviceId: string }) => socket.leave(`service:${serviceId}`));
    socket.on('provider:location', ({ location }: any) => {
      socket.broadcast.emit('service:provider_location', { userId: user.userId, location });
    });

    socket.on('disconnect', () => console.log(`[Socket] Desconectado: ${user.userId}`));
  });

  return io;
};

export const getIO = (): SocketServer | null => io;

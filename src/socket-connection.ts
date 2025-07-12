import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient } from './redis';
import http from 'http';
let io: Server | null = null;

export const initSocketIO = (server: http.Server) => {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.adapter(createAdapter(pubClient, subClient));

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      socket.join(userId as string);
      console.log(`User ${userId} connected with socket ${socket.id}`);
    } else {
      socket.disconnect();
    }

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO instance not initialized. Call initSocketIO(server) first.");
  }
  return io;
};
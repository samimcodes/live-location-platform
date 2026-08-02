import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Use a separate prisma instance to avoid circular imports with server/index.ts
const prisma = new PrismaClient();

interface LocationPayload {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  address?: string;
  city?: string;
  country?: string;
}

interface AuthSocket extends Socket {
  userId?: number;
}

/**
 * Authenticate socket connection via JWT token in handshake
 */
const authenticateSocket = (socket: AuthSocket, next: (err?: Error) => void): void => {
  const authData = socket.handshake.auth as Record<string, unknown>;
  const authHeader = socket.handshake.headers?.authorization as string | undefined;

  const token = (authData?.token as string | undefined) ?? authHeader?.split(' ')[1];

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret) as { userId: number; email: string };
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Authentication error: Invalid token'));
  }
};

export const initSocketHandlers = (io: SocketIOServer): void => {
  io.use(authenticateSocket);

  io.on('connection', async (rawSocket: Socket) => {
    const socket = rawSocket as AuthSocket;
    const userId = socket.userId!;

    console.log(`🟢 Socket connected: userId=${userId}, socketId=${socket.id}`);

    // Mark user as online
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true, lastSeen: new Date() },
      });
    } catch {
      // non-critical
    }

    // Join personal room
    socket.join(`user:${userId}`);

    // Notify friends this user is online
    const friendIds = await getFriendIds(userId);
    friendIds.forEach((friendId) => {
      io.to(`user:${friendId}`).emit('friend:online', { userId });
    });

    // ── EVENT: join group/room ──────────────────────────────
    socket.on('join', (roomId: string) => {
      socket.join(roomId);
    });

    // ── EVENT: leave room ───────────────────────────────────
    socket.on('leave', (roomId: string) => {
      socket.leave(roomId);
    });

    // ── EVENT: location update ─────────────────────────────
    socket.on('location:update', async (payload: LocationPayload) => {
      if (!userId) return;

      try {
        // Upsert current location
        await prisma.location.upsert({
          where: { userId },
          create: { userId, ...payload },
          update: { ...payload, updatedAt: new Date() },
        });

        // Save to history
        await prisma.locationHistory.create({
          data: { userId, ...payload, recordedAt: new Date() },
        });

        // Broadcast to friends
        const latestFriendIds = await getFriendIds(userId);
        latestFriendIds.forEach((friendId) => {
          io.to(`user:${friendId}`).emit('location:receive', {
            userId,
            ...payload,
            timestamp: new Date().toISOString(),
          });
        });
      } catch (err) {
        console.error('location:update error:', err);
      }
    });

    // ── EVENT: disconnect ──────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔴 Socket disconnected: userId=${userId}`);

      try {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false, lastSeen: new Date() },
        });
      } catch {
        // non-critical
      }

      const offlineFriendIds = await getFriendIds(userId);
      offlineFriendIds.forEach((friendId) => {
        io.to(`user:${friendId}`).emit('friend:offline', { userId });
      });
    });
  });
};

/** Helper — returns all friend userIds for a given user */
const getFriendIds = async (userId: number): Promise<number[]> => {
  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      select: { user1Id: true, user2Id: true },
    });
    return friendships.map((f) => (f.user1Id === userId ? f.user2Id : f.user1Id));
  } catch {
    return [];
  }
};

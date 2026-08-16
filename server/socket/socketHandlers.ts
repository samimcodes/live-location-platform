import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

// Use a separate prisma instance to avoid circular imports with server/index.ts
const prisma = new PrismaClient();

// ── Shared payload types ───────────────────────────────────────────────────
// These types are documented here so React Native clients can mirror them.

export interface LocationPayload {
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

/** Outbound location event broadcast to friends / group members. */
export interface LocationBroadcast extends LocationPayload {
  userId: number;
  timestamp: string;
}

interface AuthSocket extends Socket {
  userId?: number;
}

// ── Validation ─────────────────────────────────────────────────────────────
function isValidLocationPayload(p: unknown): p is LocationPayload {
  if (!p || typeof p !== 'object') return false;
  const obj = p as Record<string, unknown>;
  const lat = obj.latitude;
  const lng = obj.longitude;
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    isFinite(lat) && isFinite(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

// ── JWT authentication middleware ─────────────────────────────────────────
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

// ── Main handler ─────────────────────────────────────────────────────────
export const initSocketHandlers = (io: SocketIOServer): void => {
  io.use(authenticateSocket);

  io.on('connection', async (rawSocket: Socket) => {
    const socket = rawSocket as AuthSocket;
    const userId = socket.userId!;

    console.log(`🟢 Socket connected: userId=${userId}, socketId=${socket.id}`);

    // Mark user online
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true, lastSeen: new Date() },
      });
    } catch { /* non-critical */ }

    // Personal room — all targeted server→client events go here
    socket.join(`user:${userId}`);

    // Notify friends
    const friendIds = await getFriendIds(userId);
    friendIds.forEach((fid) => {
      io.to(`user:${fid}`).emit('friend:online', { userId });
    });

    // ── join / leave arbitrary rooms (group map views) ────────────────────
    socket.on('join', (roomId: string) => {
      if (typeof roomId === 'string' && roomId.length < 128) socket.join(roomId);
    });

    socket.on('leave', (roomId: string) => {
      socket.leave(roomId);
    });

    // ── location:update (from client GPS) ─────────────────────────────────
    socket.on('location:update', async (payload: unknown) => {
      if (!isValidLocationPayload(payload)) {
        socket.emit('error', { message: 'Invalid location payload' });
        return;
      }

      try {
        // Guard: verify the user actually exists in the DB before any write.
        // This prevents FK violations if a JWT is valid but the account was
        // deleted (e.g. during dev/test resets).
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, sharingLocation: true },
        });

        if (!userExists) {
          console.warn(`location:update skipped — userId=${userId} not found in DB`);
          socket.emit('error', { message: 'User account not found' });
          return;
        }

        // Respect the user's own sharing preference
        if (!userExists.sharingLocation) return;

        // Upsert current location
        await prisma.location.upsert({
          where: { userId },
          create: { userId, ...payload },
          update: { ...payload, updatedAt: new Date() },
        });

        // Append to history
        await prisma.locationHistory.create({
          data: { userId, ...payload, recordedAt: new Date() },
        });

        const broadcast: LocationBroadcast = {
          userId,
          ...payload,
          timestamp: new Date().toISOString(),
        };

        // Broadcast to friends
        const latestFriendIds = await getFriendIds(userId);
        latestFriendIds.forEach((fid) => {
          io.to(`user:${fid}`).emit('location:receive', broadcast);
        });

        // Broadcast to any group rooms this user is in
        // Group rooms are identified as `group:{groupId}` — clients join via `join` event
        const groupIds = await getGroupIds(userId);
        groupIds.forEach((gid) => {
          // Emit to the group room but NOT back to the sender
          socket.to(`group:${gid}`).emit('group:location:receive', broadcast);
        });
      } catch (err) {
        console.error('location:update error:', err);
      }
    });

    // ── location:request (ask a specific friend to share their location) ──
    // Useful for React Native / mobile app "ping" feature.
    socket.on('location:request', async (payload: unknown) => {
      const p = payload as Record<string, unknown> | null;
      if (!p || typeof p.targetUserId !== 'number') return;

      const targetUserId = p.targetUserId;

      // Security: only allow friends to request each other's location
      const areFriends = await checkFriendship(userId, targetUserId);
      if (!areFriends) {
        socket.emit('error', { message: 'You can only request location from friends' });
        return;
      }

      io.to(`user:${targetUserId}`).emit('location:requested', {
        fromUserId: userId,
        timestamp: new Date().toISOString(),
      });
    });

    // ── disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔴 Socket disconnected: userId=${userId}`);

      try {
        // Only update if user still exists (handles deleted accounts)
        const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
        if (exists) {
          await prisma.user.update({
            where: { id: userId },
            data: { isOnline: false, lastSeen: new Date() },
          });
        }
      } catch { /* non-critical */ }

      const offlineFriendIds = await getFriendIds(userId);
      offlineFriendIds.forEach((fid) => {
        io.to(`user:${fid}`).emit('friend:offline', { userId });
      });
    });
  });
};

// ── Helpers ──────────────────────────────────────────────────────────────

/** Returns all friend userIds for a given user. */
const getFriendIds = async (userId: number): Promise<number[]> => {
  try {
    const friendships = await prisma.friendship.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      select: { user1Id: true, user2Id: true },
    });
    return friendships.map((f) => (f.user1Id === userId ? f.user2Id : f.user1Id));
  } catch {
    return [];
  }
};

/** Returns all groupIds the user belongs to. */
const getGroupIds = async (userId: number): Promise<number[]> => {
  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });
    return memberships.map((m) => m.groupId);
  } catch {
    return [];
  }
};

/** Checks whether two users are friends (bidirectional). */
const checkFriendship = async (userA: number, userB: number): Promise<boolean> => {
  try {
    const [u1, u2] = userA < userB ? [userA, userB] : [userB, userA];
    const f = await prisma.friendship.findFirst({
      where: { user1Id: u1, user2Id: u2 },
    });
    return !!f;
  } catch {
    return false;
  }
};

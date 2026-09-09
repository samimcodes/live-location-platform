import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { readCookie } from '../utils/authCookies';
import {
  LOCATION_HISTORY_RETENTION_MS,
  pickLocationFields,
  shouldRecordHistory,
  type LocationFields,
} from '../utils/locationPayload';

export type LocationPayload = LocationFields;

/** Outbound location event broadcast to friends / group members. */
export interface LocationBroadcast extends LocationPayload {
  userId: number;
  timestamp: string;
}

interface AuthSocket extends Socket {
  userId?: number;
}

const authenticateSocket = (socket: AuthSocket, next: (err?: Error) => void): void => {
  const authData = socket.handshake.auth as Record<string, unknown>;
  const authHeader = socket.handshake.headers?.authorization as string | undefined;
  const cookieToken = readCookie(socket.handshake.headers?.cookie, 'accessToken');

  const token =
    (authData?.token as string | undefined) ||
    authHeader?.split(' ')[1] ||
    cookieToken;

  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');
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

    // Runtime guard — should never fire since authenticateSocket middleware runs first,
    // but protects against type-system gaps.
    if (!socket.userId) {
      socket.disconnect(true);
      return;
    }
    const userId = socket.userId;

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
    socket.on('join', async (roomId: string) => {
      if (typeof roomId !== 'string' || roomId.length >= 128) return;

      const groupMatch = /^group:(\d+)$/.exec(roomId);
      if (groupMatch) {
        const groupId = Number(groupMatch[1]);
        const member = await prisma.groupMember.findUnique({
          where: { groupId_userId: { groupId, userId } },
          select: { id: true },
        });
        if (!member) {
          socket.emit('error', { message: 'Not a member of this group' });
          return;
        }
        socket.join(roomId);
        return;
      }

      if (roomId === `user:${userId}`) socket.join(roomId);
    });

    socket.on('leave', (roomId: string) => {
      socket.leave(roomId);
    });

    // ── location:update (from client GPS) ─────────────────────────────────
    socket.on('location:update', async (payload: unknown) => {
      const fields = pickLocationFields(payload);
      if (!fields) {
        socket.emit('error', { message: 'Invalid location payload' });
        return;
      }

      try {
        const userExists = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, sharingLocation: true },
        });

        if (!userExists) {
          console.warn(`location:update skipped — userId=${userId} not found in DB`);
          socket.emit('error', { message: 'User account not found' });
          return;
        }

        if (!userExists.sharingLocation) return;

        await prisma.location.upsert({
          where: { userId },
          create: { userId, ...fields },
          update: { ...fields, updatedAt: new Date() },
        });

        if (shouldRecordHistory(userId, fields.latitude, fields.longitude)) {
          await prisma.locationHistory.create({
            data: { userId, ...fields, recordedAt: new Date() },
          });
          await prisma.locationHistory.deleteMany({
            where: {
              userId,
              recordedAt: { lt: new Date(Date.now() - LOCATION_HISTORY_RETENTION_MS) },
            },
          });
        }

        const broadcast: LocationBroadcast = {
          userId,
          ...fields,
          timestamp: new Date().toISOString(),
        };

        const latestFriendIds = await getFriendIds(userId);
        latestFriendIds.forEach((fid) => {
          io.to(`user:${fid}`).emit('location:receive', broadcast);
        });

        const groupIds = await getGroupIds(userId);
        groupIds.forEach((gid) => {
          socket.to(`group:${gid}`).emit('group:location:receive', broadcast);
        });

        // ── Geofence Safe Zone Proximity Check (Home, School, Work, etc.) ────
        try {
          const savedPlaces = await prisma.savedPlace.findMany({
            where: { userId },
            select: { id: true, name: true, latitude: true, longitude: true, type: true },
          });

          for (const place of savedPlaces) {
            const distance = haversineMeters(fields.latitude, fields.longitude, place.latitude, place.longitude);
            if (distance <= 150) {
              const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
              const recentAlert = await prisma.notification.findFirst({
                where: {
                  userId,
                  type: 'LOCATION_ALERT',
                  createdAt: { gte: twoHoursAgo },
                  body: { contains: place.name },
                },
              });

              if (!recentAlert) {
                const notifBody = `${userExists.name} arrived safely at ${place.name}.`;
                const notif = await prisma.notification.create({
                  data: {
                    userId,
                    type: 'LOCATION_ALERT',
                    title: `Safe Zone: ${place.name}`,
                    body: notifBody,
                    data: { placeId: place.id, placeName: place.name, placeType: place.type },
                  },
                });

                socket.emit('notification', {
                  id: notif.id,
                  type: 'LOCATION_ALERT',
                  message: notifBody,
                  data: notif.data,
                });

                latestFriendIds.forEach((fid) => {
                  io.to(`user:${fid}`).emit('notification', {
                    id: notif.id,
                    type: 'LOCATION_ALERT',
                    message: notifBody,
                    data: { userId, placeName: place.name },
                  });
                });
              }
            }
          }
        } catch { /* non-critical geofence check failure */ }
      } catch (err) {
        console.error('location:update error:', err);
      }
    });

    // ── sos:dispatch (Emergency 1-Click SOS from client) ──────────────────
    socket.on('sos:dispatch', async (payload: unknown) => {
      const p = payload as {
        latitude?: number;
        longitude?: number;
        address?: string;
        message?: string;
      } | null;

      if (!p || typeof p.latitude !== 'number' || typeof p.longitude !== 'number') {
        socket.emit('error', { message: 'Invalid SOS payload' });
        return;
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, phone: true },
        });
        if (!user) return;

        // Upsert current location to DB
        await prisma.location.upsert({
          where: { userId },
          create: {
            userId,
            latitude: p.latitude,
            longitude: p.longitude,
            address: p.address,
          },
          update: {
            latitude: p.latitude,
            longitude: p.longitude,
            address: p.address,
            updatedAt: new Date(),
          },
        });

        // Record emergency history breadcrumb
        await prisma.locationHistory.create({
          data: {
            userId,
            latitude: p.latitude,
            longitude: p.longitude,
            address: p.address,
            recordedAt: new Date(),
          },
        });

        const friendIds = await getFriendIds(userId);
        const sosAlert = {
          userId,
          name: user.name,
          latitude: p.latitude,
          longitude: p.longitude,
          address: p.address || 'Pinpoint GPS Coordinates',
          message: p.message || 'EMERGENCY: Immediate assistance requested!',
          timestamp: new Date().toISOString(),
        };

        // Create persistent LOCATION_ALERT notification for all friends
        for (const fid of friendIds) {
          const notif = await prisma.notification.create({
            data: {
              userId: fid,
              type: 'LOCATION_ALERT',
              title: `🚨 EMERGENCY SOS: ${user.name}`,
              body: `${user.name} triggered an Emergency SOS near ${p.address || `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`}!`,
              data: sosAlert,
            },
          });

          // High-priority audio/UI event + persistent notification to friend's socket room
          io.to(`user:${fid}`).emit('sos:alert', sosAlert);
          io.to(`user:${fid}`).emit('notification', {
            id: notif.id,
            type: 'LOCATION_ALERT',
            message: notif.body,
            data: sosAlert,
          });
        }

        // Also broadcast to user's circles/groups
        const groupIds = await getGroupIds(userId);
        groupIds.forEach((gid) => {
          socket.to(`group:${gid}`).emit('sos:alert', sosAlert);
        });

        socket.emit('sos:dispatched', {
          success: true,
          recipients: friendIds.length,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('sos:dispatch error:', err);
        socket.emit('error', { message: 'Failed to dispatch SOS alert' });
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

/** Calculates distance in meters between two lat/lng coordinates */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

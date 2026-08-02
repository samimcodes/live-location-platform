import { PrismaClient } from '@prisma/client';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();

interface LocationInput {
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

export class LocationService {
  // ── Upsert current location ──────────────────────────────────
  static updateLocation = catchServiceAsync(async (userId: number, data: LocationInput) => {
    const location = await prisma.location.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data, updatedAt: new Date() },
    });

    // Auto-save to history
    await prisma.locationHistory.create({
      data: { userId, ...data, recordedAt: new Date() },
    });

    return location;
  });

  // ── Get current location of a user ───────────────────────────
  static getLocation = catchServiceAsync(async (userId: number) => {
    return prisma.location.findUnique({ where: { userId } });
  });

  // ── Get friends' current locations ───────────────────────────
  static getFriendsLocations = catchServiceAsync(async (userId: number) => {
    const friendships = await prisma.friendship.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      select: { user1Id: true, user2Id: true },
    });

    const friendIds = friendships.map((f) => (f.user1Id === userId ? f.user2Id : f.user1Id));

    return prisma.location.findMany({
      where: { userId: { in: friendIds } },
      include: {
        user: {
          select: {
            id: true, name: true, avatar: true,
            isOnline: true, sharingLocation: true,
          },
        },
      },
    });
  });

  // ── Location history ─────────────────────────────────────────
  static getHistory = catchServiceAsync(async (
    userId: number,
    startDate?: string,
    endDate?: string,
    limit = 100
  ) => {
    const where: { userId: number; recordedAt?: { gte?: Date; lte?: Date } } = { userId };

    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) where.recordedAt.gte = new Date(startDate);
      if (endDate) where.recordedAt.lte = new Date(endDate);
    }

    return prisma.locationHistory.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  });

  // ── Delete location history ──────────────────────────────────
  static clearHistory = catchServiceAsync(async (userId: number) => {
    await prisma.locationHistory.deleteMany({ where: { userId } });
    return { message: 'Location history cleared' };
  });

  // ── Toggle location sharing ──────────────────────────────────
  static toggleSharing = catchServiceAsync(async (userId: number, sharing: boolean) => {
    return prisma.user.update({
      where: { id: userId },
      data: { sharingLocation: sharing },
      select: { id: true, sharingLocation: true },
    });
  });
}

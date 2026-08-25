import { catchServiceAsync } from '../utils/catchServiceAsync';
import { prisma } from '../lib/prisma';
import {
  LOCATION_HISTORY_RETENTION_MS,
  shouldRecordHistory,
  type LocationFields,
} from '../utils/locationPayload';

export class LocationService {
  static getFriendIds = catchServiceAsync(async (userId: number) => {
    const friendships = await prisma.friendship.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      select: { user1Id: true, user2Id: true },
    });
    return friendships.map((f) => (f.user1Id === userId ? f.user2Id : f.user1Id));
  });

  // ── Upsert current location ──────────────────────────────────
  static updateLocation = catchServiceAsync(async (userId: number, data: LocationFields) => {
    const location = await prisma.location.upsert({
      where: { userId },
      create: { userId, ...data },
      update: { ...data, updatedAt: new Date() },
    });

    if (shouldRecordHistory(userId, data.latitude, data.longitude)) {
      await prisma.locationHistory.create({
        data: { userId, ...data, recordedAt: new Date() },
      });
      await prisma.locationHistory.deleteMany({
        where: {
          userId,
          recordedAt: { lt: new Date(Date.now() - LOCATION_HISTORY_RETENTION_MS) },
        },
      });
    }

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
    limit = 100,
    skip = 0
  ) => {
    const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
    const where: { userId: number; recordedAt?: { gte?: Date; lte?: Date } } = { userId };

    if (startDate || endDate) {
      where.recordedAt = {};
      if (startDate) {
        if (!ISO_DATE_RE.test(startDate)) throw new Error('Invalid startDate format — expected YYYY-MM-DD');
        where.recordedAt.gte = new Date(startDate + 'T00:00:00.000Z');
      }
      if (endDate) {
        if (!ISO_DATE_RE.test(endDate)) throw new Error('Invalid endDate format — expected YYYY-MM-DD');
        // Include the full end day up to 23:59:59.999
        where.recordedAt.lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    const [records, total] = await Promise.all([
      prisma.locationHistory.findMany({
        where,
        orderBy: { recordedAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.locationHistory.count({ where }),
    ]);

    return { records, total, limit, skip };
  });

  // ── History statistics ────────────────────────────────────────
  static getHistoryStats = catchServiceAsync(async (userId: number) => {
    const entries = await prisma.locationHistory.findMany({
      where: { userId },
      select: {
        latitude: true,
        longitude: true,
        speed: true,
        city: true,
        country: true,
        recordedAt: true,
      },
      orderBy: { recordedAt: 'asc' },
    });

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        uniqueCities: 0,
        estimatedDistanceKm: 0,
        averageSpeedKmh: null,
        firstRecordedAt: null,
        lastRecordedAt: null,
        topCities: [],
      };
    }

    // Unique cities
    const cityMap = new Map<string, number>();
    for (const e of entries) {
      if (e.city) cityMap.set(e.city, (cityMap.get(e.city) ?? 0) + 1);
    }
    const topCities = [...cityMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    // Estimated distance using Haversine between consecutive points
    let totalDistanceKm = 0;
    for (let i = 1; i < entries.length; i++) {
      totalDistanceKm += haversineKm(
        entries[i - 1].latitude, entries[i - 1].longitude,
        entries[i].latitude,     entries[i].longitude
      );
    }

    // Average speed (only from entries that recorded speed > 0)
    const speedEntries = entries.filter((e) => e.speed != null && e.speed > 0);
    const averageSpeedKmh = speedEntries.length > 0
      ? speedEntries.reduce((sum, e) => sum + e.speed! * 3.6, 0) / speedEntries.length
      : null;

    return {
      totalEntries: entries.length,
      uniqueCities: cityMap.size,
      estimatedDistanceKm: Math.round(totalDistanceKm * 10) / 10,
      averageSpeedKmh: averageSpeedKmh ? Math.round(averageSpeedKmh * 10) / 10 : null,
      firstRecordedAt: entries[0].recordedAt.toISOString(),
      lastRecordedAt:  entries[entries.length - 1].recordedAt.toISOString(),
      topCities,
    };
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

// ── Haversine distance (km) between two lat/lng points ────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

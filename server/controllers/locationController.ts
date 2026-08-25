import { Response } from 'express';
import { LocationService } from '../services/locationService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';
import type { LocationBroadcast } from '../socket/socketHandlers';
import { pickLocationFields } from '../utils/locationPayload';

/**
 * LocationController
 * ------------------
 * All responses follow a consistent envelope:
 *   { success: boolean, message: string, data: T | null }
 *
 * This shape is intentional — the same API is consumed by:
 *   1. The Next.js frontend (via src/lib/axios.ts)
 *   2. Future React Native mobile client (same base URL, same endpoints)
 *
 * Endpoint summary (all behind verifyToken):
 *   PUT    /location/update     — upsert current position + save to history
 *   GET    /location/me         — my current location
 *   GET    /location/friends    — all friends' current locations (with user info)
 *   GET    /location/history    — my location history (filterable, paginated)
 *   DELETE /location/history    — clear my history
 *   PATCH  /location/sharing    — toggle sharingLocation flag
 */
export class LocationController {
  // ── PUT /update ──────────────────────────────────────────────────────────
  static updateLocation = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const fields = pickLocationFields(req.body);
    if (!fields) {
      sendResponse(res, { statusCode: 400, message: 'Invalid latitude or longitude' });
      return;
    }

    const location = await LocationService.updateLocation(userId, fields);

    if (req.io) {
      const broadcast: LocationBroadcast = {
        userId,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy ?? undefined,
        altitude: location.altitude ?? undefined,
        speed: location.speed ?? undefined,
        heading: location.heading ?? undefined,
        address: location.address ?? undefined,
        city: location.city ?? undefined,
        country: location.country ?? undefined,
        timestamp: new Date().toISOString(),
      };
      req.io.to(`user:${userId}`).emit('location:broadcast', broadcast);
      const friendIds = await LocationService.getFriendIds(userId);
      friendIds.forEach((fid) => {
        req.io!.to(`user:${fid}`).emit('location:receive', broadcast);
      });
    }

    sendResponse(res, {
      statusCode: 200,
      message: 'Location updated',
      data: location,
    });
  });

  // ── GET /me ──────────────────────────────────────────────────────────────
  static getMyLocation = catchAsync(async (req: AuthRequest, res: Response) => {
    const location = await LocationService.getLocation(req.user!.userId);

    sendResponse(res, {
      statusCode: 200,
      message: location ? 'Location found' : 'No location recorded yet',
      data: location,
    });
  });

  // ── GET /friends ─────────────────────────────────────────────────────────
  // Returns an array of:
  //   { userId, latitude, longitude, accuracy?, speed?, heading?,
  //     address?, city?, country?, updatedAt,
  //     user: { id, name, avatar, isOnline, sharingLocation } }
  static getFriendsLocations = catchAsync(async (req: AuthRequest, res: Response) => {
    const locations = await LocationService.getFriendsLocations(req.user!.userId);

    // Normalise: flatten the nested `user` info for easier consumption by
    // mobile clients that prefer a flat structure.
    const data = (locations as Array<{
      userId: number;
      latitude: number;
      longitude: number;
      accuracy: number | null;
      altitude: number | null;
      speed: number | null;
      heading: number | null;
      address: string | null;
      city: string | null;
      country: string | null;
      updatedAt: Date;
      user: {
        id: number;
        name: string;
        avatar: string | null;
        isOnline: boolean;
        sharingLocation: boolean;
      };
    }>).map((loc) => ({
      userId: loc.userId,
      latitude: loc.latitude,
      longitude: loc.longitude,
      accuracy: loc.accuracy ?? undefined,
      altitude: loc.altitude ?? undefined,
      speed: loc.speed ?? undefined,
      heading: loc.heading ?? undefined,
      address: loc.address ?? undefined,
      city: loc.city ?? undefined,
      country: loc.country ?? undefined,
      updatedAt: loc.updatedAt.toISOString(),
      user: {
        id: loc.user.id,
        name: loc.user.name,
        avatar: loc.user.avatar ?? null,
        isOnline: loc.user.isOnline,
        sharingLocation: loc.user.sharingLocation,
      },
    }));

    sendResponse(res, {
      statusCode: 200,
      message: `${data.length} friend location(s) found`,
      data,
    });
  });

  // ── GET /history ─────────────────────────────────────────────────────────
  static getHistory = catchAsync(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate, limit, skip } = req.query as {
      startDate?: string;
      endDate?: string;
      limit?: string;
      skip?: string;
    };

    const limitNum = limit ? Math.min(Number(limit), 500) : 100;
    const skipNum  = skip  ? Math.max(Number(skip),  0)   : 0;

    const result = await LocationService.getHistory(
      req.user!.userId,
      startDate,
      endDate,
      limitNum,
      skipNum,
    );

    sendResponse(res, {
      statusCode: 200,
      message: `${result.total} history record(s)`,
      data: result,
    });
  });

  // ── GET /history/stats ────────────────────────────────────────────────────
  static getHistoryStats = catchAsync(async (req: AuthRequest, res: Response) => {
    const stats = await LocationService.getHistoryStats(req.user!.userId);
    sendResponse(res, { statusCode: 200, message: 'Stats retrieved', data: stats });
  });

  // ── DELETE /history ───────────────────────────────────────────────────────
  static clearHistory = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await LocationService.clearHistory(req.user!.userId);
    sendResponse(res, { statusCode: 200, message: result.message, data: null });
  });

  // ── PATCH /sharing ────────────────────────────────────────────────────────
  static toggleSharing = catchAsync(async (req: AuthRequest, res: Response) => {
    const { sharing } = req.body as { sharing?: unknown };

    if (typeof sharing !== 'boolean') {
      sendResponse(res, {
        statusCode: 400,
        message: 'Body must include `sharing` (boolean)',
        data: null,
      });
      return;
    }

    const result = await LocationService.toggleSharing(req.user!.userId, sharing);

    // Notify the user's friends about the sharing change via socket.
    // We broadcast to each friend's personal room so their maps update live.
    if (req.io) {
      try {
        const friendIds = await LocationService.getFriendIds(req.user!.userId);
        const event = { userId: req.user!.userId, sharing };
        friendIds.forEach((fid) => {
          req.io!.to(`user:${fid}`).emit('sharing:changed', event);
        });
      } catch { /* non-critical — socket broadcast failure should not fail the REST response */ }
    }

    sendResponse(res, {
      statusCode: 200,
      message: `Location sharing ${sharing ? 'enabled' : 'disabled'}`,
      data: result,
    });
  });
}

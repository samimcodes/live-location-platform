import { Response } from 'express';
import { LocationService } from '../services/locationService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';
import type { LocationBroadcast } from '../socket/socketHandlers';

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

    // Basic server-side payload validation (defense-in-depth; socket layer also validates)
    const { latitude, longitude } = req.body as { latitude?: unknown; longitude?: unknown };
    if (
      typeof latitude !== 'number' || typeof longitude !== 'number' ||
      !isFinite(latitude) || !isFinite(longitude) ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      sendResponse(res, { statusCode: 400, message: 'Invalid latitude or longitude' });
      return;
    }

    const location = await LocationService.updateLocation(userId, req.body);

    // Broadcast the updated position to the user's own personal room so that
    // other devices / tabs of the same user can see it.
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
    const { startDate, endDate, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      limit?: string;
    };

    const limitNum = limit ? Math.min(Number(limit), 500) : 100;

    const history = await LocationService.getHistory(
      req.user!.userId,
      startDate,
      endDate,
      limitNum
    );

    sendResponse(res, {
      statusCode: 200,
      message: `${history.length} history record(s)`,
      data: history,
    });
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

    // Notify the user's friends about the sharing change via socket
    if (req.io) {
      req.io
        .to(`user:${req.user!.userId}`)
        .emit('sharing:changed', { userId: req.user!.userId, sharing });
    }

    sendResponse(res, {
      statusCode: 200,
      message: `Location sharing ${sharing ? 'enabled' : 'disabled'}`,
      data: result,
    });
  });
}

import { Response } from 'express';
import { LocationService } from '../services/locationService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

export class LocationController {
  static updateLocation = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const location = await LocationService.updateLocation(userId, req.body);

    // Broadcast to friends via Socket.IO (attached to req by server/index.ts)
    if (req.io) {
      req.io.to(`user:${userId}`).emit('location:broadcast', { userId, ...location });
    }

    sendResponse(res, { statusCode: 200, message: 'Location updated', data: location });
  });

  static getMyLocation = catchAsync(async (req: AuthRequest, res: Response) => {
    const location = await LocationService.getLocation(req.user!.userId);
    sendResponse(res, { statusCode: 200, data: location });
  });

  static getFriendsLocations = catchAsync(async (req: AuthRequest, res: Response) => {
    const locations = await LocationService.getFriendsLocations(req.user!.userId);
    sendResponse(res, { statusCode: 200, data: locations });
  });

  static getHistory = catchAsync(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate, limit } = req.query as {
      startDate?: string;
      endDate?: string;
      limit?: string;
    };
    const history = await LocationService.getHistory(
      req.user!.userId,
      startDate,
      endDate,
      limit ? Number(limit) : 100
    );
    sendResponse(res, { statusCode: 200, data: history });
  });

  static clearHistory = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await LocationService.clearHistory(req.user!.userId);
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static toggleSharing = catchAsync(async (req: AuthRequest, res: Response) => {
    const { sharing } = req.body as { sharing?: boolean };
    if (sharing === undefined) {
      sendResponse(res, { statusCode: 400, message: 'sharing (boolean) is required' });
      return;
    }
    const result = await LocationService.toggleSharing(req.user!.userId, sharing);
    sendResponse(res, {
      statusCode: 200,
      message: `Location sharing ${sharing ? 'enabled' : 'disabled'}`,
      data: result,
    });
  });
}

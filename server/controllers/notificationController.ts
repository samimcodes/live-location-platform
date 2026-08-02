import { Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

export class NotificationController {
  static getNotifications = catchAsync(async (req: AuthRequest, res: Response) => {
    const { page, limit } = req.query as { page?: string; limit?: string };
    const result = await NotificationService.getByUser(
      req.user!.userId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );
    sendResponse(res, { statusCode: 200, data: result });
  });

  static getUnreadCount = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await NotificationService.getUnreadCount(req.user!.userId);
    sendResponse(res, { statusCode: 200, data: result });
  });

  static markAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const notification = await NotificationService.markAsRead(Number(id), req.user!.userId);
    sendResponse(res, { statusCode: 200, message: 'Marked as read', data: notification });
  });

  static markAllAsRead = catchAsync(async (req: AuthRequest, res: Response) => {
    const result = await NotificationService.markAllAsRead(req.user!.userId);
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static deleteNotification = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await NotificationService.deleteNotification(Number(id), req.user!.userId);
    sendResponse(res, { statusCode: 200, message: result.message });
  });
}

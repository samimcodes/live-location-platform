import { Response } from 'express';
import { UserService } from '../services/userService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

export class UserController {
  static getAll = catchAsync(async (_req: AuthRequest, res: Response) => {
    const users = await UserService.getAll();
    sendResponse(res, { statusCode: 200, data: users });
  });

  static getById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const user = await UserService.getById(Number(id));
    sendResponse(res, { statusCode: 200, data: user });
  });

  static getProfile = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await UserService.getById(req.user!.userId);
    sendResponse(res, { statusCode: 200, data: user });
  });

  static updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const user = await UserService.updateProfile(userId, req.body);
    sendResponse(res, { statusCode: 200, message: 'Profile updated', data: user });
  });

  static deleteUser = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const targetId = Number(id);
    const callerId = req.user!.userId;
    const callerRole = req.user!.role;

    if (callerId !== targetId && callerRole !== 'ADMIN') {
      sendResponse(res, { statusCode: 403, message: 'You can only delete your own account' });
      return;
    }

    const result = await UserService.deleteUser(targetId);
    sendResponse(res, { statusCode: 200, message: result.message });
  });
}

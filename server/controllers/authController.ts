import { Response } from 'express';
import { AuthService } from '../services/authService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';
import { clearAuthCookies, setAuthCookies } from '../utils/authCookies';

export class AuthController {
  static register = catchAsync(async (req: AuthRequest, res: Response) => {
    const user = await AuthService.registerUser(req.body);
    sendResponse(res, { statusCode: 201, message: 'Account created successfully', data: user });
  });

  static login = catchAsync(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      sendResponse(res, { statusCode: 400, message: 'Email and password are required' });
      return;
    }

    const result = await AuthService.loginUser(email, password);
    setAuthCookies(res, result.token, result.refreshToken);

    sendResponse(res, {
      statusCode: 200,
      message: 'Welcome back!',
      data: { user: result.user, token: result.token },
    });
  });

  static forgotPassword = catchAsync(async (req: AuthRequest, res: Response) => {
    const { email } = req.body as { email?: string };
    if (!email) {
      sendResponse(res, { statusCode: 400, message: 'Email is required' });
      return;
    }
    const result = await AuthService.forgotPassword(email);
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static resetPassword = catchAsync(async (req: AuthRequest, res: Response) => {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword) {
      sendResponse(res, { statusCode: 400, message: 'Token and new password are required' });
      return;
    }
    const result = await AuthService.resetPassword(token, newPassword);
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static refreshToken = catchAsync(async (req: AuthRequest, res: Response) => {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) {
      sendResponse(res, { statusCode: 401, message: 'Refresh token not found' });
      return;
    }
    const result = await AuthService.refreshToken(refreshToken);
    const existingRefresh = req.cookies?.refreshToken as string;
    setAuthCookies(res, result.token, existingRefresh);

    sendResponse(res, { statusCode: 200, message: 'Token refreshed', data: result });
  });

  static logout = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (userId) {
      await AuthService.logoutUser(userId);
    }
    clearAuthCookies(res);
    sendResponse(res, { statusCode: 200, message: 'Logged out successfully' });
  });

  static me = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      clearAuthCookies(res);
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const user = await AuthService.getMe(userId);
    if (!user) {
      clearAuthCookies(res);
      sendResponse(res, { statusCode: 404, message: 'User not found' });
      return;
    }
    sendResponse(res, { statusCode: 200, data: user });
  });

  static updatePassword = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, { statusCode: 401, message: 'Unauthorized' });
      return;
    }
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword) {
      sendResponse(res, { statusCode: 400, message: 'Current and new password are required' });
      return;
    }
    await AuthService.updatePassword(userId, currentPassword, newPassword);
    sendResponse(res, { statusCode: 200, message: 'Password updated successfully' });
  });
}

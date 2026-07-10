import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => {
    const user = await AuthService.registerUser(req.body);
    sendResponse(res, {
      statusCode: 201,
      message: 'User registered successfully',
      data: user,
    });
  });

  static login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      sendResponse(res, {
        statusCode: 400,
        message: 'Email and password are required',
      });
      return;
    }
    const result = await AuthService.loginUser(email, password);
    
    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendResponse(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  });

  static forgotPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      sendResponse(res, { statusCode: 400, message: 'Email is required' });
      return;
    }
    const result = await AuthService.forgotPassword(email);
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      sendResponse(res, { statusCode: 400, message: 'Token and new password are required' });
      return;
    }
    const result = await AuthService.resetPassword(token, newPassword);
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static refreshToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      sendResponse(res, { statusCode: 401, message: 'Refresh token not found' });
      return;
    }
    const result = await AuthService.refreshToken(refreshToken);
    sendResponse(res, { statusCode: 200, message: 'Token refreshed', data: result });
  });

  static logout = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (userId) {
      await AuthService.logoutUser(userId);
    }
    res.clearCookie('refreshToken');
    sendResponse(res, { statusCode: 200, message: 'Logged out successfully' });
  });



  static me = catchAsync(async (req: any, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      sendResponse(res, {
        statusCode: 401,
        message: 'Unauthorized',
      });
      return;
    }



    const user = await AuthService.getMe(userId);
    if (!user) {
      sendResponse(res, {
        statusCode: 404,
        message: 'User not found',
      });
      return;
    }




    sendResponse(res, {
      statusCode: 200,
      data: user,
    });
  });
}


import { Request, Response } from 'express';
import { SocialAuthService } from '../services/socialAuthService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { setAuthCookies } from '../utils/authCookies';

export class SocialAuthController {
  static loginWithGoogle = catchAsync(async (req: Request, res: Response) => {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      sendResponse(res, { statusCode: 400, message: 'Google credential is required' });
      return;
    }

    const result = await SocialAuthService.loginWithGoogle(credential);
    setAuthCookies(res, result.token, result.refreshToken);
    sendResponse(res, {
      statusCode: 200,
      message: 'Signed in with Google',
      data: { user: result.user, token: result.token },
    });
  });

  static loginWithFacebook = catchAsync(async (req: Request, res: Response) => {
    const { accessToken } = req.body as { accessToken?: string };

    if (!accessToken) {
      sendResponse(res, { statusCode: 400, message: 'Facebook access token is required' });
      return;
    }

    const result = await SocialAuthService.loginWithFacebook(accessToken);
    setAuthCookies(res, result.token, result.refreshToken);
    sendResponse(res, {
      statusCode: 200,
      message: 'Signed in with Facebook',
      data: { user: result.user, token: result.token },
    });
  });
}

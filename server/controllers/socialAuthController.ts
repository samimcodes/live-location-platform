import { Request, Response } from 'express';
import { SocialAuthService } from '../services/socialAuthService';
import { sendResponse } from '../utils/sendResponse';

export class SocialAuthController {
  static async loginWithGoogle(req: Request, res: Response): Promise<void> {
    try {
      const { credential } = req.body;
      
      if (!credential) {
        res.status(400).json({ error: 'Google credential is required' });
        return;
      }

      const result = await SocialAuthService.loginWithGoogle(credential);

      sendResponse(res, {
        statusCode: 200,
        message: 'Successfully logged in with Google',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to login with Google' });
    }
  }

  static async loginWithFacebook(req: Request, res: Response): Promise<void> {
    try {
      const { accessToken } = req.body;
      
      if (!accessToken) {
        res.status(400).json({ error: 'Facebook access token is required' });
        return;
      }

      const result = await SocialAuthService.loginWithFacebook(accessToken);

      sendResponse(res, {
        statusCode: 200,
        message: 'Successfully logged in with Facebook',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to login with Facebook' });
    }
  }
}

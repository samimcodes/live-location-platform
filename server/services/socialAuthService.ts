import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface FacebookUserData {
  id: string;
  name: string;
  email?: string;
}

interface FindOrCreateParams {
  email: string;
  name: string;
  provider: string;
  providerId: string;
}

export class SocialAuthService {
  static loginWithGoogle = catchServiceAsync(async (credential: string) => {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email) throw new Error('Invalid Google token payload');

    const { email, name, sub: googleId } = payload;

    return SocialAuthService.findOrCreateUser({
      email,
      name: name ?? 'Google User',
      provider: 'google',
      providerId: googleId,
    });
  });

  static loginWithFacebook = catchServiceAsync(async (accessToken: string) => {
    const { data } = await axios.get<FacebookUserData>('https://graph.facebook.com/me', {
      params: { fields: 'id,name,email', access_token: accessToken },
    });

    if (!data?.email) {
      throw new Error('Facebook email not available. Please grant email permission.');
    }

    return SocialAuthService.findOrCreateUser({
      email: data.email,
      name: data.name ?? 'Facebook User',
      provider: 'facebook',
      providerId: data.id,
    });
  });

  private static async findOrCreateUser({ email, name, provider, providerId }: FindOrCreateParams) {
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (user.provider !== provider) {
        user = await prisma.user.update({
          where: { email },
          data: { provider, providerId },
        });
      }
    } else {
      user = await prisma.user.create({
        data: { email, name, provider, providerId, role: 'user' },
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET environment variable is not set');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '30d') as any }
    );

    const { password, resetPasswordToken, resetPasswordExpires, refreshToken, loginLog, ...safe } = user;
    return { token, user: safe };
  }
}

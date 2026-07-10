import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class SocialAuthService {
  static loginWithGoogle = catchServiceAsync(async (credential: string) => {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error('Invalid Google token payload');
    }

    const { email, name, sub: googleId } = payload;
    
    return await SocialAuthService.findOrCreateUser({
      email,
      name: name || 'Google User',
      provider: 'google',
      providerId: googleId,
    });
  });

  static loginWithFacebook = catchServiceAsync(async (accessToken: string) => {
    // Verify the Facebook access token and get user info
    const { data } = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        fields: 'id,name,email',
        access_token: accessToken,
      },
    });

    if (!data || !data.email) {
      throw new Error('Invalid Facebook token payload or email not provided');
    }

    const { email, name, id: facebookId } = data;

    return await SocialAuthService.findOrCreateUser({
      email,
      name: name || 'Facebook User',
      provider: 'facebook',
      providerId: facebookId,
    });
  });

  private static async findOrCreateUser(params: {
    email: string;
    name: string;
    provider: string;
    providerId: string;
  }) {
    const { email, name, provider, providerId } = params;

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Update provider if they are logging in via social for the first time
      // with an existing email, or just return the user.
      if (user.provider !== provider) {
        user = await prisma.user.update({
          where: { email },
          data: { provider, providerId },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider,
          providerId,
          role: 'employee',
        },
      });
    }

    // Generate our app's JWT
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: expiresIn as any }
    );

    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword,
    };
  }
}

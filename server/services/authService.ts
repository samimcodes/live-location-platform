import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { catchServiceAsync } from '../utils/catchServiceAsync';
import { sendTemplateEmail } from './emailService';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

// Safe user type (no password / sensitive fields)
type SafeUser = Omit<
  Awaited<ReturnType<typeof prisma.user.findUnique>>,
  'password' | 'resetPasswordToken' | 'resetPasswordExpires' | 'refreshToken' | 'loginLog'
> & { password?: never };

export class AuthService {
  static registerUser = catchServiceAsync(async (data: Prisma.UserCreateInput) => {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('User already exists with this email');

    const toSave = { ...data };
    if (data.password) {
      toSave.password = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const user = await prisma.user.create({ data: toSave });
    const { password, resetPasswordToken, resetPasswordExpires, refreshToken, loginLog, ...safe } = user;
    return safe;
  });

  static getMe = catchServiceAsync(async (userId: number) => {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
        isOnline: true,
        lastSeen: true,
        sharingLocation: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  static loginUser = catchServiceAsync(async (email: string, passwordInput: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) throw new Error('Invalid email or password');

    const valid = await bcrypt.compare(passwordInput, user.password);
    if (!valid) throw new Error('Invalid email or password');

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as string }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as string }
    );

    // Update login log
    const existingLog = Array.isArray(user.loginLog) ? (user.loginLog as string[]) : [];
    const loginLog = [...existingLog, new Date().toISOString()].slice(-50); // keep last 50

    await prisma.user.update({
      where: { id: user.id },
      data: { loginLog, refreshToken, isOnline: true, lastSeen: new Date() },
    });

    const { password, resetPasswordToken, resetPasswordExpires, ...safe } = user;
    return { user: safe, token, refreshToken };
  });

  static forgotPassword = catchServiceAsync(async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: hashed, resetPasswordExpires: expires },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await sendTemplateEmail(
      user.email,
      'LocaLink – Reset Your Password',
      'passwordReset',
      { name: user.name, appName: 'LocaLink', resetLink: resetUrl, year: new Date().getFullYear() }
    );

    return { message: 'Password reset link sent to your email' };
  });

  static resetPassword = catchServiceAsync(async (token: string, newPassword: string) => {
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: hashed, resetPasswordExpires: { gt: new Date() } },
    });
    if (!user) throw new Error('Token is invalid or has expired');

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
    });

    return { message: 'Password has been reset successfully' };
  });

  static refreshToken = catchServiceAsync(async (refreshToken: string) => {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret'
    ) as { userId: number };

    const user = await prisma.user.findFirst({
      where: { id: decoded.userId, refreshToken },
    });
    if (!user) throw new Error('Invalid refresh token');

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as string }
    );

    return { token };
  });

  static logoutUser = catchServiceAsync(async (userId: number) => {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, isOnline: false, lastSeen: new Date() },
    });
    return { message: 'Logged out' };
  });

  static updatePassword = catchServiceAsync(async (
    userId: number,
    currentPassword: string,
    newPassword: string
  ) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error('Current password is incorrect');

    const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { message: 'Password updated' };
  });
}

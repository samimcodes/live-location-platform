import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { catchServiceAsync } from '../utils/catchServiceAsync';
import { sendTemplateEmail } from './emailService';

const prisma = new PrismaClient();

export class AuthService {
  static registerUser = catchServiceAsync(async (data: Prisma.UserCreateInput) => {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const dataToSave = { ...data };
    if (data.password) {
      const saltRounds = 10;
      dataToSave.password = await bcrypt.hash(data.password, saltRounds);
    }

    const user = await prisma.user.create({
      data: dataToSave,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  static getMe = catchServiceAsync(async (userId: number) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        issueDate: true,
        createdAt: true,
        updatedAt: true
      }
    });
    return user;
  });

  static loginUser = catchServiceAsync(async (email: string, passwordInput: string) => {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.password) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(passwordInput, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as any }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
    );

    // Update login log (store current timestamp)
    let loginLog: string[] = [];
    if (user.loginLog) {
      if (Array.isArray(user.loginLog)) {
        loginLog = user.loginLog as string[];
      } else if (typeof user.loginLog === 'string') {
        try {
          loginLog = JSON.parse(user.loginLog);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    loginLog.push(new Date().toISOString());

    await prisma.user.update({
      where: { id: user.id },
      data: { loginLog, refreshToken },
    });

    const { password, resetPasswordToken, resetPasswordExpires, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
      refreshToken,
    };
  });

  static forgotPassword = catchServiceAsync(async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken, resetPasswordExpires },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    await sendTemplateEmail(
      user.email,
      'Password Reset Request',
      'passwordReset',
      { name: user.name, appName: 'My App', resetLink: resetUrl, year: new Date().getFullYear() }
    );

    return { message: 'Password reset link sent to email' };
  });

  static resetPassword = catchServiceAsync(async (token: string, newPassword: string) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Token is invalid or has expired');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  });

  static refreshToken = catchServiceAsync(async (refreshToken: string) => {
    if (!refreshToken) {
      throw new Error('Refresh token is required');
    }

    try {
      const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
      
      const user = await prisma.user.findFirst({
        where: { id: decoded.userId, refreshToken },
      });

      if (!user) {
        throw new Error('Invalid refresh token');
      }

      const newAccessToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as any }
      );

      return { token: newAccessToken };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  });

  static logoutUser = catchServiceAsync(async (userId: number) => {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  });
}

import { prisma } from '../lib/prisma';
import { catchServiceAsync } from '../utils/catchServiceAsync';

interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
  bio?: string | null;
}

export class UserService {
  static getAll = catchServiceAsync(async () => {
    return prisma.user.findMany({
      select: {
        id: true, name: true, email: true, avatar: true,
        role: true, isOnline: true, lastSeen: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  static getById = catchServiceAsync(async (id: number) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, bio: true, role: true,
        isOnline: true, lastSeen: true, sharingLocation: true,
        createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new Error('User not found');
    return user;
  });

  static updateProfile = catchServiceAsync(async (id: number, data: UpdateProfileInput) => {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, bio: true, role: true,
        isOnline: true, lastSeen: true, sharingLocation: true,
        updatedAt: true,
      },
    });
  });

  static deleteUser = catchServiceAsync(async (id: number) => {
    await prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  });
}

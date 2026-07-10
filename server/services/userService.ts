import { PrismaClient, Prisma } from '@prisma/client';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();

export class UserService {
  static getAllUsers = catchServiceAsync(async () => {
    return prisma.user.findMany();
  });

  static getUserById = catchServiceAsync(async (id: number) => {
    return prisma.user.findUnique({ where: { id } });
  });

  static createUser = catchServiceAsync(async (data: Prisma.UserCreateInput) => {
    return prisma.user.create({ data });
  });

  static updateUser = catchServiceAsync(async (id: number, data: Prisma.UserUpdateInput) => {
    return prisma.user.update({ where: { id }, data });
  });

  static deleteUser = catchServiceAsync(async (id: number) => {
    return prisma.user.delete({ where: { id } });
  });
}

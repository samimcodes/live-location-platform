import { PrismaClient, PlaceType } from '@prisma/client';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();

interface SavedPlaceInput {
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  icon?: string;
  color?: string;
  type?: PlaceType;
}

export class SavedPlaceService {
  static create = catchServiceAsync(async (userId: number, data: SavedPlaceInput) => {
    return prisma.savedPlace.create({
      data: { userId, ...data },
    });
  });

  static getByUser = catchServiceAsync(async (userId: number) => {
    return prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  });

  static getById = catchServiceAsync(async (id: number, userId: number) => {
    const place = await prisma.savedPlace.findUnique({ where: { id } });
    if (!place) throw new Error('Saved place not found');
    if (place.userId !== userId) throw new Error('Unauthorized');
    return place;
  });

  static update = catchServiceAsync(async (id: number, userId: number, data: Partial<SavedPlaceInput>) => {
    const place = await prisma.savedPlace.findUnique({ where: { id } });
    if (!place) throw new Error('Saved place not found');
    if (place.userId !== userId) throw new Error('Unauthorized');

    return prisma.savedPlace.update({ where: { id }, data });
  });

  static delete = catchServiceAsync(async (id: number, userId: number) => {
    const place = await prisma.savedPlace.findUnique({ where: { id } });
    if (!place) throw new Error('Saved place not found');
    if (place.userId !== userId) throw new Error('Unauthorized');

    await prisma.savedPlace.delete({ where: { id } });
    return { message: 'Saved place deleted' };
  });
}

import { PrismaClient, NotificationType, Prisma } from '@prisma/client';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();

interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
}

export class NotificationService {
  static create = catchServiceAsync(async (input: CreateNotificationInput) => {
    return prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data,
      },
    });
  });

  static getByUser = catchServiceAsync(async (userId: number, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  });

  static markAsRead = catchServiceAsync(async (notificationId: number, userId: number) => {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new Error('Notification not found');
    if (notification.userId !== userId) throw new Error('Unauthorized');

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  });

  static markAllAsRead = catchServiceAsync(async (userId: number) => {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All notifications marked as read' };
  });

  static deleteAllRead = catchServiceAsync(async (userId: number) => {
    const { count } = await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
    return { message: `${count} notification${count !== 1 ? 's' : ''} deleted`, deleted: count };
  });

  static deleteNotification = catchServiceAsync(async (notificationId: number, userId: number) => {
    const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification) throw new Error('Notification not found');
    if (notification.userId !== userId) throw new Error('Unauthorized');

    await prisma.notification.delete({ where: { id: notificationId } });
    return { message: 'Notification deleted' };
  });

  static getUnreadCount = catchServiceAsync(async (userId: number) => {
    const count = await prisma.notification.count({ where: { userId, isRead: false } });
    return { count };
  });
}

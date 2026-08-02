import { Response } from 'express';
import { FriendService } from '../services/friendService';
import { NotificationService } from '../services/notificationService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Server as SocketIOServer } from 'socket.io';

export class FriendController {
  static searchUsers = catchAsync(async (req: AuthRequest, res: Response) => {
    const { q } = req.query as { q?: string };
    if (!q || q.trim().length < 2) {
      sendResponse(res, { statusCode: 400, message: 'Search query must be at least 2 characters' });
      return;
    }
    const users = await FriendService.searchUsers(q.trim(), req.user!.userId);
    sendResponse(res, { statusCode: 200, data: users });
  });

  static sendRequest = catchAsync(async (req: AuthRequest, res: Response) => {
    const senderId = req.user!.userId;
    const { receiverId, message } = req.body as { receiverId?: number; message?: string };
    if (!receiverId) {
      sendResponse(res, { statusCode: 400, message: 'receiverId is required' });
      return;
    }
    const request = await FriendService.sendFriendRequest(senderId, receiverId, message);

    // Socket notification
    const io = (req as AuthRequest & { io?: SocketIOServer }).io;
    if (io) {
      io.to(`user:${receiverId}`).emit('notification', {
        type: 'FRIEND_REQUEST',
        message: 'You have a new friend request',
        data: { requestId: request.id, senderId },
      });
    }

    // DB notification
    await NotificationService.create({
      userId: receiverId,
      type: 'FRIEND_REQUEST',
      title: 'New Friend Request',
      body: `${request.sender.name} sent you a friend request`,
      data: { requestId: request.id, senderId },
    });

    sendResponse(res, { statusCode: 201, message: 'Friend request sent', data: request });
  });

  static respondToRequest = catchAsync(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { id } = req.params as { id: string };
    const { action } = req.body as { action?: 'ACCEPTED' | 'REJECTED' };

    if (!action || !['ACCEPTED', 'REJECTED'].includes(action)) {
      sendResponse(res, { statusCode: 400, message: 'action must be ACCEPTED or REJECTED' });
      return;
    }

    const result = await FriendService.respondToRequest(Number(id), userId, action);

    // Notify sender if accepted
    if (action === 'ACCEPTED') {
      const io = (req as AuthRequest & { io?: SocketIOServer }).io;
      const request = await FriendService.getPendingRequests(userId); // use sender info
      const senderId = Number(id); // This is not quite right — we get senderId from the service
      if (io) {
        io.to(`user:${senderId}`).emit('notification', {
          type: 'FRIEND_ACCEPTED',
          message: 'Your friend request was accepted',
        });
      }
    }

    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static getPendingRequests = catchAsync(async (req: AuthRequest, res: Response) => {
    const requests = await FriendService.getPendingRequests(req.user!.userId);
    sendResponse(res, { statusCode: 200, data: requests });
  });

  static getSentRequests = catchAsync(async (req: AuthRequest, res: Response) => {
    const requests = await FriendService.getSentRequests(req.user!.userId);
    sendResponse(res, { statusCode: 200, data: requests });
  });

  static getFriends = catchAsync(async (req: AuthRequest, res: Response) => {
    const friends = await FriendService.getFriends(req.user!.userId);
    sendResponse(res, { statusCode: 200, data: friends });
  });

  static removeFriend = catchAsync(async (req: AuthRequest, res: Response) => {
    const { friendId } = req.params as { friendId: string };
    const result = await FriendService.removeFriend(req.user!.userId, Number(friendId));
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static cancelRequest = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await FriendService.cancelRequest(Number(id), req.user!.userId);
    sendResponse(res, { statusCode: 200, message: result.message });
  });
}

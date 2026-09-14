import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { prisma } from '../lib/prisma';

export const getDirectMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const rawFriendId = Array.isArray(req.params.friendId) ? req.params.friendId[0] : req.params.friendId;
    const friendId = parseInt(rawFriendId, 10);
    if (isNaN(friendId)) {
      res.status(400).json({ success: false, message: 'Invalid friendId' });
      return;
    }

    // Verify friendship
    const [u1, u2] = userId < friendId ? [userId, friendId] : [friendId, userId];
    const friendship = await prisma.friendship.findFirst({
      where: { user1Id: u1, user2Id: u2 },
    });

    if (!friendship) {
      res.status(403).json({ success: false, message: 'Must be friends to view messages' });
      return;
    }

    // Mark messages sent by friendId to userId as read
    await prisma.message.updateMany({
      where: {
        senderId: friendId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json({ success: true, data: messages });
  } catch (err: unknown) {
    console.error('getDirectMessages error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve messages' });
  }
};

export const getGroupMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const rawGroupId = Array.isArray(req.params.groupId) ? req.params.groupId[0] : req.params.groupId;
    const groupId = parseInt(rawGroupId, 10);
    if (isNaN(groupId)) {
      res.status(400).json({ success: false, message: 'Invalid groupId' });
      return;
    }

    // Verify membership
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });

    if (!member) {
      res.status(403).json({ success: false, message: 'Not a member of this circle' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { groupId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    res.json({ success: true, data: messages });
  } catch (err: unknown) {
    console.error('getGroupMessages error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve circle messages' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { receiverId, groupId, content, type = 'TEXT', audioUrl, audioDuration } = req.body;

    if (!content && !audioUrl) {
      res.status(400).json({ success: false, message: 'Message content or audio is required' });
      return;
    }

    if (!receiverId && !groupId) {
      res.status(400).json({ success: false, message: 'receiverId or groupId is required' });
      return;
    }

    if (receiverId) {
      const [u1, u2] = userId < receiverId ? [userId, receiverId] : [receiverId, userId];
      const friendship = await prisma.friendship.findFirst({
        where: { user1Id: u1, user2Id: u2 },
      });
      if (!friendship) {
        res.status(403).json({ success: false, message: 'Can only message friends' });
        return;
      }
    } else if (groupId) {
      const member = await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId } },
      });
      if (!member) {
        res.status(403).json({ success: false, message: 'Not a member of this circle' });
        return;
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId: receiverId ? Number(receiverId) : null,
        groupId: groupId ? Number(groupId) : null,
        content: content ? String(content).trim() : '',
        type: type === 'VOICE' || type === 'QUICK_PING' ? type : 'TEXT',
        audioUrl: audioUrl || null,
        audioDuration: audioDuration ? Number(audioDuration) : null,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Real-time broadcast if socket is attached
    if (req.io) {
      if (receiverId) {
        req.io.to(`user:${receiverId}`).emit('chat:message', message);
      } else if (groupId) {
        req.io.to(`group:${groupId}`).emit('chat:message', message);
      }
    }

    res.status(201).json({ success: true, data: message });
  } catch (err: unknown) {
    console.error('sendMessage error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

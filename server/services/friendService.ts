import { PrismaClient, FriendRequestStatus } from '@prisma/client';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();

export class FriendService {
  // ── Search users to add as friends ──────────────────────────
  static searchUsers = catchServiceAsync(async (query: string, currentUserId: number) => {
    return prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isOnline: true,
        lastSeen: true,
      },
      take: 20,
    });
  });

  // ── Send friend request ──────────────────────────────────────
  static sendFriendRequest = catchServiceAsync(async (senderId: number, receiverId: number, message?: string) => {
    if (senderId === receiverId) throw new Error('You cannot send a friend request to yourself');

    // Check existing request
    const existing = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });
    if (existing) throw new Error('Friend request already exists');

    // Check existing friendship
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId },
        ],
      },
    });
    if (existingFriendship) throw new Error('Already friends');

    return prisma.friendRequest.create({
      data: { senderId, receiverId, message },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        receiver: { select: { id: true, name: true, avatar: true } },
      },
    });
  });

  // ── Respond to friend request ────────────────────────────────
  static respondToRequest = catchServiceAsync(async (
    requestId: number,
    userId: number,
    action: 'ACCEPTED' | 'REJECTED'
  ) => {
    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Friend request not found');
    if (request.receiverId !== userId) throw new Error('Unauthorized');
    if (request.status !== 'PENDING') throw new Error('Request already handled');

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: action as FriendRequestStatus },
    });

    if (action === 'ACCEPTED') {
      // Ensure user1Id < user2Id to maintain unique constraint
      const [user1Id, user2Id] = [request.senderId, request.receiverId].sort((a, b) => a - b);
      await prisma.friendship.create({ data: { user1Id, user2Id } });
    }

    return {
      message: action === 'ACCEPTED' ? 'Friend request accepted' : 'Friend request rejected',
      // Surface senderId so the controller can notify them without a second DB round-trip
      senderId: action === 'ACCEPTED' ? request.senderId : null,
    };
  });

  // ── Get pending requests ─────────────────────────────────────
  static getPendingRequests = catchServiceAsync(async (userId: number) => {
    return prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      include: {
        sender: { select: { id: true, name: true, avatar: true, email: true, isOnline: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  // ── Get sent requests ────────────────────────────────────────
  static getSentRequests = catchServiceAsync(async (userId: number) => {
    return prisma.friendRequest.findMany({
      where: { senderId: userId, status: 'PENDING' },
      include: {
        receiver: { select: { id: true, name: true, avatar: true, email: true, isOnline: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  // ── Get friends list ─────────────────────────────────────────
  static getFriends = catchServiceAsync(async (userId: number) => {
    const friendships = await prisma.friendship.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: {
          select: {
            id: true, name: true, email: true, avatar: true,
            isOnline: true, lastSeen: true, sharingLocation: true,
            locations: {
              select: { latitude: true, longitude: true, updatedAt: true, city: true },
            },
          },
        },
        user2: {
          select: {
            id: true, name: true, email: true, avatar: true,
            isOnline: true, lastSeen: true, sharingLocation: true,
            locations: {
              select: { latitude: true, longitude: true, updatedAt: true, city: true },
            },
          },
        },
      },
    });

    return friendships.map((f) => (f.user1Id === userId ? f.user2 : f.user1));
  });

  // ── Remove friend ────────────────────────────────────────────
  static removeFriend = catchServiceAsync(async (userId: number, friendId: number) => {
    const [user1Id, user2Id] = [userId, friendId].sort((a, b) => a - b);
    await prisma.friendship.deleteMany({
      where: { user1Id, user2Id },
    });
    return { message: 'Friend removed' };
  });

  // ── Cancel sent request ──────────────────────────────────────
  static cancelRequest = catchServiceAsync(async (requestId: number, senderId: number) => {
    const request = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Request not found');
    if (request.senderId !== senderId) throw new Error('Unauthorized');
    await prisma.friendRequest.delete({ where: { id: requestId } });
    return { message: 'Request cancelled' };
  });

  // ── Get request history (ACCEPTED + REJECTED, last 30 days) ──
  static getRequestHistory = catchServiceAsync(async (userId: number) => {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    return prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: { in: ['ACCEPTED', 'REJECTED'] },
        updatedAt: { gte: since },
      },
      include: {
        sender:   { select: { id: true, name: true, avatar: true, email: true } },
        receiver: { select: { id: true, name: true, avatar: true, email: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  });

  // ── Accept all pending requests ───────────────────────────────
  static acceptAllRequests = catchServiceAsync(async (userId: number) => {
    const pending = await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: 'PENDING' },
      select: { id: true, senderId: true, receiverId: true },
    });

    if (pending.length === 0) return { accepted: 0 };

    // Update all to ACCEPTED
    await prisma.friendRequest.updateMany({
      where: { receiverId: userId, status: 'PENDING' },
      data: { status: 'ACCEPTED' },
    });

    // Create friendship records (user1Id < user2Id)
    const friendships = pending.map(({ senderId, receiverId }) => {
      const [user1Id, user2Id] = [senderId, receiverId].sort((a, b) => a - b);
      return { user1Id, user2Id };
    });

    // createMany skips duplicates gracefully
    await prisma.friendship.createMany({ data: friendships, skipDuplicates: true });

    return { accepted: pending.length, senderIds: pending.map((r) => r.senderId) };
  });
}

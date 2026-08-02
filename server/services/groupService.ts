import { PrismaClient } from '@prisma/client';
import { catchServiceAsync } from '../utils/catchServiceAsync';

const prisma = new PrismaClient();

interface CreateGroupInput {
  name: string;
  description?: string;
  avatar?: string;
  memberIds?: number[];
}

export class GroupService {
  static createGroup = catchServiceAsync(async (createdById: number, data: CreateGroupInput) => {
    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description,
        avatar: data.avatar,
        createdById,
        members: {
          create: [
            { userId: createdById, role: 'ADMIN' },
            ...(data.memberIds?.filter((id) => id !== createdById).map((userId) => ({
              userId,
              role: 'MEMBER' as const,
            })) ?? []),
          ],
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, isOnline: true } },
          },
        },
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });
    return group;
  });

  static getMyGroups = catchServiceAsync(async (userId: number) => {
    return prisma.group.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true, isOnline: true } },
          },
        },
        createdBy: { select: { id: true, name: true, avatar: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  static getGroupById = catchServiceAsync(async (groupId: number, userId: number) => {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true, name: true, avatar: true, isOnline: true,
                lastSeen: true, sharingLocation: true,
                locations: {
                  select: { latitude: true, longitude: true, updatedAt: true, city: true },
                },
              },
            },
          },
        },
        createdBy: { select: { id: true, name: true, avatar: true } },
      },
    });
    if (!group) throw new Error('Group not found');

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) throw new Error('Not a member of this group');

    return group;
  });

  static updateGroup = catchServiceAsync(async (
    groupId: number,
    userId: number,
    data: Partial<{ name: string; description: string; avatar: string }>
  ) => {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error('Group not found');

    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member || member.role !== 'ADMIN') throw new Error('Only group admin can update the group');

    return prisma.group.update({
      where: { id: groupId },
      data,
      include: { createdBy: { select: { id: true, name: true } } },
    });
  });

  static deleteGroup = catchServiceAsync(async (groupId: number, userId: number) => {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) throw new Error('Group not found');
    if (group.createdById !== userId) throw new Error('Only the creator can delete this group');

    await prisma.group.delete({ where: { id: groupId } });
    return { message: 'Group deleted' };
  });

  static addMember = catchServiceAsync(async (groupId: number, adminId: number, userId: number) => {
    const member = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: adminId } },
    });
    if (!member || member.role !== 'ADMIN') throw new Error('Only admin can add members');

    return prisma.groupMember.create({
      data: { groupId, userId, role: 'MEMBER' },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });
  });

  static removeMember = catchServiceAsync(async (groupId: number, adminId: number, userId: number) => {
    if (adminId === userId) throw new Error('Cannot remove yourself. Leave the group instead.');

    const adminMember = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: adminId } },
    });
    if (!adminMember || adminMember.role !== 'ADMIN') throw new Error('Only admin can remove members');

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
    return { message: 'Member removed' };
  });

  static leaveGroup = catchServiceAsync(async (groupId: number, userId: number) => {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) throw new Error('Group not found');

    if (group.createdById === userId) {
      throw new Error('Group creator cannot leave. Transfer ownership or delete the group.');
    }

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId, userId } },
    });
    return { message: 'Left the group' };
  });
}

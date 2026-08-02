import { Response } from 'express';
import { GroupService } from '../services/groupService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

export class GroupController {
  static createGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    const group = await GroupService.createGroup(req.user!.userId, req.body);
    sendResponse(res, { statusCode: 201, message: 'Group created', data: group });
  });

  static getMyGroups = catchAsync(async (req: AuthRequest, res: Response) => {
    const groups = await GroupService.getMyGroups(req.user!.userId);
    sendResponse(res, { statusCode: 200, data: groups });
  });

  static getGroupById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const group = await GroupService.getGroupById(Number(id), req.user!.userId);
    sendResponse(res, { statusCode: 200, data: group });
  });

  static updateGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const group = await GroupService.updateGroup(Number(id), req.user!.userId, req.body);
    sendResponse(res, { statusCode: 200, message: 'Group updated', data: group });
  });

  static deleteGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await GroupService.deleteGroup(Number(id), req.user!.userId);
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static addMember = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { userId } = req.body as { userId?: number };
    if (!userId) {
      sendResponse(res, { statusCode: 400, message: 'userId is required' });
      return;
    }
    const member = await GroupService.addMember(Number(id), req.user!.userId, userId);
    sendResponse(res, { statusCode: 201, message: 'Member added', data: member });
  });

  static removeMember = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id, userId } = req.params as { id: string; userId: string };
    const result = await GroupService.removeMember(Number(id), req.user!.userId, Number(userId));
    sendResponse(res, { statusCode: 200, message: result.message });
  });

  static leaveGroup = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await GroupService.leaveGroup(Number(id), req.user!.userId);
    sendResponse(res, { statusCode: 200, message: result.message });
  });
}

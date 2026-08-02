import { Response } from 'express';
import { SavedPlaceService } from '../services/savedPlaceService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

export class SavedPlaceController {
  static create = catchAsync(async (req: AuthRequest, res: Response) => {
    const place = await SavedPlaceService.create(req.user!.userId, req.body);
    sendResponse(res, { statusCode: 201, message: 'Place saved', data: place });
  });

  static getAll = catchAsync(async (req: AuthRequest, res: Response) => {
    const places = await SavedPlaceService.getByUser(req.user!.userId);
    sendResponse(res, { statusCode: 200, data: places });
  });

  static getById = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const place = await SavedPlaceService.getById(Number(id), req.user!.userId);
    sendResponse(res, { statusCode: 200, data: place });
  });

  static update = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const place = await SavedPlaceService.update(Number(id), req.user!.userId, req.body);
    sendResponse(res, { statusCode: 200, message: 'Place updated', data: place });
  });

  static delete = catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const result = await SavedPlaceService.delete(Number(id), req.user!.userId);
    sendResponse(res, { statusCode: 200, message: result.message });
  });
}

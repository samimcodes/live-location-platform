import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export class UserController {
  static getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    sendResponse(res, {
      statusCode: 200,
      data: users,
    });
  });

  static getUserById = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const user = await UserService.getUserById(id);
    if (user) {
      sendResponse(res, {
        statusCode: 200,
        data: user,
      });
    } else {
      sendResponse(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }
  });

  static createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body);
    sendResponse(res, {
      statusCode: 201,
      message: 'User created successfully',
      data: user,
    });
  });

  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const user = await UserService.updateUser(id, req.body);
    sendResponse(res, {
      statusCode: 200,
      message: 'User updated successfully',
      data: user,
    });
  });

  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    await UserService.deleteUser(id);
    sendResponse(res, {
      statusCode: 200,
      message: 'User deleted successfully',
    });
  });
}

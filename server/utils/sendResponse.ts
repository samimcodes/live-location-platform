import { Response } from 'express';

type ApiResponse<T> = {
  statusCode: number;
  message?: string;
  data?: T;
};

const defaultMessages: Record<number, string> = {
  200: 'Success',
  201: 'Created Successfully',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
};

export const sendResponse = <T>(res: Response, data: ApiResponse<T>) => {
  const statusCode = data.statusCode;
  const message = data.message || defaultMessages[statusCode] || 'Success';

  res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    data: data.data || null,
  });
};

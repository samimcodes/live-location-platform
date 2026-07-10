import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';

export class UploadController {
  static uploadFile = catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      sendResponse(res, {
        statusCode: 400,
        message: 'No file provided',
      });
      return;
    }

    // Construct the backend URL for the file
    // Assuming backend runs on a specific domain/port which is known by the frontend,
    // or we can generate a relative URL that the frontend appends to its backend base URL.
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // If you need an absolute URL and you know the backend URL from env:
    // const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    // const fileUrl = `${backendUrl}/uploads/${req.file.filename}`;

    sendResponse(res, {
      statusCode: 200,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  });

  static uploadMultipleFiles = catchAsync(async (req: Request, res: Response) => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      sendResponse(res, {
        statusCode: 400,
        message: 'No files provided',
      });
      return;
    }

    const fileData = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
    }));

    sendResponse(res, {
      statusCode: 200,
      message: 'Files uploaded successfully',
      data: fileData,
    });
  });
}

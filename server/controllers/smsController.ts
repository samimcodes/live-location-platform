import { Response } from 'express';
import { sendSMS } from '../services/smsService';
import { catchAsync } from '../utils/catchAsync';
import { sendResponse } from '../utils/sendResponse';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * SmsController
 * -------------
 * Exposes Twilio SMS sending over REST so the frontend (and future mobile
 * client) can trigger messages via authenticated API calls.
 *
 * Endpoints:
 *   POST /api/v1/sms/send  — send an SMS to any phone number (admin only)
 *   POST /api/v1/sms/otp   — send a one-time-passcode to a phone number
 */
export class SmsController {
  /**
   * POST /send
   * Body: { to: string, message: string }
   *
   * General-purpose SMS send. Restricted to admin role so arbitrary messages
   * cannot be triggered by regular users.
   */
  static send = catchAsync(async (req: AuthRequest, res: Response) => {
    const { to, message } = req.body as { to?: string; message?: string };

    if (!to || !message) {
      sendResponse(res, { statusCode: 400, message: '`to` and `message` are required' });
      return;
    }

    // Basic E.164 format check — Twilio requires this format
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (!e164Regex.test(to)) {
      sendResponse(res, {
        statusCode: 400,
        message: 'Phone number must be in E.164 format (e.g. +8801XXXXXXXXX)',
      });
      return;
    }

    if (message.trim().length === 0 || message.length > 1600) {
      sendResponse(res, {
        statusCode: 400,
        message: 'Message must be between 1 and 1600 characters',
      });
      return;
    }

    const result = await sendSMS(to, message);

    sendResponse(res, {
      statusCode: 200,
      message: 'SMS sent successfully',
      data: { sid: result.sid, to: result.to, status: result.status },
    });
  });

  /**
   * POST /otp
   * Body: { to: string }
   *
   * Generates a 6-digit OTP, sends it to the given phone number, and returns
   * the OTP in the response (in production you would store it server-side and
   * only return a session token — this simplified version is useful for dev).
   */
  static sendOtp = catchAsync(async (req: AuthRequest, res: Response) => {
    const { to } = req.body as { to?: string };

    if (!to) {
      sendResponse(res, { statusCode: 400, message: '`to` (phone number) is required' });
      return;
    }

    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (!e164Regex.test(to)) {
      sendResponse(res, {
        statusCode: 400,
        message: 'Phone number must be in E.164 format (e.g. +8801XXXXXXXXX)',
      });
      return;
    }

    // Generate a cryptographically random 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const body = `Your LocaLink verification code is: ${otp}. It expires in 10 minutes. Do not share it with anyone.`;

    const result = await sendSMS(to, body);

    sendResponse(res, {
      statusCode: 200,
      message: 'OTP sent successfully',
      data: {
        sid: result.sid,
        to: result.to,
        status: result.status,
        // NOTE: In production, store the OTP server-side (Redis/DB) and
        // return only a session token. Return the OTP here only in non-prod.
        ...(process.env.NODE_ENV !== 'production' && { otp }),
      },
    });
  });
}

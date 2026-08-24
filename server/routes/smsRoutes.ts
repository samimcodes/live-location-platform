import { Router } from 'express';
import { SmsController } from '../controllers/smsController';
import { verifyToken } from '../middlewares/authMiddleware';
import { authWriteLimiter } from '../middlewares/rateLimiters';

const router = Router();

// All SMS routes require authentication
router.use(verifyToken);

/**
 * POST /api/v1/sms/send
 * Send an arbitrary SMS message (admin use-case / notifications).
 * Uses authWriteLimiter (20 req / 15 min) to prevent SMS spam / cost abuse.
 */
router.post('/send', authWriteLimiter, SmsController.send);

/**
 * POST /api/v1/sms/otp
 * Send a 6-digit OTP to a phone number for verification flows.
 * Same tight limit — each OTP request costs money and can be abused.
 */
router.post('/otp', authWriteLimiter, SmsController.sendOtp);

export default router;

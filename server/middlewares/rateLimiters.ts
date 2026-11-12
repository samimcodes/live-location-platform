import rateLimit from 'express-rate-limit';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Tight limiter for credential write endpoints:
 *   POST /login, /register, /forgot-password, /reset-password, /social-login/*
 *
 * Low ceiling in production (20 req / 15 min) to resist brute-force and credential stuffing.
 * Relaxed in development (1000 req / 15 min) so local testing is never blocked.
 */
export const authWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});

/**
 * Relaxed limiter for authenticated read/management endpoints:
 *   GET /me, POST /logout, POST /refresh-token, PATCH /update-password
 *
 * Higher ceiling (isDev ? 5000 : 600 req / 15 min) because these are called
 * on every app mount, tab restore, and token refresh.
 */
export const authReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/**
 * General API limiter — applied to all non-auth routes.
 * Supports active real-time GPS telemetry updates (120 req / min ceiling in prod).
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 1800,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

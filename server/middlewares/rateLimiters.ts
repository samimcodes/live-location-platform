import rateLimit from 'express-rate-limit';

/**
 * Tight limiter for credential write endpoints:
 *   POST /login, /register, /forgot-password, /reset-password, /social-login/*
 *
 * Low ceiling (20 req / 15 min) to resist brute-force and credential stuffing.
 */
export const authWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});

/**
 * Relaxed limiter for authenticated read/management endpoints:
 *   GET /me, POST /logout, POST /refresh-token, PATCH /update-password
 *
 * Higher ceiling (150 req / 15 min) because these are called on every app
 * mount and tab restore — a tight limit 429s legitimate users behind NAT
 * or shared IPs very quickly.
 */
export const authReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/**
 * General API limiter — applied to all non-auth routes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

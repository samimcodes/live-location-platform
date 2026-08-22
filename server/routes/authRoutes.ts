import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { SocialAuthController } from '../controllers/socialAuthController';
import { verifyToken } from '../middlewares/authMiddleware';
import { authWriteLimiter, authReadLimiter } from '../middlewares/rateLimiters';

const router = Router();

// ── Write / credential endpoints — tight limit (20 req / 15 min) ──────────
// These are the high-value brute-force targets.
router.post('/register',             authWriteLimiter, AuthController.register);
router.post('/login',                authWriteLimiter, AuthController.login);
router.post('/forgot-password',      authWriteLimiter, AuthController.forgotPassword);
router.post('/reset-password',       authWriteLimiter, AuthController.resetPassword);
router.post('/social-login/google',  authWriteLimiter, SocialAuthController.loginWithGoogle);
router.post('/social-login/facebook',authWriteLimiter, SocialAuthController.loginWithFacebook);

// ── Read / session management — relaxed limit (150 req / 15 min) ──────────
// /me is called on every app mount and tab restore.
// /refresh-token is called automatically by the Axios interceptor on 401.
// Keeping these under the same tight bucket as /login would 429 legitimate
// users behind NAT / shared IPs after only a few page loads.
router.get('/me',                    authReadLimiter, verifyToken, AuthController.me);
router.post('/refresh-token',        authReadLimiter, AuthController.refreshToken);
router.post('/logout',               authReadLimiter, verifyToken, AuthController.logout);
router.patch('/update-password',     authReadLimiter, verifyToken, AuthController.updatePassword);

export default router;

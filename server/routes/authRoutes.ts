import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { SocialAuthController } from '../controllers/socialAuthController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', verifyToken, AuthController.logout); // Optional: verifyToken ensures only logged in users can logout
router.get('/me', verifyToken, AuthController.me);

router.post('/social-login/google', SocialAuthController.loginWithGoogle);
router.post('/social-login/facebook', SocialAuthController.loginWithFacebook);

export default router;

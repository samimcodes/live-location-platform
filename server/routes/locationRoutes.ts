import { Router } from 'express';
import { LocationController } from '../controllers/locationController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.put('/update', LocationController.updateLocation);
router.get('/me', LocationController.getMyLocation);
router.get('/friends', LocationController.getFriendsLocations);
router.get('/history', LocationController.getHistory);
router.delete('/history', LocationController.clearHistory);
router.patch('/sharing', LocationController.toggleSharing);

export default router;

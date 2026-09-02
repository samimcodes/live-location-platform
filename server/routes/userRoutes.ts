import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/', UserController.getAll);
router.get('/profile', UserController.getProfile);
router.get('/:id', UserController.getById);
router.patch('/profile', UserController.updateProfile);
router.delete('/:id', UserController.deleteUser);

export default router;

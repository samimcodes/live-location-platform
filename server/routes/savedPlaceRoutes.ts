import { Router } from 'express';
import { SavedPlaceController } from '../controllers/savedPlaceController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', SavedPlaceController.create);
router.get('/', SavedPlaceController.getAll);
router.get('/:id', SavedPlaceController.getById);
router.patch('/:id', SavedPlaceController.update);
router.delete('/:id', SavedPlaceController.delete);

export default router;

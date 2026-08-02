import { Router } from 'express';
import { GroupController } from '../controllers/groupController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.post('/', GroupController.createGroup);
router.get('/', GroupController.getMyGroups);
router.get('/:id', GroupController.getGroupById);
router.patch('/:id', GroupController.updateGroup);
router.delete('/:id', GroupController.deleteGroup);
router.post('/:id/members', GroupController.addMember);
router.delete('/:id/members/:userId', GroupController.removeMember);
router.post('/:id/leave', GroupController.leaveGroup);

export default router;

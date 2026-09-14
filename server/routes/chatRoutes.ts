import { Router } from 'express';
import { verifyToken } from '../middlewares/authMiddleware';
import {
  getDirectMessages,
  getGroupMessages,
  sendMessage,
} from '../controllers/chatController';

const router = Router();

// Protect all chat endpoints
router.use(verifyToken);

router.get('/direct/:friendId', getDirectMessages);
router.get('/group/:groupId', getGroupMessages);
router.post('/send', sendMessage);

export default router;

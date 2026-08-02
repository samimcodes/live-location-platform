import { Router } from 'express';
import { FriendController } from '../controllers/friendController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

// All friend routes require auth
router.use(verifyToken);

router.get('/search', FriendController.searchUsers);
router.get('/', FriendController.getFriends);
router.get('/requests/pending', FriendController.getPendingRequests);
router.get('/requests/sent', FriendController.getSentRequests);
router.post('/requests', FriendController.sendRequest);
router.patch('/requests/:id', FriendController.respondToRequest);
router.delete('/requests/:id', FriendController.cancelRequest);
router.delete('/:friendId', FriendController.removeFriend);

export default router;

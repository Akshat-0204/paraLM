import { Router } from 'express';
import * as chatController from './chatcontroller';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);



router.post('/workspace/:workspaceId', chatController.createChat);
router.get('/workspace/:workspaceId', chatController.getChats);
router.get('/:chatId', chatController.getChat);
router.patch('/:chatId', chatController.updateChat);
router.delete('/:chatId', chatController.deleteChat);



router.get('/:chatId/messages', chatController.getMessages);
router.post('/:chatId/messages', chatController.sendMessage);



router.post('/workspace/:workspaceId/ai-task', chatController.runAITask);

export default router;
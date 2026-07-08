import { Router } from 'express';
import * as flashcardController from './flashCardController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);


router.post('/workspace/:workspaceId/generate', flashcardController.generateFlashcards as any);
router.get('/workspace/:workspaceId', flashcardController.getFlashcards as any);
router.get('/:flashcardId', flashcardController.getFlashcard as any);
router.delete('/:flashcardId', flashcardController.deleteFlashcard as any);

export default router;
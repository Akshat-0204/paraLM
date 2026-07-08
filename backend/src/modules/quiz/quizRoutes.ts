import { Router } from 'express';
import * as quizController from './quizController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/workspace/:workspaceId/generate', quizController.generateQuiz as any);
router.get('/workspace/:workspaceId', quizController.getQuizzes as any);
router.get('/:quizId', quizController.getQuiz as any);
router.delete('/:quizId', quizController.deleteQuiz as any);

export default router;
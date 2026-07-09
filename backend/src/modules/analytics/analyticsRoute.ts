import { Router } from 'express';
import * as analyticsController from './analyticsController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);


router.get('/me', analyticsController.getUserAnalytics);


router.get('/workspace/:workspaceId', analyticsController.getWorkspaceAnalytics as any);
router.get('/workspace/:workspaceId/summary', analyticsController.getAnalyticsSummary as any);


router.patch('/:analyticsId/feedback', analyticsController.submitFeedback as any);

export default router;
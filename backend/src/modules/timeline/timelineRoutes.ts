import { Router } from 'express';
import * as timelineController from './timelineController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/workspace/:workspaceId/generate', timelineController.generateTimeline as any);
router.get('/workspace/:workspaceId', timelineController.getTimelines as any);
router.get('/:timelineId', timelineController.getTimeline as any);
router.delete('/:timelineId', timelineController.deleteTimeline as any);

export default router;

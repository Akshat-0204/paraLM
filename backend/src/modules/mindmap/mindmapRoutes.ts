import { Router } from 'express';
import * as mindmapController from './mindmapController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/workspace/:workspaceId/generate', mindmapController.generateMindMap as any);
router.get('/workspace/:workspaceId', mindmapController.getMindMaps as any);
router.get('/:mindmapId', mindmapController.getMindMap as any);
router.delete('/:mindmapId', mindmapController.deleteMindMap as any);

export default router;
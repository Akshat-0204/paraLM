import { Router } from 'express';
import * as workspaceController from './workspaceController'
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/', workspaceController.createWorkspace );
router.get('/', workspaceController.getWorkspaces);
router.get('/archived', workspaceController.getArchivedWorkspaces);
router.get('/:workspaceId', workspaceController.getWorkspace)
router.patch('/:workspaceId', workspaceController.updateWorkspace)
router.delete('/:workspaceId', workspaceController.deleteWorkspace)

router.patch('/:workspaceId/archive', workspaceController.archiveWorkspace);
router.patch('/:workspaceId/restore', workspaceController.restoreWorkspace);

export default router;
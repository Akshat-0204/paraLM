import { Router } from 'express';
import * as noteController from './notesController';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.post('/workspace/:workspaceId', noteController.createNote as any);
router.post('/workspace/:workspaceId/generate', noteController.generateNote as any);
router.get('/workspace/:workspaceId', noteController.getNotes as any);
router.get('/:noteId', noteController.getNote as any);
router.patch('/:noteId', noteController.updateNote as any);
router.delete('/:noteId', noteController.deleteNote as any);

export default router;
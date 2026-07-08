import multer from 'multer';
import { RequestHandler } from "express";

import * as documentController from './docController';
import { Router } from 'express';
import { authenticate } from '../../middlewares/authMiddleware';

const router = Router();

//multer config setups
const upload = multer({
    storage : multer.memoryStorage(),
    limits : {
        fileSize : 20 * 1024 * 1024
    },
    fileFilter : (_req, file , cb) => {
            const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'text/plain',
      'text/html',
    ];

        if(allowedMimes.includes(file.mimetype)){
            cb(null, true);
        }
        else {
            cb(new Error('Unsupported file type'))
        }
    }
});

router.use(authenticate)

router.post(
  '/workspace/:workspaceId/upload',
  upload.single('file'),
  documentController.uploadDocument as any
);

router.get(
  '/workspace/:workspaceId',
  documentController.getDocuments
);

router.get(
  '/:documentId',
  documentController.getDocument
);

router.get(
  '/:documentId/status',
  documentController.getDocumentStatus
);

router.delete(
  '/:documentId',
  documentController.deleteDocument
);

export default router;
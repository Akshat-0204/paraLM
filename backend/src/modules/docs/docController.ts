import { Request, Response, NextFunction } from 'express';
import * as documentService from './docServices';
import { RequestHandler } from "express";



interface WorkspaceParams {
  workspaceId: string;
}

interface DocumentParams {
  documentId: string;
}

export async function uploadDocument(
    req : Request<WorkspaceParams>, 
    res :  Response, 
    next : NextFunction
) : Promise<void> {
    try{
        const userId = req.user!.userId;
        const {workspaceId} = req.params as WorkspaceParams;

        if(!req.file){
            res.status(400).json({
                success : false,
                message : 'No file uploaded',
            })
            return ;

        }

        const document = await documentService.uploadDocument(
            userId, workspaceId, req.file
        );

            res.status(201).json({
      success: true,
      message: 'Document uploaded successfully. Processing started.',
      data: { document },
    });


    }catch(error){
        next(error);
    }
}

//get workspace docs
export async function getDocuments(
  req: Request<WorkspaceParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const documents = await documentService.getWorkspaceDocuments(
      workspaceId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Documents fetched successfully',
      data: { documents },
    });
  } catch (error) {
    next(error);
  }
}

//get single doc 
export async function getDocument(req: Request<DocumentParams>,
  res: Response,
  next: NextFunction): Promise<void>{
    try {
        
          const userId = req.user!.userId;
    const { documentId } = req.params;

    const document = await documentService.getDocumentById(documentId, userId);

    res.status(200).json({
      success: true,
      message: 'Document fetched successfully',
      data: { document },
    });
    } catch (error) {
        next(error);
    }
  }

  //delete doc
  export async function deleteDocument(
  req: Request<DocumentParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { documentId } = req.params;

    await documentService.deleteDocument(documentId, userId);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

//get doc status
export async function getDocumentStatus(
  req: Request<DocumentParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { documentId } = req.params;

    const status = await documentService.getDocumentStatus(documentId, userId);

    res.status(200).json({
      success: true,
      message: 'Document status fetched successfully',
      data: { status },
    });
  } catch (error) {
    next(error);
  }
}

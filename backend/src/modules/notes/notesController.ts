import { Request, Response, NextFunction } from 'express';
import * as noteService from './noteServices';
import { AIProfile, IWorkspace } from '../../types';

interface WorkspaceIdParams{
    workspaceId : string ;

}

interface NoteIdParams{
   noteId : string ;

}

export async function createNote(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;
    const { title, content, documentIds } = req.body;

    const note = await noteService.createNote(userId, workspaceId, {
      title,
      content,
      documentIds,
    });

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
}

//generating note
export async function generateNote(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;
    const { userQuery, documentIds, aiProfile } = req.body;

    if (!userQuery || !documentIds?.length) {
      res.status(400).json({
        success: false,
        message: 'userQuery and documentIds are required',
      });
      return;
    }

    const note = await noteService.generateNote(userId, workspaceId, {
      userQuery,
      documentIds,
      aiProfile: aiProfile as AIProfile,
    });

    res.status(201).json({
      success: true,
      message: 'Note generated successfully',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
}

//getting notes
export async function getNotes(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const notes = await noteService.getWorkspaceNotes(workspaceId, userId);

    res.status(200).json({
      success: true,
      message: 'Notes fetched successfully',
      data: { notes },
    });
  } catch (error) {
    next(error);
  }
}

//getnote
export async function getNote(
  req: Request<NoteIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { noteId } = req.params;

    const note = await noteService.getNoteById(noteId, userId);

    res.status(200).json({
      success: true,
      message: 'Note fetched successfully',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
}

//updateNotes
export async function updateNote(
  req: Request<NoteIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { noteId } = req.params;
    const { title, content } = req.body;

    const note = await noteService.updateNote(noteId, userId, {
      title,
      content,
    });

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: { note },
    });
  } catch (error) {
    next(error);
  }
}

//deletenode
export async function deleteNote(
  req: Request<NoteIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { noteId } = req.params;

    await noteService.deleteNote(noteId, userId);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

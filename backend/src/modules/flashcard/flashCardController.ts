import { Request, Response, NextFunction } from 'express';
import * as flashcardService from './flashcardServices';
import { AIProfile } from '../../types';

interface WorkspaceIdParams{
    workspaceId : string
}

interface FCIdParams{
   flashcardId : string
}

export async function generateFlashcards(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;
    const { title, userQuery, documentIds, aiProfile } = req.body;

    if (!userQuery || !documentIds?.length) {
      res.status(400).json({
        success: false,
        message: 'userQuery and documentIds are required',
      });
      return;
    }

    const flashcard = await flashcardService.generateFlashcards(
      userId,
      workspaceId,
      {
        title,
        userQuery,
        documentIds,
        aiProfile: aiProfile as AIProfile,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Flashcards generated successfully',
      data: { flashcard },
    });
  } catch (error) {
    next(error);
  }
}

//getting flash cards
export async function getFlashcards(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const flashcards = await flashcardService.getWorkspaceFlashcards(
      workspaceId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Flashcards fetched successfully',
      data: { flashcards },
    });
  } catch (error) {
    next(error);
  }
}

//getflashCard
export async function getFlashcard(
  req: Request<FCIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { flashcardId } = req.params;

    const flashcard = await flashcardService.getFlashcardById(
      flashcardId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Flashcard fetched successfully',
      data: { flashcard },
    });
  } catch (error) {
    next(error);
  }
}

//delete flashcard
export async function deleteFlashcard(
  req: Request<FCIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { flashcardId } = req.params;

    await flashcardService.deleteFlashcard(flashcardId, userId);

    res.status(200).json({
      success: true,
      message: 'Flashcard deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
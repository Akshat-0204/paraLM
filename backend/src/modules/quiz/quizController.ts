import { Request, Response, NextFunction } from 'express';
import * as quizService from './quizServices';
import { AIProfile } from '../../types';

interface WorkspaceIdParams{
    workspaceId : string
}

interface QuizIdParams{
    quizId : string
}

export async function generateQuiz(
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

    const quiz = await quizService.generateQuiz(userId, workspaceId, {
      title,
      userQuery,
      documentIds,
      aiProfile: aiProfile as AIProfile,
    });

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
}

export async function getQuizzes(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const quizzes = await quizService.getWorkspaceQuizzes(workspaceId, userId);

    res.status(200).json({
      success: true,
      message: 'Quizzes fetched successfully',
      data: { quizzes },
    });
  } catch (error) {
    next(error);
  }
}

export async function getQuiz(
  req: Request<QuizIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { quizId } = req.params;

    const quiz = await quizService.getQuizById(quizId, userId);

    res.status(200).json({
      success: true,
      message: 'Quiz fetched successfully',
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteQuiz(
  req: Request<QuizIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { quizId } = req.params;

    await quizService.deleteQuiz(quizId, userId);

    res.status(200).json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
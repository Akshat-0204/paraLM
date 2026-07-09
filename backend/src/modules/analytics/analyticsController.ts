import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analyticsServices';
import { UserFeedback } from '../../types';

interface WorkspaceIdParams{
    workspaceId : string
}

interface AnalyticsIdParams{
    analyticsId : string
}

export async function getWorkspaceAnalytics(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const records = await analyticsService.getWorkspaceAnalytics(
      workspaceId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Analytics fetched successfully',
      data: { records },
    });
  } catch (error) {
    next(error);
  }
}



export async function getAnalyticsSummary(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const summary = await analyticsService.getAnalyticsSummary(
      workspaceId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Analytics summary fetched successfully',
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
}



export async function getUserAnalytics(
  req: Request<AnalyticsIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;

    const analytics = await analyticsService.getUserAnalytics(userId);

    res.status(200).json({
      success: true,
      message: 'User analytics fetched successfully',
      data: { analytics },
    });
  } catch (error) {
    next(error);
  }
}



export async function submitFeedback(
  req: Request<AnalyticsIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { analyticsId } = req.params;
    const { feedback } = req.body;

    if (!feedback || !Object.values(UserFeedback).includes(feedback)) {
      res.status(400).json({
        success: false,
        message: `feedback must be one of: ${Object.values(UserFeedback).join(', ')}`,
      });
      return;
    }

    const record = await analyticsService.submitFeedback(
      analyticsId,
      userId,
      feedback as UserFeedback
    );

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { record },
    });
  } catch (error) {
    next(error);
  }
}
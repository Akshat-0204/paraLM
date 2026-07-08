import { Request, Response, NextFunction } from 'express';
import * as timelineService from './timelineServices';
import { AIProfile } from '../../types';

interface WorkspaceIdParams{
    workspaceId : string
}

interface TimelineIdParams{
    timelineId : string
}

export async function generateTimeline(
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

    const timeline = await timelineService.generateTimeline(
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
      message: 'Timeline generated successfully',
      data: { timeline },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTimelines(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const timelines = await timelineService.getWorkspaceTimelines(
      workspaceId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Timelines fetched successfully',
      data: { timelines },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTimeline(
  req: Request<TimelineIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { timelineId } = req.params;

    const timeline = await timelineService.getTimelineById(timelineId, userId);

    res.status(200).json({
      success: true,
      message: 'Timeline fetched successfully',
      data: { timeline },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTimeline(
  req: Request<TimelineIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { timelineId } = req.params;

    await timelineService.deleteTimeline(timelineId, userId);

    res.status(200).json({
      success: true,
      message: 'Timeline deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
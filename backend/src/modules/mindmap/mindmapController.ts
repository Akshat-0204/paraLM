import { Request, Response, NextFunction } from 'express';
import * as mindmapService from './mindmapServices';
import { AIProfile } from '../../types';

interface WorkspaceIdParams{
    workspaceId : string
}

interface MindmapIdParams{
    mindmapId : string
}

export async function generateMindMap(
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

    const mindMap = await mindmapService.generateMindMap(userId, workspaceId, {
      title,
      userQuery,
      documentIds,
      aiProfile: aiProfile as AIProfile,
    });

    res.status(201).json({
      success: true,
      message: 'Mind map generated successfully',
      data: { mindMap },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMindMaps(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const mindMaps = await mindmapService.getWorkspaceMindMaps(
      workspaceId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Mind maps fetched successfully',
      data: { mindMaps },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMindMap(
  req: Request<MindmapIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { mindmapId } = req.params;

    const mindMap = await mindmapService.getMindMapById(mindmapId, userId);

    res.status(200).json({
      success: true,
      message: 'Mind map fetched successfully',
      data: { mindMap },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteMindMap(
  req: Request<MindmapIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { mindmapId } = req.params;

    await mindmapService.deleteMindMap(mindmapId, userId);

    res.status(200).json({
      success: true,
      message: 'Mind map deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
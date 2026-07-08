import { Request, Response, NextFunction } from 'express';
import * as chatService from './chatService';
import { AIProfile, TaskType } from '../../types';

export interface WorkspaceIdParams {
  workspaceId: string;
}

export interface ChatIdParams {
  chatId: string;
}
// Create Chat 

export async function createChat(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;
    const { title, aiProfile } = req.body;

    const chat = await chatService.createChat(userId, workspaceId, {
      title,
      aiProfile,
    });

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
}

//  Get Workspace Chats 

export async function getChats(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;

    const chats = await chatService.getWorkspaceChats(workspaceId, userId);

    res.status(200).json({
      success: true,
      message: 'Chats fetched successfully',
      data: { chats },
    });
  } catch (error) {
    next(error);
  }
}

//  Get Single Chat 

export async function getChat(
  req: Request<ChatIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { chatId } = req.params;

    const chat = await chatService.getChatById(chatId, userId);

    res.status(200).json({
      success: true,
      message: 'Chat fetched successfully',
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
}

//  Update Chat Title 

export async function updateChat(
  req: Request<ChatIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { chatId } = req.params;
    const { title } = req.body;

    const chat = await chatService.updateChatTitle(chatId , userId, title);

    res.status(200).json({
      success: true,
      message: 'Chat updated successfully',
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
}

//  Delete Chat 

export async function deleteChat(
  req: Request<ChatIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { chatId } = req.params;

    await chatService.deleteChat(chatId, userId);

    res.status(200).json({
      success: true,
      message: 'Chat deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

// Get Chat Messages 

export async function getMessages(
  req: Request<ChatIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { chatId } = req.params;

    const messages = await chatService.getChatMessages(chatId, userId);

    res.status(200).json({
      success: true,
      message: 'Messages fetched successfully',
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
}

// Send Message 



export async function sendMessage(
  req: Request<ChatIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {

    
    const userId = req.user!.userId;
    const { chatId } = req.params ;
    const { content, workspaceId, documentIds } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
      return;
    }

    const { userMessage, assistantMessage } = await chatService.sendMessage(
      chatId,
      userId,
      workspaceId,
      content,
      documentIds ?? []
    );

    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      data: { userMessage, assistantMessage },
    });
  } catch (error) {
    next(error);
  }
}

//  Run AI Task 

export async function runAITask(
  req: Request<WorkspaceIdParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { workspaceId } = req.params;
    const { taskType, aiProfile, userQuery, documentIds } = req.body;

    if (!taskType || !userQuery) {
      res.status(400).json({
        success: false,
        message: 'taskType and userQuery are required',
      });
      return;
    }

    const result = await chatService.runAITask(userId, workspaceId, {
      taskType: taskType as TaskType,
      aiProfile: (aiProfile as AIProfile) ?? AIProfile.BALANCED,
      userQuery,
      documentIds: documentIds ?? [],
    });

    res.status(200).json({
      success: true,
      message: 'AI task completed successfully',
      data: { result },
    });
  } catch (error) {
    next(error);
  }
}
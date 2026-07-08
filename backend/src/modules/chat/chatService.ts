import Chat from './chatModel';
import Message from './messageModel';
import { AppError } from '../../middlewares/errorMiddleware';
import { IChat, IMessage, MessageRole, AIProfile, TaskType } from '../../types';
import { runOrchestrator } from '../../ai/orchestrator/graph';

// ─── Create Chat ──────────────────────────────────────────────────────────────

export async function createChat(
  userId: string,
  workspaceId: string,
  input: {
    title?: string;
    aiProfile?: AIProfile;
  }
): Promise<IChat> {
  const chat = await Chat.create({
    userId,
    workspaceId,
    title: input.title ?? 'New Chat',
    aiProfile: input.aiProfile ?? AIProfile.BALANCED,
  });

  return chat;
}

// ─── Get Chats by Workspace ───────────────────────────────────────────────────

export async function getWorkspaceChats(
  workspaceId: string,
  userId: string
): Promise<IChat[]> {
  const chats = await Chat.find({ workspaceId, userId }).sort({
    updatedAt: -1,
  });

  return chats;
}

// ─── Get Single Chat ──────────────────────────────────────────────────────────

export async function getChatById(
  chatId: string,
  userId: string
): Promise<IChat> {
  const chat = await Chat.findOne({ _id: chatId, userId });

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  return chat;
}

// ─── Update Chat Title ────────────────────────────────────────────────────────

export async function updateChatTitle(
  chatId: string,
  userId: string,
  title: string
): Promise<IChat> {
  const chat = await Chat.findOneAndUpdate(
    { _id: chatId, userId },
    { $set: { title } },
    { new: true }
  );

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  return chat;
}

// ─── Delete Chat ──────────────────────────────────────────────────────────────

export async function deleteChat(
  chatId: string,
  userId: string
): Promise<void> {
  const chat = await Chat.findOne({ _id: chatId, userId });

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  // Delete all messages in the chat
  await Message.deleteMany({ chatId });
  await chat.deleteOne();
}

// ─── Get Chat Messages ────────────────────────────────────────────────────────

export async function getChatMessages(
  chatId: string,
  userId: string
): Promise<IMessage[]> {
  // Verify chat belongs to user
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
  return messages;
}

// ─── Send Message ─────────────────────────────────────────────────────────────

export async function sendMessage(
  chatId: string,
  userId: string,
  workspaceId: string,
  content: string,
  documentIds: string[]
): Promise<{
  userMessage: IMessage;
  assistantMessage: IMessage;
}> {
  // Verify chat belongs to user
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  // Save user message
  const userMessage = await Message.create({
    chatId,
    role: MessageRole.USER,
    content,
  });

  // Increment message count
  await Chat.findByIdAndUpdate(chatId, { $inc: { messageCount: 1 } });

  // Run the AI orchestrator
  const result = await runOrchestrator({
    userId,
    workspaceId,
    chatId,
    taskType: TaskType.CHAT,
    aiProfile: chat.aiProfile as AIProfile,
    userQuery: content,
    documentIds,
  });

  // Save assistant message with citations
  const assistantMessage = await Message.create({
    chatId,
    role: MessageRole.ASSISTANT,
    content: result.generatedOutput,
    sources: result.citations,
  });

  // Increment message count again for assistant
  await Chat.findByIdAndUpdate(chatId, {
    $inc: { messageCount: 1 },
    $set: { updatedAt: new Date() },
  });

  // Auto-generate title from first message if still default
  if (chat.title === 'New Chat' && chat.messageCount === 0) {
    const autoTitle = content.slice(0, 60) + (content.length > 60 ? '...' : '');
    await Chat.findByIdAndUpdate(chatId, { $set: { title: autoTitle } });
  }

  return { userMessage, assistantMessage };
}

// ─── Run AI Task (non-chat) ───────────────────────────────────────────────────
// Used for summarize, notes, flashcards, quiz, timeline, mindmap

export async function runAITask(
  userId: string,
  workspaceId: string,
  input: {
    taskType: TaskType;
    aiProfile: AIProfile;
    userQuery: string;
    documentIds: string[];
  }
): Promise<{
  output: string;
  citations: any[];
  reflectionScore: number;
  confidenceScore: number;
  selectedModel: string;
}> {
  const result = await runOrchestrator({
    userId,
    workspaceId,
    
    taskType: input.taskType,
    aiProfile: input.aiProfile,
    userQuery: input.userQuery,
    documentIds: input.documentIds,
  });

  return {
    output: result.generatedOutput,
    citations: result.citations,
    reflectionScore: result.reflectionScore,
    confidenceScore: result.confidenceScore,
    selectedModel: result.selectedModel,
  };
}
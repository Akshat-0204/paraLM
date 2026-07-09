import api from '@/lib/api';
import { Chat, Message, ApiResponse, AIProfile, TaskType } from '@/types';

export interface CreateChatPayload {
  title?: string;
  aiProfile?: AIProfile;
}

export interface SendMessagePayload {
  content: string;
  workspaceId: string;
  documentIds?: string[];
}

export interface AITaskPayload {
  taskType: TaskType;
  aiProfile?: AIProfile;
  userQuery: string;
  documentIds?: string[];
}

export interface AITaskResult {
  output: string;
  citations: any[];
  reflectionScore: number;
  confidenceScore: number;
  selectedModel: string;
}

export const chatService = {
  createChat: async (
    workspaceId: string,
    payload: CreateChatPayload
  ): Promise<Chat> => {
    const { data } = await api.post<ApiResponse<{ chat: Chat }>>(
      `/chats/workspace/${workspaceId}`,
      payload
    );
    return data.data!.chat;
  },

  getChats: async (workspaceId: string): Promise<Chat[]> => {
    const { data } = await api.get<ApiResponse<{ chats: Chat[] }>>(
      `/chats/workspace/${workspaceId}`
    );
    return data.data!.chats;
  },

  getChat: async (chatId: string): Promise<Chat> => {
    const { data } = await api.get<ApiResponse<{ chat: Chat }>>(
      `/chats/${chatId}`
    );
    return data.data!.chat;
  },

  updateChat: async (chatId: string, title: string): Promise<Chat> => {
    const { data } = await api.patch<ApiResponse<{ chat: Chat }>>(
      `/chats/${chatId}`,
      { title }
    );
    return data.data!.chat;
  },

  deleteChat: async (chatId: string): Promise<void> => {
    await api.delete(`/chats/${chatId}`);
  },

  getMessages: async (chatId: string): Promise<Message[]> => {
    const { data } = await api.get<ApiResponse<{ messages: Message[] }>>(
      `/chats/${chatId}/messages`
    );
    return data.data!.messages;
  },

  sendMessage: async (
    chatId: string,
    payload: SendMessagePayload
  ): Promise<{ userMessage: Message; assistantMessage: Message }> => {
    const { data } = await api.post<ApiResponse<{ userMessage: Message; assistantMessage: Message }>
    >(`/chats/${chatId}/messages`, payload);
    return data.data!;
  },

  runAITask: async (
    workspaceId: string,
    payload: AITaskPayload
  ): Promise<AITaskResult> => {
    const { data } = await api.post<ApiResponse<{ result: AITaskResult }>>(
      `/chats/workspace/${workspaceId}/ai-task`,
      payload
    );
    return data.data!.result;
  },
};
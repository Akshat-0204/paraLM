import api from '@/lib/api';
import { Quiz, ApiResponse, AIProfile } from '@/types';

export interface GenerateQuizPayload {
  title?: string;
  userQuery: string;
  documentIds: string[];
  aiProfile?: AIProfile;
}

export const quizService = {
  generateQuiz: async (
    workspaceId: string,
    payload: GenerateQuizPayload
  ): Promise<Quiz> => {
    const { data } = await api.post<ApiResponse<{ quiz: Quiz }>>(
      `/quizzes/workspace/${workspaceId}/generate`,
      payload
    );
    return data.data!.quiz;
  },

  getQuizzes: async (workspaceId: string): Promise<Quiz[]> => {
    const { data } = await api.get<ApiResponse<{ quizzes: Quiz[] }>>(
      `/quizzes/workspace/${workspaceId}`
    );
    return data.data!.quizzes;
  },

  getQuiz: async (quizId: string): Promise<Quiz> => {
    const { data } = await api.get<ApiResponse<{ quiz: Quiz }>>(
      `/quizzes/${quizId}`
    );
    return data.data!.quiz;
  },

  deleteQuiz: async (quizId: string): Promise<void> => {
    await api.delete(`/quizzes/${quizId}`);
  },
};
import api from '@/lib/api';
import { Flashcard, ApiResponse, AIProfile } from '@/types';

export interface GenerateFlashcardPayload {
  title?: string;
  userQuery: string;
  documentIds: string[];
  aiProfile?: AIProfile;
}

export const flashcardService = {
  generateFlashcards: async (
    workspaceId: string,
    payload: GenerateFlashcardPayload
  ): Promise<Flashcard> => {
    const { data } = await api.post<ApiResponse<{ flashcard: Flashcard }>>(
      `/flashcards/workspace/${workspaceId}/generate`,
      payload
    );
    return data.data!.flashcard;
  },

  getFlashcards: async (workspaceId: string): Promise<Flashcard[]> => {
    const { data } = await api.get<ApiResponse<{ flashcards: Flashcard[] }>>(
      `/flashcards/workspace/${workspaceId}`
    );
    return data.data!.flashcards;
  },

  getFlashcard: async (flashcardId: string): Promise<Flashcard> => {
    const { data } = await api.get<ApiResponse<{ flashcard: Flashcard }>>(
      `/flashcards/${flashcardId}`
    );
    return data.data!.flashcard;
  },

  deleteFlashcard: async (flashcardId: string): Promise<void> => {
    await api.delete(`/flashcards/${flashcardId}`);
  },
};
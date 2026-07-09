import api from '@/lib/api';
import { Note, ApiResponse, AIProfile } from '@/types';

export interface CreateNotePayload {
  title: string;
  content?: string;
  documentIds?: string[];
}

export interface GenerateNotePayload {
  userQuery: string;
  documentIds: string[];
  aiProfile?: AIProfile;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
}

export const noteService = {
  createNote: async (
    workspaceId: string,
    payload: CreateNotePayload
  ): Promise<Note> => {
    const { data } = await api.post<ApiResponse<{ note: Note }>>(
      `/notes/workspace/${workspaceId}`,
      payload
    );
    return data.data!.note;
  },

  generateNote: async (
    workspaceId: string,
    payload: GenerateNotePayload
  ): Promise<Note> => {
    const { data } = await api.post<ApiResponse<{ note: Note }>>(
      `/notes/workspace/${workspaceId}/generate`,
      payload
    );
    return data.data!.note;
  },

  getNotes: async (workspaceId: string): Promise<Note[]> => {
    const { data } = await api.get<ApiResponse<{ notes: Note[] }>>(
      `/notes/workspace/${workspaceId}`
    );
    return data.data!.notes;
  },

  getNote: async (noteId: string): Promise<Note> => {
    const { data } = await api.get<ApiResponse<{ note: Note }>>(
      `/notes/${noteId}`
    );
    return data.data!.note;
  },

  updateNote: async (
    noteId: string,
    payload: UpdateNotePayload
  ): Promise<Note> => {
    const { data } = await api.patch<ApiResponse<{ note: Note }>>(
      `/notes/${noteId}`,
      payload
    );
    return data.data!.note;
  },

  deleteNote: async (noteId: string): Promise<void> => {
    await api.delete(`/notes/${noteId}`);
  },
};
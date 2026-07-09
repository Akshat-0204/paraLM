import api from '@/lib/api';
import { Document, ApiResponse } from '@/types';

export interface DocumentStatusResponse {
  processingStatus: string;
  embeddingStatus: string;
  chunkCount: number;
}

export const documentService = {
  uploadDocument: async (
    workspaceId: string,
    file: File,
    onUploadProgress?: (progress: number) => void
  ): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<ApiResponse<{ document: Document }>>(
      `/documents/workspace/${workspaceId}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onUploadProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onUploadProgress(progress);
          }
        },
      }
    );
    return data.data!.document;
  },

  getDocuments: async (workspaceId: string): Promise<Document[]> => {
    const { data } = await api.get<ApiResponse<{ documents: Document[] }>>(
      `/documents/workspace/${workspaceId}`
    );
    return data.data!.documents;
  },

  getDocument: async (documentId: string): Promise<Document> => {
    const { data } = await api.get<ApiResponse<{ document: Document }>>(
      `/documents/${documentId}`
    );
    return data.data!.document;
  },

  getDocumentStatus: async (
    documentId: string
  ): Promise<DocumentStatusResponse> => {
    const { data } = await api.get<ApiResponse<{ status: DocumentStatusResponse }>>(
      `/documents/${documentId}/status`
    );
    return data.data!.status;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  },
};
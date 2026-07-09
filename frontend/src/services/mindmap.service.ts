import api from '@/lib/api';
import { MindMap, ApiResponse, AIProfile } from '@/types';

export interface GenerateMindMapPayload {
  title?: string;
  userQuery: string;
  documentIds: string[];
  aiProfile?: AIProfile;
}

export const mindmapService = {
  generateMindMap: async (
    workspaceId: string,
    payload: GenerateMindMapPayload
  ): Promise<MindMap> => {
    const { data } = await api.post<ApiResponse<{ mindMap: MindMap }>>(
      `/mindmaps/workspace/${workspaceId}/generate`,
      payload
    );
    return data.data!.mindMap;
  },

  getMindMaps: async (workspaceId: string): Promise<MindMap[]> => {
    const { data } = await api.get<ApiResponse<{ mindMaps: MindMap[] }>>(
      `/mindmaps/workspace/${workspaceId}`
    );
    return data.data!.mindMaps;
  },

  getMindMap: async (mindmapId: string): Promise<MindMap> => {
    const { data } = await api.get<ApiResponse<{ mindMap: MindMap }>>(
      `/mindmaps/${mindmapId}`
    );
    return data.data!.mindMap;
  },

  deleteMindMap: async (mindmapId: string): Promise<void> => {
    await api.delete(`/mindmaps/${mindmapId}`);
  },
};
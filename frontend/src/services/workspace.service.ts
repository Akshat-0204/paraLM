import api from '@/lib/api';
import { Workspace, ApiResponse } from '@/types';

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const workspaceService = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    const { data } = await api.get<ApiResponse<{ workspaces: Workspace[] }>>(
      '/workspaces'
    );
    return data.data!.workspaces;
  },

  getWorkspace: async (workspaceId: string): Promise<Workspace> => {
    const { data } = await api.get<ApiResponse<{ workspace: Workspace }>>(
      `/workspaces/${workspaceId}`
    );
    return data.data!.workspace;
  },

  createWorkspace: async (
    payload: CreateWorkspacePayload
  ): Promise<Workspace> => {
    const { data } = await api.post<ApiResponse<{ workspace: Workspace }>>(
      '/workspaces',
      payload
    );
    return data.data!.workspace;
  },

  updateWorkspace: async (
    workspaceId: string,
    payload: UpdateWorkspacePayload
  ): Promise<Workspace> => {
    const { data } = await api.patch<ApiResponse<{ workspace: Workspace }>>(
      `/workspaces/${workspaceId}`,
      payload
    );
    return data.data!.workspace;
  },

  deleteWorkspace: async (workspaceId: string): Promise<void> => {
    await api.delete(`/workspaces/${workspaceId}`);
  },

  archiveWorkspace: async (workspaceId: string): Promise<Workspace> => {
    const { data } = await api.patch<ApiResponse<{ workspace: Workspace }>>(
      `/workspaces/${workspaceId}/archive`
    );
    return data.data!.workspace;
  },

  restoreWorkspace: async (workspaceId: string): Promise<Workspace> => {
    const { data } = await api.patch<ApiResponse<{ workspace: Workspace }>>(
      `/workspaces/${workspaceId}/restore`
    );
    return data.data!.workspace;
  },

  getArchivedWorkspaces: async (): Promise<Workspace[]> => {
    const { data } = await api.get<ApiResponse<{ workspaces: Workspace[] }>>(
      '/workspaces/archived'
    );
    return data.data!.workspaces;
  },
};
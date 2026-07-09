import api from '@/lib/api';
import { Timeline, ApiResponse, AIProfile } from '@/types';

export interface GenerateTimelinePayload {
  title?: string;
  userQuery: string;
  documentIds: string[];
  aiProfile?: AIProfile;
}

export const timelineService = {
  generateTimeline: async (
    workspaceId: string,
    payload: GenerateTimelinePayload
  ): Promise<Timeline> => {
    const { data } = await api.post<ApiResponse<{ timeline: Timeline }>>(
      `/timelines/workspace/${workspaceId}/generate`,
      payload
    );
    return data.data!.timeline;
  },

  getTimelines: async (workspaceId: string): Promise<Timeline[]> => {
    const { data } = await api.get<ApiResponse<{ timelines: Timeline[] }>>(
      `/timelines/workspace/${workspaceId}`
    );
    return data.data!.timelines;
  },

  getTimeline: async (timelineId: string): Promise<Timeline> => {
    const { data } = await api.get<ApiResponse<{ timeline: Timeline }>>(
      `/timelines/${timelineId}`
    );
    return data.data!.timeline;
  },

  deleteTimeline: async (timelineId: string): Promise<void> => {
    await api.delete(`/timelines/${timelineId}`);
  },
};
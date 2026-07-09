import api from '@/lib/api';
import { Analytics, AnalyticsSummary, ApiResponse, UserFeedback } from '@/types';

export const analyticsService = {
  getWorkspaceAnalytics: async (workspaceId: string): Promise<Analytics[]> => {
    const { data } = await api.get<ApiResponse<{ records: Analytics[] }>>(
      `/analytics/workspace/${workspaceId}`
    );
    return data.data!.records;
  },

  getAnalyticsSummary: async (
    workspaceId: string
  ): Promise<AnalyticsSummary> => {
    const { data } = await api.get<ApiResponse<{ summary: AnalyticsSummary }>>(
      `/analytics/workspace/${workspaceId}/summary`
    );
    return data.data!.summary;
  },

  getUserAnalytics: async (): Promise<{
    totalRuns: number;
    totalTokens: number;
    totalCost: number;
    recentRuns: Analytics[];
  }> => {
    const { data } = await api.get<ApiResponse<{
        analytics: {
          totalRuns: number;
          totalTokens: number;
          totalCost: number;
          recentRuns: Analytics[];
        };
      }>
    >('/analytics/me');
    return data.data!.analytics;
  },

  submitFeedback: async (
    analyticsId: string,
    feedback: UserFeedback
  ): Promise<Analytics> => {
    const { data } = await api.patch<ApiResponse<{ record: Analytics }>>(
      `/analytics/${analyticsId}/feedback`,
      { feedback }
    );
    return data.data!.record;
  },
};
import Analytics from './analyticsModel';
import { IAnalytics, TaskType, AIProfile, UserFeedback } from '../../types';
import { AppError } from '../../middlewares/errorMiddleware';

// ─── Create Analytics Record ──────────────────────────────────────────────────

export async function createAnalyticsRecord(input: {
  userId: string;
  workspaceId: string;
  chatId?: string;
  taskType: TaskType;
  aiProfile: AIProfile;
  modelUsed: string;
  totalLatency: number;
  retrievalTime: number;
  generationTime: number;
  tokensUsed: number;
  chunksRetrieved: number;
  chunksUsed: number;
  confidenceScore: number;
  reflectionScore: number;
  failed: boolean;
  retries: number;
}): Promise<IAnalytics> {
  // Estimate cost based on tokens used
  // Rough estimate: $0.0001 per 1000 tokens for free models
  const estimatedCost = (input.tokensUsed / 1000) * 0.0001;

  const record = await Analytics.create({
    ...input,
    estimatedCost,
  });

  return record;
}



export async function getWorkspaceAnalytics(
  workspaceId: string,
  userId: string
): Promise<IAnalytics[]> {
  const records = await Analytics.find({ workspaceId, userId })
    .sort({ createdAt: -1 })
    .limit(100);

  return records;
}



export async function getAnalyticsSummary(
  workspaceId: string,
  userId: string
): Promise<{
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  avgConfidence: number;
  avgReflection: number;
  taskBreakdown: Record<string, number>;
  modelBreakdown: Record<string, number>;
  failureRate: number;
}> {
  const records = await Analytics.find({ workspaceId, userId });

  if (records.length === 0) {
    return {
      totalRuns: 0,
      totalTokens: 0,
      totalCost: 0,
      avgLatency: 0,
      avgConfidence: 0,
      avgReflection: 0,
      taskBreakdown: {},
      modelBreakdown: {},
      failureRate: 0,
    };
  }

  const totalRuns = records.length;
  const totalTokens = records.reduce((sum, r) => sum + r.tokensUsed, 0);
  const totalCost = records.reduce((sum, r) => sum + r.estimatedCost, 0);
  const avgLatency =
    records.reduce((sum, r) => sum + r.totalLatency, 0) / totalRuns;
  const avgConfidence =
    records.reduce((sum, r) => sum + r.confidenceScore, 0) / totalRuns;
  const avgReflection =
    records.reduce((sum, r) => sum + r.reflectionScore, 0) / totalRuns;
  const failedCount = records.filter((r) => r.failed).length;
  const failureRate = failedCount / totalRuns;

  // Task type breakdown
  const taskBreakdown: Record<string, number> = {};
  for (const record of records) {
    taskBreakdown[record.taskType] =
      (taskBreakdown[record.taskType] ?? 0) + 1;
  }

  // Model usage breakdown
  const modelBreakdown: Record<string, number> = {};
  for (const record of records) {
    modelBreakdown[record.modelUsed] =
      (modelBreakdown[record.modelUsed] ?? 0) + 1;
  }

  return {
    totalRuns,
    totalTokens,
    totalCost: Math.round(totalCost * 10000) / 10000,
    avgLatency: Math.round(avgLatency),
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    avgReflection: Math.round(avgReflection * 100) / 100,
    taskBreakdown,
    modelBreakdown,
    failureRate: Math.round(failureRate * 100) / 100,
  };
}


export async function getUserAnalytics(userId: string): Promise<{
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  recentRuns: IAnalytics[];
}> {
  const records = await Analytics.find({ userId })
    .sort({ createdAt: -1 })
    .limit(200);

  const totalRuns = records.length;
  const totalTokens = records.reduce((sum, r) => sum + r.tokensUsed, 0);
  const totalCost = records.reduce((sum, r) => sum + r.estimatedCost, 0);
  const recentRuns = records.slice(0, 10);

  return {
    totalRuns,
    totalTokens,
    totalCost: Math.round(totalCost * 10000) / 10000,
    recentRuns,
  };
}



export async function submitFeedback(
  analyticsId: string,
  userId: string,
  feedback: UserFeedback
): Promise<IAnalytics> {
  const record = await Analytics.findOneAndUpdate(
    { _id: analyticsId, userId },
    { $set: { userFeedback: feedback } },
    { new: true }
  );

  if (!record) {
    throw new AppError('Analytics record not found', 404);
  }

  return record;
}
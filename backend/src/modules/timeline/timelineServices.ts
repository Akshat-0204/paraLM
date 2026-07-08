import Timeline from './timelineModel';
import { AppError } from '../../middlewares/errorMiddleware';
import { ITimeline, AIProfile, TaskType } from '../../types';
import { runOrchestrator } from '../../ai/orchestrator/graph';

export async function generateTimeline(
  userId: string,
  workspaceId: string,
  input: {
    title?: string;
    userQuery: string;
    documentIds: string[];
    aiProfile?: AIProfile;
  }
): Promise<ITimeline> {
  const result = await runOrchestrator({
    userId,
    workspaceId,
    taskType: TaskType.TIMELINE,
    aiProfile: input.aiProfile ?? AIProfile.BALANCED,
    userQuery: input.userQuery,
    documentIds: input.documentIds,
  });

  const parsed = JSON.parse(result.generatedOutput);

  const timeline = await Timeline.create({
    userId,
    workspaceId,
    title: input.title ?? parsed.title ?? `Timeline — ${input.userQuery.slice(0, 50)}`,
    events: parsed.events,
    documentIds: input.documentIds,
  });

  return timeline;
}

export async function getWorkspaceTimelines(
  workspaceId: string,
  userId: string
): Promise<ITimeline[]> {
  return Timeline.find({ workspaceId, userId }).sort({ createdAt: -1 });
}

export async function getTimelineById(
  timelineId: string,
  userId: string
): Promise<ITimeline> {
  const timeline = await Timeline.findOne({ _id: timelineId, userId });
  if (!timeline) throw new AppError('Timeline not found', 404);
  return timeline;
}

export async function deleteTimeline(
  timelineId: string,
  userId: string
): Promise<void> {
  const timeline = await Timeline.findOne({ _id: timelineId, userId });
  if (!timeline) throw new AppError('Timeline not found', 404);
  await timeline.deleteOne();
}
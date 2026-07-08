import MindMap from './mindmapModel';
import { AppError } from '../../middlewares/errorMiddleware';
import { IMindMap, AIProfile, TaskType } from '../../types';
import { runOrchestrator } from '../../ai/orchestrator/graph';

export async function generateMindMap(
  userId: string,
  workspaceId: string,
  input: {
    title?: string;
    userQuery: string;
    documentIds: string[];
    aiProfile?: AIProfile;
  }
): Promise<IMindMap> {
  const result = await runOrchestrator({
    userId,
    workspaceId,
    taskType: TaskType.MINDMAP,
    aiProfile: input.aiProfile ?? AIProfile.BALANCED,
    userQuery: input.userQuery,
    documentIds: input.documentIds,
  });

  const parsed = JSON.parse(result.generatedOutput);

  // Auto-assign positions to nodes in a radial layout
  const nodesWithPositions = parsed.nodes.map(
    (
      node: { id: string; label: string; type: string },
      index: number
    ) => {
      const angle = (index / parsed.nodes.length) * 2 * Math.PI;
      const radius = node.type === 'root' ? 0 : node.type === 'branch' ? 200 : 400;
      return {
        ...node,
        position: {
          x: Math.round(radius * Math.cos(angle)),
          y: Math.round(radius * Math.sin(angle)),
        },
      };
    }
  );

  const mindMap = await MindMap.create({
    userId,
    workspaceId,
    title: input.title ?? parsed.title ?? `Mind Map — ${input.userQuery.slice(0, 50)}`,
    nodes: nodesWithPositions,
    edges: parsed.edges,
    documentIds: input.documentIds,
  });

  return mindMap;
}

export async function getWorkspaceMindMaps(
  workspaceId: string,
  userId: string
): Promise<IMindMap[]> {
  return MindMap.find({ workspaceId, userId }).sort({ createdAt: -1 });
}

export async function getMindMapById(
  mindmapId: string,
  userId: string
): Promise<IMindMap> {
  const mindMap = await MindMap.findOne({ _id: mindmapId, userId });
  if (!mindMap) throw new AppError('Mind map not found', 404);
  return mindMap;
}

export async function deleteMindMap(
  mindmapId: string,
  userId: string
): Promise<void> {
  const mindMap = await MindMap.findOne({ _id: mindmapId, userId });
  if (!mindMap) throw new AppError('Mind map not found', 404);
  await mindMap.deleteOne();
}
import { StateGraph, Annotation, START, END } from '@langchain/langgraph';
import { AIProfile, ISource, RetrievedChunk, TaskType } from '../../types';
import { emitAIStep, emitAIResult, emitAiError } from '../../config/socket';
import { runPlannerWorker } from '../agents/plannerAgent';
import { runTaskAnalyzerWorker } from '../agents/taskAnalyzerAgent';
import { runModelRouterWorker } from '../agents/modelRouter';
import { runRetrieverWorker } from '../agents/retrieverAgent';
import { runContextOptimizerWorker } from '../agents/contextOptimizerAgent';
import { runSummarizationWorker } from '../agents/summarizationAgent';
import { runNotesWorker } from '../agents/notesAgent';
import { runFlashcardWorker } from '../agents/flashcardAgent';
import { runQuizWorker } from '../agents/quizAgent';
import { runTimelineWorker } from '../agents/timelineAgent';
import { runMindMapWorker } from '../agents/mindmapAgent';
import { runReflectionWorker } from '../agents/reflectionAgent';
import { runCitationWorker } from '../agents/citationAgent';



const GraphAnnotation = Annotation.Root({
  userId: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => '',
  }),
  workspaceId: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => '',
  }),
  chatId: Annotation<string | undefined>({
    reducer: (_a, b) => b,
    default: () => undefined ,
  }),
  taskType: Annotation<TaskType>({
    reducer: (_a, b) => b,
    default: () => TaskType.CHAT,
  }),
  aiProfile: Annotation<AIProfile>({
    reducer: (_a, b) => b,
    default: () => AIProfile.BALANCED,
  }),
  userQuery: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => '',
  }),
  documentIds: Annotation<string[]>({
    reducer: (_a, b) => b,
    default: () => [],
  }),
  plannedSteps: Annotation<string[]>({
    reducer: (_a, b) => b,
    default: () => [],
  }),
  retrievedChunks: Annotation<RetrievedChunk[]>({
    reducer: (_a, b) => b,
    default: () => [],
  }),
  optimizedContext: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => '',
  }),
  selectedModel: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => '',
  }),
  generatedOutput: Annotation<string>({
    reducer: (_a, b) => b,
    default: () => '',
  }),
  citations: Annotation<ISource[]>({
    reducer: (_a, b) => b,
    default: () => [],
  }),
  reflectionScore: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 0,
  }),
  confidenceScore: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 0,
  }),
  totalTokens: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 0,
  }),
  startTime: Annotation<number>({
    reducer: (_a, b) => b,
    default: () => 0,
  }),
  error: Annotation<string | undefined>({
    reducer: (_a, b) => b,
    default: () => undefined,
  }),
});

// Infer state type from annotation 

type GraphState = typeof GraphAnnotation.State;

// Wrap worker with Socket.io progress emission 

function withProgress(
  stepName: string,
  worker: (state: GraphState) => Promise<Partial<GraphState>>
) {
  return async (state: GraphState): Promise<Partial<GraphState>> => {
    emitAIStep(state.userId, stepName, 'started');
    try {
      const result = await worker(state);
      emitAIStep(state.userId, stepName, 'completed');
      return result;
    } catch (error) {
      emitAIStep(state.userId, stepName, 'failed');
      return { error: (error as Error).message };
    }
  };
}

// Conditional edge — routes to correct generation worker 

function routeToGenerationWorker(state: GraphState): string {
  switch (state.taskType) {
    case TaskType.SUMMARIZE:
      return 'summarization_worker';
    case TaskType.NOTES:
      return 'notes_worker';
    case TaskType.FLASHCARD:
      return 'flashcard_worker';
    case TaskType.QUIZ:
      return 'quiz_worker';
    case TaskType.TIMELINE:
      return 'timeline_worker';
    case TaskType.MINDMAP:
      return 'mindmap_worker';
    case TaskType.CHAT:
    default:
      return 'summarization_worker';
  }
}

// ─── Build and compile the graph ──────────────────────────────────────────────

export function buildOrchestratorGraph() {
  const graph = new StateGraph(GraphAnnotation)

    // ── Core pipeline nodes ──────────────────────────────────────────────────
    .addNode('planner', withProgress('Planning', runPlannerWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('task_analyzer', withProgress('Analyzing Task', runTaskAnalyzerWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('model_router', withProgress('Selecting Model', runModelRouterWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('retriever', withProgress('Retrieving Knowledge', runRetrieverWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('context_optimizer', withProgress('Optimizing Context', runContextOptimizerWorker as (state: GraphState) => Promise<Partial<GraphState>>))

    // ── Generation worker nodes ──────────────────────────────────────────────
    .addNode('summarization_worker', withProgress('Generating', runSummarizationWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('notes_worker', withProgress('Generating Notes', runNotesWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('flashcard_worker', withProgress('Generating Flashcards', runFlashcardWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('quiz_worker', withProgress('Generating Quiz', runQuizWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('timeline_worker', withProgress('Generating Timeline', runTimelineWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('mindmap_worker', withProgress('Generating Mind Map', runMindMapWorker as (state: GraphState) => Promise<Partial<GraphState>>))

    // ── Post-generation nodes ────────────────────────────────────────────────
    .addNode('reflection', withProgress('Reflecting', runReflectionWorker as (state: GraphState) => Promise<Partial<GraphState>>))
    .addNode('citation', withProgress('Validating Citations', runCitationWorker as (state: GraphState) => Promise<Partial<GraphState>>))

    // ── Linear edges ─────────────────────────────────────────────────────────
    .addEdge(START, 'planner')
    .addEdge('planner', 'task_analyzer')
    .addEdge('task_analyzer', 'model_router')
    .addEdge('model_router', 'retriever')
    .addEdge('retriever', 'context_optimizer')

    // ── Conditional routing to generation worker ──────────────────────────────
    .addConditionalEdges('context_optimizer', routeToGenerationWorker, {
      summarization_worker: 'summarization_worker',
      notes_worker: 'notes_worker',
      flashcard_worker: 'flashcard_worker',
      quiz_worker: 'quiz_worker',
      timeline_worker: 'timeline_worker',
      mindmap_worker: 'mindmap_worker',
    })

    // ── All generation workers converge → reflection → citation → END ─────────
    .addEdge('summarization_worker', 'reflection')
    .addEdge('notes_worker', 'reflection')
    .addEdge('flashcard_worker', 'reflection')
    .addEdge('quiz_worker', 'reflection')
    .addEdge('timeline_worker', 'reflection')
    .addEdge('mindmap_worker', 'reflection')
    .addEdge('reflection', 'citation')
    .addEdge('citation', END);

  return graph.compile();
}

// ─── Run the orchestrator ─────────────────────────────────────────────────────

export async function runOrchestrator(input: {
  userId: string;
  workspaceId: string;
  taskType: TaskType;
  aiProfile: AIProfile;
  userQuery: string;
  documentIds: string[];
  chatId?: string;
}): Promise<GraphState> {
  const graph = buildOrchestratorGraph();

 const initialState: GraphState = {
  ...input,
  chatId: input.chatId ?? undefined,
  plannedSteps: [],
  retrievedChunks: [],
  optimizedContext: '',
  selectedModel: '',
  generatedOutput: '',
  citations: [],
  reflectionScore: 0,
  confidenceScore: 0,
  totalTokens: 0,
  startTime: Date.now(),
  error: undefined,
};


  try {
    const finalState = await graph.invoke(initialState) as GraphState;

    emitAIResult(input.userId, {
      output: finalState.generatedOutput,
      citations: finalState.citations,
      reflectionScore: finalState.reflectionScore,
      confidenceScore: finalState.confidenceScore,
      selectedModel: finalState.selectedModel,
      latency: Date.now() - initialState.startTime,
    });

    return finalState;
  } catch (error) {
    emitAiError(input.userId, (error as Error).message);
    throw error;
  }
}
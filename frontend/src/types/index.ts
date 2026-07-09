

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}



export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  color: string;
  icon: string;
  documentCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}



export type FileType = 'pdf' | 'docx' | 'md' | 'txt' | 'html';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type EmbeddingStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Document {
  _id: string;
  workspaceId: string;
  userId: string;
  originalName: string;
  publicId: string;
  secureUrl: string;
  fileType: FileType;
  fileSize: number;
  processingStatus: ProcessingStatus;
  chunkCount: number;
  embeddingStatus: EmbeddingStatus;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}



export type AIProfile = 'fast' | 'balanced' | 'research' | 'deep_think';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Source {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  relevanceScore: number;
  excerpt: string;
}

export interface Message {
  _id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  createdAt: string;
}

export interface Chat {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  aiProfile: AIProfile;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}



export interface Note {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  content: string;
  documentIds: string[];
  aiGenerated: boolean;
  createdAt: string;
  updatedAt: string;
}



export type CardDifficulty = 'easy' | 'medium' | 'hard';

export interface Card {
  question: string;
  answer: string;
  difficulty: CardDifficulty;
}

export interface Flashcard {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  cards: Card[];
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}



export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: CardDifficulty;
}

export interface Quiz {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  questions: Question[];
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}



export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'branch' | 'leaf';
  position: { x: number; y: number };
  description?: string;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface MindMap {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}



export type EventImportance = 'low' | 'medium' | 'high';

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  importance: EventImportance;
  category?: string;
}

export interface Timeline {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  events: TimelineEvent[];
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
}



export type TaskType =
  | 'chat'
  | 'summarize'
  | 'notes'
  | 'flashcard'
  | 'quiz'
  | 'timeline'
  | 'mindmap';

export type UserFeedback = 'thumbs_up' | 'thumbs_down';

export interface Analytics {
  _id: string;
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
  estimatedCost: number;
  chunksRetrieved: number;
  chunksUsed: number;
  confidenceScore: number;
  reflectionScore: number;
  userFeedback?: UserFeedback;
  failed: boolean;
  retries: number;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalRuns: number;
  totalTokens: number;
  totalCost: number;
  avgLatency: number;
  avgConfidence: number;
  avgReflection: number;
  taskBreakdown: Record<string, number>;
  modelBreakdown: Record<string, number>;
  failureRate: number;
}



export type AIStepStatus = 'idle' | 'started' | 'completed' | 'failed';

export interface AIStep {
  step: string;
  status: AIStepStatus;
  timestamp?: number;
}

export interface AIProgressState {
  isRunning: boolean;
  steps: AIStep[];
  currentStep: string | null;
  result: AIResult | null;
  error: string | null;
}

export interface AIResult {
  output: string;
  citations: Source[];
  reflectionScore: number;
  confidenceScore: number;
  selectedModel: string;
  latency: number;
}



export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}



export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
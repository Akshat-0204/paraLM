

export interface IUser   {
    _id : string;
    name : string ;
    email: string;
  password: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
comparePassword(candidatePassword: string): Promise<boolean>;
}

export enum UserRole{
    USER = 'user',
    ADMIN = 'admin'
}

//Worksapce types
export interface IWorkspace  {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  color: string;
  icon: string;
  documentCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

//Document Types 
export interface IDocument {
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
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum FileType {
  PDF = 'pdf',
  DOCX = 'docx',
  MD = 'md',
  TXT = 'txt',
  HTML = 'html',
}

export enum ProcessingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum EmbeddingStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

//Chat types 
export interface IChat {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  aiProfile: AIProfile;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage  {
  _id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  sources?: ISource[];
  aiRun?: string;
  createdAt: Date;
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export interface ISource {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  relevanceScore: number;
  excerpt: string;
}

//notes types
export interface INote {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  content: string;
  documentIds: string[];
  aiGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

//flashcard
export interface IFlashcard  {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  cards: ICard[];
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICard {
  question: string;
  answer: string;
  difficulty: CardDifficulty;
}

export enum CardDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

//quiz types
export interface IQuiz{
    _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  questions: IQuestion[];
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;

}

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

//MindMap types

export interface IMindMap  {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  nodes: IMindMapNode[];
  edges: IMindMapEdge[];
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMindMapNode {
  id: string;
  label: string;
  type: string;
  position: { x: number; y: number };
}

export interface IMindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

//Timeline types 
export interface ITimeline {
  _id: string;
  workspaceId: string;
  userId: string;
  title: string;
  events: ITimelineEvent[];
  documentIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimelineEvent {
  date: string;
  title: string;
  description: string;
  importance: EventImportance;
}

export enum EventImportance {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

//Analytics types
export interface IAnalytics  {
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
  createdAt: Date;
}

export enum TaskType {
  CHAT = 'chat',
  SUMMARIZE = 'summarize',
  NOTES = 'notes',
  FLASHCARD = 'flashcard',
  QUIZ = 'quiz',
  TIMELINE = 'timeline',
  MINDMAP = 'mindmap',
}

export enum AIProfile {
  FAST = 'fast',
  BALANCED = 'balanced',
  RESEARCH = 'research',
  DEEP_THINK = 'deep_think',
}

export enum UserFeedback {
  THUMBS_UP = 'thumbs_up',
  THUMBS_DOWN = 'thumbs_down',
}

//Orchestration types 
export interface AIRunState {
  userId: string;
  workspaceId: string;
  chatId?: string;
  taskType: TaskType;
  aiProfile: AIProfile;
  userQuery: string;
  documentIds: string[];
  plannedSteps: string[];
  retrievedChunks: RetrievedChunk[];
  optimizedContext: string;
  selectedModel: string;
  generatedOutput: string;
  citations: ISource[];
  reflectionScore: number;
  confidenceScore: number;
  totalTokens: number;
  startTime: number;
  error?: string;
}

export interface RetrievedChunk {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

//API response types 
export interface ApiResponse< T= unknown>{
      success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

//JWT types 
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

//multer
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
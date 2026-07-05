import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorMiddleware } from './middlewares/errorMiddleware';

const app : Application = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'paraLM API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/* 
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workspaces', workspaceRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/flashcards', flashcardRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/mindmaps', mindmapRoutes);
app.use('/api/v1/timelines', timelineRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
*/

app.use(errorMiddleware);

export default app;
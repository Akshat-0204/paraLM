import Quiz from './quizModel';
import { AppError } from '../../middlewares/errorMiddleware';
import { IQuiz, AIProfile, TaskType } from '../../types';
import { runOrchestrator } from '../../ai/orchestrator/graph';

export async function generateQuiz(
  userId: string,
  workspaceId: string,
  input: {
    title?: string;
    userQuery: string;
    documentIds: string[];
    aiProfile?: AIProfile;
  }
): Promise<IQuiz> {
  const result = await runOrchestrator({
    userId,
    workspaceId,
    taskType: TaskType.QUIZ,
    aiProfile: input.aiProfile ?? AIProfile.BALANCED,
    userQuery: input.userQuery,
    documentIds: input.documentIds,
  });

  const parsed = JSON.parse(result.generatedOutput);

  const quiz = await Quiz.create({
    userId,
    workspaceId,
    title: input.title ?? parsed.title ?? `Quiz — ${input.userQuery.slice(0, 50)}`,
    questions: parsed.questions,
    documentIds: input.documentIds,
  });

  return quiz;
}

export async function getWorkspaceQuizzes(
  workspaceId: string,
  userId: string
): Promise<IQuiz[]> {
  return Quiz.find({ workspaceId, userId }).sort({ createdAt: -1 });
}

export async function getQuizById(
  quizId: string,
  userId: string
): Promise<IQuiz> {
  const quiz = await Quiz.findOne({ _id: quizId, userId });
  if (!quiz) throw new AppError('Quiz not found', 404);
  return quiz;
}

export async function deleteQuiz(
  quizId: string,
  userId: string
): Promise<void> {
  const quiz = await Quiz.findOne({ _id: quizId, userId });
  if (!quiz) throw new AppError('Quiz not found', 404);
  await quiz.deleteOne();
}


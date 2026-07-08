import Flashcard from './flashCardModel';
import { AppError } from '../../middlewares/errorMiddleware';
import { IFlashcard, AIProfile, TaskType } from '../../types';
import { runOrchestrator } from '../../ai/orchestrator/graph';

export async function generateFlashcards(
  userId: string,
  workspaceId: string,
  input: {
    title?: string;
    userQuery: string;
    documentIds: string[];
    aiProfile?: AIProfile;
  }
): Promise<IFlashcard> {
  const result = await runOrchestrator({
    userId,
    workspaceId,
    taskType: TaskType.FLASHCARD,
    aiProfile: input.aiProfile ?? AIProfile.BALANCED,
    userQuery: input.userQuery,
    documentIds: input.documentIds,
  });

const parsed = JSON.parse(result.generatedOutput);

  const flashcard = await Flashcard.create({
    userId,
    workspaceId,
    title: input.title ?? parsed.title ?? `Flashcards — ${input.userQuery.slice(0, 50)}`,
    cards: parsed.cards,
    documentIds: input.documentIds,
  });

  return flashcard;
}

//get workspaceflash card
export async function getWorkspaceFlashcards(
  workspaceId: string,
  userId: string
): Promise<IFlashcard[]> {
  return Flashcard.find({ workspaceId, userId }).sort({ createdAt: -1 });
}

//by id 
export async function getFlashcardById(
  flashcardId: string,
  userId: string
): Promise<IFlashcard> {
  const flashcard = await Flashcard.findOne({ _id: flashcardId, userId });
  if (!flashcard) throw new AppError('Flashcard not found', 404);
  return flashcard;
}

//delete flashcard
export async function deleteFlashcard(
  flashcardId: string,
  userId: string
): Promise<void> {
  const flashcard = await Flashcard.findOne({ _id: flashcardId, userId });
  if (!flashcard) throw new AppError('Flashcard not found', 404);
  await flashcard.deleteOne();
}

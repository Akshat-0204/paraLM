import Note from './notesModel';
import { AppError } from '../../middlewares/errorMiddleware';
import { INote, AIProfile, TaskType } from '../../types';
import { runOrchestrator } from '../../ai/orchestrator/graph';

//manual note 
export async function createNote(
  userId: string,
  workspaceId: string,
  input: {
    title: string;
    content?: string;
    documentIds?: string[];
  }
): Promise<INote> {
  const note = await Note.create({
    userId,
    workspaceId,
    title: input.title,
    content: input.content ?? '',
    documentIds: input.documentIds ?? [],
    aiGenerated: false,
  });

  return note;
}

//generate note with AI 

export async function generateNote(
  userId: string,
  workspaceId: string,
  input: {
    userQuery: string;
    documentIds: string[];
    aiProfile?: AIProfile;
  }
): Promise<INote> {
  const result = await runOrchestrator({
    userId,
    workspaceId,
    taskType: TaskType.NOTES,
    aiProfile: input.aiProfile ?? AIProfile.BALANCED,
    userQuery: input.userQuery,
    documentIds: input.documentIds,
  });

  const note = await Note.create({
    userId,
    workspaceId,
    title: `Notes — ${input.userQuery.slice(0, 60)}`,
    content: result.generatedOutput,
    documentIds: input.documentIds,
    aiGenerated: true,
  });

  return note;
}

//get notes from workspace 
export async function getWorkspaceNotes(
  workspaceId: string,
  userId: string
): Promise<INote[]> {
  const notes = await Note.find({ workspaceId, userId }).sort({
    createdAt: -1,
  });

  return notes;
}

//get single note
export async function getNoteById(
  noteId: string,
  userId: string
): Promise<INote> {
  const note = await Note.findOne({ _id: noteId, userId });

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  return note;
}

//update note
export async function updateNote(
  noteId: string,
  userId: string,
  updates: { title?: string; content?: string }
): Promise<INote> {
  const note = await Note.findOneAndUpdate(
    { _id: noteId, userId },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  return note;
}

//delete note
export async function deleteNote(
  noteId: string,
  userId: string
): Promise<void> {
  const note = await Note.findOne({ _id: noteId, userId });

  if (!note) {
    throw new AppError('Note not found', 404);
  }

  await note.deleteOne();
}

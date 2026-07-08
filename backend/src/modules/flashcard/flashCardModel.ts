import mongoose, { Schema } from 'mongoose';
import { IFlashcard, CardDifficulty } from '../../types';

const flashcardSchema = new Schema<IFlashcard>(
  {
    workspaceId: {
      type: String,
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    cards: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        difficulty: {
          type: String,
          enum: Object.values(CardDifficulty),
          default: CardDifficulty.MEDIUM,
        },
      },
    ],
    documentIds: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

flashcardSchema.index({ workspaceId: 1, createdAt: -1 });

flashcardSchema.set('toJSON', {
  transform: (_doc, ret : any) => {
    delete ret.__v;
    return ret;
  },
});

const Flashcard = mongoose.model<IFlashcard>('Flashcard', flashcardSchema);
export default Flashcard;
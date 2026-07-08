import mongoose, { Schema } from 'mongoose';
import { IQuiz } from '../../types';

const quizSchema = new Schema<IQuiz>(
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
    questions: [
      {
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswer: { type: Number, required: true },
        explanation: { type: String, required: true },
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

quizSchema.index({ workspaceId: 1, createdAt: -1 });
quizSchema.index({ userId: 1, createdAt: -1 });

quizSchema.set('toJSON', {
  transform: (_doc, ret : any) => {
    delete ret.__v;
    return ret;
  },
});

const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);
export default Quiz;

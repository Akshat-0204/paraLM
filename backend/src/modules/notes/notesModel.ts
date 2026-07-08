import mongoose, { Schema } from 'mongoose';
import { INote } from '../../types';

const noteSchema = new Schema<INote>(
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
    content: {
      type: String,
      default: '',
    },
    documentIds: {
      type: [String],
      default: [],
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ workspaceId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, createdAt: -1 });

noteSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

const Note = mongoose.model<INote>('Note', noteSchema);
export default Note;
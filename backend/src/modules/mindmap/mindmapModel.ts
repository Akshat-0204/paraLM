import mongoose, { Schema } from 'mongoose';
import { IMindMap } from '../../types';

const mindMapSchema = new Schema<IMindMap>(
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
    nodes: [
      {
        id: { type: String, required: true },
        label: { type: String, required: true },
        type: { type: String, required: true },
        position: {
          x: { type: Number, default: 0 },
          y: { type: Number, default: 0 },
        },
        description: { type: String },
      },
    ],
    edges: [
      {
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        label: { type: String },
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

mindMapSchema.index({ workspaceId: 1, createdAt: -1 });
mindMapSchema.index({ userId: 1, createdAt: -1 });

mindMapSchema.set('toJSON', {
  transform: (_doc, ret : any) => {
    delete ret.__v;
    return ret;
  },
});

const MindMap = mongoose.model<IMindMap>('MindMap', mindMapSchema);
export default MindMap;
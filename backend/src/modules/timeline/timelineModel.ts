import mongoose, { Schema } from 'mongoose';
import { ITimeline, EventImportance } from '../../types';

const timelineSchema = new Schema<ITimeline>(
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
    events: [
      {
        date: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        importance: {
          type: String,
          enum: Object.values(EventImportance),
          default: EventImportance.MEDIUM,
        },
        category: { type: String },
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

timelineSchema.index({ workspaceId: 1, createdAt: -1 });
timelineSchema.index({ userId: 1, createdAt: -1 });

timelineSchema.set('toJSON', {
  transform: (_doc, ret : any) => {
    delete ret.__v;
    return ret;
  },
});

const Timeline = mongoose.model<ITimeline>('Timeline', timelineSchema);
export default Timeline;
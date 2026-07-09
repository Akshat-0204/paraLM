import mongoose, { Schema } from 'mongoose';
import { IAnalytics, TaskType, AIProfile, UserFeedback } from '../../types';

const analyticsSchema = new Schema<IAnalytics>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    workspaceId: {
      type: String,
      required: [true, 'Workspace ID is required'],
      index: true,
    },
    chatId: {
      type: String,
      default: null,
    },
    taskType: {
      type: String,
      enum: Object.values(TaskType),
      required: [true, 'Task type is required'],
    },
    aiProfile: {
      type: String,
      enum: Object.values(AIProfile),
      required: [true, 'AI profile is required'],
    },
    modelUsed: {
      type: String,
      required: [true, 'Model used is required'],
    },
    totalLatency: {
      type: Number,
      default: 0,
    },
    retrievalTime: {
      type: Number,
      default: 0,
    },
    generationTime: {
      type: Number,
      default: 0,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    chunksRetrieved: {
      type: Number,
      default: 0,
    },
    chunksUsed: {
      type: Number,
      default: 0,
    },
    confidenceScore: {
      type: Number,
      default: 0,
    },
    reflectionScore: {
      type: Number,
      default: 0,
    },
    userFeedback: {
      type: String,
      enum: Object.values(UserFeedback),
      default: null,
    },
    failed: {
      type: Boolean,
      default: false,
    },
    retries: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

analyticsSchema.index({ userId: 1, createdAt: -1 });
analyticsSchema.index({ workspaceId: 1, createdAt: -1 });
analyticsSchema.index({ taskType: 1, createdAt: -1 });

analyticsSchema.set('toJSON', {
  transform: (_doc, ret : any) => {
    delete ret.__v;
    return ret;
  },
});

const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);
export default Analytics;
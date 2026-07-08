import mongoose, { Schema } from 'mongoose';
import { IChat, AIProfile } from '../../types';

const chatSchema = new Schema<IChat>(
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
      required: [true, 'Chat title is required'],
      trim: true,
      maxlength: 200,
      default: 'New Chat',
    },
    aiProfile: {
      type: String,
      enum: Object.values(AIProfile),
      default: AIProfile.BALANCED,
    },
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ workspaceId: 1, createdAt: -1 });
chatSchema.index({ userId: 1, createdAt: -1 });

chatSchema.set('toJSON', {
  transform: (_doc, ret : any) => {
    delete ret.__v;
    return ret;
  },
});

const Chat = mongoose.model<IChat>('Chat', chatSchema);
export default Chat;
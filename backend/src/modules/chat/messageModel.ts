import mongoose, { Schema } from 'mongoose';
import { IMessage, MessageRole } from '../../types';

const messageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: String,
      required: [true, 'Chat ID is required'],
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(MessageRole),
      required: [true, 'Role is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    sources: [
      {
        documentId: { type: String },
        documentName: { type: String },
        chunkIndex: { type: Number },
        relevanceScore: { type: Number },
        excerpt: { type: String },
      },
    ],
    aiRun: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chatId: 1, createdAt: 1 });

messageSchema.set('toJSON', {
  transform: (_doc, ret : any) => {
    delete ret.__v;
    return ret;
  },
});

const Message = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
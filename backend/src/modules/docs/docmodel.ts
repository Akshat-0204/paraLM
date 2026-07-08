import mongoose, { Schema } from 'mongoose';
import { IDocument, FileType, ProcessingStatus, EmbeddingStatus } from '../../types';

const documentSchema = new Schema<IDocument>(
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
    originalName: {
      type: String,
      required: [true, 'Original filename is required'],
      trim: true,
    },
    publicId: {
      type: String,
      required: [true, 'Cloudinary public ID is required'],
      unique: true,
    },
    secureUrl: {
      type: String,
      required: [true, 'Secure URL is required'],
    },
    fileType: {
      type: String,
      enum: Object.values(FileType),
      required: [true, 'File type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    processingStatus: {
      type: String,
      enum: Object.values(ProcessingStatus),
      default: ProcessingStatus.PENDING,
      index: true,
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    embeddingStatus: {
      type: String,
      enum: Object.values(EmbeddingStatus),
      default: EmbeddingStatus.PENDING,
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

//indexes

documentSchema.index({ workspaceId: 1, createdAt: -1 });
documentSchema.index({ workspaceId: 1, fileType: 1 });
documentSchema.index({ userId: 1, createdAt: -1 });

//clean o/p

documentSchema.set('toJSON', {
  transform: (_doc, ret : any) => {
    delete ret.__v;
    return ret;
  },
});

const Document = mongoose.model<IDocument>('Document', documentSchema);
export default Document;
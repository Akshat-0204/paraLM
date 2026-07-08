
import { AppError } from "../../middlewares/errorMiddleware";
import Document from './docmodel';
import { EmbeddingStatus, FileType, IDocument, ProcessingStatus} from "../../types";

import { cloudinary } from "../../config/cloudinary";
import { decrementDocCount, incrementDocCount } from "../workspace/workspaceService";

//allowed mime types 
const MIME_TO_FILETYPE: Record<string, FileType> = {
    'application/pdf': FileType.PDF,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileType.DOCX,
  'text/markdown': FileType.MD,
  'text/plain': FileType.TXT,
  'text/html': FileType.HTML,
}

const MAX_FILE_SIZE = 20 * 1024 * 1024;

//upload doc 
export async function uploadDocument(userId: string,
  workspaceId: string,
  file: Express.Multer.File
): Promise<IDocument>{

    //check file size 
    if(file.size > MAX_FILE_SIZE){
        throw new AppError("File exceeds limit", 400);

    }

    const fileType = MIME_TO_FILETYPE[file.mimetype];
    if(!fileType){
        throw new AppError("Unsupported file type", 400);
    }

    const uploadResult = await new Promise<{
        public_id : string ;
        secure_url : string;
    }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            resource_type : 'raw',
            folder : `paraLM/${workspaceId}`,
            use_filename : true,
            unique_filename : true
        }, (error, result) => {
            if(error || result ) return reject(error);
            resolve(result);
        })
        uploadStream.end(file.buffer);
    });


    const document = await Document.create({
        workspaceId,
    userId,
    originalName: file.originalname,
    publicId: uploadResult.public_id,
    secureUrl: uploadResult.secure_url,
    fileType,
    fileSize: file.size,
    processingStatus: ProcessingStatus.PENDING,
    embeddingStatus: EmbeddingStatus.PENDING,
    });

    await incrementDocCount(workspaceId);
     //now trigger async pipeline 
    processDocPipeline(document, file.buffer).catch((err)=> {
        console.log(`Pipeline failing for doc ${document._id}`, err);


    })

   return document;
}

//async processing pipeline 
async function processDocPipeline(
    document: IDocument,
  fileBuffer: Buffer
): Promise<void>{
    try {
        await Document.findByIdAndUpdate(document._id, {
            processingStatus : ProcessingStatus.PROCESSING,
            embeddingStatus : EmbeddingStatus.PROCESSING
        });

        //chunking
        const chunks = await processDocument(
            fileBuffer, 
            document.fileType as FileType,
            document.originalName,
            document._id.toString(),
            document.workspaceId
        );

        //embed karke chromaDb me stroe 
        await embedAndStoreChunks(chunks, document.workspaceId);

        //update status 
        await Document.findByIdAndUpdate(document._id, {
                processingStatus: ProcessingStatus.COMPLETED,
      embeddingStatus: EmbeddingStatus.COMPLETED,
      chunkCount: chunks.length,
        });

        console.log(`Doc ${document.originalName} processed `);

    } catch (error) {
        await Document.findByIdAndUpdate(document._id,{
            processingStatus: ProcessingStatus.FAILED,
      embeddingStatus: EmbeddingStatus.FAILED,

        });

        console.error("Doc processing failed", error)
    }
}

//getting doc by workspace 
export async function getWorkspaceDocuments(
  workspaceId: string,
  userId: string
): Promise<IDocument[]> {
  const documents = await Document.find({
    workspaceId,
    userId,
  }).sort({ createdAt: -1 });

  return documents;
}


//get a single doc 
export async function getDocumentById(
  documentId: string,
  userId: string
): Promise<IDocument> {
  const document = await Document.findOne({
    _id: documentId,
    userId,
  });

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  return document;
}

//delete doc
export async function deleteDocument(documentId : string , 
    userId : string 
): Promise<void>{
    const document = await Document.findOne({
        _id : documentId,
        userId 
    });

    if (!document) {
    throw new AppError('Document not found', 404);
  }

  //delete from cloudinary
  await cloudinary.uploader.destroy(document.publicId , {
    resource_type : 'raw',
  });

  await decrementDocCount(document.workspaceId);

  //delete from mongo 
  await document.deleteOne();
}

// get processing status 
export async function getDocumentStatus(
  documentId: string,
  userId: string
): Promise<{
  processingStatus: ProcessingStatus;
  embeddingStatus: EmbeddingStatus;
  chunkCount: number;
}> {
  const document = await Document.findOne(
    { _id: documentId, userId },
    { processingStatus: 1, embeddingStatus: 1, chunkCount: 1 }
  );

  if (!document) {
    throw new AppError('Document not found', 404);
  }

  return {
    processingStatus: document.processingStatus,
    embeddingStatus: document.embeddingStatus,
    chunkCount: document.chunkCount,
  };
}
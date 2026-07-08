import {pipeline} from '@xenova/transformers'
import { getOrCreateCollection } from '../../config/chroma'

import { DocumentChunk } from './chunker'
import {v4 as uuidv4} from 'uuid'

//loading model once and using it for all the embedding calls 

let embeddingPipeline: Awaited<ReturnType<typeof pipeline>> | null = null;

async function getEmbeddingPipeline(): Promise<Awaited<ReturnType<typeof pipeline>>> {
  if (!embeddingPipeline) {
    const modelName = process.env.EMBEDDING_MODEL || 'Xenova/bge-base-en-v1.5';
    console.log(`🔄 Loading embedding model: ${modelName}`);
    embeddingPipeline = await pipeline('feature-extraction', modelName);
    console.log(`✅ Embedding model loaded: ${modelName}`);
  }
  return embeddingPipeline;
}


//create embeddings for a single text 

export async function generateEmbedding(text : string) : Promise<number[]>{
    const pipe = await getEmbeddingPipeline();

    const output = await pipe(text, {
            pooling: 'mean',
            normalize : true,
    

    });

  const tensor = output as any;
  return Array.from(tensor.data as Float32Array);
}

//generating embeddings in batches 
async function generateEmbeddingsBatch(texts : string[]) : Promise<number[][]>{
  const batchSize = Number(process.env.EMBEDDING_BATCH_SIZE) || 32;

  const allEmbeddings: number[][] = [];

  for(let i = 0 ; i < texts.length; i++){
    const batch = texts.slice(i, i + batchSize);

console.log(
      ` Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        texts.length / batchSize
      )}`
    );

    const batchEmbeddings = await Promise.all(
      batch.map((text) => generateEmbedding(text))
    );

    allEmbeddings.push(...batchEmbeddings);
  }

  return allEmbeddings;
}


//embed and store 
export async function embedAndStoreChunks(
  chunks: DocumentChunk[],
  workspaceId : string 
) : Promise<void> {
  if(chunks.length === 0){
    console.warn("No chunks to embed");
    return ;

  }

  const collection = await getOrCreateCollection(workspaceId);
  const texts = chunks.map((chunk) => chunk.content);
  const embeddings = await generateEmbeddingsBatch(texts);

  const ids = chunks.map(() => uuidv4());

  const metadatas = chunks.map((chunk) => ({
    documentId: chunk.documentId,
        documentName: chunk.documentName,
    workspaceId: chunk.workspaceId,
    chunkIndex: chunk.chunkIndex,
    fileType: chunk.metadata.fileType,
    wordCount: chunk.metadata.wordCount,
    characterCount: chunk.metadata.characterCount,


  }));

  await collection.upsert({
    ids, 
    embeddings,
    documents : texts,
    metadatas
  });

  console.log(`Stored ${chunks.length} embeddings in workspace collection: ${workspaceId}`);
}

//delete embeddings for a doc
export async function deleteDocumentEmbeddings(
  documentId: string,
  workspaceId: string
): Promise<void> {
  try {
    const collection = await getOrCreateCollection(workspaceId);

    const results = await collection.get({
      where: { documentId },
    });

    if (results.ids.length === 0) {
      console.warn(`No embeddings found for document ${documentId}`);
      return;
    }

    await collection.delete({ ids: results.ids });

    console.log(
      `🗑️  Deleted ${results.ids.length} embeddings for document ${documentId}`
    );
  } catch (error) {
    console.error(
      `Failed to delete embeddings for document ${documentId}:`,
      error
    );
  }
}
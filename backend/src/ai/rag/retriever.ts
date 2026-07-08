import { getOrCreateCollection } from '../../config/chroma';
import { generateEmbedding } from './embeder';
import { RetrievedChunk } from '../../types';

// ─── Retrieval config per AI profile ─────────────────────────────────────────

const PROFILE_RETRIEVAL_CONFIG = {
  fast: { topK: 3, scoreThreshold: 0.5 },
  balanced: { topK: 5, scoreThreshold: 0.45 },
  research: { topK: 8, scoreThreshold: 0.4 },
  deep_think: { topK: 12, scoreThreshold: 0.35 },
};

// ─── Semantic Retrieval ───────────────────────────────────────────────────────

export async function semanticRetrieval(
  query: string,
  workspaceId: string,
  aiProfile: keyof typeof PROFILE_RETRIEVAL_CONFIG = 'balanced',
  documentIds?: string[]
): Promise<RetrievedChunk[]> {
  const collection = await getOrCreateCollection(workspaceId);
  const { topK, scoreThreshold } = PROFILE_RETRIEVAL_CONFIG[aiProfile];

  const queryEmbedding = await generateEmbedding(query);

  // Build query — conditionally add where only when needed
  // This satisfies exactOptionalPropertyTypes without type gymnastics
  const results = await (documentIds && documentIds.length > 0
    ? collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        where: { documentId: { $in: documentIds } } as any,
        include: ['documents', 'metadatas', 'distances'] as any,
      })
    : collection.query({
        queryEmbeddings: [queryEmbedding],
        nResults: topK,
        include: ['documents', 'metadatas', 'distances'] as any,
      }));

  const docs = results.documents[0];

  if (!docs || docs.length === 0 ) {
    return [];
  }

  const metadatas = results.metadatas[0];
  const distances = results.distances?.[0];

 if (!metadatas) return [];

  const chunks: RetrievedChunk[] = [];

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const metadata = metadatas[i] as Record<string, unknown>;
    const distance = distances != null ? (distances[i] ?? 1) : 1;
    const score = 1 / (1 + distance);

    if (score < scoreThreshold) continue;
    if (!doc) continue;
    if (!metadata) continue;

    chunks.push({
      documentId: metadata.documentId as string,
      documentName: metadata.documentName as string,
      chunkIndex: metadata.chunkIndex as number,
      content: doc,
      score,
      metadata,
    });
  }

  return chunks;
}

// ─── Keyword Retrieval ────────────────────────────────────────────────────────

export async function keywordRetrieval(
  keywords: string[],
  workspaceId: string,
  topK: number = 5,
  documentIds?: string[]
): Promise<RetrievedChunk[]> {
  const collection = await getOrCreateCollection(workspaceId);
  const allResults: RetrievedChunk[] = [];

  for (const keyword of keywords.slice(0, 3)) {
    try {
      // Conditionally add where only when needed
      const results = await (documentIds && documentIds.length > 0
        ? collection.get({
            whereDocument: { $contains: keyword },
            where: { documentId: { $in: documentIds } } as any,
            limit: topK,
            include: ['documents', 'metadatas'] as any,
          })
        : collection.get({
            whereDocument: { $contains: keyword },
            limit: topK,
            include: ['documents', 'metadatas'] as any,
          }));

      const docs = results.documents;
      const metadatas = results.metadatas;

      if (!docs || docs.length === 0) continue;

      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        const metadata = metadatas[i] as Record<string, unknown> | null;

        if (!doc) continue;
        if (!metadata) continue;

        allResults.push({
          documentId: metadata.documentId as string,
          documentName: metadata.documentName as string,
          chunkIndex: metadata.chunkIndex as number,
          content: doc,
          score: 0.5,
          metadata,
        });
      }
    } catch {
      continue;
    }
  }

  return allResults;
}

// ─── Hybrid Retrieval ─────────────────────────────────────────────────────────

export async function hybridRetrieval(
  query: string,
  keywords: string[],
  workspaceId: string,
  aiProfile: keyof typeof PROFILE_RETRIEVAL_CONFIG = 'balanced',
  documentIds?: string[]
): Promise<RetrievedChunk[]> {
  const [semanticChunks, keywordChunks] = await Promise.all([
    semanticRetrieval(query, workspaceId, aiProfile, documentIds),
    keywordRetrieval(keywords, workspaceId, 5, documentIds),
  ]);

  const seen = new Set<string>();
  const merged: RetrievedChunk[] = [];

  for (const chunk of [...semanticChunks, ...keywordChunks]) {
    const key = `${chunk.documentId}-${chunk.chunkIndex}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(chunk);
    }
  }

  merged.sort((a, b) => b.score - a.score);

  return merged;
}
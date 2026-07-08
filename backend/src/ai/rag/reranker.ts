import { CohereClient } from 'cohere-ai';
import { RetrievedChunk } from '../../types';

let cohereClient : CohereClient | null = null;

function getCohereClient(): CohereClient {
  if (!cohereClient) {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      throw new Error('COHERE_API_KEY is not defined');
    }
    cohereClient = new CohereClient({ token: apiKey });
  }
  return cohereClient;
}

//rerank
export async function rerankChunks(
  chunks: RetrievedChunk[],
  query: string,
  topK: number = 5
): Promise<RetrievedChunk[]> {
    if(chunks.length === 0) return [];

    if(chunks.length === 1) return chunks;

    try{

        const cohere = getCohereClient();

        const documents = chunks.map((chunk) => chunk.content);

        const response = await cohere.rerank({
            model: 'rerank-english-v3.0',
             query,
             documents,
            topN: Math.min(topK, chunks.length),
        });

        //reranked results back to Retrieved Chunk
        const reranked : RetrievedChunk[] = response.results.map((result) => ({
            ...chunks[result.index]!,
            score : result.relevanceScore,
        }));
        return reranked;
    }catch(error){
            console.error('Cohere reranking failed, falling back to original order:', error);

                return chunks
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    }

   
}

//extract keywords 
const STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
  'in', 'with', 'to', 'of', 'for', 'it', 'this', 'that', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
  'might', 'shall', 'can', 'what', 'how', 'when', 'where', 'who',
  'why', 'me', 'my', 'we', 'you', 'your', 'he', 'she', 'they',
  'their', 'from', 'by', 'about', 'into', 'through', 'during',
]);

export function extractKeywords(query : string ) : string[] {
    return query.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOPWORDS.has(word))
    .slice(0, 10);

}
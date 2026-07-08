import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import { AIRunState, ISource } from '../../types';
import { GROQ_MODELS } from '../providers/groqProvider';

// ─── Tool ─────────────────────────────────────────────────────────────────────

const submitCitationsTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_citations',
    description: 'Submit the verified citations extracted from the generated output',
    schema: z.object({
      citations: z.array(
        z.object({
          documentId: z.string().describe('ID of the source document'),
          documentName: z.string().describe('Name of the source document'),
          chunkIndex: z.number().describe('Chunk index within the document'),
          relevanceScore: z.number().min(0).max(1).describe('How relevant this source is to the output'),
          excerpt: z.string().describe('Short excerpt from the source that was used'),
        })
      ).describe('List of citations for the generated output'),
      citationSummary: z.string().describe('Brief summary of sources used'),
    }),
  }
);

// ─── Worker ───────────────────────────────────────────────────────────────────

export async function runCitationWorker(
  state: AIRunState
): Promise<Partial<AIRunState>> {
  try {
    // If no chunks were retrieved there is nothing to cite
    if (state.retrievedChunks.length === 0) {
      return { citations: [] };
    }

     const apiKey = process.env.GROQ_API_KEY;

      if(!apiKey) {
        throw new Error("Groq api missing");
      }

    const model = new ChatGroq({
      apiKey: apiKey,
      model: GROQ_MODELS.LLAMA_8B,
      temperature: 0.1,
      maxTokens: 1024,
    });

    // Build source list for agent to reason about
    const sourceList = state.retrievedChunks
      .map(
        (chunk, index) =>
          `[${index}] Document: ${chunk.documentName} | ID: ${chunk.documentId} | Chunk: ${chunk.chunkIndex} | Score: ${chunk.score.toFixed(3)}
Excerpt: ${chunk.content.substring(0, 200)}...`
      )
      .join('\n\n');

    const agent = createAgent({
       model,
      tools: [submitCitationsTool],
      systemPrompt: `You are a citation agent inside Arcana AI Research Workspace.
Your job is to identify which source chunks were actually used in the generated output and produce accurate citations.

Rules:
- Only cite sources whose content is reflected in the generated output
- Assign higher relevance scores to sources that contributed more to the output
- Extract a short meaningful excerpt from each cited source
- Do not cite sources that were not used in generating the output
Always call submit_citations. Never respond with plain text.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: `Identify citations and call submit_citations:

Generated Output:
${state.generatedOutput.substring(0, 2000)}

Available Sources:
${sourceList}`,
        },
      ],
    });

    const messages = result.messages;
    const toolMessage = messages.find(
      (m: any) => m.constructor.name === 'ToolMessage'
    );

    if (!toolMessage) {
      throw new Error('Citation agent did not call submit_citations');
    }

    const citationData = JSON.parse(toolMessage.content as string);

    // Map to ISource interface
    const citations: ISource[] = citationData.citations.map(
      (c: {
        documentId: string;
        documentName: string;
        chunkIndex: number;
        relevanceScore: number;
        excerpt: string;
      }) => ({
        documentId: c.documentId,
        documentName: c.documentName,
        chunkIndex: c.chunkIndex,
        relevanceScore: c.relevanceScore,
        excerpt: c.excerpt,
      })
    );

    console.log(`📚 Citation worker complete: ${citations.length} citations`);

    return {
      citations,
    };
  } catch (error) {
    console.error('Citation worker failed:', error);
    return {
      citations: [],
    };
  }
}
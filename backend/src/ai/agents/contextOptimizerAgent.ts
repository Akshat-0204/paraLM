import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import { AIRunState, RetrievedChunk } from '../../types';
import { GROQ_MODELS } from '../providers/groqProvider';
import { getMaxTokensFromState } from './modelRouter';

// ─── Token estimation 

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// tool

const submitContextTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_context',
    description: 'Submit the selected and ordered chunk indices to build the final context window',
    schema: z.object({
      selectedIndices: z.array(z.number()).describe('Indices of chunks to include, in priority order'),
      contextSummary: z.string().describe('Brief summary of what the selected context covers'),
      coverageScore: z.number().min(0).max(1).describe('How well the context covers the user query, 0 to 1'),
    }),
  }
);

// Worker 

export async function runContextOptimizerWorker(
  state: AIRunState
): Promise<Partial<AIRunState>> {
  try {
    const chunks = state.retrievedChunks;

    if (chunks.length === 0) {
      console.warn('Context optimizer: no chunks to optimize');
      return { optimizedContext: '' };
    }

    // Step 1: Calculate token budget
    // Reserve half of max tokens for generation, use other half for context
    const maxTokens = getMaxTokensFromState(state);
    const contextTokenBudget = Math.floor(maxTokens * 0.6);

    // Step 2: Build chunk summary for agent to reason about
    const chunkSummaries = chunks
      .map((chunk, index) => {
        return `[${index}] Score: ${chunk.score.toFixed(3)} | Doc: ${chunk.documentName} | Preview: ${chunk.content.substring(0, 150)}...`;
      })
      .join('\n');

      const apiKey = process.env.GROQ_API_KEY;

      if(!apiKey) {
        throw new Error("Groq api missing");
      }

    // Step 3: Use agent to intelligently select and order chunks
    const model = new ChatGroq({
      apiKey: apiKey,
      model: GROQ_MODELS.LLAMA_8B,
      temperature: 0.1,
      maxTokens: 512,
    });

    const agent = createAgent({
     model,
      tools: [submitContextTool],
      systemPrompt: `You are a context optimization agent inside Arcana AI Research Workspace.
Your job is to select and order the most relevant chunks to build an optimal context window.
Prioritize chunks with higher scores and better coverage of the user query.
Avoid selecting redundant chunks that cover the same information.
Always call submit_context. Never respond with plain text.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: `Select the best chunks and call submit_context:
User Query: ${state.userQuery}
Token Budget: ${contextTokenBudget} tokens
Available Chunks:
${chunkSummaries}`,
        },
      ],
    });

    const messages = result.messages;
    const toolMessage = messages.find(
      (m: any) => m.constructor.name === 'ToolMessage'
    );

    let selectedChunks: RetrievedChunk[] = chunks;

    if (toolMessage) {
      const parsed = JSON.parse(toolMessage.content as string);
      const indices: number[] = parsed.selectedIndices ?? [];

      // Filter to valid indices
      const validIndices = indices.filter(
        (i) => i >= 0 && i < chunks.length
      );

      

      if (validIndices.length > 0) {
        selectedChunks = validIndices.map((i) => chunks[i]!);
      }

      console.log(
        `Context Optimizer → selected ${selectedChunks.length}/${chunks.length} chunks | coverage: ${parsed.coverageScore}`
      );
    }

    // Step 4: Build context string respecting token budget
    const contextParts: string[] = [];
    let usedTokens = 0;

    for (const chunk of selectedChunks) {
      const chunkText = `[Source: ${chunk.documentName}]\n${chunk.content}`;
      const chunkTokens = estimateTokens(chunkText);

      if (usedTokens + chunkTokens > contextTokenBudget) break;

      contextParts.push(chunkText);
      usedTokens += chunkTokens;
    }

    const optimizedContext = contextParts.join('\n\n---\n\n');

    console.log(
      ` Context built: ${contextParts.length} chunks | ~${usedTokens} tokens`
    );

    return {
      optimizedContext,
      retrievedChunks: selectedChunks,
    };
  } catch (error) {
    console.error('Context optimizer worker failed:', error);

    // Fallback: just concatenate all chunks within a safe limit
    const fallbackContext = state.retrievedChunks
      .slice(0, 5)
      .map((c) => `[Source: ${c.documentName}]\n${c.content}`)
      .join('\n\n---\n\n');

    return { optimizedContext: fallbackContext };
  }
}


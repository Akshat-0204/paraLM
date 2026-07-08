import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import { AIRunState } from '../../types';
import {
  getSelectedModelFromState,
  getTemperatureFromState,
  getMaxTokensFromState,
} from './modelRouter';

// ─── Tool ─────────────────────────────────────────────────────────────────────

const submitSummaryTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_summary',
    description: 'Submit the final structured summary of the documents',
    schema: z.object({
      title: z.string().describe('Title of the summary'),
      overview: z.string().describe('High-level overview paragraph'),
      keyPoints: z.array(z.string()).describe('List of key points extracted'),
      mainThemes: z.array(z.string()).describe('Main themes identified in the content'),
      conclusion: z.string().describe('Concluding paragraph'),
    }),
  }
);

// ─── Worker ───────────────────────────────────────────────────────────────────

export async function runSummarizationWorker(
  state: AIRunState
): Promise<Partial<AIRunState>> {
  try {
    const selectedModel = getSelectedModelFromState(state) as any;
    const temperature = getTemperatureFromState(state);
    const maxTokens = getMaxTokensFromState(state);


     const apiKey = process.env.GROQ_API_KEY;

        if(!apiKey){
            throw new Error("Groq api key missing")
        }

    const model = new ChatGroq({
      apiKey: apiKey,
      model: selectedModel,
      temperature,
      maxTokens,
    });

    const agent = createAgent({
      model,
      tools: [submitSummaryTool],
      systemPrompt: `You are a summarization agent inside Arcana AI Research Workspace.
Your job is to produce a comprehensive, accurate summary based on the provided context.
Only use information from the provided context. Do not hallucinate.
Always call submit_summary with your final structured summary.
Never respond with plain text.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: `Summarize the following content and call submit_summary:
User Request: ${state.userQuery}

CONTEXT:
${state.optimizedContext}`,
        },
      ],
    });

    const messages = result.messages;
    const toolMessage = messages.find(
      (m: any) => m.constructor.name === 'ToolMessage'
    );

    if (!toolMessage) {
      throw new Error('Summarization agent did not call submit_summary');
    }

    const summary = JSON.parse(toolMessage.content as string);

    const formattedOutput = `# ${summary.title}

## Overview
${summary.overview}

## Key Points
${summary.keyPoints.map((p: string) => `- ${p}`).join('\n')}

## Main Themes
${summary.mainThemes.map((t: string) => `- ${t}`).join('\n')}

## Conclusion
${summary.conclusion}`;

    console.log(`📄 Summarization complete`);

    return {
      generatedOutput: formattedOutput,
    };
  } catch (error) {
    console.error('Summarization worker failed:', error);
    return {
      generatedOutput: 'Summarization failed. Please try again.',
    };
  }
}
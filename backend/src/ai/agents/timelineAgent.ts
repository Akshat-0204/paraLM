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

const submitTimelineTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_timeline',
    description: 'Submit the generated timeline of events extracted from the documents',
    schema: z.object({
      title: z.string().describe('Title of the timeline'),
      description: z.string().describe('Brief description of what the timeline covers'),
      events: z.array(
        z.object({
          date: z.string().describe('Date or time period of the event'),
          title: z.string().describe('Short title of the event'),
          description: z.string().describe('Detailed description of the event'),
          importance: z.enum(['low', 'medium', 'high']).describe('Importance level of the event'),
          category: z.string().optional().describe('Optional category or tag for the event'),
        })
      ).describe('Chronologically ordered list of events'),
    }),
  }
);

// Worker 

export async function runTimelineWorker(
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
      tools: [submitTimelineTool],
      systemPrompt: `You are a timeline extraction agent inside Arcana AI Research Workspace.
Your job is to identify and extract all chronological events, dates, and sequences from the provided context.
Order events chronologically from earliest to latest.
If exact dates are not available use approximate periods like "Early 2020s" or "Mid 19th Century".
Mark high importance for events that were turning points or had major impact.
Only use information from the provided context. Do not hallucinate dates or events.
Always call submit_timeline. Never respond with plain text.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: `Extract a chronological timeline and call submit_timeline:
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
      throw new Error('Timeline agent did not call submit_timeline');
    }

    const timelineData = JSON.parse(toolMessage.content as string);

    console.log(
      `📅 Timeline generation complete: ${timelineData.events.length} events`
    );

    return {
      generatedOutput: JSON.stringify(timelineData),
    };
  } catch (error) {
    console.error('Timeline worker failed:', error);
    return {
      generatedOutput: JSON.stringify({ title: 'Error', events: [] }),
    };
  }
}
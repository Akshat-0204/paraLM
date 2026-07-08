import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import { AIRunState } from '../../types';
import {
  getSelectedModelFromState,
  getTemperatureFromState,
  getMaxTokensFromState,
} from './modelRouter';

//tool

const submitFlashcardsTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_flashcards',
    description: 'Submit the generated flashcards',
    schema: z.object({
      title: z.string().describe('Title for this flashcard set'),
      cards: z.array(
        z.object({
          question: z.string().describe('The flashcard question'),
          answer: z.string().describe('The flashcard answer'),
          difficulty: z.enum(['easy', 'medium', 'hard']).describe('Difficulty level'),
          hint: z.string().optional().describe('Optional hint for the question'),
        })
      ).describe('List of flashcards'),
    }),
  }
);

// Worker 

export async function runFlashcardWorker(
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
      tools: [submitFlashcardsTool],
      systemPrompt: `You are a flashcard generation agent inside Arcana AI Research Workspace.
Your job is to create high-quality flashcards that test understanding of key concepts.
Generate a mix of easy, medium, and hard cards.
Questions should test comprehension not just recall.
Only use information from the provided context. Do not hallucinate.
Always call submit_flashcards. Never respond with plain text.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: `Generate flashcards and call submit_flashcards:
User Request: ${state.userQuery}
Generate at least 10 flashcards.

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
      throw new Error('Flashcard agent did not call submit_flashcards');
    }

    const flashcardData = JSON.parse(toolMessage.content as string);

    console.log(
      `🃏 Flashcard generation complete: ${flashcardData.cards.length} cards`
    );

    return {
      generatedOutput: JSON.stringify(flashcardData),
    };
  } catch (error) {
    console.error('Flashcard worker failed:', error);
    return {
      generatedOutput: JSON.stringify({ title: 'Error', cards: [] }),
    };
  }
}
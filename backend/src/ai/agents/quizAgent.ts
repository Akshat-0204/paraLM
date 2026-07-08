import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import { AIRunState } from '../../types';
import {
  getSelectedModelFromState,
  getTemperatureFromState,
  getMaxTokensFromState,
} from './modelRouter';

// Tool 

const submitQuizTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_quiz',
    description: 'Submit the generated quiz with multiple choice questions',
    schema: z.object({
      title: z.string().describe('Title of the quiz'),
      description: z.string().describe('Brief description of what the quiz covers'),
      questions: z.array(
        z.object({
          question: z.string().describe('The quiz question'),
          options: z.array(z.string()).length(4).describe('Exactly 4 answer options'),
          correctAnswer: z.number().min(0).max(3).describe('Index of the correct answer (0-3)'),
          explanation: z.string().describe('Explanation of why the answer is correct'),
          difficulty: z.enum(['easy', 'medium', 'hard']),
        })
      ).describe('List of quiz questions'),
    }),
  }
);

// Worker 

export async function runQuizWorker(
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
      tools: [submitQuizTool],
      systemPrompt: `You are a quiz generation agent inside Arcana AI Research Workspace.
Your job is to create rigorous multiple choice questions that test deep understanding.
Each question must have exactly 4 options with only one correct answer.
Include a clear explanation for each correct answer.
Only use information from the provided context. Do not hallucinate.
Always call submit_quiz. Never respond with plain text.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: `Generate a quiz and call submit_quiz:
User Request: ${state.userQuery}
Generate at least 8 questions with a mix of difficulties.

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
      throw new Error('Quiz agent did not call submit_quiz');
    }

    const quizData = JSON.parse(toolMessage.content as string);

    console.log(
      `📋 Quiz generation complete: ${quizData.questions.length} questions`
    );

    return {
      generatedOutput: JSON.stringify(quizData),
    };
  } catch (error) {
    console.error('Quiz worker failed:', error);
    return {
      generatedOutput: JSON.stringify({ title: 'Error', questions: [] }),
    };
  }
}
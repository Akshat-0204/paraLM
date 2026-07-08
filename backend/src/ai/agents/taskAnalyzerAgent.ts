import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { AIRunState } from '../../types';
import { GROQ_MODELS } from '../providers/groqProvider';
import { ChatGroq } from '@langchain/groq';

const TaskAnalysisSchema = z.object({
  keywords: z.array(z.string()).describe('5-10 most important terms for document retrieval'),
  subQuestions: z.array(z.string()).describe('Break the main query into 2-4 sub-questions'),
  constraints: z.array(z.string()).describe('Explicit user constraints like length, format, focus area'),
  expectedOutputLength: z.enum(['short', 'medium', 'long']).describe('Expected length of response'),
  domainContext: z.string().describe('Brief description of the domain or topic'),
  isComparative: z.boolean().describe('True if user wants to compare things'),
  isTemporal: z.boolean().describe('True if query involves dates, timelines, sequences'),
  requiresExamples: z.boolean().describe('True if the response should include examples'),
});

const submitAnalysisTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_analysis',
    description: 'Submit the structured task analysis after deeply analyzing the user query',
    schema: TaskAnalysisSchema,
  }
);




export function extractKeywordsFromState(state: AIRunState): string[] {
  const keywordStep = state.plannedSteps.find((s) =>
    s.startsWith('__keywords__:')
  );
  if (!keywordStep) return [];
  return keywordStep.replace('__keywords__:', '').split(',');
}

export function extractSubQuestionsFromState(state: AIRunState): string[] {
  const subQStep = state.plannedSteps.find((s) =>
    s.startsWith('__subquestions__:')
  );
  if (!subQStep) return [];
  return subQStep.replace('__subquestions__:', '').split('|');
}

//worker functios 
export async function runTaskAnalyzerWorker(state : AIRunState): Promise<Partial<AIRunState>> {
  try {

    const apiKey = process.env.GROQ_API_KEY;

    if(!apiKey){
     throw new Error("GROQ_API_KEY is missing");
    }
    
    const model = new ChatGroq({
      apiKey: apiKey,
      model : GROQ_MODELS.LLAMA_8B,
      temperature : 0.2,
      maxTokens : 1024,

    });

    const agent = createAgent({
      model,
      tools: [submitAnalysisTool],
      systemPrompt : `You are a task analysis agent inside Arcana AI Research Workspace.
Deeply analyze the user query and call submit_analysis with structured information.
Always call submit_analysis. Never respond with plain text.`
    });

    const result = await agent.invoke({
      messages : [
        {
          role: 'user',
          content: `Analyze this query and call submit_analysis:
User Query: ${state.userQuery}
Task Type: ${state.taskType}
Planned Steps: ${state.plannedSteps.filter((s) => !s.startsWith('__')).join(', ')}`,
        },

      ]
    });

    const messages = result.messages;
    const toolMessage = messages.find(
      (m: any) => m.constructor.name === 'ToolMessage'
    );

    if(!toolMessage){
      throw new Error('task analyzer agent cannot call submit_analysis tool');
    }

    const analysis = JSON.parse(toolMessage.content as string)

    console.log(
      `Task Analyzer → keywords: ${analysis.keywords.length} | sub-questions: ${analysis.subQuestions.length} | domain: ${analysis.domainContext}`
    );

    //embeddig keywords and sub-ques into plannedSteps so retriever can read them 
    return {
       plannedSteps: [
        ...state.plannedSteps,
        `__keywords__:${analysis.keywords.join(',')}`,
        `__subquestions__:${analysis.subQuestions.join('|')}`,
      ],
    }

  } catch (error) {
     console.error('Task analyzer worker failed:', error);
    return {};
  }
}

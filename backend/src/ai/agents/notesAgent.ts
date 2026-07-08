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

const submitNotesTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_notes',
    description: 'Submit the generated structured notes',
    schema: z.object({
      title: z.string().describe('Title of the notes'),
      sections: z.array(
        z.object({
          heading: z.string().describe('Section heading'),
          content: z.string().describe('Section content in markdown'),
          bulletPoints: z.array(z.string()).describe('Key bullet points for this section'),
        })
      ).describe('Sections of the notes'),
      importantTerms: z.array(
        z.object({
          term: z.string(),
          definition: z.string(),
        })
      ).describe('Important terms and their definitions'),
      studyTips: z.array(z.string()).describe('Study tips based on the content'),
    }),
  }
);

// Worker 

export async function runNotesWorker(
  state: AIRunState
): Promise<Partial<AIRunState>> {
  try {
    const selectedModel = getSelectedModelFromState(state) as any;
    const temperature = getTemperatureFromState(state);
    const maxTokens = getMaxTokensFromState(state);

    const apiKey = process.env.GROQ_API_KEY;

      if(!apiKey) {
        throw new Error("Groq api missing");
      }

    const model = new ChatGroq({
      apiKey: apiKey,
      model: selectedModel,
      temperature,
      maxTokens,
    });

    const agent = createAgent({
       model,
      tools: [submitNotesTool],
      systemPrompt: `You are a note-taking agent inside Arcana AI Research Workspace.
Your job is to generate comprehensive, well-structured study notes from the provided context.
Organize notes logically with clear sections, bullet points, and key terms.
Only use information from the provided context. Do not hallucinate.
Always call submit_notes. Never respond with plain text.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: `Generate structured notes and call submit_notes:
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
      throw new Error('Notes agent did not call submit_notes');
    }

    const notes = JSON.parse(toolMessage.content as string);

    // Format into markdown
    const sectionsMarkdown = notes.sections
      .map(
        (s: { heading: string; content: string; bulletPoints: string[] }) => `
## ${s.heading}
${s.content}
${s.bulletPoints.map((b: string) => `- ${b}`).join('\n')}`
      )
      .join('\n\n');

    const termsMarkdown = notes.importantTerms
      .map((t: { term: string; definition: string }) => `**${t.term}**: ${t.definition}`)
      .join('\n');

    const formattedOutput = `# ${notes.title}

${sectionsMarkdown}

## Important Terms
${termsMarkdown}

## Study Tips
${notes.studyTips.map((tip: string) => `- ${tip}`).join('\n')}`;

    console.log(`📝 Notes generation complete`);

    return {
      generatedOutput: formattedOutput,
    };
  } catch (error) {
    console.error('Notes worker failed:', error);
    return {
      generatedOutput: 'Notes generation failed. Please try again.',
    };
  }
}
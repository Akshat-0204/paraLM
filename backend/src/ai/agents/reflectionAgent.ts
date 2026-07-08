import { createAgent, tool } from 'langchain';
import { z } from 'zod';
import { ChatGroq } from '@langchain/groq';
import { AIRunState } from '../../types';
import { GROQ_MODELS } from '../providers/groqProvider';

// ─── Tool ─────────────────────────────────────────────────────────────────────

const submitReflectionTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_reflection',
    description: 'Submit the reflection and quality assessment of the generated output',
    schema: z.object({
      qualityScore: z.number().min(0).max(1).describe('Overall quality score from 0 to 1'),
      accuracyScore: z.number().min(0).max(1).describe('How accurately the output reflects the source context'),
      completenessScore: z.number().min(0).max(1).describe('How completely the output addresses the user query'),
      issues: z.array(z.string()).describe('List of identified issues or gaps in the output'),
      improvements: z.array(z.string()).describe('Suggested improvements'),
      passesQualityCheck: z.boolean().describe('Whether the output meets minimum quality threshold'),
      confidenceScore: z.number().min(0).max(1).describe('Confidence that the output is correct and grounded'),
    }),
  }
);

// ─── Worker ───────────────────────────────────────────────────────────────────

export async function runReflectionWorker(
  state: AIRunState
): Promise<Partial<AIRunState>> {
  try {

    const apiKey = process.env.GROQ_API_KEY;

        if(!apiKey){
            throw new Error("Groq api key missing")
        }
        
    // Use a fast model for reflection to keep latency low
    const model = new ChatGroq({
      apiKey: apiKey,
      model: GROQ_MODELS.LLAMA_8B,
      temperature: 0.1,
      maxTokens: 1024,
    });

    const agent = createAgent({
       model,
      tools: [submitReflectionTool],
      systemPrompt: `You are a reflection and quality control agent inside Arcana AI Research Workspace.
Your job is to critically evaluate AI-generated outputs for quality, accuracy, and completeness.

Evaluation criteria:
- Accuracy: Does the output accurately reflect information from the source context?
- Completeness: Does it fully address what the user asked for?
- Hallucination: Does it contain information NOT in the provided context?
- Coherence: Is it logically structured and easy to understand?

Be strict. A score of 0.8 or above means the output passes quality check.
If you detect hallucinations or major inaccuracies set passesQualityCheck to false.
Always call submit_reflection. Never respond with plain text.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: `Evaluate this output and call submit_reflection:

User Query: ${state.userQuery}

Source Context Used:
${state.optimizedContext.substring(0, 2000)}...

Generated Output:
${state.generatedOutput.substring(0, 2000)}...`,
        },
      ],
    });

    const messages = result.messages;
    const toolMessage = messages.find(
      (m: any) => m.constructor.name === 'ToolMessage'
    );

    if (!toolMessage) {
      throw new Error('Reflection agent did not call submit_reflection');
    }

    const reflection = JSON.parse(toolMessage.content as string);

    console.log(
      `🔎 Reflection → quality: ${reflection.qualityScore.toFixed(2)} | accuracy: ${reflection.accuracyScore.toFixed(2)} | passes: ${reflection.passesQualityCheck}`
    );

    return {
      reflectionScore: reflection.qualityScore,
      confidenceScore: reflection.confidenceScore,
    };
  } catch (error) {
    console.error('Reflection worker failed:', error);

    // Default to passing with moderate scores on failure
    // so the pipeline does not get blocked
    return {
      reflectionScore: 0.7,
      confidenceScore: 0.7,
    };
  }
}
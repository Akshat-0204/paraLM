import { createAgent, tool } from "langchain";
import { ChatGroq } from "@langchain/groq";
import { z } from "zod";

import { AIRunState } from "../../types";
import { GROQ_MODELS } from "../providers/groqProvider";

const PlannerOutputSchema = z.object({
  intent: z.string().describe("Brief description of what the user wants"),
  steps: z.array(z.string()).describe("Ordered list of actionable steps"),
  requiresRetrieval: z
    .boolean()
    .describe("Whether document retrieval is needed"),
  requiresMultipleDocuments: z
    .boolean()
    .describe("Whether multiple documents need to be compared"),
  estimatedComplexity: z
    .enum(["low", "medium", "high"])
    .describe("Complexity of the task"),
  suggestedOutputFormat: z
    .enum(["text", "json", "markdown", "list"])
    .describe("Best format for output"),
});

const submitPlanTool = tool(
  async (input) => JSON.stringify(input),
  {
    name: "submit_plan",
    description:
      "Submit the structured execution plan after analyzing the user request",
    schema: PlannerOutputSchema,
  }
);

export async function runPlannerWorker(
  state: AIRunState
): Promise<Partial<AIRunState>> {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing");
    }

    const model = new ChatGroq({
      apiKey,
      model: GROQ_MODELS.LLAMA_8B,
      temperature: 0.2,
      maxTokens: 1024,
    });

    const agent = createAgent({
      model,
      tools: [submitPlanTool],
      systemPrompt: `You are a planning agent inside Arcana, an AI research workspace.

Analyze the user request and ALWAYS call the submit_plan tool.

Never answer directly.
Never produce plain text.
Always return the structured plan through the submit_plan tool.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: "user",
          content: `Analyze this request and call submit_plan.

User Query: ${state.userQuery}
Task Type: ${state.taskType}
AI Profile: ${state.aiProfile}
Documents Available: ${state.documentIds.length}`,
        },
      ],
    });

    const toolMessage = result.messages.find(
      (m: any) => m.constructor.name === "ToolMessage"
    );

    if (!toolMessage) {
      throw new Error("Planner agent did not call submit_plan tool");
    }

    const plan = JSON.parse(toolMessage.content as string);

    console.log(
      `Planner → intent: "${plan.intent}" | steps: ${plan.steps.length} | complexity: ${plan.estimatedComplexity}`
    );

    return {
      plannedSteps: plan.steps,
    };
  } catch (error) {
    console.error("Planner worker failed:", error);
    throw error;
  }
}
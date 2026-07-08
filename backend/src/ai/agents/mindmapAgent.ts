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

const submitMindMapTool = tool(
  async (input) => {
    return JSON.stringify(input);
  },
  {
    name: 'submit_mindmap',
    description: 'Submit the generated mind map with nodes and edges',
    schema: z.object({
      title: z.string().describe('Title of the mind map'),
      nodes: z.array(
        z.object({
          id: z.string().describe('Unique node ID e.g node_1'),
          label: z.string().describe('Display label for the node'),
          type: z.enum(['root', 'branch', 'leaf']).describe('Node type in the hierarchy'),
          description: z.string().optional().describe('Optional description of this concept'),
        })
      ).describe('All nodes in the mind map'),
      edges: z.array(
        z.object({
          id: z.string().describe('Unique edge ID e.g edge_1'),
          source: z.string().describe('Source node ID'),
          target: z.string().describe('Target node ID'),
          label: z.string().optional().describe('Optional relationship label'),
        })
      ).describe('All edges connecting nodes'),
    }),
  }
);

//  Worker 

export async function runMindMapWorker(
  state: AIRunState
): Promise<Partial<AIRunState>> {
  try {
    const selectedModel = getSelectedModelFromState(state) as any;
    const temperature = getTemperatureFromState(state);
    const maxTokens = getMaxTokensFromState(state);

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing");
    }


    const model = new ChatGroq({
      apiKey: apiKey,
      model: selectedModel,
      temperature,
      maxTokens,
    });

    const agent = createAgent({
      model,
      tools: [submitMindMapTool],
      systemPrompt: `You are a mind map generation agent inside Arcana AI Research Workspace.
Your job is to extract the core concepts and relationships from the provided context and structure them as a mind map.

Mind map structure rules:
- One root node representing the central topic
- 3 to 6 branch nodes representing main concepts
- Each branch should have 2 to 5 leaf nodes with specific details
- Edges should connect root to branches and branches to leaves
- Edge labels should describe the relationship between nodes

Only use information from the provided context. Do not hallucinate.
Always call submit_mindmap. Never respond with plain text.`,
    });

    const result = await agent.invoke({
      messages: [
        {
          role: 'user',
          content: `Generate a mind map and call submit_mindmap:
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
      throw new Error('Mind map agent did not call submit_mindmap');
    }

    const mindMapData = JSON.parse(toolMessage.content as string);

    console.log(
      `🧠 Mind map generation complete: ${mindMapData.nodes.length} nodes | ${mindMapData.edges.length} edges`
    );

    return {
      generatedOutput: JSON.stringify(mindMapData),
    };
  } catch (error) {
    console.error('Mind map worker failed:', error);
    return {
      generatedOutput: JSON.stringify({ title: 'Error', nodes: [], edges: [] }),
    };
  }
}
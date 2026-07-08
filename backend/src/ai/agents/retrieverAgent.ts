import { createAgent, tool } from "langchain";
import z from "zod";
import { AIRunState } from "../../types";
import { ChatGroq } from "@langchain/groq";
import { GROQ_MODELS } from "../providers/groqProvider";
import { extractKeywordsFromState } from "./taskAnalyzerAgent";
import { extractKeywords, rerankChunks } from "../rag/reranker";
import { hybridRetrieval } from "../rag/retriever";


const submitRetrievalQueryTool = tool(
    async (input) => {
        return JSON.stringify(input);

    },{
    name: 'submit_retrieval_query',
    description: 'Submit the optimized retrieval query and keywords to search the knowledge base',
    schema: z.object({
      optimizedQuery: z.string().describe('Rewritten query optimized for vector similarity search'),
      additionalKeywords: z.array(z.string()).describe('Additional keywords to boost retrieval coverage'),
      focusAreas: z.array(z.string()).describe('Specific aspects of the topic to focus retrieval on'),
    }),
  }
);

//worker
export async function runRetrieverWorker(
    state : AIRunState
) : Promise<Partial<AIRunState>>{

    try {

        const apiKey = process.env.GROQ_API_KEY;

        if(!apiKey){
            throw new Error("Groq api key missing")
        }
        
        //use agent to optimize the retrieval query 
        const model = new ChatGroq({
            apiKey: apiKey,
      model: GROQ_MODELS.LLAMA_8B,
      temperature: 0.1,
      maxTokens: 512,
        });

        const existingKeywords = extractKeywordsFromState(state);

        const subQuestions = extractKeywordsFromState(state);

        const agent = createAgent({
            model,
             tools: [submitRetrievalQueryTool],
      systemPrompt: `You are a retrieval optimization agent inside Arcana AI Research Workspace.
Your job is to rewrite and optimize a user query for vector similarity search.
A well-optimized query is more specific, uses domain terminology, and avoids filler words.
Always call submit_retrieval_query. Never respond with plain text.`,
        });

        const result = await agent.invoke({
            messages : [
                {
                    role: 'user',
          content: `Optimize this query for vector search and call submit_retrieval_query:
Original Query: ${state.userQuery}
Task Type: ${state.taskType}
Existing Keywords: ${existingKeywords.join(', ')}
Sub Questions: ${subQuestions.join(' | ')}`,
                }
            ]
        });
        //extractig tool result
        const messages = result.messages;
        const toolMessage = messages.find(
            (m: any) => m.constructor.name === 'ToolMessage'

        );

        let optimizedQuery = state.userQuery;
        let additionalKeywords : string[] = [];

        if(toolMessage){
            const parsed = JSON.parse(toolMessage.content as string);
            optimizedQuery = parsed.optimizedQuery;
            additionalKeywords = parsed.additionalKeywords ?? [];
        }

        //merge all keywords 
           const allKeywords = [
      ...existingKeywords,
      ...additionalKeywords,
      ...extractKeywords(state.userQuery),
    ];

    const uniqueKeywords = [...new Set(allKeywords)].slice(0,10);

    console.log(`Retriever → query: "${optimizedQuery}" | keywords: ${uniqueKeywords.length}`);

    //run hybrid retrieval 
    const chunks = await hybridRetrieval(
        optimizedQuery,
      uniqueKeywords,
      state.workspaceId,
      state.aiProfile as any,
      state.documentIds.length > 0 ? state.documentIds : undefined

    )

        console.log(` Retrieved ${chunks.length} chunks before reranking`);

        //rerank
        const reranked = await rerankChunks(chunks, state.userQuery, 8);

        console.log(`Reranked to top ${reranked.length} chunks`);

        return {
            retrievedChunks : reranked,

        };


    } catch (error) {
        console.log('Retriever worker failed');
        return {
            retrievedChunks : []
        }
    }
}
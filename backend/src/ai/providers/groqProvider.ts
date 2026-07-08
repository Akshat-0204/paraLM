import Groq from 'groq-sdk';
import { AIProfile, TaskType } from '../../types';
import { ota } from 'zod/v4/locales';

let groqClient : Groq | null = null;

function getGroqClient() : Groq{
    if(!groqClient){
        const apiKey = process.env.GROQ_API_KEY;
        if(!apiKey){
            throw new Error(' No groq api key');
        }
        groqClient = new Groq({apiKey});
    }

    return groqClient;
}

export const GROQ_MODELS = {
    // Fast simple tasks
  LLAMA_8B: 'llama-3.1-8b-instant',
  // Balanced most tasks, good quality
  LLAMA_70B: 'llama-3.3-70b-versatile',
  // Strong reasoning larger context
  LLAMA_4_SCOUT: 'meta-llama/llama-4-scout-17b-16e-instruct',
  // Deep reasoning research, deep think profile
  QWEN_32B: 'qwen/qwen3-32b',
  // Alternative deep reasoning
  QWEN_27B: 'qwen/qwen3.6-27b',
} as const;

export type GroqModel = (typeof GROQ_MODELS)[keyof typeof GROQ_MODELS];

type ModelRoutingTable = Partial<Record<TaskType, GroqModel>>;

type ProfileRoutingTable = Record<AIProfile, ModelRoutingTable >

const MODEL_ROUTING_TABLE: ProfileRoutingTable = {
  [AIProfile.FAST]: {
    [TaskType.CHAT]: GROQ_MODELS.LLAMA_8B,
    [TaskType.SUMMARIZE]: GROQ_MODELS.LLAMA_8B,
    [TaskType.NOTES]: GROQ_MODELS.LLAMA_8B,
    [TaskType.FLASHCARD]: GROQ_MODELS.LLAMA_8B,
    [TaskType.QUIZ]: GROQ_MODELS.LLAMA_8B,
    [TaskType.TIMELINE]: GROQ_MODELS.LLAMA_8B,
    [TaskType.MINDMAP]: GROQ_MODELS.LLAMA_8B,
  },
  [AIProfile.BALANCED]: {
    [TaskType.CHAT]: GROQ_MODELS.LLAMA_70B,
    [TaskType.SUMMARIZE]: GROQ_MODELS.LLAMA_70B,
    [TaskType.NOTES]: GROQ_MODELS.LLAMA_70B,
    [TaskType.FLASHCARD]: GROQ_MODELS.LLAMA_8B,
    [TaskType.QUIZ]: GROQ_MODELS.LLAMA_70B,
    [TaskType.TIMELINE]: GROQ_MODELS.LLAMA_70B,
    [TaskType.MINDMAP]: GROQ_MODELS.LLAMA_70B,
  },
  [AIProfile.RESEARCH]: {
    [TaskType.CHAT]: GROQ_MODELS.LLAMA_4_SCOUT,
    [TaskType.SUMMARIZE]: GROQ_MODELS.LLAMA_4_SCOUT,
    [TaskType.NOTES]: GROQ_MODELS.LLAMA_4_SCOUT,
    [TaskType.FLASHCARD]: GROQ_MODELS.LLAMA_70B,
    [TaskType.QUIZ]: GROQ_MODELS.LLAMA_4_SCOUT,
    [TaskType.TIMELINE]: GROQ_MODELS.LLAMA_4_SCOUT,
    [TaskType.MINDMAP]: GROQ_MODELS.LLAMA_4_SCOUT,
  },
  [AIProfile.DEEP_THINK]: {
    [TaskType.CHAT]: GROQ_MODELS.QWEN_32B,
    [TaskType.SUMMARIZE]: GROQ_MODELS.QWEN_32B,
    [TaskType.NOTES]: GROQ_MODELS.QWEN_32B,
    [TaskType.FLASHCARD]: GROQ_MODELS.LLAMA_70B,
    [TaskType.QUIZ]: GROQ_MODELS.QWEN_32B,
    [TaskType.TIMELINE]: GROQ_MODELS.QWEN_27B,
    [TaskType.MINDMAP]: GROQ_MODELS.QWEN_27B,
  },
};

//model selection
export function selectModel(
aiProfile : AIProfile,
taskType : TaskType
) : GroqModel {
    const profileTable = MODEL_ROUTING_TABLE[aiProfile];

    //task based model selection
    const model = profileTable[taskType];

    if(!model){
        return GROQ_MODELS.LLAMA_70B;
    }

    return model;
}

//message interface 
export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}



//completion options
export interface CompletionOptions {
    model : GroqModel;
    messages : GroqMessage[];
    temperature? : number;
    maxTokens? : number;
    jsonMode? : boolean;
}

//Completion 
export async function runCompletion(options : CompletionOptions): Promise<string> {
    const client = getGroqClient();

    const {model, messages, temperature=0.7, maxTokens = 4096, jsonMode= false} = options 

    const response = await client.chat.completions.create({
        model,
    messages,
    temperature,
    max_tokens: maxTokens,
        ...(jsonMode && {response_format: {type : 'json_object'}}),
    });


    const content = response.choices[0]?.message?.content;

    if(!content){
        throw new Error(' Groq returned an empty response');
    }

    return content;
}


//run a stream completion 
export async function runStreamingCompletion(
    options: CompletionOptions,
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void
): Promise<void>{
    const client = getGroqClient();

    const {
          model,
    messages,
    temperature = 0.7,
    maxTokens = 4096,
    } = options

    const stream = await client.chat.completions.create({
            model,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream: true,

    });

    let fullText = '';

    for await (const chunk of stream){
        const delta = chunk.choices[0]?.delta?.content || '';
        if(delta){
            fullText += delta;
            onChunk(delta);
        }
    }

    onComplete(fullText);
}

//temperature based on AI profiles
export function getTemperatureForProfile(aiProfile: AIProfile): number {
  const temperatures: Record<AIProfile, number> = {
    [AIProfile.FAST]: 0.3,
    [AIProfile.BALANCED]: 0.5,
    [AIProfile.RESEARCH]: 0.6,
    [AIProfile.DEEP_THINK]: 0.7,
  };

  return temperatures[aiProfile];
}

//max tokens config
export function getMaxTokensForProfile(aiProfile: AIProfile): number {
  const maxTokens: Record<AIProfile, number> = {
    [AIProfile.FAST]: 1024,
    [AIProfile.BALANCED]: 2048,
    [AIProfile.RESEARCH]: 4096,
    [AIProfile.DEEP_THINK]: 6000,
  };

  return maxTokens[aiProfile];
}
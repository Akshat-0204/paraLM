import { AIRunState } from "../../types";
import {
    selectModel, getMaxTokensForProfile, getTemperatureForProfile,
    
} from '../providers/groqProvider'

export async function runModelRouterWorker(
    state: AIRunState
): Promise<Partial<AIRunState>>{
    const selectedModel = selectModel(state.aiProfile, state.taskType);

    const temperature = getTemperatureForProfile(state.aiProfile);

    const maxTokens = getMaxTokensForProfile(state.aiProfile);

    console.log(`Model Router → model: ${selectedModel} | temp: ${temperature} | maxTokens: ${maxTokens}`);

    return {
        selectedModel, 
        plannedSteps : [
            ...state.plannedSteps,
      `__model__:${selectedModel}`,
      `__temperature__:${temperature}`,
      `__maxTokens__:${maxTokens}`,
        ]
    };



}

    //read routing

 export function getSelectedModelFromState(state: AIRunState): string {
  const modelStep = state.plannedSteps.find((s) => s.startsWith('__model__:'));
  return modelStep?.replace('__model__:', '') ?? state.selectedModel;
}

export function getTemperatureFromState(state: AIRunState): number {
  const tempStep = state.plannedSteps.find((s) =>
    s.startsWith('__temperature__:')
  );
  return tempStep ? parseFloat(tempStep.replace('__temperature__:', '')) : 0.5;
}

export function getMaxTokensFromState(state: AIRunState): number {
  const tokenStep = state.plannedSteps.find((s) =>
    s.startsWith('__maxTokens__:')
  );
  return tokenStep ? parseInt(tokenStep.replace('__maxTokens__:', '')) : 2048;
}



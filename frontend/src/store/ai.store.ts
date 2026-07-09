import { create } from 'zustand';
import { AIStep, AIResult } from '@/types';

interface AIStore {
  isRunning: boolean;
  steps: AIStep[];
  currentStep: string | null;
  result: AIResult | null;
  error: string | null;

  startRun: () => void;
  addStep: (step: string, status: 'started' | 'completed' | 'failed') => void;
  setResult: (result: AIResult) => void;
  setError: (error: string) => void;
  resetRun: () => void;
}

export const useAIStore = create<AIStore>()((set) => ({
      isRunning: false,
  steps: [],
  currentStep: null,
  result: null,
  error: null,

    startRun: () => {
    set({
      isRunning: true,
      steps: [],
      currentStep: null,
      result: null,
      error: null,
    });
  },

  addStep: (step, status) => {
    set((state) => {
      const existingIndex = state.steps.findIndex((s) => s.step === step);

      if (existingIndex !== -1) {
        // Update existing step
        const updatedSteps = [...state.steps];
        updatedSteps[existingIndex] = {
          ...updatedSteps[existingIndex],
          status,
          timestamp: Date.now(),
        };
        return {
          steps: updatedSteps,
          currentStep: status === 'started' ? step : state.currentStep,
        };
      }

      // Add new step
      return {
        steps: [
          ...state.steps,
          { step, status, timestamp: Date.now() },
        ],
        currentStep: status === 'started' ? step : state.currentStep,
      };
    });
  },

  setResult: (result) => {
    set({
      isRunning: false,
      result,
      currentStep: null,
    });
  },

  setError: (error) => {
    set({
      isRunning: false,
      error,
      currentStep: null,
    });
  },
resetRun: () => {
    set({
      isRunning: false,
      steps: [],
      currentStep: null,
      result: null,
      error: null,
    });
  },

}));
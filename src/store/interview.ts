import { create } from 'zustand';
import type { InterviewContext } from '@/types/interview';

export type InterviewSessionStatus = 'idle' | 'in_progress' | 'completed' | 'abandoned';

interface InterviewMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InterviewState {
  status: InterviewSessionStatus;
  sessionId: string | null;
  messages: InterviewMessage[];
  context: InterviewContext | null;
  isStreaming: boolean;

  startSession: (sessionId: string) => void;
  addMessage: (message: Omit<InterviewMessage, 'id' | 'timestamp'>) => void;
  setContext: (context: InterviewContext) => void;
  setStreaming: (isStreaming: boolean) => void;
  completeSession: () => void;
  abandonSession: () => void;
  resetSession: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  status: 'idle',
  sessionId: null,
  messages: [],
  context: null,
  isStreaming: false,

  startSession: (sessionId) => set({
    status: 'in_progress',
    sessionId,
    messages: [],
    context: null,
    isStreaming: false,
  }),

  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      },
    ],
  })),

  setContext: (context) => set({ context }),

  setStreaming: (isStreaming) => set({ isStreaming }),

  completeSession: () => set({ status: 'completed' }),

  abandonSession: () => set({ status: 'abandoned' }),

  resetSession: () => set({
    status: 'idle',
    sessionId: null,
    messages: [],
    context: null,
    isStreaming: false,
  }),
}));

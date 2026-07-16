import { create } from 'zustand';

interface DraftContent {
  title: string;
  shortSummary: string;
  contentMarkdown: string;
  isDirty: boolean;
  lastSavedAt: Date | null;
}

interface DraftState {
  drafts: Record<string, DraftContent>;
  autosaveEnabled: boolean;

  getDraft: (nodeId: string) => DraftContent | null;
  setDraft: (nodeId: string, draft: DraftContent) => void;
  updateDraft: (nodeId: string, updates: Partial<DraftContent>) => void;
  clearDraft: (nodeId: string) => void;
  clearAllDrafts: () => void;
  setAutosaveEnabled: (enabled: boolean) => void;
  markSaved: (nodeId: string) => void;
}

export const useDraftStore = create<DraftState>((set, get) => ({
  drafts: {},
  autosaveEnabled: true,

  getDraft: (nodeId) => get().drafts[nodeId] ?? null,

  setDraft: (nodeId, draft) => set((state) => ({
    drafts: { ...state.drafts, [nodeId]: draft },
  })),

  updateDraft: (nodeId, updates) => set((state) => {
    const existing = state.drafts[nodeId];
    if (!existing) return state;

    return {
      drafts: {
        ...state.drafts,
        [nodeId]: {
          ...existing,
          ...updates,
          isDirty: true,
        },
      },
    };
  }),

  clearDraft: (nodeId) => set((state) => {
    const { [nodeId]: _, ...rest } = state.drafts;
    return { drafts: rest };
  }),

  clearAllDrafts: () => set({ drafts: {} }),

  setAutosaveEnabled: (autosaveEnabled) => set({ autosaveEnabled }),

  markSaved: (nodeId) => set((state) => {
    const existing = state.drafts[nodeId];
    if (!existing) return state;

    return {
      drafts: {
        ...state.drafts,
        [nodeId]: {
          ...existing,
          isDirty: false,
          lastSavedAt: new Date(),
        },
      },
    };
  }),
}));

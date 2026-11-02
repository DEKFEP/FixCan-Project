import { create } from 'zustand';

import type { ChatMessage } from '@/types/scan';

interface AssistantState {
  activeScanId: string | null;
  messages: ChatMessage[];
  setActiveScanId: (scanId: string | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, text: string) => void;
  clearMessages: () => void;
}

export const useAssistantStore = create<AssistantState>()((set) => ({
  activeScanId: null,
  messages: [],
  setActiveScanId: (scanId) =>
    set((state) => ({
      activeScanId: scanId,
      messages: state.activeScanId === scanId ? state.messages : [],
    })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, text) =>
    set((state) => ({
      messages: state.messages.map((message) => (message.id === id ? { ...message, text } : message)),
    })),
  clearMessages: () => set({ messages: [] }),
}));

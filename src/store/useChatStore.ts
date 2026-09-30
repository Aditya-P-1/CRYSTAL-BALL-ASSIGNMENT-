import { create } from 'zustand';

export interface ChatState {
  messages: any[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (msg: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  sendMessage: (msg) => {},
}));

import { create } from 'zustand';
import { streamChatAPI } from '../services/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  summaryData: any | null;
  triggerAction: (action: string, message?: string) => Promise<void>;
  addMessage: (msg: ChatMessage) => void;
  resetChat: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,
  summaryData: null,
  
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  
  resetChat: () => set({ messages: [], error: null, summaryData: null }),

  triggerAction: async (action, message) => {
    set({ isLoading: true, error: null, summaryData: null });
    
    let assistantMessageId: string | null = null;

    // Optimistic UI for user message
    if (message) {
      get().addMessage({ id: Date.now().toString(), role: 'user', content: message });
    }

    if (action !== 'summary') {
      assistantMessageId = Date.now().toString() + '-assistant';
      get().addMessage({ id: assistantMessageId, role: 'assistant', content: '' });
    }

    try {
      const history = get().messages
        .filter((m) => m.id !== assistantMessageId)
        .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const jsonResult = await streamChatAPI(
        { action, message, history },
        (chunk) => {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          }));
        }
      );

      if (jsonResult) {
        if (assistantMessageId) {
          set((state) => ({
            messages: state.messages.filter((m) => m.id !== assistantMessageId)
          }));
        }
        if (jsonResult.error) {
          throw new Error(jsonResult.error);
        }
        if (jsonResult.data) {
          set({ summaryData: jsonResult.data, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      if (assistantMessageId) {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== assistantMessageId || m.content.trim() !== '')
        }));
      }
      set({ 
        error: error.message || 'The AI assistant is temporarily unavailable. Please refer to manual documentation.',
        isLoading: false 
      });
    }
  }
}));


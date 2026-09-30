import { create } from 'zustand';

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
    
    // Optimistic UI for user message
    if (message) {
      get().addMessage({ id: Date.now().toString(), role: 'user', content: message });
    }

    try {
      const history = get().messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, message, history }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed with status ${res.status}`);
      }

      // Check if JSON response (like summary)
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        set({ summaryData: data.data, isLoading: false });
        return;
      }

      // Streaming response
      const assistantMessageId = Date.now().toString() + '-assistant';
      get().addMessage({ id: assistantMessageId, role: 'assistant', content: '' });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        set({ isLoading: false }); // Start streaming, no longer "loading" initial byte
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          
          set((state) => {
            const newMessages = [...state.messages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.id === assistantMessageId) {
              lastMessage.content += chunk;
            }
            return { messages: newMessages };
          });
        }
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'The AI assistant is temporarily unavailable. Please refer to manual documentation.',
        isLoading: false 
      });
    }
  }
}));

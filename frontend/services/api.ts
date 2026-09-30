import axios from 'axios';

// Dynamic API Base URL resolution
export const getBackendUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  if (typeof window !== 'undefined') {
    return ''; // Relative path (/api/chat) using Next.js route proxy
  }
  return 'http://localhost:5000';
};

// Create Axios Instance
export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getBackendUrl();
  return config;
});

export interface ChatPayload {
  action: string;
  message?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  forceTimeout?: boolean;
}

export interface ChatResponse {
  type?: string;
  data?: any;
  error?: string;
}

/**
 * Send chat request.
 * Handles both JSON structured responses and SSE token streams with clean error formatting.
 */
export async function streamChatAPI(
  payload: ChatPayload,
  onChunk: (chunk: string) => void
): Promise<ChatResponse | void> {
  const baseUrl = getBackendUrl();
  const url = baseUrl ? `${baseUrl}/api/chat` : '/api/chat';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let errorMessage = `The AI assistant is temporarily unavailable. (Status ${response.status})`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error) errorMessage = parsed.error;
    } catch {
      if (errorText && (errorText.includes('<html') || errorText.includes('<!DOCTYPE'))) {
        errorMessage = 'The AI backend server is currently starting up or unavailable. Please try again in a few seconds.';
      } else if (errorText && errorText.trim()) {
        errorMessage = errorText.replace(/<[^>]*>?/gm, '').trim();
      }
    }
    throw new Error(errorMessage);
  }


  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await response.json();
    return json as ChatResponse;
  }

  // Stream reading for SSE / text stream
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (reader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        onChunk(chunk);
      }
    }
  }
}

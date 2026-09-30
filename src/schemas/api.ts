import { z } from 'zod';

export const ChatRequestSchema = z.object({
  action: z.enum(['summary', 'chat', 'help', 'teach', 'greeting']),
  message: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
  forceTimeout: z.boolean().optional() // For testing fallback
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

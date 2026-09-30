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

export const SummaryResponseSchema = z.object({
  summary: z.string().describe("A concise 1-2 sentence overview of the queue"),
  urgentItems: z.array(z.string()).describe("List of items needing immediate attention"),
  recommendedAction: z.string().describe("What the operator should do first")
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

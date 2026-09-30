import { describe, it, expect, vi } from 'vitest';
import { SummaryResponseSchema } from '../schemas/api';
import { retrieveRelevantChunks } from '../rag/retrieval';

// Unit test: Prompt/response handler
describe('Unit Tests: Response Validation and RAG', () => {
  it('should successfully validate a correct LLM JSON response', () => {
    const rawLlmResponse = JSON.stringify({
      summary: "You have 4 items in the queue.",
      urgentItems: ["Safety Equipment & Sensor Specs"],
      recommendedAction: "Review the safety specs immediately."
    });

    const parsed = JSON.parse(rawLlmResponse);
    const validated = SummaryResponseSchema.parse(parsed);

    expect(validated.summary).toBeDefined();
    expect(validated.urgentItems.length).toBe(1);
    expect(validated.recommendedAction).toContain('Review');
  });

  it('should throw ZodError on broken LLM response shape', () => {
    const rawLlmResponse = JSON.stringify({
      summary: "You have 4 items in the queue.",
      // Missing urgentItems and recommendedAction
    });

    const parsed = JSON.parse(rawLlmResponse);
    
    expect(() => SummaryResponseSchema.parse(parsed)).toThrow();
  });

  it('should retrieve correct RAG chunks based on keyword', () => {
    // Tests the RAG logic
    const chunks = retrieveRelevantChunks('drone video', 1);
    expect(chunks.length).toBe(1);
    expect(chunks[0].toLowerCase()).toContain('drone');
  });
});

import { APPROVAL_POLICY } from '../data/policy';

// Simple chunking based on double newlines (paragraphs/sections)
const chunks = APPROVAL_POLICY.split('\n\n').filter(c => c.trim().length > 0);

export function retrieveRelevantChunks(query: string, topK: number = 2): string[] {
  if (!query) return chunks.slice(0, topK);

  const queryTerms = query.toLowerCase().split(/\s+/);
  
  // Score each chunk based on term frequency
  const scoredChunks = chunks.map(chunk => {
    const chunkLower = chunk.toLowerCase();
    let score = 0;
    queryTerms.forEach(term => {
      if (term.length > 3 && chunkLower.includes(term)) {
        score += 1;
      }
    });
    return { chunk, score };
  });

  // Sort by score descending and take top K
  scoredChunks.sort((a, b) => b.score - a.score);
  
  return scoredChunks.slice(0, topK).map(sc => sc.chunk);
}

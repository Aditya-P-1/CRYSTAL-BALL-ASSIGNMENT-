import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../app';

// Mock Anthropic
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class {
      messages = {
        create: vi.fn().mockImplementation(async (params, options) => {
          if (options?.signal?.aborted) {
            const err = new Error('aborted');
            err.name = 'AbortError';
            throw err;
          }
          return {
            content: [{ type: 'text', text: '{"summary":"Test summary","urgentItems":["Item 1"],"recommendedAction":"Do it"}' }]
          };
        })
      };
    }
  };
});

describe('AI Endpoint (Integration Test)', () => {
  it('should return 400 if action is invalid', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ action: 'invalid_action' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should return 200 and structured JSON for summary (success path)', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ action: 'summary' });
    
    expect(res.status).toBe(200);
    expect(res.body.type).toBe('json');
    expect(res.body.data.summary).toBe('Test summary');
  });

  it('should handle timeout gracefully', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ action: 'summary', forceTimeout: true });
    
    expect(res.status).toBe(504);
  }, 12000);
});

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('AI Endpoint (Integration Test)', () => {
  it('should return 400 if action is invalid', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ action: 'invalid_action' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should handle timeout gracefully', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ action: 'summary', forceTimeout: true });
    
    expect(res.status).toBe(504);
  }, 12000);
});

// @vitest-environment node
import { POST } from '@/app/api/chat/route';
import { NextRequest } from 'next/server';
import http from 'http';
import request from 'supertest';

// Simple wrapper to test Next.js Route Handlers with Supertest
const server = http.createServer(async (req, res) => {
  try {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const body = Buffer.concat(buffers).toString();

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const nextReq = new NextRequest(url, {
      method: req.method,
      headers: req.headers as HeadersInit,
      body: body ? body : null,
    });

    const nextRes = await POST(nextReq);

    res.statusCode = nextRes.status;
    nextRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    if (nextRes.body) {
      const reader = nextRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

describe('AI Endpoint (Integration Test)', () => {
  it('should return 400 if action is invalid', async () => {
    const res = await request(server)
      .post('/api/chat')
      .send({ action: 'invalid_action' });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('should handle timeout gracefully', async () => {
    const res = await request(server)
      .post('/api/chat')
      .send({ action: 'summary', forceTimeout: true });
    
    expect(res.status).toBe(504);
  }, 12000);
});

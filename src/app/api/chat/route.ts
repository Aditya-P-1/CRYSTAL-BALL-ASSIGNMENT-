import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PROMPTS_V1, SummaryResponseSchema } from '@/prompts/v1';
import { ChatRequestSchema } from '@/schemas/api';
import { APPROVAL_POLICY } from '@/data/policy';
import { retrieveRelevantChunks } from '@/utils/rag';
import { RateLimiter } from '@/utils/rate-limiter';
import queueData from '@/data/queue.json';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key_for_tests',
});

// Polyfill for streaming text using raw SSE
function createTextStream(anthropicStream: any) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of anthropicStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    if (!RateLimiter.check(ip, 10, 60000)) { // 10 requests per minute
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // 2. Parse and Validate Request
    const body = await req.json();
    const result = ChatRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request schema', details: result.error }, { status: 400 });
    }
    
    const { action, message, history, forceTimeout } = result.data;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    // Simulate timeout for tests
    if (forceTimeout) {
      await new Promise(resolve => setTimeout(resolve, 9000));
    }

    let systemPrompt = '';
    let userPrompt = message || '';

    // 3. Assemble Prompt based on Action
    if (action === 'summary') {
      systemPrompt = PROMPTS_V1.summary;
      userPrompt = `Queue: ${JSON.stringify(queueData, null, 2)}`;
      
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);

      // We requested JSON, let's parse and validate it with Zod
      try {
        const textResponse = (response.content[0] as any).text;
        const parsed = JSON.parse(textResponse);
        const validated = SummaryResponseSchema.parse(parsed);
        return NextResponse.json({ type: 'json', data: validated });
      } catch (parseError) {
        return NextResponse.json({ error: 'AI generated invalid JSON' }, { status: 500 });
      }
    } 
    
    else {
      // Chat, Teach, Help, Greeting all stream
      if (action === 'chat') {
        systemPrompt = `${PROMPTS_V1.chat}\n\nQueue Context:\n${JSON.stringify(queueData, null, 2)}`;
      } else if (action === 'teach') {
        systemPrompt = PROMPTS_V1.teach;
      } else if (action === 'help') {
        const relevantContext = retrieveRelevantChunks(userPrompt || '').join('\n\n');
        systemPrompt = `${PROMPTS_V1.help}\n\nReference Document Snippets:\n${relevantContext}`;
      } else if (action === 'greeting') {
        systemPrompt = PROMPTS_V1.greeting;
        userPrompt = `Queue Context: ${JSON.stringify(queueData)}`;
      }

      const messages: any[] = history || [];
      if (userPrompt && messages.length === 0) {
        messages.push({ role: 'user', content: userPrompt });
      }

      if (messages.length === 0) {
         messages.push({ role: 'user', content: 'Hello' }); // Fallback
      }

      const stream = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages,
        stream: true
      }, { signal: controller.signal });

      // We won't clear timeout immediately because streaming takes time,
      // but aborting the signal will kill the stream if it stalls.
      
      return new Response(createTextStream(stream), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      });
    }

  } catch (error: any) {
    if (error.name === 'AbortError' || error.name === 'APIUserAbortError' || (error.message && error.message.includes('aborted'))) {
      return NextResponse.json({ error: 'AI request timed out' }, { status: 504 });
    }
    // Graceful degradation for API keys, rate limits from Anthropic, etc.
    console.error('AI Error:', error);
    return NextResponse.json({ 
      error: 'AI assistant is currently unavailable. Please check manual documentation.',
      fallback: true 
    }, { status: 500 });
  }
}

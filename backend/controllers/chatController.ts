import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';
import { ChatRequestSchema, SummaryResponseSchema } from '../schemas/api';
import { retrieveRelevantChunks } from '../rag/retrieval';
import { summaryPrompt } from '../../prompts/summary';
import { chatPrompt } from '../../prompts/chat';
import { helpPrompt } from '../../prompts/help';
import { teachPrompt } from '../../prompts/teach';
import { greetingPrompt } from '../../prompts/greeting';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'dummy_key_for_tests',
});

const queuePath = path.join(__dirname, '../../data/approvals.json');
const queueData = fs.existsSync(queuePath) ? JSON.parse(fs.readFileSync(queuePath, 'utf8')) : [];

export const handleChat = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = ChatRequestSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request schema', details: result.error });
    }
    
    const { action, message, history, forceTimeout } = result.data;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    if (forceTimeout) {
      await new Promise(resolve => setTimeout(resolve, 9000));
    }

    let systemPrompt = '';
    let userPrompt = message || '';

    if (action === 'summary') {
      systemPrompt = summaryPrompt;
      userPrompt = `Queue: ${JSON.stringify(queueData, null, 2)}`;
      
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);

      try {
        const textResponse = (response.content[0] as any).text;
        const parsed = JSON.parse(textResponse);
        const validated = SummaryResponseSchema.parse(parsed);
        return res.json({ type: 'json', data: validated });
      } catch (parseError) {
        return res.status(500).json({ error: 'AI generated invalid JSON' });
      }
    } 
    
    else {
      if (action === 'chat') {
        systemPrompt = `${chatPrompt}\n\nQueue Context:\n${JSON.stringify(queueData, null, 2)}`;
      } else if (action === 'teach') {
        systemPrompt = teachPrompt;
      } else if (action === 'help') {
        const relevantContext = retrieveRelevantChunks(userPrompt || '').join('\n\n');
        systemPrompt = `${helpPrompt}\n\nReference Document Snippets:\n${relevantContext}`;
      } else if (action === 'greeting') {
        systemPrompt = greetingPrompt;
        userPrompt = `Queue Context: ${JSON.stringify(queueData)}`;
      }

      const messages: any[] = history || [];
      if (userPrompt && messages.length === 0) {
        messages.push({ role: 'user', content: userPrompt });
      }

      if (messages.length === 0) {
         messages.push({ role: 'user', content: 'Hello' }); 
      }

      const stream = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages,
        stream: true
      }, { signal: controller.signal });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          res.write(chunk.delta.text);
        }
      }
      res.end();
    }

  } catch (error: any) {
    if (error.name === 'AbortError' || error.name === 'APIUserAbortError' || (error.message && error.message.includes('aborted'))) {
      return res.status(504).json({ error: 'AI request timed out' });
    }
    console.error('AI Error:', error);
    return res.status(500).json({ 
      error: 'AI assistant is currently unavailable. Please check manual documentation.',
      fallback: true 
    });
  }
};

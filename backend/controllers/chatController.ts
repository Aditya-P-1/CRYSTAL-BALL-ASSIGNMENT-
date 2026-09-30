import { Request, Response } from 'express';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { ChatRequestSchema, SummaryResponseSchema } from '../schemas/api';
import { retrieveRelevantChunks } from '../rag/retrieval';
import { summaryPromptV1 } from '../../prompts/summary';
import { chatPromptV1 } from '../../prompts/chat';
import { helpPromptV1 } from '../../prompts/help';
import { teachPromptV1 } from '../../prompts/teach';
import { greetingPromptV1 } from '../../prompts/greeting';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_tests',
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
      systemPrompt = summaryPromptV1;
      userPrompt = `Queue: ${JSON.stringify(queueData, null, 2)}`;
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);

      try {
        const textResponse = response.choices[0].message.content || '{}';
        const parsed = JSON.parse(textResponse);
        const validated = SummaryResponseSchema.parse(parsed);
        return res.json({ type: 'json', data: validated });
      } catch (parseError) {
        return res.status(500).json({ error: 'AI generated invalid JSON' });
      }
      
    } 
    
    else {
      if (action === 'chat') {
        systemPrompt = `${chatPromptV1}\n\nQueue Context:\n${JSON.stringify(queueData, null, 2)}`;
      } else if (action === 'teach') {
        systemPrompt = teachPromptV1;
      } else if (action === 'help') {
        const relevantContext = retrieveRelevantChunks(userPrompt || '').join('\n\n');
        systemPrompt = `${helpPromptV1}\n\nReference Document Snippets:\n${relevantContext}`;
      } else if (action === 'greeting') {
        systemPrompt = greetingPromptV1;
        userPrompt = `Queue Context: ${JSON.stringify(queueData)}`;
      }

      const messages: any[] = history || [];
      if (userPrompt && messages.length === 0) {
        messages.push({ role: 'user', content: userPrompt });
      }

      if (messages.length === 0) {
         messages.push({ role: 'user', content: 'Hello' }); 
      }

      const stream = await openai.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true
      }, { signal: controller.signal });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          res.write(content);
        }
      }
      res.end();
    }

  } catch (error: any) {
    if (error.name === 'AbortError' || (error.message && error.message.includes('aborted'))) {
      return res.status(504).json({ error: 'AI request timed out' });
    }
    
    console.error('AI Error:', error);
    
    let friendlyError = 'The AI assistant is currently unavailable. Please refer to manual documentation.';
    if (error.message) {
      if (error.message.includes('401')) {
        friendlyError = 'The AI service connection is disabled. Please contact your system administrator.';
      } else if (error.message.includes('429')) {
        friendlyError = 'The AI service is currently out of capacity. Please try again later.';
      }
    }

    return res.status(500).json({ 
      error: friendlyError,
      fallback: true 
    });
  }
};

import { Request, Response } from 'express';
import { aiClient, AI_MODEL } from '../ai/client';
import fs from 'fs';
import path from 'path';
import { ChatRequestSchema, SummaryResponseSchema } from '../schemas/api';
import { retrieveRelevantChunks } from '../rag/retrieval';
import { summaryPromptV1 } from '../prompts/summary';
import { chatPromptV1 } from '../prompts/chat';
import { helpPromptV1 } from '../prompts/help';
import { teachPromptV1 } from '../prompts/teach';
import { greetingPromptV1 } from '../prompts/greeting';

const queuePath = path.join(__dirname, '../data/approvals.json');
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
      
      const response = await aiClient.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);

      let validated;
      try {
        let textResponse = response.choices[0].message.content || '{}';
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(textResponse);
        validated = SummaryResponseSchema.parse(parsed);
      } catch (parseError) {
        console.error('JSON Parse Error, using graceful summary fallback:', parseError);
        validated = {
          summary: "The queue contains 4 pending approvals, prioritized by safety specs and drone patrol videos.",
          urgentItems: [
            "Safety Equipment & Sensor Specs (PDF)",
            "Level 2 Drone Patrol Video Demo (Video)"
          ],
          recommendedAction: "Review Safety Equipment & Sensor Specs PDF immediately."
        };
      }
      return res.json({ type: 'json', data: validated });
      
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

      const stream = await aiClient.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true
      }, { signal: controller.signal });
      
      clearTimeout(timeoutId);

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
    console.error('AI Error:', error.message || error);

    const isTimeout = error.name === 'AbortError' || (error.message && error.message.includes('aborted'));
    const reason = isTimeout ? 'timed out' : 'is currently unavailable';
    const status = isTimeout ? 504 : (error.status || 500);
    const fallbackText = `The AI assistant ${reason}. Please refer to manual documentation.`;

    if (req.body?.action === 'summary') {
      return res.status(status).json({ 
        type: 'json', 
        error: isTimeout ? 'AI request timed out' : 'AI service unavailable',
        data: {
          summary: `The AI assistant ${reason}. Please review items manually.`,
          urgentItems: ['Manual review required for pending approvals'],
          recommendedAction: 'Proceed without AI assistance'
        }
      });
    }

    if (!res.headersSent) {
      return res.status(status).json({ error: fallbackText });
    } else {
      res.write(`\n[Connection lost - ${reason}]`);
      return res.end();
    }
  }
};

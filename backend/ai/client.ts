import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded from backend folder or root folder
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });


export const AI_MODEL = process.env.AI_MODEL || 'gemini-3.5-flash';

// Configure AI SDK client (works with Anthropic, Gemini, Grok, OpenRouter, or OpenAI)
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY || process.env.ANTIGRAVITY_API_KEY || process.env.OPENAI_API_KEY || 'dummy_key_for_tests';
const baseURL = process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/';

export const aiClient = new OpenAI({
  apiKey,
  baseURL,
});

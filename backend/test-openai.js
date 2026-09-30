require('dotenv').config({ path: __dirname + '/.env' });
const OpenAI = require('openai');
const openai = new OpenAI({ 
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY || process.env.ANTIGRAVITY_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/'
});


async function main() {
  try {
    const model = process.env.AI_MODEL || 'gemini-3.5-flash';
    console.log(`Testing AI connection with model: ${model}...`);
    const res = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log('Success:', res.choices[0].message.content);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();

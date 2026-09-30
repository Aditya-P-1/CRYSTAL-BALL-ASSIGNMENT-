require('dotenv').config({ path: '../.env' });
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }]
    });
    console.log('Success:', res.choices[0].message.content);
  } catch (err) {
    console.error('Error:', err.message);
  }
}
main();

# Crystal Ball Command Centre

This repository implements the Wave 2 Take-Home Assignment: an "Approvals" assistant integrated into a Next.js App Router application.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set your environment variables:
   Create a `.env.local` file in the root and add your Anthropic API Key:
   ```
   ANTHROPIC_API_KEY=your-api-key-here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` to interact with the dashboard.

4. Run the tests:
   ```bash
   npm run test
   ```

## Architecture & AI Judgment

### AI-Necessary vs. AI-Unnecessary
**AI-Necessary:** The free-form chat ("Talk to me"), teaching a new operator ("Teach me"), and policy QA ("Help me") are inherently dynamic and depend on user input and specific contexts that can't be easily pre-programmed. AI shines here by processing natural language against the queue context and policy document (RAG). The structured summary is also well-suited for AI as it synthesizes and prioritizes complex, unstructured context (the queue).

**AI-Unnecessary:** Replaying a greeting ("Replay Greeting") does not need an LLM. While it can adapt to the queue size, this could easily be a templated string (e.g., `Hello! You have ${queue.length} items to review.`). Using an LLM for simple string interpolation is slow, costly, and unnecessary, but implemented here per the spec. Also, fetching the queue data and determining basic item counts should be handled by standard API queries, not an LLM.

### Fallback Design
Every LLM call is wrapped in a robust fallback mechanism. 
1. **Timeouts**: We use an `AbortController` combined with a `setTimeout` (8 seconds). If the model hangs, the request aborts, catching the `AbortError` and returning a `504` or graceful error message.
2. **Graceful Degradation**: If the API key is missing, rate-limited (429), or errors out, the UI catches it. Instead of breaking the page, it displays a friendly error state: "The AI assistant is temporarily unavailable. Please refer to manual documentation." 

### One Thing I'd Do Differently
With more time, I would implement **optimistic token caching** or a small local vector database (like `pgvector` or even a local SQLite VSS) for the "Help me" RAG feature. Currently, it passes the entire policy into the prompt window. While fine for 400 words, real-world policies are much larger. I'd also add more rigorous component tests covering the exact token-by-token streaming behavior using mocked streams.

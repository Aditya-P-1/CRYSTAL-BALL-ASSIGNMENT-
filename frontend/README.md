# Crystal Ball Command Centre - OomniEye Approvals Widget

## Overview
This is a full-stack, monorepo implementation of the OomniEye "Approvals" assistant, built with Next.js, Node/Express, TypeScript, and flexible AI SDK integrations (supporting Google Gemini, Anthropic, xAI Grok, OpenRouter, and OpenAI).

---

## Setup & Running Locally

This project uses npm workspaces to manage both frontend and backend simultaneously.

1. **Install dependencies** at the root of the project:
   ```bash
   npm install
   ```
2. **Add your Environment Variables**: Create a `.env` file in the root folder:
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   AI_MODEL=gemini-3.5-flash
   AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
   PORT=5000
   ```
   *(The AI Client is provider-agnostic: switch `AI_BASE_URL` and `AI_MODEL` to seamlessly use Anthropic, xAI Grok, OpenRouter, DeepSeek, or OpenAI).*

3. **Start the application**: Run the following command at the root to boot up both the Express API and Next.js frontend concurrently:
   ```bash
   npm run dev
   ```
4. **View the App**: Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### Folder Structure & Monorepo
This project is a true Monorepo:
- **`frontend/`**: Isolated Next.js UI, Zustand state store, React Markdown renderer, auto-expanding textarea, animated typing indicator dots, and component tests.
- **`backend/`**: Node/Express API with strict TypeScript, Zod request/response validation, versioned prompts (`/prompts/*.ts`), policy document RAG engine (`/policy/approval-policy.md`), 8s timeout guard, rate limiter, and integration tests.

### Running Frontend and Backend Separately
If you prefer to run the frontend and backend in separate terminal tabs:

**Terminal 1 (Backend):**
```bash
npm run backend
```
*(Starts Express API on port 5000 using nodemon)*

**Terminal 2 (Frontend):**
```bash
npm run frontend
```
*(Starts Next.js UI on port 3000)*

---

### 🧪 Automated Testing
To run the full test suite across the monorepo (unit tests, Supertest endpoint integration, and Testing Library UI component tests):
```bash
npm test
```
```text
Backend:  3 unit tests passed, 3 integration tests passed (6 total)
Frontend: 4 React Testing Library component tests passed (4 total)
Total:    10/10 tests passing (100% pass rate)
```

---

## AI Judgment & Action Breakdown

As requested in the assignment, here is the rationale for how LLMs are applied to each of the 5 entry points, along with their non-AI fallbacks:

| Action | Needs LLM? | Rationale | Non-AI Fallback |
| :--- | :---: | :--- | :--- |
| **Present me Summary** | **Yes** | Requires dynamic reasoning over the mock JSON queue to interpret which items are urgent (e.g., categorizing PDF safety specs above folders). | A static string: *"You have 4 pending items in your queue."* |
| **Talk to me** | **Yes** | Free-form, multi-turn chat allowing operators to ask nuanced follow-up questions about queue data. | Chat input is disabled, returning a static message: *"Conversational assistant is currently offline."* |
| **Help me** | **Yes** | Requires parsing a specific RAG surface (`policy/approval-policy.md`) to extract relevant operational procedures based on the user's specific query. | Direct link to internal documentation: *"Please consult the [Approval Policy Wiki]."* |
| **Teach me** | **Yes** | Demands an adaptive, pedagogical approach to guide new operators step-by-step, adjusting to their pace and follow-up questions. | A static UI modal with a bulleted onboarding checklist or a tutorial video. |
| **Replay Greeting** | **Optional** | Using an LLM makes it context-aware (e.g., dynamically stating *"Good morning, you have an urgent safety spec pending."*). | A standard, static greeting string: *"Hello, Welcome to Approvals."* |

---

## Technical Architecture, UI & Safety

- **Structured Output**: The `summary` endpoint enforces JSON mode. Output is strictly parsed through a `zod` schema (`SummaryResponseSchema`) on the backend before being relayed to the frontend.
- **Streaming & Real-Time Typing**: Conversational actions (`chat`, `help`, `teach`, `greeting`) utilize SSE (Server-Sent Events) to stream tokens directly into the Zustand UI state. The UI renders Markdown (`react-markdown`) token-by-token alongside animated bouncing typing dots (`...`).
- **UI Enhancements**: Features an auto-expanding input field (`textarea`) for long queries and auto-scrolling (`scrollIntoView`) to keep the latest messages and error states visible.
- **Graceful Failure & Timeout**: The API enforces an `AbortController` timeout of 8s for every AI call. If the LLM stalls or the API key is removed, it degrades cleanly by returning an HTTP 504 Timeout and displaying a user-friendly error message.
- **Rate Limiting**: `express-rate-limit` protects the backend `/api/chat` route (20 requests per 15 minutes per session IP) to prevent API abuse.

---

## What I'd do differently with more time
If given an extra day, I would improve **State Management and Caching**: currently, Zustand holds the session state, but navigating away resets the chat unless persisted. I would implement `React Query` alongside a persistent backend session store (e.g. Redis) so an operator's conversation history is fully recoverable if they refresh the tab or return to a specific approval ticket hours later.

---

## 🤖 AI Tool Usage Statement (Per Wave 2 JD Expectation)

In alignment with the job description's AI-augmented workflow expectation, this assignment was built in direct pair-programming collaboration with AI coding assistants (**Antigravity AI Assistant by Google DeepMind**, **Claude / Anthropic API**, and **Cursor**):

1. **Antigravity AI (Agentic Assistant)**:
   - Acted as the primary pair-programmer to plan, architect, write code, run automated tests, and debug edge cases across both backend and frontend.
   - Built the full-stack monorepo structure (`@oomnieye/backend` and `@oomnieye/frontend`).
   - Implemented server-side SSE token streaming, Zod schema validation, RAG keyword search over policy documentation, rate limiting, and 8s timeout error recovery.
   - Designed the modern UI panel with auto-expanding textarea, bouncing typing dots animation, Markdown renderer, auto-scroll, and error handling.
   - Authored the unit, integration (Supertest), and component (Vitest + Testing Library) test suites.

2. **Claude / Anthropic SDK**:
   - Used for structuring and testing system prompts (`backend/prompts/*.ts`) for summary, conversational chat, policy help, and onboarding guidance.

3. **Gemini / OpenAI Compatible API Endpoint**:
   - Integrated as the backend LLM provider engine (`AI_MODEL=gemini-3.5-flash` with OpenAI-compatible base URL) via provider-agnostic SDK bindings.



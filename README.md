# Crystal Ball Command Centre - OomniEye Approvals Widget

## Overview
This is a full-stack, monorepo implementation of the OomniEye "Approvals" assistant, built with Next.js, Node/Express, and the OpenAI API (GPT-4o). 

## Setup & Running Locally

This project uses npm workspaces to manage both frontend and backend simultaneously. 

1. **Install dependencies** at the root of the project:
   ```bash
   npm install
   ```
2. **Add your API Key**: Create a `.env` file in the root folder and add your OpenAI key:
   ```env
   OPENAI_API_KEY=your_api_key_here
   ```
3. **Start the application**: Run the following command at the root to boot up both the Express API and the Next.js frontend concurrently:
   ```bash
   npm run dev
   ```
4. **View the App**: Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Running Frontend and Backend Separately
If you prefer to run the frontend and backend in separate terminal tabs (for example, to see their logs independently), you can do so easily thanks to npm workspaces.

**Terminal 1 (Backend):**
```bash
npm run dev -w backend
```
*(This will start the Express API on port 3001 using nodemon)*

**Terminal 2 (Frontend):**
```bash
npm run dev -w frontend
```
*(This will start the Next.js UI on port 3000)*

---

5. **Testing**: To run the full test suite (backend integration/unit + frontend component):
   ```bash
   npm run test
   ```

---

## AI Judgment & Action Breakdown

As requested in the assignment, here is the rationale for how LLMs are applied to each of the 5 actions, and what their non-AI fallbacks look like.

| Action | Needs LLM? | Rationale | Non-AI Fallback |
| :--- | :---: | :--- | :--- |
| **Present me Summary** | **Yes** | Requires dynamic reasoning over the mock JSON queue to interpret which items are urgent (e.g., categorizing PDF safety specs above folders). | A static, hard-coded string: *"You have 4 pending items in your queue."* |
| **Talk to me** | **Yes** | It's a free-form, multi-turn chat allowing operators to ask nuanced follow-up questions about queue data. | Chat input is disabled, returning a static message: *"Conversational assistant is currently offline."* |
| **Help me** | **Yes** | Requires parsing a specific RAG surface (`policy/approval-policy.md`) to extract relevant operational procedures based on the user's specific query. | Direct link to the internal documentation: *"Please consult the [Approval Policy Wiki]."* |
| **Teach me** | **Yes** | Demands an adaptive, pedagogical approach to guide new operators step-by-step, adjusting to their pace and follow-up questions. | A static UI modal with a bulleted onboarding checklist or a tutorial video. |
| **Replay Greeting** | **Optional** | While it can be solved with a static string, using an LLM makes it context-aware (e.g., dynamically stating *"Good morning, you have an urgent safety spec pending."*). | A standard, static greeting string: *"Hello, Welcome to Approvals."* |

---

## Technical Architecture & Safety

- **Structured Output**: The `summary` endpoint enforces JSON mode. The LLM response is strictly parsed through a `zod` schema (`SummaryResponseSchema`) on the backend before being relayed to the frontend. The UI never trusts or regex-parses raw text.
- **Streaming**: Standard conversational actions (`chat`, `help`, `teach`) utilize SSE (Server-Sent Events) to stream tokens directly into the Zustand UI state.
- **Graceful Failure**: The API enforces an `AbortController` timeout of 8s for every AI call. If the LLM stalls or the API key is removed, it degrades cleanly. Instead of a 500 error or hanging UI, it returns a 504 Timeout and the UI cleanly displays: *"Failed to reach AI. Please try again."*
- **Rate Limiting**: `express-rate-limit` protects the backend `/api/chat` route (20 requests per 15 minutes per session IP) to prevent API abuse.
- **Testing**: A strict test-first approach was utilized. Tests include mocked OpenAI API classes (Vitest), integration endpoint tests (Supertest), and UI loading/error state component tests (Testing Library).

---

## AI Tool Usage Statement

Per the JD's AI-augmented workflow expectation: this project was built in pair-programming collaboration with an AI coding assistant. The AI was utilized for:
- Accelerating boilerplate generation (Express routing, Next.js UI scaffolds, Vitest config setups).
- Designing the custom SVG/3D illustrations for the UI cards using image generation prompts.
- Refactoring and extracting repetitive UI/CSS chunks to perfectly match the reference UI grid.
- Scaffolding the mock dataset and authoring the 200-word RAG policy markdown file.

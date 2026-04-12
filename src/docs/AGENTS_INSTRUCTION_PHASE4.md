# FaciliOne Phase 4: AI Features — Master Execution Plan

Build all AI-powered features for FaciliOne. The app restructuring (Phases 1-3) is complete — the codebase is clean, all pages/tabs match the target module tree. Now build the AI layer.

Use the appropriate agents for each task. Work in the order specified. One logical change per commit. QA after each major feature.

---

## EXISTING AI INFRASTRUCTURE (already built)

Before building anything, understand what exists:

```
src/lib/ai/client.ts
  - invokeAiText({ feature, systemPrompt, userPrompt, temperature, maxTokens })
    → resolves model from featureModelMap in Firestore systemSettings/ai
  - invokeAiModelText({ modelKey, systemPrompt, userPrompt, temperature, maxTokens })
    → calls specific model by key
  - Both support: chat-completions + responses API styles, api-key + bearer auth

src/lib/ai/runtime-config.ts
  - getAzureOpenAiRuntimeConfig(feature) → resolves from Firestore
  - getAzureOpenAiRuntimeConfigByModelKey(modelKey)
  - Firestore doc: systemSettings/ai
    → endpoint, apiVersion, apiKey, models[], featureModelMap, agents[]

src/lib/ai/historical-comparisons.ts
  - Queries estimates, costReviews, comparisonSnapshots, estimateComparisonForms
  - Scores candidates by type match, scope overlap, budget proximity, recency

Existing API routes:
  - POST /api/ai/portfolio-insights → executive portfolio brief
  - POST /api/ai/cost-estimate → cost estimate recommendation
  - POST /api/ai/weekly-update-draft → weekly project update draft
  - POST /api/ai/historical-comparisons → scored comparable projects
  - POST /api/admin/ai/config → GET/PUT AI configuration
  - POST /api/admin/ai/test → test model connectivity

KB data (already in constants + Firestore):
  - src/constants/sop-data.ts → 5 project types + 4 appendices
  - src/constants/flowchart-data.ts → process flowcharts
  - src/constants/sf-schedule-data.ts → schedule templates
  - Firestore: kb/sops/types/{key}, kb/flowcharts/types/{key}, kb/templates/types/{key}
```

**DO NOT** create alternative AI client functions. All AI calls go through `invokeAiText` or `invokeAiModelText`.

---

## CRITICAL RULES FOR ALL AI FEATURES

1. **Advisory only.** AI never approves, routes, or transacts. Every output is a recommendation or draft for human review.
2. **Cite SOPs.** Every domain-specific answer must reference SOP section + step. No fabrication, no general construction knowledge.
3. **Honest gaps.** If KB/SOP doesn't cover a question, AI says so: "This is not covered in the current SOPs. Please consult your PM lead."
4. **Prompt format.** String arrays joined with `\n`. System prompt = one sentence. User prompt = labeled sections (Context, Data, Rules, Output Format).
5. **JSON output.** Strip markdown fences before parsing. Always try/catch. Define exact shape in prompt.
6. **Temperature.** 0.0–0.15 for JSON/analysis. 0.2–0.3 for drafting. 0.3–0.5 for creative.
7. **Roles.** Only "admin", "cm", "pm" — no "director".

---

## PHASE 4A: FE COPILOT CORE (ai-integration + frontend-builder + data-firestore agents)

Build the copilot infrastructure first, then add features one by one.

### 4A.1 Copilot Session Management (data-firestore agent)

Define types and Firestore structure for copilot sessions:

```typescript
// Types needed:
interface AiSession {
  id: string;
  userId: string;
  title: string;          // auto-generated from first message
  projectId?: string;     // if opened from project context
  projectType?: ProjectType;
  createdAt: string;
  updatedAt: string;
}

interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];   // SOP section references
  timestamp: string;
}
```

- Firestore: `ai-sessions/{sessionId}` + subcollection `messages/{messageId}`
- Security rules: user can read/write own sessions, admin can read all
- Client functions: `createSession()`, `addMessage()`, `getSessionMessages()`, `listUserSessions()`, `deleteSession()`

### 4A.2 Copilot Chat UI — Full Page (frontend-builder agent)

Build `src/app/(app)/fe-copilot/page.tsx` as a full chat interface:

- Left sidebar: session list (new chat button, session history, delete session)
- Main area: message thread with user/assistant bubbles
- Input area: text input + send button, file upload button (for Document Reviewer)
- Streaming display: show assistant response as it arrives (token by token)
- Auto-scroll to latest message
- Session title auto-generated from first user message
- If opened from a project context (via inline panel), pre-populate projectId and show project name in header
- Empty state: welcome message with suggested starter questions (e.g., "What are the steps for a New Store project?", "Am I ready for Phase 3 of my WIW?")
- Mobile-responsive: session sidebar collapses on small screens

### 4A.3 Copilot Streaming API Route (api-backend + ai-integration agents)

Build `src/app/api/ai/copilot/route.ts`:

- Accept: `{ sessionId, message, projectId?, projectType?, history[] }`
- Determine which copilot feature to invoke based on message content (or default to general Q&A)
- For SOP questions: fetch relevant KB content, inject as context
- Stream response back using ReadableStream / Server-Sent Events
- Save both user message and assistant response to Firestore session
- Return citations alongside response content

### 4A.4 Copilot Inline Panel (frontend-builder agent)

Build a slide-in right sidebar panel for project-context copilot:

- Component: `src/components/copilot/inline-panel.tsx`
- Triggered by a floating button or icon on the project detail page
- Auto-injects current project context (project name, type, phase, key dates)
- Shares session management with full-page copilot
- Compact UI: just message thread + input, no session sidebar
- "Open in full page" link that navigates to /fe-copilot with the same session

---

## PHASE 4B: COPILOT FEATURES (ai-integration agent, one feature per commit)

Build each as a focused capability that the copilot routing can invoke. Each gets its own API route.

### 4B.1 SOP Process Q&A (HIGHEST PRIORITY — build first)

Route: `POST /api/ai/copilot/sop-qa`

- Input: `{ question, projectType? }`
- RAG: determine relevant project type from question → fetch matching SOP sections from constants or Firestore KB → inject as system prompt context
- Output: answer with inline citations like "[NS SOP, Phase 2, Step 3]"
- If question spans multiple types, include relevant sections from each
- If not covered: "This is not covered in the current SOPs."

### 4B.2 Next-Action Assistant

Route: `POST /api/ai/copilot/next-actions`

- Input: `{ projectId, projectType, currentPhase, completedSteps[], gateStatus[] }`
- Fetch SOP for the project type → identify what comes next in sequence
- Output JSON: `{ actions: [{ priority: 1-5, action: string, sopRef: string, dueContext: string }] }`
- Sort by priority. Flag any gates that are blocking.

### 4B.3 Communication Drafter

Route: `POST /api/ai/copilot/draft-communication`

- Input: `{ type: "email" | "memo" | "rfi-response" | "status-update", projectData, recipientRole, topic, additionalContext? }`
- Output: fully formatted draft with ALL fields filled from project data. No placeholders like "[INSERT NAME]" — if a field is missing, ask for it before drafting.
- Professional tone matching Kroger FE communication style
- Temperature: 0.25, maxTokens: 800

### 4B.4 Gate Compliance Check

Route: `POST /api/ai/copilot/gate-check`

- Input: `{ projectId, projectType, targetPhase, completedItems[], projectData }`
- Fetch gate requirements from SOP for target phase
- Output JSON: `{ ready: boolean, score: "X/Y", items: [{ requirement: string, status: "pass" | "fail" | "unknown", sopRef: string, note?: string }] }`
- Must reference specific SOP gate criteria — no generic checklists

### 4B.5 Historical Data Search

Route: `POST /api/ai/copilot/historical-search`

This already has infrastructure in `src/lib/ai/historical-comparisons.ts`. Wrap it for the copilot:

- Input: `{ projectType, scopeDescription?, budgetRange?, additionalFilters? }`
- Use existing scoring functions
- Output: comparison table with scored matches, key metrics, and relevance explanation

### 4B.6 Budget Variance Analysis

Route: `POST /api/ai/copilot/budget-analysis`

- Input: `{ projectId, budgetData, costReviewData? }`
- Scan for: variances > 10%, unusual line items, missing categories for project type
- Output: plain-language narrative + structured findings JSON
- Auto-triggered when cost review data is imported (wire this in the import flow)

### 4B.7 Schedule Deviation Alerts

Route: `POST /api/ai/copilot/schedule-deviations`

- Input: `{ projectId, projectType, actualMilestones[], templateMilestones[] }`
- Compare actuals vs SOP/template offsets
- Flag: float consumed, milestones behind, critical path items at risk
- Output JSON: `{ deviations: [{ milestone, expected, actual, daysOff, severity, suggestion }] }`

### 4B.8 Document Reviewer

Route: `POST /api/ai/copilot/document-review`

- Input: `{ documentText, questions[], projectType? }`
- Accept extracted PDF text (client-side extraction or upload to API)
- Answer questions against the document content + KB context
- Cite both document sections and SOP references where applicable

---

## PHASE 4C: FORMS TAB AI FEATURES (ai-integration + parser-import agents)

### 4C.1 AI Auto-Populate for Form Templates

Route: `POST /api/ai/forms/auto-populate`

- Input: `{ templateType: "pre-bid" | "pre-con" | "kickoff" | "weekly-pm" | "jobsite", projectId, projectData }`
- Pre-fill all template fields from project data (name, type, phase, dates, team members, agenda items per SOP)
- Output: populated form JSON matching the template schema
- Temperature: 0.1 (structured output)

### 4C.2 AI Agenda Builder

Route: `POST /api/ai/forms/agenda-builder`

- Input: `{ templateType, projectType, currentPhase, previousMinutes?, customTopics[] }`
- Generate suggested agenda items based on: SOP for current phase + previous meeting carryover items + custom topics
- Output: ordered list of agenda items with time estimates and SOP references

### 4C.3 AI Minutes Generation from Notes

Route: `POST /api/ai/forms/generate-minutes`

- Input: `{ rawNotes: string, templateType, projectData, agendaItems[] }`
- Structure raw PM notes into: agenda items discussed, key decisions, action items (with assignee + due date), follow-up items
- Output: structured minutes JSON matching the form export schema
- Temperature: 0.2

### 4C.4 AI Minutes from Audio Transcription (future — stub only)

Route: `POST /api/ai/forms/transcribe-minutes`

- For now: create the API route stub with types and validation
- Note in the code: "Requires Azure Speech Services or Whisper API integration — not yet configured"
- The extraction/structuring function should be built (parser-import agent) — it takes transcribed text and calls the generate-minutes route

### 4C.5 AI Minutes from Images (future — stub only)

Same as 4C.4 — create stub route, note Azure Computer Vision dependency, build the structuring function that processes OCR output.

---

## PHASE 4D: REPORTS TAB AI FEATURES (ai-integration agent)

### 4D.1 Weekly Status Report (AI-Drafted)

Route already exists: `POST /api/ai/weekly-update-draft`

- Review existing implementation and enhance if needed
- Wire it into the Reports tab UI: button → generate → preview → edit → export
- Add: export as .docx and .pdf (use existing export patterns from Estimator)

### 4D.2 Schedule Status Report (AI-Generated)

Route: `POST /api/ai/reports/schedule-status`

- Input: `{ projectId, projectType, milestones[], phases[], recentChanges[] }`
- Generate narrative schedule status: what's on track, what's behind, upcoming milestones, critical items
- Cite SOP phase/gate references where applicable
- Output: structured report with sections + summary
- Temperature: 0.25, maxTokens: 900

---

## PHASE 4E: DASHBOARD AI (ai-integration agent)

### 4E.1 Auto-Generate Executive Brief

Route already exists: `POST /api/ai/portfolio-insights`

- Review existing implementation
- Wire it to auto-trigger on dashboard load/refresh (not manual button)
- Cache the result in Firestore or local state — don't re-generate on every render
- Add a "Refresh" icon button for manual re-generation
- Brief should include: portfolio health summary, at-risk projects, upcoming milestones, budget status across portfolio

---

## PHASE 4F: FEATURE-MODEL MAPPING

After all features are built, update the `featureModelMap` in Firestore `systemSettings/ai`:

```
Feature Key                  → Suggested Model
sop-qa                       → gpt-4o (needs deep reasoning)
next-actions                 → gpt-4o-mini (structured output)
draft-communication          → gpt-4o (quality writing)
gate-check                   → gpt-4o-mini (structured checklist)
historical-search            → gpt-4o-mini (scoring)
budget-analysis              → gpt-4o (complex analysis)
schedule-deviations          → gpt-4o-mini (comparison)
document-review              → gpt-4o (comprehension)
forms-auto-populate          → gpt-4o-mini (structured fill)
forms-agenda-builder         → gpt-4o-mini (list generation)
forms-generate-minutes       → gpt-4o (structuring prose)
reports-schedule-status      → gpt-4o (narrative generation)
portfolio-insights           → gpt-4o (executive summary)
cost-estimate                → gpt-4o (already mapped)
weekly-update-draft          → gpt-4o (already mapped)
historical-comparisons       → gpt-4o-mini (already mapped)
```

Build an admin UI update or migration script to add these mappings.

---

## EXECUTION ORDER

```
4A.1  Session management types + Firestore       (data-firestore)
4A.2  Copilot chat UI — full page                 (frontend-builder)
4A.3  Copilot streaming API route                 (api-backend + ai-integration)
4A.4  Copilot inline panel                        (frontend-builder)
      → QA PASS
4B.1  SOP Process Q&A                             (ai-integration)
4B.2  Next-Action Assistant                       (ai-integration)
4B.3  Communication Drafter                       (ai-integration)
4B.4  Gate Compliance Check                       (ai-integration)
      → QA PASS
4B.5  Historical Data Search                      (ai-integration)
4B.6  Budget Variance Analysis                    (ai-integration)
4B.7  Schedule Deviation Alerts                   (ai-integration)
4B.8  Document Reviewer                           (ai-integration)
      → QA PASS
4C.1  Forms AI auto-populate                      (ai-integration)
4C.2  Forms AI agenda builder                     (ai-integration)
4C.3  Forms AI minutes from notes                 (ai-integration + parser-import)
4C.4  Forms AI minutes from audio (stub)          (ai-integration)
4C.5  Forms AI minutes from images (stub)         (ai-integration)
      → QA PASS
4D.1  Weekly status report enhancement            (ai-integration + frontend-builder)
4D.2  Schedule status report                      (ai-integration + frontend-builder)
4E.1  Dashboard auto-generate brief               (ai-integration + frontend-builder)
      → QA PASS
4F    Feature-model mapping update                (data-firestore)
      → FINAL QA PASS
```

---

## EXECUTION RULES

1. **One feature per commit.** Each API route + its tests/types = one commit.
2. **QA after every 4 features.** Run qa-review agent to check types, imports, route patterns.
3. **All prompts use string arrays joined with \n.** No template literal abuse.
4. **Every AI route follows the established pattern** from existing routes in src/app/api/ai/.
5. **No new AI client functions.** Use `invokeAiText` or `invokeAiModelText` only.
6. **Every domain answer cites SOPs.** No exceptions.
7. **If KB doesn't cover it, say so.** Never fabricate.
8. **Review every diff before committing.**
9. **If something is ambiguous, stop and ask.** Don't guess.
# MAP: FE Copilot

Scan date: 2026-04-11

---

## Module Tree

```
src/app/(app)/fe-copilot/page.tsx           Full-page copilot chat
src/components/copilot/inline-panel.tsx      Project-context inline panel (used in project detail)
src/lib/firebase/ai-sessions.ts             Session + message CRUD
src/app/api/ai/copilot/
├── route.ts                                Main chat endpoint (SSE streaming)
├── sop-qa/route.ts                         SOP Q&A
├── next-actions/route.ts                   Next actions advisor
├── draft-communication/route.ts            Draft communication
├── gate-check/route.ts                     Gate readiness check
├── historical-search/route.ts              Historical project search
├── budget-analysis/route.ts                Budget analysis
├── schedule-deviations/route.ts            Schedule deviation analysis
└── document-review/route.ts                Document review
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /fe-copilot | src/app/(app)/fe-copilot/page.tsx | Client | Yes | admin, cm, pm |

## Components

| File | Used By | Props | Client/Server |
|---|---|---|---|
| src/components/copilot/inline-panel.tsx | projects/[id]/page.tsx | projectId, projectName, projectType, currentPhase?, onClose | Client |

## API Routes

| Method | Endpoint | Auth | Feature Key | Called By |
|---|---|---|---|---|
| POST | /api/ai/copilot | requireAppUser | sop-qa (auto-detected) | fe-copilot/page.tsx, inline-panel.tsx |
| POST | /api/ai/copilot/sop-qa | requireAppUser | sop-qa | Copilot sub-features |
| POST | /api/ai/copilot/next-actions | requireAppUser | next-actions | Copilot sub-features |
| POST | /api/ai/copilot/draft-communication | requireAppUser | draft-communication | Copilot sub-features |
| POST | /api/ai/copilot/gate-check | requireAppUser | gate-check | Copilot sub-features |
| POST | /api/ai/copilot/historical-search | requireAppUser | historical-search | Copilot sub-features |
| POST | /api/ai/copilot/budget-analysis | requireAppUser | budget-analysis | Copilot sub-features |
| POST | /api/ai/copilot/schedule-deviations | requireAppUser | schedule-deviations | Copilot sub-features |
| POST | /api/ai/copilot/document-review | requireAppUser | document-review | Copilot sub-features |

## Firestore Collections

| Collection Path | Operation | Purpose |
|---|---|---|
| ai-sessions | createSession(), listUserSessions(), deleteSession(), updateSessionTitle() | Session management |
| ai-sessions/{sid}/messages | addMessage(), getSessionMessages() | Message persistence |

## Key Features

1. **Session Sidebar**: List of past chats, create new, delete existing
2. **Streaming Responses**: SSE-based streaming from /api/ai/copilot
3. **SOP Grounding**: Main copilot route detects project type from message content, injects relevant SOP context
4. **Citations**: Assistant responses can include SOP phase citations
5. **Starter Questions**: 4 pre-defined starter prompts for new users
6. **Inline Panel**: Project-scoped version embedded in project detail page (floating button)
7. **History**: Last 10 messages sent as context with each new message

## Main Copilot Route Logic

The main /api/ai/copilot route:
- Detects project types mentioned in user message (NS, ER, WIW, FC, MC)
- Injects relevant SOP phases as system context
- Streams response using SSE (Server-Sent Events)
- Supports `data: [DONE]` termination signal
- Sends both text chunks and citation metadata

## Dependencies

- Imports from: @/lib/firebase/auth-context, @/lib/firebase/ai-sessions, @/lib/utils, @/lib/ai/client, @/lib/ai/runtime-config, @/constants/sop-data, @/types
- External: lucide-react, sonner

## Status

Fully implemented. All 8 copilot sub-feature routes are operational.

## Discrepancies Found

- The copilot sub-feature routes (sop-qa, next-actions, etc.) are defined but the FE Copilot page only calls the main /api/ai/copilot route. The sub-routes appear to be designed for direct invocation (e.g., from inline panel or future structured UI) but are not currently called from any client code.

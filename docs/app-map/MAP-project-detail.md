# MAP: Project Detail

Scan date: 2026-04-11

---

## Module Tree

```
src/app/(app)/projects/[id]/page.tsx
src/components/
├── schedule/
│   ├── gantt-chart.tsx
│   └── sf-schedule-panel.tsx
├── forms/
│   └── project-forms-tab.tsx
├── tasks/
│   └── task-kanban-board.tsx
├── reports/
│   ├── ipecc-builder.tsx
│   ├── ai-weekly-status.tsx
│   └── ai-schedule-status.tsx
└── copilot/
    └── inline-panel.tsx
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /projects/[id] | src/app/(app)/projects/[id]/page.tsx | Client | Yes | admin, cm, pm (Firestore rules enforce PM/CM ownership) |

## Tabs

| Tab | Value | Component(s) | Status |
|---|---|---|---|
| Schedule | schedule | GanttChart, SfSchedulePanel | Fully implemented |
| Budget | budget | Inline cards linking to Estimator + Cost Review placeholder | Partial (Cost Review "Coming Soon") |
| Forms | forms | ProjectFormsTab | Fully implemented (5 meeting types, AI auto-populate/agenda/minutes) |
| Tasks | tasks | TaskKanbanBoard | Fully implemented (derived from phases) |
| Reports | reports | IpeccBuilder, AiWeeklyStatus, AiScheduleStatus | Partially implemented (IPECC is stub) |

## Components

| File | Used By | Props | Client/Server |
|---|---|---|---|
| src/components/schedule/gantt-chart.tsx | projects/[id]/page.tsx | phases, grandOpeningDate, onUpdateMilestone | Client |
| src/components/schedule/sf-schedule-panel.tsx | projects/[id]/page.tsx | projectType, grandOpeningDate, savedState, onUpdate | Client |
| src/components/forms/project-forms-tab.tsx | projects/[id]/page.tsx | projectId, projectName | Client |
| src/components/tasks/task-kanban-board.tsx | projects/[id]/page.tsx | phases, projectId | Client |
| src/components/reports/ipecc-builder.tsx | projects/[id]/page.tsx | projectId?, projectLabel? | Client |
| src/components/reports/ai-weekly-status.tsx | projects/[id]/page.tsx | project, phases | Client |
| src/components/reports/ai-schedule-status.tsx | projects/[id]/page.tsx | project, phases | Client |
| src/components/copilot/inline-panel.tsx | projects/[id]/page.tsx | projectId, projectName, projectType, currentPhase?, onClose | Client |

## API Routes Called

| Method | Endpoint | Called By |
|---|---|---|
| POST | /api/ai/weekly-update-draft | AiWeeklyStatus |
| POST | /api/ai/reports/schedule-status | AiScheduleStatus |
| POST | /api/ai/forms/auto-populate | ProjectFormsTab |
| POST | /api/ai/forms/agenda-builder | ProjectFormsTab |
| POST | /api/ai/forms/generate-minutes | ProjectFormsTab |
| POST | /api/ai/forms/image-minutes | ProjectFormsTab |
| POST | /api/ai/forms/transcribe-minutes | ProjectFormsTab |
| POST | /api/ai/copilot | CopilotInlinePanel |

## Firestore Collections

| Collection Path | Operation | Purpose |
|---|---|---|
| projects/{id} | getProject() (one-time) | Load project data |
| projects/{id} | updateProject() | Save sfSchedule and grandOpeningDate changes |
| projects/{id}/phases | subscribeToPhases() (real-time) | Load and track phase changes |
| projects/{id}/phases/{phaseId} | updateMilestoneDate() | Update milestone completion |
| ai-sessions | createSession(), addMessage() | CopilotInlinePanel chat |

## Copilot Inline Panel

- Floating button in bottom-right corner opens a side panel
- Project-scoped: sends projectId, projectType, currentPhase as context
- Links to full FE Copilot page via /fe-copilot
- Uses /api/ai/copilot endpoint with SSE streaming

## Dependencies

- Imports from: @/lib/firebase/firestore, @/lib/firebase/ai-sessions, @/lib/utils, @/lib/schedule/sf-schedule, @/constants/sf-schedule-data, @/types, @/components/ui/*, @/components/schedule/*, @/components/forms/*, @/components/tasks/*, @/components/reports/*, @/components/copilot/*
- External: lucide-react, next/navigation, next/link, sonner

## Status

Fully implemented. Cost Review button is a "Coming Soon" stub. IPECC Builder accepts file uploads but is largely a stub.

## Discrepancies Found

None.

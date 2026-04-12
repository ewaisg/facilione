# MAP: Dashboard

Scan date: 2026-04-11

---

## Module Tree

```
src/app/(app)/dashboard/page.tsx
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /dashboard | src/app/(app)/dashboard/page.tsx | Client | Yes | admin, cm, pm |

## Components

The dashboard page is a single self-contained page component with inline subcomponents:
- `StatCard` — KPI card (label, value, sub, icon, accent)
- `getGreeting()` — Time-of-day greeting helper

## API Routes Called

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/ai/portfolio-insights | AI portfolio executive brief (auto-generated on load) |

## Firestore Collections

| Collection Path | Operation | Purpose |
|---|---|---|
| projects | subscribeToProjects() (real-time) | Load all projects for user's role |
| projects/{pid}/weeklyUpdates | getLatestProjectWeeklyUpdate() | Fetch latest weekly update per project |

## Key Features

1. **KPI Cards**: Active Projects, Total Budget, GO Due in 14 Days, At-Risk Projects
2. **Portfolio Action Center**: 3 alert items (GO overdue, Schedule milestones overdue, Weekly updates stale)
3. **AI Portfolio Intelligence**: Auto-generates executive brief via /api/ai/portfolio-insights on data load
4. **Visual Analytics**: 3 placeholder "Coming soon" chart cards (Budget by Type, Schedule Trend, Health Heat Map)
5. **Portfolio Summary**: Breakdown by status (Active/Planning/Completed) and by type (NS/ER/WIW/FC/MC/F&D)
6. **Schedule Health**: Overall health percentage, green/yellow/red breakdown, overdue milestones count

## Dependencies

- Imports from: @/lib/firebase/auth-context, @/lib/firebase/firestore, @/lib/utils, @/types, @/components/ui/*
- External: lucide-react, next/link, sonner (not directly used but parent has Toaster)

## Status

Fully implemented. Charts are placeholders.

## Discrepancies Found

None.

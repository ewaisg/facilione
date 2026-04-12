# MAP: Projects List

Scan date: 2026-04-11

---

## Module Tree

```
src/app/(app)/projects/page.tsx
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /projects | src/app/(app)/projects/page.tsx | Client | Yes | admin, cm, pm |

## Components

Self-contained page with inline helper:
- `getScheduleProgress(project)` — Extracts schedule progress from project.sfSchedule field

## Firestore Collections

| Collection Path | Operation | Purpose |
|---|---|---|
| projects | subscribeToProjects() (real-time) | Load all projects for user's role |

## Key Features

1. **Search**: Text search on storeNumber, storeName, projectType
2. **Type Filter**: All, NS, ER, WIW, FC, MC (F&D not shown in filter buttons)
3. **Timing Filter**: All Timing, Overdue GO, GO Due within 14 days (supports ?timing=overdue URL param)
4. **Project Cards**: Each card shows type badge, health status, store name, schedule progress bar, milestones done/total, overdue count, next milestone, budget, GO date
5. **Create Link**: Links to /admin?tab=projects

## Dependencies

- Imports from: @/lib/firebase/auth-context, @/lib/firebase/firestore, @/lib/utils, @/constants/project-types, @/types, @/components/ui/*
- External: lucide-react, next/link, next/navigation

## Status

Fully implemented.

## Discrepancies Found

- F&D type is not included in the ALL_TYPES filter button array (only "All", "NS", "ER", "WIW", "FC", "MC"). F&D projects would only be visible under "All" filter.

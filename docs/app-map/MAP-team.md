# MAP: Team

Scan date: 2026-04-11

---

## Module Tree

```
src/app/(app)/team/page.tsx
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /team | src/app/(app)/team/page.tsx | Client | Yes | admin, cm, pm |

## API Routes Called

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/admin/users/list | Load all team members |

## Firestore Collections

| Collection Path | Operation | Purpose |
|---|---|---|
| projects | subscribeToProjects() (real-time) | Build user-to-project assignment map |

## Key Features

1. **Quick Stats**: Team Members, Project Managers, Construction Managers, Active Projects
2. **Team Directory**: Searchable/filterable list of all users
3. **Search**: By name or email
4. **Role Filter**: All, Admin, Construction Manager, Project Manager
5. **Expandable Cards**: Click to show assigned projects per member
6. **Overview Analysis**: 3 placeholder "Coming Soon" cards (Projects per PM, Schedule Health by PM, Workload Trends)

## Dependencies

- Imports from: @/lib/firebase/auth-context, @/lib/firebase/firestore, @/lib/utils, @/types, @/components/ui/*
- External: lucide-react, next/link, sonner

## Status

Fully implemented. Analytics section is placeholders.

## Discrepancies Found

None.

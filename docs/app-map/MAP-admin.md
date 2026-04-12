# MAP: Admin

Scan date: 2026-04-11

---

## Module Tree

```
src/app/(app)/admin/page.tsx
src/app/api/admin/
├── users/
│   ├── route.ts                            POST — Create user
│   ├── list/route.ts                       GET  — List users
│   └── [uid]/route.ts                      PATCH/DELETE — Update/delete user
├── projects/
│   ├── create/route.ts                     POST — Create project
│   ├── list/route.ts                       GET  — List projects
│   └── [id]/route.ts                       PATCH — Update project
├── ai/
│   ├── config/route.ts                     GET/PUT — AI config
│   ├── test/route.ts                       POST — Test model
│   ├── seed-feature-map/route.ts           POST — Seed feature map
│   ├── comparison-snapshots/import/route.ts POST — Import comparison XLSX
│   └── estimate-comparison-forms/import/route.ts POST — Import comparison form XLSX
└── parsing/
    └── apply/route.ts                      POST — Apply parsed data to project
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /admin | src/app/(app)/admin/page.tsx | Client | Yes | admin only (enforced by canAccessPath) |

## Tabs

| Tab | Content | Status |
|---|---|---|
| Users | User CRUD: create (email+role+orgId), edit role/name, delete, temp password display | Fully implemented |
| Projects | Project CRUD: create with seeded phases, edit fields, delete, SF import (overview/schedule/files-reports parsing). Also renders `EstimateLoaderTab` — loads saved estimates by project ID via `GET /api/admin/estimates` and links to estimator page. | Fully implemented |
| AI Setup | Model config, feature-model mapping, agent config, test connectivity, import comparison snapshots | Fully implemented |

## API Routes

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/admin/users | None in code (should be admin) | Create user with Firebase Auth + Firestore doc |
| GET | /api/admin/users/list | None in code | List all users |
| PATCH | /api/admin/users/[uid] | None in code | Update user role/displayName |
| DELETE | /api/admin/users/[uid] | None in code | Delete user (Auth + Firestore) |
| POST | /api/admin/projects/create | requireRoles(["admin","cm","pm"]) | Create project with optional phase seeding |
| GET | /api/admin/projects/list | None in code | List all projects |
| PATCH | /api/admin/projects/[id] | None in code | Update allowed project fields |
| GET/PUT | /api/admin/ai/config | requireRoles(["admin"]) | Read/write AI settings |
| POST | /api/admin/ai/test | requireRoles(["admin"]) | Test model connectivity |
| POST | /api/admin/ai/seed-feature-map | requireRoles(["admin"]) | Seed default feature-model map |
| POST | /api/admin/ai/comparison-snapshots/import | requireRoles(["admin","cm","pm"]) | Import comparison snapshot XLSX |
| POST | /api/admin/ai/estimate-comparison-forms/import | requireRoles(["admin","cm","pm"]) | Import estimate comparison form XLSX |
| POST | /api/admin/parsing/apply | None in code | Apply parsed SiteFolio data to project |

## Firestore Collections

| Collection Path | Operation | Purpose |
|---|---|---|
| users | CRUD via adminDb | User management |
| projects | CRUD via adminDb | Project management |
| projects/{pid}/phases | batch write | Phase seeding on project creation |
| projects/{pid}/weeklyUpdates | write | Weekly comment from overview import |
| systemSettings/ai | read/write | AI configuration |
| comparisonSnapshots | write | Store imported comparison data |
| estimateComparisonForms | write | Store imported comparison form data |
| imports | write | Log import operations |

## Role-Based Access

| Action | admin | cm | pm |
|---|---|---|---|
| Access /admin page | Yes | No | No |
| Create user | Yes (page-level guard) | No | No |
| Create project | Yes | Yes (API) | Yes (API) |
| Manage AI config | Yes | No | No |
| Import comparison data | Yes | Yes (API) | Yes (API) |

## Dependencies

- Imports from: @/lib/utils, @/constants/project-types, @/types, @/components/ui/*
- External: lucide-react, next/link, next/navigation, sonner

## Status

Fully implemented. All three tabs are functional.

## Discrepancies Found

- Several admin API routes lack auth middleware: /api/admin/users (POST), /api/admin/users/list (GET), /api/admin/users/[uid] (PATCH/DELETE), /api/admin/projects/list (GET), /api/admin/projects/[id] (PATCH), /api/admin/parsing/apply (POST). These routes can be accessed by any authenticated user, not just admins.
- The admin page is guarded client-side by canAccessPath (admin-only), but the underlying API routes are not consistently protected server-side.
- `EstimateLoaderTab` (rendered inside the Projects tab) calls `GET /api/admin/estimates?projectId=...` but this API route does not exist. The fetch will always return 404. See DISCREPANCIES.md M-03.

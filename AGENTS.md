# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

FaciliOne is a web-first, AI-powered PM command center for Facility Engineering Project Managers and Construction Managers. It consolidates project planning, scheduling, budgeting, document management, and AI-assisted tools into a single platform. It works alongside Oracle, Coupa, and SiteFolio — it does not replace them.

**Target users:** Kroger/King Soopers Facility Engineering PMs and CMs (Mid-Central division).

Key reference docs:
- Full product blueprint: `src/docs/FaciliOne_Blueprint.md` (v3.3)
- Build plan + phases: `docs/architecture/BUILD-PLAN.md`
- Module/route tree (planned): `docs/architecture/APP-MODULE-TREE.md`
- Feature requirements: `docs/architecture/APP-BRAINSTORM-SCRATCHPAD.md`
- SiteFolio data inventory: `docs/architecture/MASTER-DATA-INVENTORY.md`
- Live codebase map: `docs/app-map/MASTER-TREE.md`
- Current status: `docs/app-map/STATUS.md`
- Known issues: `docs/app-map/DISCREPANCIES.md`

---

## Tech Stack

- **Framework:** Next.js 15 (App Router) with React 19, TypeScript, Tailwind CSS v4
- **Backend/DB:** Firebase (Firestore, Auth, Storage) — Firebase Admin SDK for API routes
- **UI:** Radix UI primitives + shadcn/ui pattern (`src/components/ui/`), Lucide icons
- **AI:** OpenAI-compatible client (`src/lib/ai/client.ts`) with runtime config resolution from Firestore `systemSettings/ai`
- **Other:** ExcelJS/XLSX (SheetJS) for spreadsheet I/O, Mermaid for flowcharts, Zod for validation, react-hook-form, Playwright for SiteFolio SSO auth

---

## Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
npm run format       # Prettier format all src files
npm run format:check # Prettier check without writing
```

No test framework is configured.

---

## Architecture

### Route Groups

- `src/app/(app)/` — Authenticated app shell (sidebar + topbar layout). All main pages live here.
- `src/app/(auth)/` — Login and forgot-password pages (no app shell).
- `src/app/api/` — Next.js API routes for admin operations, AI endpoints, SiteFolio proxy, seeding, and health checks.

### Auth & Access Control

- Firebase email/password auth only — no self-signup, admin creates users.
- `AuthProvider` (`src/lib/firebase/auth-context.tsx`) wraps the app, provides `useAuth()` hook returning `AppUser`.
- Three roles: `admin`, `cm` (Construction Manager), `pm` (Project Manager).
- Client-side route guarding in `src/app/(app)/layout.tsx` via `canAccessPath()` from `src/lib/access-control.ts`.
- API routes authenticate via `__session` cookie using Firebase Admin (`src/lib/firebase-admin/request-auth.ts`).

### Current Page / Route Structure (Actual)

```
src/app/
├── page.tsx                        → redirect to /dashboard
├── (auth)/
│   ├── login/page.tsx
│   └── forgot-password/page.tsx
└── (app)/
    ├── dashboard/page.tsx          KPIs, AI portfolio brief, project health table
    ├── projects/
    │   ├── page.tsx                Project list (role-filtered, real-time Firestore)
    │   └── [id]/page.tsx           Project detail (5 tabs: Schedule, Budget, Forms, Tasks, Reports)
    ├── team/page.tsx               Team directory (users, project assignments, workload)
    ├── tasks/page.tsx              Cross-project task hub (kanban + table views)
    ├── fe-copilot/page.tsx         FE Copilot full-page chat (streaming, SOP-grounded)
    ├── smart-tools/
    │   ├── page.tsx                Smart Tools index (Estimator live, others planned)
    │   └── estimator/page.tsx      Cost Estimator (presets, CSV/XLSX import, AI analysis)
    ├── resources/
    │   ├── page.tsx                Resources hub
    │   ├── sops/page.tsx           SOP Quick Reference (5 project types + 4 appendices)
    │   └── flowcharts/page.tsx     Project Flowcharts (Mermaid, pan/zoom, 5 types)
    ├── admin/page.tsx              Admin panel (Users, Projects, AI Setup tabs)
    └── profile/page.tsx            User profile (account info, change password)
```

**Sidebar navigation (actual):** Dashboard, Projects, Team, Tasks, FE Copilot, Smart Tools, Resources, Admin (admin-only), Profile (bottom).

**Planned navigation (not yet built):** Reports module (`/reports`), Settings module (`/settings`), Project Comparison (`/projects/compare`), Portfolio Timeline (`/projects/timeline`).

### Key Directories

- `src/lib/firebase/` — Client-side Firebase (auth, Firestore, storage helpers)
- `src/lib/firebase-admin/` — Server-side Firebase Admin SDK
- `src/lib/schedule/` — Schedule/Gantt logic, SiteFolio import parsers, template engine
- `src/lib/ai/` — AI client, runtime config, comparison/historical analysis
- `src/lib/sitefolio/` — SiteFolio sync engine, parsers (overview, schedule, projects list), session store
- `src/types/` — All TypeScript types (barrel-exported from `src/types/index.ts`)
- `src/constants/` — Domain data: project types, SOP content, Oracle report definitions, estimate presets, schedule data
- `src/components/ui/` — Reusable shadcn/ui components
- `src/components/layout/` — Sidebar and topbar
- `src/components/copilot/` — Inline copilot panel (used in project detail)
- `src/components/schedule/` — Gantt chart, SF schedule panel
- `src/components/tasks/` — Kanban board, task table, next-steps list
- `src/components/reports/` — IPECC builder stub, AI weekly/schedule status
- `src/components/forms/` — Meeting form templates (Pre-Bid, Pre-Con, Kickoff, etc.)
- `src/components/sitefolio/` — SF overview panel, SF synced schedule display

### Firestore Collections

Key collections: `users`, `organizations`, `projects` (with subcollections: `phases`, `weeklyUpdates`), `estimates`, `costReviews`, `costReviewImports`, `costReviewInputs`, `costReviewSettings`, `kb` (SOPs, flowcharts, templates), `ai-sessions` (with `messages` subcollection), `notifications`, `imports`, `userPreferences`, `customization`, `systemSettings`, `comparisonSnapshots`, `estimateComparisonForms`, `sitefolio_sessions`.

Security rules are in `firestore.rules`. Composite indexes in `firestore.indexes.json`.

### Project Types

Seven types: NS (New Store), ER (Existing Remodel), WIW (Walk-In Walk-Out), FC (Fixture Changeout), MC (Maintenance/Capital), F&D (Floor & Decor), MR (Minor Remodel). Defined in `src/constants/project-types.ts`.

### AI Features (17 total)

All feature keys, routes, and model assignments are in `docs/app-map/MASTER-TREE.md`. Runtime model config is resolved from `systemSettings/ai` in Firestore. Default model: `gpt-4o`. Feature routing via `src/lib/ai/runtime-config.ts`.

Key AI routes:
- `/api/ai/copilot/` — Main chat + 8 sub-feature routes (sop-qa, next-actions, draft-communication, gate-check, historical-search, budget-analysis, schedule-deviations, document-review)
- `/api/ai/forms/` — auto-populate, agenda-builder, generate-minutes (+ 2 stubs)
- `/api/ai/tasks/` — extract, suggest-next-steps
- `/api/ai/` — portfolio-insights, cost-estimate, weekly-update-draft, historical-comparisons, reports/schedule-status

### SiteFolio Integration

SiteFolio is Kroger's project management platform (sitefolio.net). FaciliOne integrates with it to sync project data.

- Auth: Playwright SSO flow → cookies stored in Firestore `sitefolio_sessions/current`
- All SiteFolio calls are server-side via `/api/sitefolio/` proxy routes — client never sees cookies
- Sync engine: `src/lib/sitefolio/sync.ts` — full or single-project sync
- Parsers: `src/lib/sitefolio/parsers/` (overview, schedule, projects-list)
- Admin sync routes: `/api/sitefolio/sync/`, `/api/sitefolio/import/`, `/api/sitefolio/auth/`
- SiteFolio constants: Enterprise ID=8252, Team ID=1077, Member ID=83709 (Gheiath Ewais)

---

## Conventions

- Path alias: `@/` maps to `src/`
- Formatting: Prettier configured in `.prettierrc`
- ESLint: unused vars prefixed with `_` are allowed
- UI toast notifications use `sonner` (`toast()` from `"sonner"`)
- Deployment target: Vercel (facilione.vercel.app)
- Firebase project: `facilione` (see `.firebaserc`)
- All SiteFolio API calls are server-side only; client never calls SiteFolio directly

---

## Current Build Status (as of 2026-05-03)

### Built and Working ✅
- Auth flow (login, forgot password, session middleware, role-based access)
- App shell (sidebar, topbar, responsive layout)
- Dashboard (KPIs, AI portfolio brief — charts are placeholders)
- Projects list (role-filtered, real-time Firestore subscription)
- Project detail (5 tabs: Schedule, Budget stub, Forms, Tasks, Reports)
- Gantt chart + SiteFolio schedule panel
- Smart Tools: Estimator (full — presets, import, AI analysis, export)
- Resources: SOPs + Flowcharts (full content, search, Mermaid rendering)
- Admin panel (Users CRUD, Projects CRUD, AI Setup)
- FE Copilot (full-page chat, streaming, SOP-grounded, session history)
- Tasks hub (cross-project, kanban + table, AI extraction + next steps)
- SiteFolio sync engine (full + single-project, import preview)
- All 17 AI feature API routes (backend built, not all wired to UI)

### Partially Built / Placeholder ⚠️
- Dashboard charts — "Coming soon" placeholders (Budget by Type, Schedule Trend, Heat Map)
- Project detail Budget tab — Estimator link exists; Cost Review button disabled/stub
- Project detail overview/SiteFolio data tabs — only Schedule pulls SF data
- Team page — overview analysis cards are stubs
- Resources — Forms & Templates section is "Coming Soon"
- Smart Tools — Bid Comparison is a placeholder card
- IPECC Builder — upload stub only, no processing logic
- FE Copilot — 8 sub-feature routes built but not individually wired from UI

### Not Yet Built ❌
From `docs/architecture/BUILD-PLAN.md`:
- **Reports module** (`/reports`) — Division Status, Data Completeness, SiteFolio Reports, Custom Reports
- **Settings module** (`/settings`) — Profile settings, SiteFolio connection, data sync, preferences, AI settings
- **Project detail tabs**: Overview (SF data), Bidding, Contracts, Requests, Documents, Team, Photos
- **Portfolio views**: Project comparison (`/projects/compare`), Portfolio timeline (`/projects/timeline`)
- **Phase 2 PM modules**: Budget tracker, Document upload, Meetings module, Calendar
- **Phase 3 FE modules**: Sequence Tracker, SWPPP Tracker, SPG Gate Tracker, CA Log, PO Reference Tool
- **Smart Tools ST-02 through ST-13** (only ST-01 Estimator is built)
- **Phase 5 Analytics**: Portfolio analytics, budget vs actual, schedule health charts
- **Phase 6**: Customization, automation (Cloud Functions), notification center, PWA/mobile

---

## Known Issues (Priority Order)

1. **Broken endpoint** — Admin page calls `GET /api/admin/estimates` which doesn't exist (404)
2. **Missing auth on 15 API routes** — Admin and AI routes under `/api/admin/*` and some `/api/ai/*` lack `requireRoles()`; see `docs/app-map/DISCREPANCIES.md` section 2 (A-01 through A-15)
3. **Copilot sub-features not wired** — 8 routes built at `/api/ai/copilot/*` but not called individually from the UI (main route handles all)
4. **KB data duplication** — SOP/flowchart/template data exists in constants (read by pages) AND seeded to Firestore (nothing reads it from there)
5. **Project detail tabs missing** — Planned tabs (Bidding, Contracts, Requests, Documents, Team, Photos) not built; current tabs are PM workflow-focused (Schedule, Budget, Forms, Tasks, Reports)

Pending manual tasks:
- Seed data via `POST /api/seed-sops`, `POST /api/seed-flowcharts`, `POST /api/seed-templates`
- Deploy Firestore security rules for `estimates` and `userPreferences`
- Create Firestore composite indexes for estimates (userId + updatedAt DESC)

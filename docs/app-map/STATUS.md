# FaciliOne — Current Implementation Status

**As of:** 2026-05-03
**Blueprint version:** v3.3 (last updated 2026-03-27)
**Codebase last scan:** 2026-05-03

---

## Executive Summary

FaciliOne has completed Phase 1, Phase 1.5, and the Phase 1→3 restructuring (cleanup + rebuild) from AGENTS_INSTRUCTIONS_ph1to3.md. Phase 4 AI features are **partially implemented** — all API routes and backend logic exist, but most are not wired to the frontend UI. Additionally, a **SiteFolio sync engine** and **Tasks hub** have been added that go beyond Blueprint v3.3.

---

## What Is Fully Built and Working

### Auth & Access Control ✅
- Firebase email/password login + forgot password
- Role-based access: `admin | cm | pm` (director role removed)
- Session cookie middleware, `canAccessPath()`, `requireRoles()`
- Admin user creation (Firebase Admin SDK → temp password flow)

### Project Management ✅
- Project list page (role-filtered, real-time Firestore subscription)
- Project detail page with 5 tabs: **Schedule, Budget, Forms, Tasks, Reports**
- SiteFolio Schedule Panel (auto-calc from GO date, weeks-to-open + day-offset models)
- Gantt chart component (phase-based, milestone editing)
- Schedule template seeding from XLS → JSON → Firestore (all 5 types + F&D alias)

### Smart Tools ✅ (partial)
- **ST-01 Estimator** — fully deployed (presets, CSV/XLSX import, ExcelJS export, Firestore save/load, AI cost estimate)
- **ST-02 Bid Comparison** — placeholder only (not built)

### Resources & KB ✅
- SOP Quick Reference — full content, all 5 project types + 4 appendices, cross-search
- Project Flowcharts — Mermaid rendering with pan/zoom, 5 flow types
- Resources hub page (cards + links)

### Admin Panel ✅
- **Users tab** — Create, list, edit, delete (Firebase Admin SDK)
- **Projects tab** — Create, list, edit, bulk-delete
- **AI Setup tab** — Model config, feature-model mapping, agent registry, connectivity test

### Profile ✅
- Profile info display, change password, sign out
- Located at bottom of sidebar as user identity block

### FE Copilot ✅ (infrastructure only, not all features wired)
- Full-page chat UI with session history (fe-copilot page)
- Inline panel component for project context
- Main streaming API route (`/api/ai/copilot`) operational
- AI session + message Firestore CRUD

### AI Backend Routes ✅ (built but not all wired to UI)
All 17 AI feature routes exist and have implementations:
- All 8 copilot sub-features (sop-qa, next-actions, draft-communication, gate-check, historical-search, budget-analysis, schedule-deviations, document-review)
- All 3 forms AI routes (auto-populate, agenda-builder, generate-minutes)
- 2 stub routes (image-minutes, transcribe-minutes — stubs, not implemented)
- Reports: schedule-status, weekly-update-draft
- Dashboard: portfolio-insights
- Estimator: cost-estimate
- Tasks: extract, suggest-next-steps (NEW — not in original Phase 4 plan)

### Forms Tab ✅
- 5 pre-structured meeting templates (Pre-Bid, Pre-Con, Kickoff, Weekly PM, Jobsite)
- AI auto-populate from project data
- AI agenda builder
- AI minutes generation from typed notes
- Multi-format export support

### Reports Tab ✅
- IPECC Builder (stub — upload form only, no full implementation)
- AI Weekly Status report (generate + preview)
- AI Schedule Status report (generate + preview)

### Team Page ✅ (partial)
- User directory with project assignments
- "Overview Analysis" cards are placeholder stubs

### Tasks Hub ✅ (NEW — not in Blueprint)
- Standalone `/tasks` page for cross-project task management
- Kanban board in project detail (Past Due / In Progress / Done)
- AI task extraction (`/api/ai/tasks/extract`)
- AI next steps suggestion (`/api/ai/tasks/suggest-next-steps`)

### SiteFolio Integration ✅ (NEW — exceeds Blueprint)
- Full sync engine: `src/lib/sitefolio/sync.ts`
- 4 parsers: overview, schedule, projects list, files/reports
- Admin sync routes: full sync, single project sync, sync status
- Import routes: preview + import single SF project
- SiteFolio overview panel + synced schedule components

### Dashboard ✅ (partial)
- KPI cards, AI portfolio brief (auto-generate on load)
- Visual analytics cards are "Coming Soon" placeholders

---

## What Is Partially Implemented

| Module | Built | Missing |
|---|---|---|
| **Dashboard** | KPIs, AI brief, project health table | Visual charts (budget by type, schedule trend, heat map) |
| **FE Copilot** | Full page UI, inline panel, streaming route, all 8 sub-feature routes | Sub-feature routes not called from UI — main `/api/ai/copilot` handles all routing |
| **Team** | Directory, assignments | Overview analysis/performance section |
| **Budget Tab** | Estimator link, Cost Review placeholder | Cost Review not built (button disabled) |
| **IPECC Builder** | Upload stub in Reports tab | Full Oracle report parsing + formatting |
| **Resources** | SOPs, Flowcharts | Forms & Templates section (Coming Soon) |
| **AI Features** | All routes + prompts built | Copilot sub-features not individually invoked from UI |

---

## What Is NOT Built (Planned but Absent)

These are in the Blueprint and agent instructions but have zero code:

### Phase 2 — Core PM Modules (0% complete)
- Interactive Gantt (drag-adjust, zoom controls, baseline/actual toggle) — component exists but is basic
- Budget tracker (line-item table, categories, variance, EAC, POC/Full PO flag, charts)
- Document upload module (Firebase Storage, type tagging, version history)
- Meetings module (6 types, agenda builder, minutes, action items, Word export)
- Calendar (portfolio-wide, 3-week look-ahead, .ics export)

### Phase 3 — FE Modules (0% complete)
- Project Sequence Tracker (phase accordion, step checklist, gate indicators, PDF export)
- SWPPP Tracker (NOI flow, inspection log, date calculator, export)
- SPG Gate Tracker (FC only)
- CA Log (entry form + routing rules display)
- PO Reference Tool
- Smart Tools: CA Prep Guide, Display Case Order Form, Procurement Planner

### Phase 4 Smart Tools (not yet built)
- ST-02 Bid Comparison
- ST-03 Plan Request Builder
- ST-04 Meeting Builder
- ST-05 Three-Week Look-Ahead
- ST-06 Pay Application Reviewer
- ST-07 Change Order Log
- ST-08 Close-Out Kit
- ST-09 CA Prep Guide (also in Phase 3)
- ST-10 Display Case Order Form (also in Phase 3)
- ST-11 Procurement Planner (also in Phase 3)
- ST-12 IPECC Builder (stub exists)
- ST-13 RFI & Submittal Tracker

### Phase 4 Import/Export Engine (0% complete)
- Oracle KAM PA report parsers (needs samples — O-03)
- Import field mapping preview UI
- Full export engine (all Kroger-formatted outputs)
- KB home with full-text search

### Phase 5 Analytics (0% complete)
- Portfolio analytics page (full)
- Budget vs. actual charts
- Schedule health analytics
- Resource utilization, vendor performance, historical benchmarks

### Phase 6 — Customization, Automation & Mobile (0% complete)
- Admin branding (logo, app name, color)
- Nav Builder, Module Config
- Automation engine (Firebase Cloud Functions)
- In-app notification center
- Risk Register
- Mobile optimization + PWA

---

## Known Issues & Open Blockers

### Open Technical Issues (from DISCREPANCIES.md)
1. **15 API routes missing auth middleware** — `/api/admin/*` and some `/api/ai/*` routes are unprotected
2. **Broken endpoint** — Admin page calls `GET /api/admin/estimates` which doesn't exist (404)
3. **Copilot sub-feature routes not wired** — 8 routes built but not individually invoked from Copilot UI
4. **KB data duplication** — SOP/flowchart data in constants AND seeded to Firestore, but only constants are read
5. **CLAUDE.md stale** — still lists `director` role and `src/lib/cost-review/` (neither exists)

### Open Items (from Blueprint O-series)
| # | Item | Blocks |
|---|---|---|
| O-01 | Project naming/ID convention | Phase 1 (was deferred) |
| O-02 | Oracle parent project list — confirm complete | Phase 3 |
| O-03 | Oracle KAM PA report export samples (5 reports) | Phase 4 import engine |
| O-04 | Display case contacts — confirm current | Phase 3 |
| O-05 | F1 fixture plan CSV sample | Phase 4 take-off feature |

### Pending Manual Tasks (from Blueprint Phase 1.5)
- Run `POST /api/seed-sops` (via Admin → Seed Data — **tab no longer exists, must call API directly**)
- Run `POST /api/seed-flowcharts`
- Deploy Firestore security rules for `/estimates/` and `/userPreferences/` from `firestore-rules-additions.txt`
- Create Firestore composite indexes for estimates (userId + updatedAt desc)
- Wire `next-themes` for dark/light mode toggle

---

## Blueprint Drift (What the Codebase Outpaced)

The current codebase includes features beyond Blueprint v3.3:

| Feature | Status | Blueprint? |
|---|---|---|
| SiteFolio sync engine (full project sync) | Built | No — Blueprint only mentions schedule panel import |
| Tasks hub (`/tasks` page) | Built | No — Tasks are inside projects only in Blueprint |
| AI task extraction + next-steps | Built | No — not in Phase 4 plan |
| Bulk project delete | Built | No |
| User session tracking (multi-device) | Built | No |
| SiteFolio import/preview flow | Built | No — extends beyond what Blueprint described |

**Blueprint should be updated to v3.4 to reflect these additions.**

---

## Recommended Next Steps (Priority Order)

1. **Fix the broken admin estimates endpoint** (DISCREPANCIES M-03) — quick win, stops a 404
2. **Add auth middleware to unprotected admin API routes** (A-01 to A-06) — security gap
3. **Wire Copilot sub-feature routes to UI** — all the backend is done, need frontend routing
4. **Dashboard charts** — fill the "Coming soon" placeholders (Recharts components)
5. **Budget Tab — Cost Review** — build the PM Cost Review module
6. **Phase 2 — Meetings module** — highest-value unbuilt core PM feature
7. **Phase 2 — Budget tracker** — line-item table with variance/EAC
8. **Update Blueprint to v3.4** — document SiteFolio sync, Tasks hub, AI task features
9. **Update CLAUDE.md** — fix stale "director" role and cost-review directory references

# FaciliOne App Restructuring — Master Execution Plan

Execute the full restructuring of the FaciliOne app to match the target module tree below. Use the appropriate agents for each task. Work in the order specified: cleanup first, QA, then build new structure. One logical change per commit. Verify the build compiles after each major change.

---

## TARGET MODULE TREE

This is the final desired state of the app. Anything that exists in the current app but is NOT listed here must be removed. Anything listed here that doesn't exist yet must be built.

```
FaciliOne
├── AUTH
│   ├── Login (email/password)
│   ├── Forgot Password (reset email)
│   ├── Session management (cookies, middleware)
│   └── Role-based access (PM, CM, Admin) — NO "director" role
│
├── DASHBOARD
│   ├── KPI Cards (active projects, projects by type, projects near/approaching/past due milestones)
│   ├── Portfolio Action Center (alerts: schedule status and upcoming item in sequence with dates)
│   ├── Visual charts (columns, lines, heat)
│   ├── Portfolio summary
│   ├── Schedule health
│   └── AI Portfolio Intelligence (Auto-generate executive brief)
│
├── PROJECTS
│   ├── Project List (filters by type, timing, search)
│   ├── Project Detail
│   │   ├── Schedule Tab
│   │   │   ├── SiteFolio Schedule Panel (auto-calc, HTML import)
│   │   │   ├── Gantt Chart (zoom, baseline/actual, drag-adjust)
│   │   │   └── Summary Cards (status, phases)
│   │   ├── Budget Tab
│   │   │   ├── Estimate (open in Estimator)
│   │   │   └── Cost Review (PM Cost Review)
│   │   ├── Forms Tab
│   │   │   ├── 5 Pre-structured Template Types (pre-bid, pre-con, project kickoff, weekly PM, jobsite) with optional AI auto populate
│   │   │   ├── Agenda builder (drag-and-drop) and optional AI builder
│   │   │   ├── Minutes generation using AI from notes taken by PM/recorded sound files/images/etc.
│   │   │   └── For all forms, options to export as (.docx, .xlsx, .csv, .pdf, .md) or per the preset/prestructured forms.
│   │   ├── Tasks Tab
│   │   │   ├── Kanban (Past Due / In Progress / Done)
│   │   │   └── Auto-create from project specific schedule/sequence
│   │   └── Reports Tab
│   │       ├── IPECC Builder (TBD for now)
│   │       ├── Weekly status (AI-drafted)
│   │       └── Schedule Status (AI-generated)
│   └── Project Sequence Tracker/Visual Flowcharts
│       ├── Phase accordion
│       ├── Step checklist
│       ├── Gate indicators
│       ├── Progress bars
│       └── PDF export
│
├── TEAM
│   ├── Team directory (name, email, phone number, title)
│   ├── Project assignments
│   └── Overview Analysis and Performance
│
├── FE COPILOT
│   ├── Full-page chat (streaming, session history)
│   ├── Inline panel (right sidebar, project-context)
│   ├── SOP Process Q&A (cited answers from KB)
│   ├── Next-Action Assistant (prioritized actions from phase/gates)
│   ├── Document Reviewer (upload PDF, ask questions)
│   ├── Communication Drafter (emails, memos, no placeholders)
│   ├── Historical Data Search (comparable projects)
│   ├── Budget Variance Analysis (auto-triggered on import)
│   ├── Schedule Deviation Alerts (actuals vs template)
│   └── Gate Compliance Check ("Am I ready for Phase X?")
│
├── SMART TOOLS
│   ├── ST-01 Estimator [DEPLOYED] — keep as-is
│   └── ST-02 Bid Comparison (future build)
│
├── RESOURCES & KB
│   ├── SOP Quick Reference [DEPLOYED] — keep as-is
│   ├── Project Flowcharts [DEPLOYED] — keep as-is
│   └── Forms and Templates (TBD)
│
├── ADMIN
│   ├── Users Tab [DEPLOYED] — keep as-is
│   ├── Projects Tab — create/edit/delete only (remove wizard link)
│   ├── AI Setup Tab — models, agents, feature mapping (extract from old System tab)
│   └── Future tabs: Organization Settings, Branding, Nav Builder, Module Config, Custom Forms
│
├── PROFILE (at bottom of sidebar — user avatar + display name as clickable nav item → /profile)
│   ├── Profile info (name, email, image)
│   ├── Change password
│   └── Sign Out
│   NOTE: Collapse/expand sidebar button placed in same row as user avatar/name.
│
└── NOTIFICATIONS
    └── In-app notification feed (bell icon in topbar, dismiss/snooze, clickable → navigates to item)
```

---

## SIDEBAR NAV ORDER (DEFINITIVE)

```
1. Dashboard        → /dashboard
2. Projects         → /projects
3. Team             → /team
4. FE Copilot       → /fe-copilot
5. Smart Tools      → /smart-tools
6. Resources & KB   → /resources
7. Admin            → /admin      (admin role only)
── spacer ──
[User Avatar + Display Name] [Collapse ▸]  → navigates to /profile
```

There are NO nav items for: Analytics, Calendar, Settings, Control Center.

---

## PHASE 1: CLEANUP (use cleanup-refactor agent)

Execute these removals in order. After each group, verify no orphaned imports, type references, or nav items remain.

### 1.1 Remove "director" role everywhere
- Remove "director" from `UserRole` union in `src/types/user.ts`
- Remove `isDirector()` function and `hasRole("director")` calls in `firestore.rules`
- Remove "director" from ROLES arrays/dropdowns in `admin/page.tsx`
- Remove director cases from switch statements in `src/lib/firebase/firestore.ts` (`subscribeToProjects`, `getProjectsForUser`)
- Remove director from `canAccessPath()` and `canSeeNavItem()` in `src/lib/access-control.ts`
- Remove director from `requireRoles()` calls in any API routes
- Final state: `UserRole = "admin" | "cm" | "pm"` — nothing else

### 1.2 Delete pages
- Delete `src/app/(app)/analytics/` (entire folder)
- Delete `src/app/(app)/calendar/` (entire folder)
- Delete `src/app/(app)/settings/` (entire folder — replaced by /profile)
- Delete `src/app/(app)/control-center/` (entire folder)
- Delete `src/app/(app)/projects/new/` (entire folder — wizard removed)
- Delete `src/app/(app)/smart-tools/ipecc/` (entire folder — standalone IPECC removed)
- Clean all references: imports, nav items, route definitions, middleware paths, access control rules

### 1.3 Rename copilot to fe-copilot
- Rename `src/app/(app)/copilot/` → `src/app/(app)/fe-copilot/`
- Update all imports, nav items (`href: "/fe-copilot"`), and route references
- Update sidebar label: "Copilot" → "FE Copilot"

### 1.4 Remove project detail tabs
- Remove Documents tab, Compliance tab, Risks tab from `src/app/(app)/projects/[id]/page.tsx`
- Remove `showCompliance` logic and `COMPLIANCE_PROJECT_TYPES` references
- Remove `SPG_PROJECT_TYPES` references
- Delete related tab components if they are standalone files
- Final project tabs: Schedule, Budget, Forms, Tasks, Reports

### 1.5 Restructure Admin panel
- Remove `ParsingTab` component/section from `admin/page.tsx`
- Remove `SeedDataTab` component/section from `admin/page.tsx`
- Extract AI Setup (model config, agent registry, feature-model mapping) from the current `SystemTab` into its own `AI Setup` tab
- Remove health check, Firestore indexes, and app info sections from admin
- Remove wizard link from Projects tab
- Final admin tabs: Users, Projects, AI Setup

### 1.6 Trim Smart Tools
- Remove all Smart Tool cards from `src/app/(app)/smart-tools/page.tsx` EXCEPT Estimator and Bid Comparison
- Trim `SmartToolId` in `src/types/smart-tools.ts` to `"estimator" | "bid-comparison"` only
- Delete any standalone smart tool page folders that were removed (check for cost-review, etc.)

### 1.7 Remove unused constants
- Delete `src/constants/po-item-numbers.ts`
- Delete `src/constants/sitefolio-paths.ts`
- Remove `COMPLIANCE_PROJECT_TYPES` from `src/constants/project-types.ts`
- Remove `SPG_PROJECT_TYPES` from `src/constants/project-types.ts`
- Clean all import references

### 1.8 Trim Resources & KB
- Remove Schedule Templates, Meeting Templates, Forms & Checklists, Estimating Guides, Oracle Reference sections from the Resources page
- Keep: SOP Quick Reference, Project Flowcharts
- Add placeholder for: Forms and Templates (TBD)

### 1.9 Update sidebar nav
- Remove nav items: Analytics, Calendar, Settings, Control Center
- Rename: Copilot → FE Copilot (if not already done in 1.3)
- Verify nav order matches the DEFINITIVE order above

### 1.10 Update topbar
- Remove Settings from user dropdown menu
- Keep sign out in dropdown as convenience (it will also exist on Profile page)

---

## PHASE 2: QA PASS (use qa-review agent)

Run the full QA checklist:
- TypeScript compiles with zero errors
- No imports from deleted files/folders
- No "director" references anywhere
- Sidebar nav matches the definitive order
- Project detail tabs are exactly: Schedule, Budget, Forms, Tasks, Reports
- Admin tabs are exactly: Users, Projects, AI Setup
- Smart Tools page shows only Estimator and Bid Comparison
- `SmartToolId` is `"estimator" | "bid-comparison"`
- No `COMPLIANCE_PROJECT_TYPES` or `SPG_PROJECT_TYPES` references
- No nav items pointing to deleted pages
- `firestore.rules` has no director references
- `access-control.ts` works with 3 roles only

Fix any issues found before proceeding to Phase 3.

---

## PHASE 3: BUILD NEW STRUCTURE (use frontend-builder + other agents as needed)

### 3.1 Create /profile page (frontend-builder agent)
- Route: `src/app/(app)/profile/page.tsx`
- Contains: profile info (name, email, avatar/image), change password form, sign out button
- Migrate password change logic from the deleted settings page
- Use shadcn/ui components, follow existing page layout patterns

### 3.2 Update sidebar with Profile at bottom (frontend-builder agent)
- Move user avatar + display name to the bottom of the sidebar as a clickable element → navigates to `/profile`
- Place the collapse/expand sidebar button in the same row as the user avatar/name block
- Profile is NOT a regular nav item — it's the user identity block at the bottom

### 3.3 Simplify Dashboard (frontend-builder agent)
- Remove executive update feed
- Add visual charts section (column charts, line charts, heat map) for portfolio data
- Add portfolio summary section
- Add schedule health section
- Change AI brief generation to auto-generate on load/refresh (not manual button)

### 3.4 Build Forms tab in project detail (frontend-builder + ai-integration agents)
- 5 pre-structured template types: pre-bid, pre-con, project kickoff, weekly PM, jobsite
- Optional AI auto-populate from project data
- Agenda builder with drag-and-drop reordering, optional AI builder
- Minutes generation using AI from: typed notes, recorded audio files, images
- Multi-format export: .docx, .xlsx, .csv, .pdf, .md

### 3.5 Simplify Tasks tab (frontend-builder agent)
- Kanban board with 3 columns: Past Due, In Progress, Done (NOT Backlog)
- Auto-create tasks from project-specific schedule/sequence
- Remove: recurring tasks, list view, weekly digest

### 3.6 Simplify Reports tab (frontend-builder agent)
- Keep: IPECC Builder (mark as TBD), Weekly Status (AI-drafted), Schedule Status (AI-generated)
- Remove: budget variance report, site photo report, close-out package

### 3.7 Simplify Budget tab (frontend-builder agent)
- Two links only: open Estimator (in project context), open Cost Review (in project context)
- Remove: standalone line-item tracker, POC/accrual display, charts, forecast trend

### 3.8 Build Team page (frontend-builder + data-firestore agents)
- Directory: name, email, phone number, title
- Project assignments view
- Overview analysis and performance section

### 3.9 Build Dashboard charts (frontend-builder agent)
- Column charts, line charts, heat maps for portfolio data
- Portfolio summary widget
- Schedule health widget

---

## PHASE 4: BUILD AI FEATURES (future — not part of this restructuring pass)

These are noted for awareness but should NOT be built during this restructuring:
- FE Copilot full implementation (streaming chat, RAG pipeline, all 8 copilot features)
- AI minutes generation from audio/images
- AI auto-populate for forms
- AI schedule status generation
- Bid Comparison smart tool

---

## EXECUTION RULES

1. **One logical change per commit.** Group related items (e.g., "remove director role" touches multiple files but is one logical change).
2. **QA after every major change.** Don't accumulate 10 changes before checking the build.
3. **Review every diff before committing.** The agents write code — you approve it.
4. **Phase 1 must be 100% complete before Phase 3.** Don't build new things on top of dead code.
5. **If you encounter something ambiguous, stop and ask.** Don't guess.

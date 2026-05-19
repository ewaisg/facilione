# FaciliOne Visual App Tree - Edit Map

Created: 2026-05-18  
Purpose: edit this file to mark what should stay, be removed, be hidden, or be deferred.

## How To Edit

Use the `Decision: ___` field on each line.

Suggested decisions:

- `KEEP`
- `REMOVE`
- `HIDE`
- `DEFER`
- `MERGE WITH ...`
- `RENAME TO ...`
- `NEEDS FIX`

Status legend:

- `LIVE`: route or feature exists and is substantially usable.
- `PARTIAL`: exists but incomplete or has important caveats.
- `STUB`: visible or coded but not meaningfully functional.
- `PLANNED`: appears in docs/plans but no current route/module exists.
- `CONDITIONAL`: only appears when data/config exists.
- `ORPHAN`: code exists but is not currently wired into the app.
- `RISK`: exists but has known access/data/runtime concerns.

---

# 1. Current Main App Shell

FaciliOne App Shell  
Decision: ___ | Status: LIVE

```text
FaciliOne
├── Auth shell
│   ├── Login
│   └── Forgot Password
│
├── Authenticated app shell
│   ├── Sidebar navigation
│   ├── Topbar
│   ├── Main content outlet
│   └── Profile link at sidebar bottom
│
└── Global support
    ├── Firebase Auth / Firestore user context
    ├── Role-based page access
    ├── Toast notifications
    └── Branding logo support
```

## 1.1 Sidebar Navigation - Current

```text
Sidebar
├── Dashboard (/dashboard)                              [LIVE]       Decision: ___
├── Projects (/projects)                                [LIVE]       Decision: ___
├── Tasks (/tasks)                                      [LIVE]       Decision: ___
├── Team (/team)                                        [PARTIAL]    Decision: ___
├── FE Copilot (/fe-copilot)                            [PARTIAL]    Decision: ___
├── Smart Tools (/smart-tools)                          [PARTIAL]    Decision: ___
├── Resources & KB (/resources)                         [PARTIAL]    Decision: ___
│   ├── SOP Reference (/resources/sops)                 [LIVE]       Decision: ___
│   └── Flowcharts (/resources/flowcharts)              [LIVE]       Decision: ___
├── Admin (/admin)                                      [LIVE/RISK]  Decision: ___
└── Profile (/profile)                                  [LIVE]       Decision: ___
```

## 1.2 Topbar - Current

```text
Topbar
├── Page title                                           [LIVE]       Decision: ___
├── Search icon button                                   [STUB]       Decision: ___
├── Notifications bell                                   [STUB]       Decision: ___
└── User menu                                            [LIVE]       Decision: ___
    ├── Profile
    └── Sign out
```

Known topbar gaps:

- Search button has no action.
- Notifications button has no action.
- Page title map is missing `/tasks` and `/profile`, so those can show fallback title `FaciliOne`.

---

# 2. Auth Area

```text
Auth
├── /login                                               [LIVE]       Decision: ___
│   ├── Email/password login
│   ├── Branding logo
│   └── Link to forgot password
│
└── /forgot-password                                     [LIVE]       Decision: ___
    ├── Password reset email
    └── Back to login
```

Notes:

- No self-signup.
- Forgot password page does not currently use the branding logo.

---

# 3. Dashboard

```text
Dashboard (/dashboard)                                   [LIVE]       Decision: ___
├── KPI cards                                            [LIVE]       Decision: ___
├── AI portfolio brief                                   [LIVE]       Decision: ___
├── Project health table                                 [LIVE]       Decision: ___
├── Projects by type chart                               [LIVE]       Decision: ___
├── Phase/pipeline chart                                 [LIVE]       Decision: ___
├── Schedule risk/heat style widget                      [LIVE]       Decision: ___
├── Portfolio summary                                    [LIVE]       Decision: ___
└── Recent/active project summaries                      [LIVE]       Decision: ___
```

Known caveat:

- Some schedule health/progress calculations still rely on root project schedule fields instead of the newer synced SiteFolio subcollection.

Planned/dashboard ideas from docs:

```text
Dashboard planned or not fully mature
├── Alerts & action items                                [PLANNED]    Decision: ___
├── Data freshness panel                                 [PLANNED]    Decision: ___
├── Notification badge integration                       [PLANNED]    Decision: ___
└── Drilldown analytics                                  [PLANNED]    Decision: ___
```

---

# 4. Projects

```text
Projects (/projects)                                     [LIVE]       Decision: ___
├── Project list/cards                                   [LIVE]       Decision: ___
├── Search by store/name                                 [LIVE]       Decision: ___
├── Type filter                                          [PARTIAL]    Decision: ___
│   ├── All                                              [LIVE]
│   ├── NS                                               [LIVE]
│   ├── ER                                               [LIVE]
│   ├── WIW                                              [LIVE]
│   ├── FC                                               [LIVE]
│   ├── MC                                               [LIVE]
│   └── F&D                                              [MISSING]    Decision: ___
├── Status/health display                                [LIVE]       Decision: ___
└── Link to project detail                               [LIVE]       Decision: ___
```

## 4.1 Project Detail - Current Actual Tabs

Project detail route: `/projects/[id]`  
Decision: ___ | Status: PARTIAL

```text
Project Detail (/projects/[id])
├── Header                                               [LIVE]       Decision: ___
│   ├── Back to projects
│   ├── Project type badge
│   ├── Health badge
│   ├── Store number/name/state
│   ├── Grand opening date
│   └── Total budget
│
├── Overview tab                                         [CONDITIONAL/PARTIAL] Decision: ___
│   ├── Only appears when project has sfProjectId
│   └── SiteFolio overview detail panel
│
├── Schedule tab                                         [LIVE/PARTIAL] Decision: ___
│   ├── Compact SiteFolio overview panel                 [CONDITIONAL]
│   ├── Grand Opening summary card                       [LIVE]
│   ├── Total Budget summary card                        [LIVE]
│   ├── Status summary card                              [LIVE]
│   ├── Phases seeded summary card                       [LIVE]
│   ├── SiteFolio synced schedule                        [CONDITIONAL/LIVE]
│   └── Gantt chart                                      [LIVE]
│
├── Budget tab                                           [PARTIAL]    Decision: ___
│   ├── Estimator card/link                              [LIVE]
│   └── Cost Review card/button                          [STUB]
│
├── Forms tab                                            [STUB/PARTIAL] Decision: ___
│   └── ProjectFormsTab
│       ├── Template/form selector                       [PARTIAL]
│       ├── Meeting notes editor                         [PARTIAL]
│       ├── Agenda builder button                        [STUB]
│       ├── Generate minutes button                      [STUB]
│       ├── Audio/image upload buttons                   [STUB]
│       └── Export buttons                               [STUB]
│
├── Tasks tab                                            [PARTIAL]    Decision: ___
│   └── TaskKanbanBoard
│       ├── Schedule-generated task creation             [PARTIAL]
│       ├── Manual local kanban tasks                    [PARTIAL]
│       └── Firestore persistence                        [MISSING]
│
├── Reports tab                                          [PARTIAL]    Decision: ___
│   ├── IPECC Builder                                    [STUB]
│   ├── AI Weekly Status                                 [LIVE/PARTIAL]
│   └── AI Schedule Status                               [LIVE/PARTIAL]
│
├── Team tab                                             [CONDITIONAL/PARTIAL] Decision: ___
│   ├── Only appears when project has sfProjectId
│   └── SiteFolio team directory
│
└── Inline Copilot panel                                 [PARTIAL]    Decision: ___
    ├── Floating Copilot button
    ├── Chat panel
    └── Open full page action                            [NEEDS FIX]
```

## 4.2 Project Detail - Planned Or Not Implemented Tabs

These appear in product docs/plans but are not current full tabs.

```text
Project Detail planned tabs
├── Overview for all projects                             [PLANNED/PARTIAL] Decision: ___
├── Bidding                                               [PLANNED]         Decision: ___
│   ├── Bid package list
│   ├── Bid package detail
│   ├── Bid analysis
│   ├── GC comparison
│   └── AI bid review
├── Contracts                                             [PLANNED]         Decision: ___
│   ├── Contract list
│   ├── SOV summary
│   ├── Change orders
│   └── Attachments
├── Requests                                              [PLANNED]         Decision: ___
│   ├── ASI subtab
│   ├── PR subtab
│   └── RFI subtab
├── Documents                                             [PLANNED]         Decision: ___
│   ├── Folder tree
│   ├── File list
│   ├── File search
│   └── Viewer/download links
├── Photos                                                [PLANNED]         Decision: ___
│   ├── Library browser
│   ├── Thumbnail grid
│   └── Photo count/grouping
├── Full Team tab for all projects                        [PLANNED/PARTIAL] Decision: ___
└── SiteFolio data tabs beyond schedule/overview/team      [PLANNED]         Decision: ___
```

## 4.3 Projects - Planned Portfolio Routes

```text
Projects planned routes
├── /projects/compare                                     [PLANNED]    Decision: ___
│   ├── Select 2+ projects
│   ├── Compare schedules
│   ├── Compare budgets
│   └── Compare teams/status
│
└── /projects/timeline                                    [PLANNED]    Decision: ___
    ├── Portfolio Gantt
    ├── Filter by type
    ├── Filter by PM
    └── Filter by year
```

---

# 5. Tasks

```text
Tasks (/tasks)                                            [LIVE]       Decision: ___
├── Project/task-list selector                            [LIVE]       Decision: ___
│   ├── Real projects group
│   └── Standalone task lists group
├── New List modal                                        [LIVE]       Decision: ___
├── Task filter bar                                       [LIVE]       Decision: ___
├── Flat task table                                       [LIVE]       Decision: ___
│   ├── Check/done
│   ├── Text editing
│   ├── Notes editing
│   ├── Status cycling
│   ├── Priority cycling
│   ├── Due date editing
│   └── Delete task
├── Project notes panel                                   [LIVE]       Decision: ___
├── History navigator                                     [LIVE]       Decision: ___
├── Snapshot/date view                                    [LIVE]       Decision: ___
├── Project info side panel                               [LIVE]       Decision: ___
├── Custom fields dialog                                  [LIVE]       Decision: ___
└── AI task extraction route                              [NOT WIRED TO CURRENT UI?] Decision: ___
```

Known issue:

- `/tasks` is persistent, but the Project Detail Tasks tab is a separate local kanban system.

Older/extra task components:

```text
Task legacy or separate components
├── TaskKanbanBoard                                       [USED IN PROJECT DETAIL/PARTIAL] Decision: ___
├── TaskSection                                           [ORPHAN/LEGACY]                 Decision: ___
├── TaskTable                                             [ORPHAN/LEGACY]                 Decision: ___
└── NextStepsList                                         [ORPHAN/RISK]                   Decision: ___
```

---

# 6. Team

```text
Team (/team)                                              [PARTIAL]    Decision: ___
├── Team directory                                        [LIVE]       Decision: ___
├── User search                                           [LIVE]       Decision: ___
├── Role filter                                           [LIVE]       Decision: ___
├── Project assignments/workload counts                   [LIVE]       Decision: ___
└── Overview Analysis cards                               [STUB]       Decision: ___
    ├── Projects per PM
    ├── Schedule health by PM
    └── Workload trends
```

Known caveat:

- `/api/team/list` returns safe fields for all users to any authenticated user. It is not org/manager scoped.

---

# 7. FE Copilot

```text
FE Copilot (/fe-copilot)                                  [PARTIAL]    Decision: ___
├── Full-page chat                                        [LIVE]       Decision: ___
├── Session history                                       [LIVE]       Decision: ___
├── Streaming AI responses                                [LIVE]       Decision: ___
├── Suggested prompts / quick actions                     [PARTIAL]    Decision: ___
├── SOP-grounded context                                  [PARTIAL]    Decision: ___
└── Specialized tool routing                              [NOT WIRED]  Decision: ___
```

## 7.1 Copilot Specialized API Routes

These backend routes exist but are not individually called by the current UI quick actions.

```text
Copilot subfeatures
├── SOP Q&A                                               [API EXISTS] Decision: ___
├── Next Actions                                          [API EXISTS] Decision: ___
├── Draft Communication                                   [API EXISTS] Decision: ___
├── Gate Check                                            [API EXISTS] Decision: ___
├── Historical Search                                     [API EXISTS] Decision: ___
├── Budget Analysis                                       [API EXISTS] Decision: ___
├── Schedule Deviations                                   [API EXISTS] Decision: ___
└── Document Review                                       [API EXISTS] Decision: ___
```

Planned/documented copilot concepts:

```text
Copilot planned concepts
├── Bid Review Assistant                                  [PLANNED]    Decision: ___
├── Email Drafter                                         [PARTIAL/API] Decision: ___
├── Schedule Analyzer                                     [PARTIAL/API] Decision: ___
├── Meeting Prep                                          [PLANNED]    Decision: ___
├── Project Briefing                                      [PLANNED]    Decision: ___
└── SiteFolio Navigator                                   [PLANNED]    Decision: ___
```

---

# 8. Smart Tools

```text
Smart Tools (/smart-tools)                                [PARTIAL]    Decision: ___
├── Estimator (/smart-tools/estimator)                    [LIVE]       Decision: ___
│   ├── Project info fields                               [LIVE]
│   ├── Project type/source/funding fields                [LIVE]
│   ├── Estimate sections                                 [LIVE]
│   ├── Line item table                                   [LIVE]
│   ├── Presets                                           [LIVE]
│   ├── CSV/XLSX import                                   [LIVE]
│   ├── Save/load estimates                               [LIVE]
│   ├── Export                                            [LIVE]
│   ├── AI analysis                                       [LIVE/PARTIAL]
│   ├── Historical comparables                            [LIVE/PARTIAL]
│   └── Estimate comparison workbook import               [LIVE/PARTIAL]
│
└── Bid Comparison                                        [STUB]       Decision: ___
    ├── Card appears on Smart Tools page
    └── No real route; href loops to /smart-tools
```

Planned Smart Tools from roadmap:

```text
Smart Tools planned
├── ST-02 Bid Comparison                                  [STUB/PLANNED] Decision: ___
├── ST-03 Cost Review                                     [PLANNED]      Decision: ___
├── ST-04 Schedule Analyzer                               [PLANNED]      Decision: ___
├── ST-05 Meeting Prep                                    [PLANNED]      Decision: ___
├── ST-06 Communication Drafter                           [PARTIAL/API]  Decision: ___
├── ST-07 Document Reviewer                               [PARTIAL/API]  Decision: ___
├── ST-08 Historical Comparison                           [PARTIAL/API]  Decision: ___
├── ST-09 PO Reference Tool                               [PLANNED]      Decision: ___
├── ST-10 CA Log                                          [PLANNED]      Decision: ___
├── ST-11 Gate Compliance                                 [PARTIAL/API]  Decision: ___
├── ST-12 IPECC Builder                                   [STUB]         Decision: ___
└── ST-13 Other future tools                              [PLANNED]      Decision: ___
```

---

# 9. Resources And Knowledge Base

```text
Resources & KB (/resources)                               [PARTIAL]    Decision: ___
├── SOP Quick Reference (/resources/sops)                 [LIVE]       Decision: ___
│   ├── Search                                            [LIVE]
│   ├── Project type selector                             [LIVE]
│   ├── NS SOP                                            [LIVE]
│   ├── ER SOP                                            [LIVE]
│   ├── WIW SOP                                           [LIVE]
│   ├── FC SOP                                            [LIVE]
│   ├── MC SOP                                            [LIVE]
│   ├── F&D separate SOP                                  [MISSING]    Decision: ___
│   ├── MR SOP                                            [MISSING]    Decision: ___
│   └── Appendices                                        [LIVE]
│
├── Project Flowcharts (/resources/flowcharts)            [LIVE]       Decision: ___
│   ├── Mermaid rendering                                 [LIVE]
│   ├── Pan/zoom/navigation                               [LIVE]
│   ├── NS flowchart                                      [LIVE]
│   ├── ER flowchart                                      [LIVE]
│   ├── WIW flowchart                                     [LIVE]
│   ├── FC flowchart                                      [LIVE]
│   ├── MC flowchart                                      [LIVE]
│   ├── F&D separate flowchart                            [MISSING]    Decision: ___
│   └── MR flowchart                                      [MISSING]    Decision: ___
│
└── Forms & Templates                                     [STUB]       Decision: ___
    └── Card appears on Resources page only
```

Planned resources routes from docs:

```text
Resources planned
├── /resources/knowledge-base                             [PLANNED]    Decision: ___
├── /resources/procedures                                 [PLANNED]    Decision: ___
├── /resources/system-guides                              [PLANNED]    Decision: ___
├── /resources/templates                                  [PLANNED]    Decision: ___
└── /resources/contacts                                   [PLANNED]    Decision: ___
```

Important note:

- Current Resources pages use static source constants, not Firestore KB reads.

---

# 10. Admin

```text
Admin (/admin)                                            [LIVE/RISK]  Decision: ___
├── Users tab                                             [LIVE]       Decision: ___
│   ├── Create user                                       [LIVE]
│   ├── Show temporary password                           [LIVE]
│   ├── Copy temporary password                           [LIVE]
│   ├── List users                                        [LIVE]
│   ├── Edit user                                         [LIVE/RISK]
│   └── Delete user                                       [LIVE]
│
├── Projects tab                                          [LIVE/PARTIAL] Decision: ___
│   ├── List projects                                     [LIVE]
│   ├── Quick create project                              [LIVE/PARTIAL]
│   ├── Edit project                                      [LIVE/PARTIAL]
│   ├── Delete project                                    [LIVE/RISK]
│   ├── Bulk delete projects                              [LIVE/RISK]
│   └── Load Estimate by project id                       [LIVE]
│
├── AI Setup tab                                          [LIVE/PARTIAL] Decision: ___
│   ├── Provider/global config                            [LIVE]
│   ├── Models list/config                                [LIVE]
│   ├── Feature model map                                 [LIVE/PARTIAL]
│   ├── Agents config                                     [LIVE/PARTIAL]
│   ├── Test AI config                                    [LIVE]
│   └── Seed feature map                                  [LIVE]
│
├── SiteFolio tab                                         [LIVE/PARTIAL] Decision: ___
│   ├── Session status                                    [LIVE]
│   ├── Contact ID / Enterprise ID settings               [LIVE]
│   ├── Preview import                                    [LIVE]
│   ├── Import selected projects                          [LIVE]
│   ├── Sync all projects                                 [LIVE]
│   ├── Project mapping table                             [LIVE]
│   └── Sync single project                               [LIVE]
│
└── Branding tab                                          [PARTIAL]    Decision: ___
    ├── Current logo preview                              [LIVE]
    ├── Upload/replace logo                               [LIVE]
    └── Remove logo                                       [LIVE]
```

Admin known issues:

- Project create route allows admin/cm/pm API access even though UI is admin-only.
- Project quick create does not seed phases.
- Project deletes can leave related data orphaned.
- User role update does not validate role values on PATCH.
- Branding only supports logo; app name/theme/nav customization is not implemented.

---

# 11. Profile

```text
Profile (/profile)                                        [LIVE/PARTIAL] Decision: ___
├── Account info                                          [LIVE]
├── Role/org info                                         [LIVE]
├── Change password                                       [LIVE]
├── Sessions list                                         [LIVE]
├── Delete session                                        [LIVE/PARTIAL]
└── Sign out all devices                                  [PARTIAL]
```

Known caveat:

- Session deletion removes Firestore session records but does not revoke Firebase refresh tokens.

---

# 12. Reports

Current state:

```text
Reports
├── Project Detail > Reports tab                          [PARTIAL]    Decision: ___
│   ├── IPECC Builder                                     [STUB]
│   ├── AI Weekly Status                                  [LIVE/PARTIAL]
│   └── AI Schedule Status                                [LIVE/PARTIAL]
└── /reports route/module                                 [MISSING]    Decision: ___
```

Planned report module from docs:

```text
Reports planned (/reports)
├── Reports hub                                           [PLANNED]    Decision: ___
├── Division Status (/reports/division-status)            [PLANNED]    Decision: ___
├── Data Completeness (/reports/completeness)             [PLANNED]    Decision: ___
├── SiteFolio Reports (/reports/sitefolio)                [PLANNED]    Decision: ___
└── Custom Reports (/reports/custom)                      [PLANNED]    Decision: ___
```

---

# 13. Settings And Customization

Current state:

```text
Settings
├── /settings route/module                                [MISSING]    Decision: ___
├── Profile is at /profile, not /settings/profile         [LIVE]       Decision: ___
└── Admin handles some settings-like functions             [PARTIAL]    Decision: ___
    ├── AI Setup
    ├── SiteFolio
    └── Branding logo
```

Planned settings module from docs:

```text
Settings planned (/settings)
├── Profile settings (/settings/profile)                  [PLANNED]    Decision: ___
├── Projects management (/settings/projects)              [PLANNED]    Decision: ___
├── SiteFolio connection (/settings/sitefolio)             [PLANNED]    Decision: ___
├── Data sync (/settings/sync)                             [PLANNED]    Decision: ___
├── App preferences (/settings/preferences)                [PLANNED]    Decision: ___
└── AI settings (/settings/ai)                             [PLANNED]    Decision: ___
```

Customization placeholders:

```text
Customization
├── src/lib/customization/index.ts                         [PLACEHOLDER] Decision: ___
├── Branding logo                                          [LIVE]
├── App name override                                      [MISSING]
├── Primary color/theme override                           [MISSING]
├── Nav builder                                            [MISSING]
└── Module config                                          [MISSING]
```

---

# 14. SiteFolio Integration

```text
SiteFolio Integration                                     [LIVE/PARTIAL] Decision: ___
├── Admin > SiteFolio tab                                  [LIVE/PARTIAL]
├── Playwright SSO session refresh script                  [LIVE]
├── Firestore session store                                [LIVE]
├── Server-side SiteFolio fetch/proxy                      [LIVE]
├── Import preview                                         [LIVE]
├── Project import                                         [LIVE]
├── Full sync                                              [LIVE]
├── Single-project sync                                    [LIVE]
├── Sync status                                            [LIVE]
├── Project detail synced schedule                         [LIVE]
├── Project detail synced overview                         [LIVE/PARTIAL]
├── Project detail synced team                             [LIVE/RISK]
├── Dashboard/list use of synced schedule data             [PARTIAL]
└── Scheduled automatic sync                               [MISSING]
```

Older/orphaned SiteFolio/parser items:

```text
SiteFolio legacy/orphan-looking items
├── SfSchedulePanel                                        [ORPHAN]    Decision: ___
├── sitefolio-html-import                                  [ORPHAN]    Decision: ___
├── sitefolio-overview-import                              [ORPHAN]    Decision: ___
├── sitefolio-files-reports-import                         [ORPHAN]    Decision: ___
└── /api/admin/parsing/apply                               [ORPHAN?]   Decision: ___
```

---

# 15. AI API Modules

```text
AI API
├── /api/ai/copilot                                        [LIVE/PARTIAL] Decision: ___
├── /api/ai/copilot/sop-qa                                 [API EXISTS]   Decision: ___
├── /api/ai/copilot/next-actions                           [API EXISTS]   Decision: ___
├── /api/ai/copilot/draft-communication                    [API EXISTS]   Decision: ___
├── /api/ai/copilot/gate-check                             [API EXISTS]   Decision: ___
├── /api/ai/copilot/historical-search                      [API EXISTS]   Decision: ___
├── /api/ai/copilot/budget-analysis                        [API EXISTS]   Decision: ___
├── /api/ai/copilot/schedule-deviations                    [API EXISTS]   Decision: ___
├── /api/ai/copilot/document-review                        [API EXISTS]   Decision: ___
├── /api/ai/cost-estimate                                  [LIVE]         Decision: ___
├── /api/ai/portfolio-insights                             [LIVE]         Decision: ___
├── /api/ai/weekly-update-draft                            [LIVE]         Decision: ___
├── /api/ai/historical-comparisons                         [LIVE/PARTIAL] Decision: ___
├── /api/ai/reports/schedule-status                        [LIVE]         Decision: ___
├── /api/ai/forms/auto-populate                            [API EXISTS]   Decision: ___
├── /api/ai/forms/agenda-builder                           [API EXISTS]   Decision: ___
├── /api/ai/forms/generate-minutes                         [API EXISTS]   Decision: ___
├── /api/ai/forms/image-minutes                            [STUB/API]     Decision: ___
├── /api/ai/forms/transcribe-minutes                       [STUB/API]     Decision: ___
├── /api/ai/tasks/extract                                  [API EXISTS]   Decision: ___
└── /api/ai/tasks/suggest-next-steps                       [API RISK]     Decision: ___
```

AI config issue:

- Runtime feature map defines 15 feature keys, while docs mention 17. Separate `tasks-extract` and `tasks-next-steps` feature keys do not currently exist.

---

# 16. Data And Backend Collections

Visible app features depend on these collections/rules. Use this section if you want to remove an entire data domain.

```text
Firestore/Data Domains
├── users                                                 [LIVE]       Decision: ___
├── organizations                                         [PARTIAL]    Decision: ___
├── projects                                              [LIVE]       Decision: ___
│   ├── phases subcollection                              [LIVE/PARTIAL]
│   ├── weeklyUpdates subcollection                       [PARTIAL]
│   └── sitefolio subcollection                           [LIVE/PARTIAL]
├── estimates                                             [LIVE/PARTIAL] Decision: ___
├── costReviews                                           [PARTIAL/PLANNED] Decision: ___
├── costReviewImports                                     [PARTIAL/PLANNED] Decision: ___
├── costReviewInputs                                      [PARTIAL/RISK] Decision: ___
├── costReviewSettings                                    [PARTIAL/PLANNED] Decision: ___
├── kb                                                    [SEEDED/NOT READ BY UI] Decision: ___
├── ai-sessions                                           [LIVE/RISK]  Decision: ___
├── notifications                                         [PLANNED]    Decision: ___
├── imports                                               [PARTIAL]    Decision: ___
├── userPreferences                                       [PARTIAL]    Decision: ___
├── customization                                         [PARTIAL]    Decision: ___
├── systemSettings                                        [LIVE]       Decision: ___
├── comparisonSnapshots                                   [LIVE/PARTIAL] Decision: ___
├── estimateComparisonForms                               [LIVE/PARTIAL] Decision: ___
├── sitefolio_sessions                                    [LIVE]       Decision: ___
└── taskProjects                                          [LIVE/RISK]  Decision: ___
```

---

# 17. Project Types

Current code-supported project types:

```text
Project Types
├── NS - New Store                                        [SUPPORTED]  Decision: ___
├── ER - Existing Remodel                                 [SUPPORTED]  Decision: ___
├── WIW - Walk-In Walk-Out                                [SUPPORTED]  Decision: ___
├── FC - Fixture Changeout                                [SUPPORTED]  Decision: ___
├── MC - Minor Capital                                    [SUPPORTED]  Decision: ___
├── F&D - Floor & Decor                                   [PARTIAL]    Decision: ___
└── MR - Minor Remodel                                    [DOCS ONLY]  Decision: ___
```

Known mismatch:

- Source has `F&D` but no `MR`.
- Some docs mention seven types including `MR`.
- SOPs/flowcharts cover five primary types, not separate F&D/MR.

---

# 18. Major Roadmap Items Not Built

Use this section to decide whether these should remain in the plan or be deleted from the product direction.

```text
Major planned/unbuilt modules
├── Reports module                                        [PLANNED]    Decision: ___
├── Settings module                                       [PLANNED]    Decision: ___
├── Project comparison                                    [PLANNED]    Decision: ___
├── Portfolio timeline                                    [PLANNED]    Decision: ___
├── Budget tracker                                        [PLANNED]    Decision: ___
├── Document upload/workflow                              [PLANNED]    Decision: ___
├── Meetings module                                       [PLANNED]    Decision: ___
├── Calendar module                                       [PLANNED]    Decision: ___
├── Sequence Tracker                                      [PLANNED]    Decision: ___
├── SWPPP Tracker                                         [PLANNED]    Decision: ___
├── SPG Gate Tracker                                      [PLANNED]    Decision: ___
├── CA Log                                                [PLANNED]    Decision: ___
├── PO Reference Tool                                     [PLANNED]    Decision: ___
├── Portfolio analytics                                   [PLANNED]    Decision: ___
├── Notification center                                   [PLANNED]    Decision: ___
├── Cloud Functions automation                            [PLANNED]    Decision: ___
├── PWA/mobile                                            [PLANNED]    Decision: ___
├── True KB/RAG pipeline                                  [PLANNED]    Decision: ___
└── True scheduled SiteFolio sync                          [PLANNED]    Decision: ___
```

---

# 19. Quick Pruning Checklist

Fill this section however you want.

```text
Keep as core MVP:
-
-
-

Remove completely:
-
-
-

Hide for now but keep code/docs:
-
-
-

Merge into another module:
-
-
-

Needs to be implemented before launch:
-
-
-

Can stay as future roadmap only:
-
-
-
```

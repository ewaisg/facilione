# MASTER-TREE.md — FaciliOne Codebase Map

Scan date: 2026-05-03
Scanner: App Cartographer (full rescan — updated from 2026-04-11 baseline)

---

## PAGES

```
src/app/
├── layout.tsx                              Root layout (Providers, Toaster, globals.css)
├── page.tsx                                Root redirect -> /dashboard
│
├── (auth)/
│   ├── layout.tsx                          Auth layout (centered card, no sidebar)
│   ├── login/page.tsx                      Login form (email/password, Firebase Auth)
│   └── forgot-password/page.tsx            Password reset form (Firebase sendPasswordResetEmail)
│
└── (app)/
    ├── layout.tsx                          App shell (Sidebar + Topbar + auth guard + canAccessPath)
    ├── dashboard/page.tsx                  Executive dashboard (KPIs, alerts, AI portfolio insights)
    ├── projects/
    │   ├── page.tsx                        Project list (filters, schedule progress, real-time subscription)
    │   └── [id]/page.tsx                   Project detail (5 tabs: Schedule, Budget, Forms, Tasks, Reports)
    ├── team/page.tsx                       Team directory (user list, project assignments, workload stats)
    ├── tasks/page.tsx                      Tasks hub (standalone task management, all projects)
    ├── fe-copilot/page.tsx                 FE Copilot chat (session management, streaming, SOP-grounded)
    ├── smart-tools/
    │   ├── page.tsx                        Smart Tools index (Estimator live, Bid Comparison planned)
    │   └── estimator/page.tsx              Estimator tool (sections, presets, CSV/XLSX import, AI analysis)
    ├── resources/
    │   ├── page.tsx                        Resources & KB index (links to SOPs, Flowcharts)
    │   ├── sops/page.tsx                   SOP Quick Reference (all 5 types + 4 appendices, cross-search)
    │   └── flowcharts/page.tsx             Project Flowcharts (Mermaid rendering, pan/zoom, 5 types)
    ├── admin/page.tsx                      Admin panel (3 tabs: Users, Projects, AI Setup)
    └── profile/page.tsx                    User profile (account info, change password, sign out)
```

## COMPONENTS

```
src/components/
├── providers.tsx                           Wraps AuthProvider + TooltipProvider
├── layout/
│   ├── sidebar.tsx                         Nav sidebar (7 items, role-filtered, collapsible, profile at bottom)
│   └── topbar.tsx                          Top bar (page title, search btn, notifications btn, user menu)
├── copilot/
│   └── inline-panel.tsx                    Project-context copilot panel (used in project detail page)
├── forms/
│   └── project-forms-tab.tsx               Forms tab (Pre-Bid, Pre-Con, Kickoff, Weekly PM, Jobsite templates)
├── schedule/
│   ├── gantt-chart.tsx                     Gantt chart (phase-based, milestone date editing)
│   └── sf-schedule-panel.tsx               SiteFolio schedule panel (weeks-to-open / day-offset, HTML import)
├── sitefolio/
│   ├── sf-overview-panel.tsx               SiteFolio overview panel (project details from SF sync)
│   └── sf-synced-schedule.tsx              SiteFolio synced schedule display (from sync data)
├── tasks/
│   ├── task-kanban-board.tsx               Task kanban board (derived from phases/checklist items)
│   ├── task-status-badge.tsx               Status badge for tasks (colored pill)
│   ├── task-project-sidebar.tsx            Project context sidebar for tasks hub
│   ├── next-steps-list.tsx                 AI-suggested next steps list component
│   ├── task-section.tsx                    Section grouping for tasks
│   └── task-table.tsx                      Table view of tasks
├── reports/
│   ├── ipecc-builder.tsx                   IPECC packet builder (Oracle report uploads, stub)
│   ├── ai-weekly-status.tsx                AI weekly status report generator
│   └── ai-schedule-status.tsx              AI schedule status report generator
├── projects/
│   └── index.ts                            Empty barrel export (planned components not yet built)
└── ui/                                     shadcn/ui primitives (15 components)
    ├── alert.tsx
    ├── avatar.tsx
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── input.tsx
    ├── label.tsx
    ├── progress.tsx
    ├── select.tsx
    ├── separator.tsx
    ├── tabs.tsx
    ├── textarea.tsx
    └── tooltip.tsx
```

## API ROUTES

```
src/app/api/
├── health/route.ts                         GET  — Health check (returns status, version, timestamp)
│
├── admin/
│   ├── users/
│   │   ├── route.ts                        POST — Create user (Firebase Auth + Firestore doc)
│   │   ├── list/route.ts                   GET  — List all users
│   │   └── [uid]/route.ts                  PATCH/DELETE — Update/delete user
│   ├── projects/
│   │   ├── create/route.ts                 POST — Create project (with optional phase seeding)
│   │   ├── list/route.ts                   GET  — List all projects
│   │   ├── [id]/route.ts                   PATCH — Update project fields
│   │   └── bulk-delete/route.ts            POST — Bulk delete multiple projects (admin only)
│   ├── ai/
│   │   ├── config/route.ts                 GET/PUT — AI settings CRUD (models, feature map, agents)
│   │   ├── test/route.ts                   POST — Test model connectivity
│   │   ├── seed-feature-map/route.ts       POST — Seed default feature-model mapping
│   │   ├── comparison-snapshots/
│   │   │   └── import/route.ts             POST — Import comparison snapshot workbook
│   │   └── estimate-comparison-forms/
│   │       └── import/route.ts             POST — Import estimate comparison form workbook
│   └── parsing/
│       └── apply/route.ts                  POST — Apply parsed SiteFolio data to project
│
├── ai/
│   ├── copilot/
│   │   ├── route.ts                        POST — Main copilot chat (SSE streaming, SOP-grounded)
│   │   ├── sop-qa/route.ts                 POST — SOP Q&A (feature: sop-qa)
│   │   ├── next-actions/route.ts           POST — Next actions advisor (feature: next-actions)
│   │   ├── draft-communication/route.ts    POST — Draft communication (feature: draft-communication)
│   │   ├── gate-check/route.ts             POST — Gate readiness check (feature: gate-check)
│   │   ├── historical-search/route.ts      POST — Historical project search (feature: historical-search)
│   │   ├── budget-analysis/route.ts        POST — Budget analysis (feature: budget-analysis)
│   │   ├── schedule-deviations/route.ts    POST — Schedule deviation analysis (feature: schedule-deviations)
│   │   └── document-review/route.ts        POST — Document review (feature: document-review)
│   ├── forms/
│   │   ├── auto-populate/route.ts          POST — Auto-populate form template (feature: forms-auto-populate)
│   │   ├── agenda-builder/route.ts         POST — Build meeting agenda (feature: forms-agenda-builder)
│   │   ├── generate-minutes/route.ts       POST — Generate meeting minutes (feature: forms-generate-minutes)
│   │   ├── image-minutes/route.ts          POST — OCR minutes from image (stub)
│   │   └── transcribe-minutes/route.ts     POST — Transcribe audio to minutes (stub)
│   ├── tasks/
│   │   ├── extract/route.ts                POST — Extract actionable tasks from text (AI)
│   │   └── suggest-next-steps/route.ts     POST — AI-suggested next steps for a project
│   ├── cost-estimate/route.ts              POST — AI cost estimate analysis (feature: cost-estimate)
│   ├── historical-comparisons/route.ts     POST — Historical comparable projects search
│   ├── portfolio-insights/route.ts         POST — Portfolio AI intelligence (feature: portfolio-insights)
│   ├── reports/
│   │   └── schedule-status/route.ts        POST — Schedule status report (feature: reports-schedule-status)
│   └── weekly-update-draft/route.ts        POST — Weekly update draft (feature: weekly-update-draft)
│
├── sitefolio/
│   ├── auth/route.ts                       GET  — Check SiteFolio session status (admin only)
│   ├── proxy/[...path]/route.ts            GET/POST — Proxy SiteFolio ASMX/page requests (admin only)
│   ├── sync/
│   │   ├── route.ts                        POST — Sync projects from SiteFolio (admin only; full or single)
│   │   └── status/route.ts                 GET  — Get SiteFolio sync status
│   └── import/
│       ├── route.ts                        POST — Import a single SiteFolio project by job number
│       └── preview/route.ts                POST — Preview parsed SiteFolio project data before import
│
├── seed-sops/route.ts                      POST — Seed SOP data to Firestore kb/sops
├── seed-flowcharts/route.ts                POST — Seed flowchart data to Firestore kb/flowcharts
└── seed-templates/route.ts                 POST — Seed schedule templates to Firestore kb/templates
```

## TYPES

```
src/types/
├── index.ts                                Barrel re-export of all type modules + constant re-exports
├── user.ts                                 UserRole ("admin"|"cm"|"pm"), AppUser
├── project.ts                              ProjectType, ProjectStatus, HealthStatus, Project, ProjectWeeklyUpdate
├── schedule.ts                             PhaseStatus, ChecklistItem, Phase, ScheduleTemplate, ScheduleTemplatePhase, ScheduleTemplateMilestone
├── budget.ts                               AccrualType, BudgetLineItem, getAccrualType()
├── estimate.ts                             EstimateRow, EstimateColumnKey, EstimateSection, EstimateProjectInfo, EstimateComparable, EstimateComparisonContext, Estimate, PresetSectionDef
├── smart-tools.ts                          SmartToolId ("estimator"|"bid-comparison"), SmartToolMeta
├── customization.ts                        OrgBranding, NavItem, NavConfig, ModuleConfig
├── sop.ts                                  SOPStep, SOPPhase, SOPScheduleItem, SOPProject, SOPDataMap
├── ai-session.ts                           AiSession, AiMessage
├── task.ts                                 Task types (standalone and project-linked task management)
├── sitefolio.ts                            SiteFolioSyncMeta and SiteFolio integration types
├── session.ts                              User session tracking types (multi-device)
└── dashboard.ts                            PortfolioAiCache and dashboard-specific types
```

## CONSTANTS

```
src/constants/
├── project-types.ts                        ORACLE_PARENT_PROJECTS, PROJECT_TYPE_LABELS, PROJECT_TYPE_DURATIONS, TEMPLATE_ALIAS, FUNDING_SOURCES, FundingSource
├── estimate-presets.ts                     PRESET_SECTIONS, PRESET_MAP (estimate section templates)
├── oracle-parents.ts                       OracleParentProject, ORACLE_PARENT_PROJECT_CATALOG
├── oracle-reports.ts                       OracleReportDef, ORACLE_REPORTS
├── sop-data.ts                             SOP_DATA (merged map), PROJECT_KEYS, APPENDIX_KEYS, ALL_SOP_KEYS
├── sop-data-ns-er.ts                       SOP_DATA for NS and ER
├── sop-data-wiw-fc-mc.ts                   SOP_DATA_REMAINING for WIW, FC, MC
├── sop-data-appendices.ts                  SOP_DATA_APPENDICES for appA, appB, appC, appD
├── flowchart-data.ts                       FlowchartDef, FLOWCHARTS, FLOWCHART_KEYS, LEGEND_ITEMS
└── sf-schedule-data.ts                     ScheduleModel, SfMilestoneWeeks, SfMilestoneDayOffset, SfScheduleTemplate, SF_SCHEDULE_TEMPLATES
```

## LIB / SERVICES

```
src/lib/
├── access-control.ts                       canAccessPath(), canSeeNavItem()
├── utils/index.ts                          cn(), formatCurrency(), formatDate(), formatDateShort(), getHealthColor(), getHealthLabel(), getProjectTypeColor(), calculateVariance(), calculateVariancePercent(), calculateTargetDate(), getInitials()
├── firebase/
│   ├── index.ts                            Firebase Client SDK init (auth, db, storage)
│   ├── auth-context.tsx                    AuthProvider, useAuth()
│   ├── firestore.ts                        Project + Phase + WeeklyUpdate CRUD (10 functions)
│   ├── estimates.ts                        Estimate CRUD (6 functions)
│   ├── ai-sessions.ts                      AI session + message CRUD (6 functions)
│   ├── sessions.ts                         User session tracking (multi-device session management)
│   └── storage.ts                          deleteStorageFile(), uploadProjectImportFile()
├── firebase-admin/
│   ├── index.ts                            Firebase Admin SDK lazy init (adminAuth, adminDb)
│   └── request-auth.ts                     requireAppUser(), requireRoles()
├── ai/
│   ├── client.ts                           invokeAiText(), invokeAiModelText()
│   ├── runtime-config.ts                   AiFeature (17 features), runtime config resolution from systemSettings/ai
│   ├── historical-comparisons.ts           listHistoricalCandidates() (searches estimates, costReviews, comparisonSnapshots, estimateComparisonForms)
│   └── comparison-snapshot-parser.ts       parseComparisonSnapshotWorkbook() (XLSX parser)
├── schedule/
│   ├── index.ts                            Barrel re-export
│   ├── template-parser.ts                  parseScheduleTemplate(), parseMinorCapitalTemplate()
│   ├── seed-phases.ts                      seedPhasesFromTemplate(), recalculatePhaseDates()
│   ├── get-template.ts                     getScheduleTemplate(), getAvailableTemplateTypes()
│   ├── sf-schedule.ts                      SfMilestoneState, initScheduleState(), recalcWeeksToOpen(), recalcDayOffset(), isDatePast(), formatScheduleDate()
│   ├── sitefolio-html-import.ts            parseSiteFolioScheduleHtml(), mapSiteFolioRowsToMilestones()
│   ├── sitefolio-files-reports-import.ts   parseSiteFolioFilesReportsHtml()
│   ├── sitefolio-overview-import.ts        parseSiteFolioOverviewHtml()
│   └── templates.json                      Pre-parsed schedule templates
├── sitefolio/
│   ├── fetch.ts                            sfAsmxCall(), sfPageFetch()
│   ├── playwright-auth.ts                  authenticateSiteFolio() (Playwright SSO)
│   ├── session-store.ts                    getStoredSession(), storeSession(), getSessionStatus()
│   ├── sync.ts                             syncProject(), syncAllProjects(), buildProjectsListUrl() — full SF sync engine
│   └── parsers/
│       ├── index.ts                        Barrel re-export for all parsers
│       ├── overview.ts                     parseOverview() — SiteFolio project overview HTML
│       ├── schedule.ts                     parseSchedule() — SiteFolio schedule HTML
│       └── projects-list.ts               parseProjectsList() — SiteFolio projects list HTML
├── customization/index.ts                  Empty placeholder (Phase 6)
│
src/hooks/index.ts                          Empty placeholder
src/middleware.ts                           Edge middleware (cookie auth redirect)
│
src/docs/
├── FaciliOne_Blueprint.md                  Full product blueprint (1323 lines, v3.3)
├── AGENTS_INSTRUCTIONS_ph1to3.md           Agent instructions for phases 1-3 (restructuring execution plan)
├── AGENTS_INSTRUCTION_PHASE4.md            Agent instructions for phase 4 (AI features execution plan)
└── forms_examples/
    ├── Budget_Store_Project_Cost_by_Line_Item.xlsx   Sample budget form
    └── New_store_project_schedule_template.xls       Sample schedule template
```

## FIRESTORE COLLECTIONS

| Collection | Fields | Source |
|---|---|---|
| users/{userId} | uid, email, displayName, role, orgId, assignedProjectIds, managedUserIds, forcePasswordChange, createdAt, createdBy, avatarUrl? | Code + Rules |
| organizations/{orgId} | (org-level config, schema TBD) | Rules only |
| customization/{orgId}/... | (OrgBranding, NavConfig, ModuleConfig — Phase 6) | Rules only |
| projects/{projectId} | id, storeNumber, storeName, storeAddress, storeCity, storeState, projectType, status, healthStatus, grandOpeningDate, constructionStartDate, pmUserId, cmUserId, orgId, oracleParentProject, oracleProjectNumber, currentPhaseIndex, totalBudget, committedCost, actualCost, forecastCost, notes, tags, createdAt, updatedAt, sfSchedule?, siteFolioJobNumber?, siteFolioSync? | Code + Rules |
| projects/{pid}/phases/{phaseId} | id, projectId, phaseNumber, name, targetStartWeekOffset, targetEndWeekOffset, targetStartDate, targetEndDate, actualStartDate, actualEndDate, status, checklistItems[], sopReference, notes | Code + Rules |
| projects/{pid}/weeklyUpdates/{uid} | projectId, weekStart, comment, createdBy, createdByName, createdAt, updatedAt | Code |
| kb/sops/types/{type} | SOPProject fields | Seeded |
| kb/flowcharts/types/{type} | FlowchartDef fields | Seeded |
| kb/templates/types/{type} | ScheduleTemplate fields | Seeded |
| ai-sessions/{sessionId} | id, userId, title, projectId?, projectType?, createdAt, updatedAt | Code + Rules |
| ai-sessions/{sid}/messages/{mid} | id, role, content, citations?, timestamp | Code + Rules |
| estimates/{estimateId} | id, userId, projectId, projectInfo, sections[], comparisonContext?, createdAt, updatedAt | Code + Rules |
| costReviews/{id} | projectId, storeNumber, projectName, projectType, summary, scopeItems, projectStatusText, updatedAt | Rules + historical-comparisons.ts |
| costReviewImports/{id} | projectId, costReviewId, importedAt | Rules |
| costReviewInputs/{costReviewId} | (user inputs for cost reviews) | Rules |
| costReviewSettings/{docId} | (admin cost review settings) | Rules |
| imports/{importId} | (import log records) | Rules |
| notifications/{notificationId} | userId, ... | Rules |
| userPreferences/{userId} | (user preferences) | Rules |
| systemSettings/ai | endpoint, apiKey, apiVersion, models[], featureModelMap, agents[] | runtime-config.ts |
| comparisonSnapshots/{id} | templateType, title, projectType, estimatedProjectTotal, estimatedProject, referenceProjects[], scopeItems[], notes, sourceFileName, createdAt, updatedAt | Code |
| estimateComparisonForms/{id} | (same shape as comparisonSnapshots) | Code |
| sitefolio_sessions/current | cookies, cookieMap, memberId, enterpriseId, obtainedAt, expiresAt, refreshedBy, refreshedAt | Code + Rules |

## FIRESTORE SECURITY RULES SUMMARY

| Collection | Read | Write |
|---|---|---|
| users/{userId} | Self, admin, CM managing user | admin only |
| organizations/{orgId} | Authenticated + same org | admin + same org |
| customization/{orgId}/... | Authenticated + same org | admin + same org |
| projects/{projectId} | admin, assigned PM, managing CM | Create: admin/PM/CM; Update: admin/PM/CM; Delete: admin |
| projects/{pid}/{sub}/{docId} | Same as parent project | Same as parent project |
| kb/{collection}/{docId} | Any authenticated | admin only |
| ai-sessions/{sessionId} | Owner or admin | Owner (write/create) |
| ai-sessions/{sid}/messages/{mid} | Session owner or admin | Session owner or admin |
| imports/{importId} | Any authenticated | Create: any; Update/Delete: admin |
| notifications/{notificationId} | Owner only | Create/Delete: admin; Update: owner |
| estimates/{estimateId} | admin, owner, project PM | Create: any; Update/Delete: admin or owner |
| userPreferences/{userId} | Self or admin | Self |
| costReviews/{id} | admin, project PM, managing CM | Create: admin/PM/CM; Update: admin/PM/CM; Delete: admin |
| costReviewImports/{id} | admin, project PM, managing CM | Create: admin/PM/CM; Update/Delete: admin |
| costReviewInputs/{id} | admin, project PM, managing CM | admin, project PM, managing CM |
| costReviewSettings/{docId} | Any authenticated | admin only |
| sitefolio_sessions/{docId} | admin | Server only (Firebase Admin SDK) |

## COMPOSITE INDEXES

| Collection | Fields | Scope |
|---|---|---|
| projects | pmUserId ASC, updatedAt DESC | COLLECTION |
| projects | orgId ASC, updatedAt DESC | COLLECTION |
| costReviews | projectId ASC, reviewDate DESC | COLLECTION |
| costReviewImports | costReviewId ASC, importedAt DESC | COLLECTION |

## AI FEATURES (17 total)

| Feature Key | Default Model | API Route | Called By |
|---|---|---|---|
| sop-qa | gpt-4o | /api/ai/copilot/sop-qa | FE Copilot, inline panel |
| next-actions | gpt-4o-mini | /api/ai/copilot/next-actions | FE Copilot, inline panel |
| draft-communication | gpt-4o | /api/ai/copilot/draft-communication | FE Copilot, inline panel |
| gate-check | gpt-4o-mini | /api/ai/copilot/gate-check | FE Copilot, inline panel |
| historical-search | gpt-4o-mini | /api/ai/copilot/historical-search | FE Copilot, inline panel |
| budget-analysis | gpt-4o | /api/ai/copilot/budget-analysis | FE Copilot, inline panel |
| schedule-deviations | gpt-4o-mini | /api/ai/copilot/schedule-deviations | FE Copilot, inline panel |
| document-review | gpt-4o | /api/ai/copilot/document-review | FE Copilot, inline panel |
| forms-auto-populate | gpt-4o-mini | /api/ai/forms/auto-populate | ProjectFormsTab |
| forms-agenda-builder | gpt-4o-mini | /api/ai/forms/agenda-builder | ProjectFormsTab |
| forms-generate-minutes | gpt-4o | /api/ai/forms/generate-minutes | ProjectFormsTab |
| reports-schedule-status | gpt-4o | /api/ai/reports/schedule-status | AiScheduleStatus |
| portfolio-insights | gpt-4o | /api/ai/portfolio-insights | DashboardPage |
| cost-estimate | gpt-4o | /api/ai/cost-estimate | EstimatorPage |
| weekly-update-draft | gpt-4o | /api/ai/weekly-update-draft | AiWeeklyStatus |
| tasks-extract | gpt-4o-mini | /api/ai/tasks/extract | Tasks hub / project detail |
| tasks-next-steps | gpt-4o-mini | /api/ai/tasks/suggest-next-steps | NextStepsList component |

## NEW SINCE LAST SCAN (2026-04-11 → 2026-05-03)

| Category | Item | Notes |
|---|---|---|
| Page | src/app/(app)/tasks/page.tsx | New standalone tasks hub page |
| Component | src/components/sitefolio/sf-overview-panel.tsx | SiteFolio project overview display |
| Component | src/components/sitefolio/sf-synced-schedule.tsx | SiteFolio synced schedule display |
| Component | src/components/tasks/task-status-badge.tsx | Task status badge |
| Component | src/components/tasks/task-project-sidebar.tsx | Project sidebar for tasks hub |
| Component | src/components/tasks/next-steps-list.tsx | AI next steps list |
| Component | src/components/tasks/task-section.tsx | Section grouping for tasks |
| Component | src/components/tasks/task-table.tsx | Table view for tasks |
| API Route | /api/sitefolio/sync/route.ts | SiteFolio full/single project sync (admin) |
| API Route | /api/sitefolio/sync/status/route.ts | Sync status endpoint |
| API Route | /api/sitefolio/import/route.ts | Import single SF project |
| API Route | /api/sitefolio/import/preview/route.ts | Preview SF project before import |
| API Route | /api/admin/projects/bulk-delete/route.ts | Bulk delete projects |
| API Route | /api/ai/tasks/extract/route.ts | AI task extraction |
| API Route | /api/ai/tasks/suggest-next-steps/route.ts | AI next steps |
| Lib | src/lib/sitefolio/sync.ts | Full SF sync engine |
| Lib | src/lib/sitefolio/parsers/index.ts | Parsers barrel export |
| Lib | src/lib/sitefolio/parsers/overview.ts | SF overview parser |
| Lib | src/lib/sitefolio/parsers/schedule.ts | SF schedule parser |
| Lib | src/lib/sitefolio/parsers/projects-list.ts | SF projects list parser |
| Lib | src/lib/firebase/sessions.ts | User session tracking |
| Type | src/types/task.ts | Task types |
| Type | src/types/sitefolio.ts | SiteFolio integration types |
| Type | src/types/session.ts | User session types |
| Type | src/types/dashboard.ts | Dashboard types (PortfolioAiCache) |

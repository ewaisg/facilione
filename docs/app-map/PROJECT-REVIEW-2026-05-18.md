# FaciliOne Project Review - 2026-05-18

## Scope

This review covers the current local repository at `C:\Users\ewaisg\VSProjects\facilione` as of May 18, 2026. I reviewed the application routes, API routes, Firebase/Admin layers, Firestore and Storage rules, AI runtime, SiteFolio integration, constants, types, docs, scripts, and feature wiring.

I counted 235 repository files with `rg --files` after excluding generated/dependency folders such as `node_modules`, `.next`, and `out`.

This file is an audit artifact only. No product code was changed.

## Verification Results

| Check | Result | Notes |
| --- | --- | --- |
| `npm run build` | PASS | Next production build completed and generated all routes. |
| `npm run lint` | PASS WITH WARNINGS | Warnings remain for raw `<img>` tags and unused imports/variables. `next lint` is deprecated for future Next versions. |
| `npm run format:check` | FAIL | Prettier reports style issues in 165 `src` files. |

Build warnings that matter:

- Next inferred the workspace root as `C:\Users\ewaisg` because another lockfile exists at `C:\Users\ewaisg\package-lock.json`. The project also has `C:\Users\ewaisg\VSProjects\facilione\package-lock.json`.
- Raw `<img>` usage appears in Admin, Login, and Sidebar where Next recommends `next/image`.
- Several unused imports or variables remain in project detail, tasks, copilot, forms, task table/sidebar, and AI sessions helpers.

## Bottom Line

FaciliOne is a real, buildable Next.js application. The authenticated shell, Firebase auth, dashboard, project list/detail, admin panel, FE Copilot, tasks hub, SOP/flowchart resources, estimator, SiteFolio sync surface, and many AI API routes exist in code and compile.

The app is not just a mockup, but several modules are still split between real backends and UI placeholders. The strongest live modules are Auth, Dashboard, Projects list/detail shell, Admin, Estimator, Tasks hub, Resources SOPs/Flowcharts, AI route layer, and SiteFolio sync plumbing. The weakest or unfinished areas are Reports, Settings, project-detail expansion tabs, forms AI wiring, IPECC processing, true KB/RAG, notifications, automation, broader Smart Tools, and several planned PM/FE modules.

The most important discovery is documentation drift: older app-map docs still describe issues that have since been fixed, while newer issues are not captured there. For example, `/api/admin/estimates` now exists and API auth is much better than the current discrepancy docs claim. At the same time, the code still has real gaps around formatting, Firestore rules, project type consistency, SiteFolio data usage, stale placeholder files, and some UI/API wiring.

## Current App Surface

Actual app routes:

- `/dashboard`
- `/projects`
- `/projects/[id]`
- `/team`
- `/tasks`
- `/fe-copilot`
- `/smart-tools`
- `/smart-tools/estimator`
- `/resources`
- `/resources/sops`
- `/resources/flowcharts`
- `/admin`
- `/profile`
- `/login`
- `/forgot-password`

Actual API surface includes:

- Admin: users, projects, estimates, branding, AI config/test/seed, parser apply, comparison snapshot imports.
- AI: copilot main route plus 8 copilot subroutes, cost estimate, portfolio insights, weekly update draft, historical comparisons, reports schedule status, forms routes, tasks routes.
- SiteFolio: auth, proxy, import, preview, sync, sync status, project team.
- Public utility: branding and health.
- Seed routes: SOPs, flowcharts, templates.
- Team list.

## Working Code And Features

### Auth And App Shell

Status: working.

- Firebase email/password login is implemented.
- Session cookie is set client-side using the Firebase ID token.
- Server API routes verify the cookie through Firebase Admin helpers.
- `AuthProvider` provides `useAuth()`, app user state, user Firestore profile loading, session tracking, password update, and sign-out.
- Middleware protects app pages by cookie presence.
- App layout performs client-side role/path checks using `canAccessPath()`.
- Sidebar and topbar render the main app shell.
- Branding logo is loaded in login/sidebar through the public branding endpoint.

Important caveat:

- Middleware only checks that a cookie exists. Real role validation happens in client route guards and API routes, not in middleware.
- `signOutAllDevices()` deletes Firestore session records but does not revoke Firebase refresh tokens through Admin SDK, so it is not true remote device revocation.

### Dashboard

Status: working with data caveats.

- Dashboard reads live Firestore projects through the client project subscription.
- KPI cards, health distribution, project type counts, phase counts, overdue logic, budget totals, recent projects, and AI portfolio brief exist.
- Recharts-based visual widgets are now present. Older docs saying all dashboard charts are placeholders are stale.
- AI portfolio brief uses `/api/ai/portfolio-insights` and caches a summary for 24 hours.

Important caveat:

- Dashboard schedule-overdue/progress calculations use root project fields such as `sfSchedule`. The current SiteFolio sync writes schedule data under `projects/{id}/sitefolio/schedule`, so dashboard schedule health can be stale or empty for newly synced SiteFolio data.

### Projects List

Status: working with a filter gap.

- Projects list subscribes to role-filtered Firestore project data.
- Search, type filters, status filters, health badges, budget/progress details, GO dates, and project cards exist.
- Admin/CM/PM access behavior is implemented through the client Firestore helpers and security rules.

Issue:

- The projects page type filter omits `F&D`; F&D projects can still appear under "All" but cannot be filtered directly.

### Project Detail

Status: partially working.

Working:

- Loads project by ID.
- Has current tabs: Schedule, Budget, Forms, Tasks, Reports.
- Schedule tab includes the Gantt chart and current SiteFolio synced schedule panel.
- Budget tab links to the Estimator and includes budget summary values.
- Forms tab renders the meeting form workspace UI.
- Tasks tab renders a project-local kanban board.
- Reports tab includes AI weekly/schedule status widgets and IPECC builder surface.
- Inline copilot panel exists.

Partial or not working:

- Budget Cost Review button is a disabled "Coming Soon" stub.
- Forms actions are mostly UI-only and toast "Coming in Phase 4".
- Project-detail Tasks tab uses local state; tasks vanish on refresh and are not connected to the persistent `/tasks` hub.
- IPECC Builder accepts files but does not parse/process/export a real packet.
- Planned tabs such as Overview, Bidding, Contracts, Requests, Documents, Team, and Photos are not implemented as real project detail tabs.

### Team

Status: partially working.

- Team directory loads users from `/api/team/list`.
- Project assignments and workload counts are computed from live project data.
- Role filters and search exist.

Partial:

- Overview/performance analysis cards are still "Coming soon".
- `/api/team/list` returns all safe user records to any authenticated user. There is no org-level filtering.

### Tasks Hub

Status: working, but split from project detail.

- `/tasks` is a persistent Firestore-backed task hub.
- It supports task projects, linked projects, custom fields, flat table, project sidebar, notes/history, snapshots, and AI task extraction UI.
- Firestore rules include taskProjects and subcollections.

Issues:

- The project-detail kanban board is a separate local-only task system and is not integrated with the persistent `/tasks` hub.
- Some older task components remain in the codebase and appear unused.

### FE Copilot

Status: working as a chat surface, but subfeatures are not wired as designed.

- Full-page FE Copilot chat exists.
- Session history exists through Firestore `ai-sessions` and `messages`.
- Streaming response handling is implemented.
- Inline copilot panel exists on project detail.
- Main `/api/ai/copilot` route is authenticated and calls the OpenAI-compatible runtime client.

Limitations:

- UI quick actions only insert prompt text and still call the main copilot route.
- The 8 specialized `/api/ai/copilot/*` routes exist, but the UI does not call them individually.
- Main copilot route always uses the `sop-qa` feature key and injects static SOP context, so model routing and tool behavior for budget/document/historical/gate tasks are not truly specialized from the UI.
- Inline copilot "open full page" uses `/fe-copilot?session=...`, but the full FE Copilot page does not read the `session` query parameter.

### Smart Tools

Status: Estimator working; rest mostly planned.

Estimator is one of the most complete modules:

- Presets exist.
- Manual line-item editing exists.
- CSV/XLSX import exists.
- AI analysis route exists.
- Save/load/delete estimate flows exist.
- Historical comparables and comparison workbook import support exist.
- Export support exists in the UI.

Partial:

- Estimator depends on AI configuration and Firestore indexes being correct.
- Built-in default rows are starter template data, not actual project cost history.
- Smart Tools index still has placeholder cards such as Bid Comparison.
- Most planned Smart Tools ST-02 through ST-13 are not implemented.

### Resources

Status: SOPs and Flowcharts working as static app data.

- SOP Quick Reference is implemented with real static SOP constants.
- Flowcharts are implemented using Mermaid diagrams and static constants.
- Search/filtering and project-type selection exist.

Partial:

- Resources Forms & Templates section is "Coming Soon".
- The pages read constants, not Firestore KB data.
- Seed routes can write SOP/flowchart/template data to Firestore, but no current UI reads that Firestore KB.

### Admin

Status: broad and mostly working.

Working:

- Users CRUD and listing exist.
- Projects listing and quick create exist.
- Admin estimates lookup endpoint exists.
- AI Setup supports provider/model/feature/agent configuration.
- Branding logo upload/delete exists.
- SiteFolio admin settings/status/sync/import controls exist.

Issues:

- Quick project create route allows admin, CM, and PM direct API access even though the UI is admin-only.
- Quick project create does not seed phases despite route comments implying it can.
- Project create validation is light; projectType/status/healthStatus/pmUserId are not strongly validated in the route.
- Single project delete cleans only `phases`; bulk delete cleans `phases` and `sitefolio`. Other related data such as weekly updates, imports, task projects, estimates, and AI sessions can remain orphaned.
- User PATCH can write an invalid role string; create validates roles, update does not.
- `forcePasswordChange` is written for new users but no enforcement flow was found.

### Profile

Status: working with a session caveat.

- Profile page shows user info, role, session list, password change, and session deletion controls.
- Local password change uses Firebase client auth.

Caveat:

- Deleting session records does not revoke Firebase tokens on other devices.

### SiteFolio

Status: real server-side integration exists.

Working shape:

- Playwright SSO helper exists for refreshing SiteFolio cookies.
- Cookies are stored in Firestore `sitefolio_sessions/current`.
- Client does not directly call SiteFolio.
- Server-side proxy, import preview, import, sync, sync status, and project team routes exist.
- Sync writes overview, comments, team, reports, and schedule documents under project `sitefolio` subcollections.
- Project detail can display synced schedule and overview/team data.

Requirements/caveats:

- Requires valid credentials/session in `.env.local` and Firestore.
- No automatic Cloud Function or scheduled sync exists.
- Portfolio dashboard and projects list still rely partly on root project schedule fields rather than the synced SiteFolio subcollection.
- `/api/sitefolio/project/[id]/team` authenticates the user but does not perform an explicit project access check before returning team data.

### Reports

Status: partial.

- AI weekly status and AI schedule status components/routes exist.
- IPECC builder UI exists.

Not working:

- The full `/reports` module does not exist.
- IPECC processing is a stub; it does not parse Oracle reports into a real packet.
- Oracle report constants describe report names and mappings, but sample availability is false and full processing is not implemented.

### Branding And Customization

Status: partial.

- Admin Branding can upload/delete a logo.
- Public `/api/branding` returns branding data.
- Sidebar and login page render custom logo.

Not complete:

- App name remains hardcoded as "FaciliOne" in visible areas.
- Forgot-password page does not use branding logo.
- Primary color, nav builder, module configuration, and org customization runtime are not implemented.
- `src/lib/customization/index.ts` is still an empty placeholder.

## API And Auth Findings

### Current Auth Matrix

Most API route auth is now present:

- Admin routes generally call `requireRoles()`.
- AI routes generally call `requireAppUser()`.
- Seed routes are admin-protected.
- SiteFolio admin routes are admin-protected.
- Public routes are limited to `/api/branding` and `/api/health`.

This means the old documentation claim that many admin/AI routes lack auth is stale.

### Remaining API Risks

- `/api/sitefolio/project/[id]/team` uses `requireAppUser()` but needs project-level authorization.
- `/api/team/list` exposes all safe user directory records to any authenticated user and does not filter by org or management relationship.
- `/api/admin/projects/create` allows `admin`, `cm`, and `pm`, while the Admin UI is admin-only.
- `/api/admin/users/[uid]` update path does not validate role values.
- `/api/ai/tasks/suggest-next-steps` imports the client Firestore helper `getProject` from `@/lib/firebase/firestore` inside a server route. That helper uses the client SDK, not Firebase Admin. This is likely to fail or behave incorrectly in a server request and should be replaced with Admin SDK reads plus project access checks.

## AI Findings

### What Exists

AI runtime configuration exists in `src/lib/ai/runtime-config.ts` and resolves from Firestore `systemSettings/ai`. The app supports OpenAI-compatible/Azure-style runtime config. Admin AI Setup can configure providers, models, feature maps, and agents.

Implemented AI API routes include:

- Main copilot
- Copilot subfeatures: SOP QA, next actions, draft communication, gate check, historical search, budget analysis, schedule deviations, document review
- Cost estimate
- Portfolio insights
- Weekly update draft
- Historical comparisons
- Reports schedule status
- Forms auto-populate
- Forms agenda builder
- Forms generate minutes
- Forms image minutes
- Forms transcribe minutes
- Tasks extract
- Tasks suggest next steps

### Feature Map Drift

Docs say AI has 17 feature keys. Source currently defines 15 configurable `AiFeature` keys:

- `weekly-update-draft`
- `portfolio-insights`
- `cost-estimate`
- `sop-qa`
- `next-actions`
- `draft-communication`
- `gate-check`
- `historical-search`
- `budget-analysis`
- `schedule-deviations`
- `document-review`
- `forms-auto-populate`
- `forms-agenda-builder`
- `forms-generate-minutes`
- `reports-schedule-status`

The source does not define separate `tasks-extract` or `tasks-next-steps` feature keys even though docs list them. Current task routes reuse `forms-generate-minutes` and `next-actions`.

### RAG Reality

The app does not yet have a true KB RAG pipeline. SOP data is static TypeScript constants injected as context. There is no chunking, embedding, vector retrieval, citation store, or Firestore KB-backed retrieval in current UI behavior.

## Firebase And Data Findings

### Real Data Sources

Real/persistent sources:

- Firebase Auth users.
- Firestore `users`, `projects`, `estimates`, `ai-sessions`, task hub data, settings, branding, SiteFolio session and sync data.
- Firebase Storage branding assets.
- SiteFolio server-side sync when a valid session exists.
- Static SOP and flowchart data extracted into source constants.
- Static schedule templates in JSON/constants.

Static/template/non-live sources:

- Estimator default line items are starter templates, not live cost history.
- SOP/flowchart pages use source constants, not Firestore KB.
- Oracle report definitions are catalog/config data, not live parsed report data.
- Dashboard charts are real calculations from current project docs, but not full analytics.
- AI historical comparisons score locally across available Firestore data; there is no vector search.

Fake/stub/placeholder surfaces:

- Forms AI buttons in project forms tab.
- IPECC processing.
- Team overview analytics.
- Smart Tools Bid Comparison and most future smart tools.
- Resources Forms & Templates.
- Topbar global search and notification button.
- Cost Review button in project budget tab.
- Empty placeholder modules: `src/components/projects/index.ts`, `src/hooks/index.ts`, `src/lib/customization/index.ts`.

### Firestore Rules Issues

Rules that should be tightened or fixed:

- `kb` rule is `match /kb/{collection}/{docId}`, but seeded docs are nested deeper, such as `kb/sops/types/ns`, `kb/flowcharts/types/ns`, and `kb/templates/types/NS`. Current UI reads constants, so this is latent, but Firestore KB reads would not match the intended rule.
- `taskProjects` allows any authenticated user to create a task project without validating `createdBy`, `orgId`, or linked project access.
- `projects` create rule allows Admin/PM/CM client creates without validating `pmUserId`, `orgId`, project type, or ownership constraints.
- `ai-sessions` create rule does not validate that `userId == request.auth.uid`.
- `costReviewInputs` access helpers call project-style PM/CM helpers on cost review documents. If cost review docs only contain `projectId`, PM/CM access can be broken except for admins.
- Storage rules allow any authenticated user to read/write under any `projects/{projectId}/...` path and any org asset path. There is no project/org membership check.

### Missing Indexes

`src/lib/firebase/estimates.ts` queries:

- `estimates` where `userId == ...` ordered by `updatedAt desc`
- `estimates` where `projectId == ...` ordered by `updatedAt desc`

`firestore.indexes.json` does not include these estimates composite indexes. The old pending task mentions only `userId + updatedAt`; source also needs `projectId + updatedAt`.

## Project Type Findings

Actual TypeScript project type union:

- `NS`
- `ER`
- `WIW`
- `FC`
- `MC`
- `F&D`

Docs and user instructions mention seven project types including `MR` Minor Remodel. Current source does not include `MR`.

Inconsistencies:

- `F&D` exists in types, dashboard, admin quick create, estimator, and schedule constants.
- `F&D` is omitted from projects page filter buttons.
- `F&D` maps to the MC schedule template.
- SOP data covers only five main types: NS, ER, WIW, FC, MC, plus appendices. There is no separate F&D SOP.
- Flowcharts cover five main types; there is no separate F&D or MR flowchart.
- Docs mention `MR` in architecture/data inventory, but source does not model it.

## Date Handling Issue

`src/lib/utils/index.ts` formats date-only strings with `new Date(dateString).toLocaleDateString(...)`.

For ISO date-only strings like `2026-05-18`, JavaScript parses the value as UTC midnight. In Mountain Time, that can display as the previous calendar day. This can affect GO dates, milestone dates, schedule dates, reports, and any date-only value shown through these helpers.

Recommended fix: parse date-only strings as local dates or format manually instead of using `new Date("YYYY-MM-DD")`.

## Documentation Drift

Current app-map docs are useful but no longer fully accurate.

Stale or incorrect examples:

- Docs say `/api/admin/estimates` is missing. It now exists and is admin-protected.
- Docs say 15 API routes lack auth. The reviewed route files now generally include `requireRoles()` or `requireAppUser()`.
- Docs say dashboard charts are placeholders. The dashboard now has live chart widgets.
- Docs say Admin has only Users, Projects, AI Setup. Current Admin also has SiteFolio and Branding.
- Docs mention planned or placeholder files that still exist, but some descriptions are outdated relative to current implementation.
- `src/docs/FaciliOne_Blueprint.md` still repeats several older status claims.
- Docs say `AiFeature` has 17 features, but source defines 15 feature keys.

Docs still accurate:

- Team analytics are partial.
- Smart Tools Bid Comparison is placeholder.
- IPECC is stubbed.
- Resources Forms & Templates is not built.
- Project-detail Cost Review is not built.
- Empty placeholder files still exist in projects/hooks/customization.
- Many planned Phase 2-6 modules remain missing.

## Not Implemented Or Missing

Major modules not present:

- `/reports` module.
- `/settings` module.
- `/projects/compare`.
- `/projects/timeline`.
- Project creation wizard with phase seeding.
- Full project Overview/Bidding/Contracts/Requests/Documents/Team/Photos tabs.
- Budget tracker module.
- Document upload/workflow module.
- Meetings module.
- Calendar module.
- Sequence Tracker.
- SWPPP Tracker.
- SPG Gate Tracker.
- CA Log.
- PO Reference Tool.
- Most Smart Tools ST-02 through ST-13.
- True analytics module.
- Notification center.
- Cloud Functions/automation.
- PWA/mobile layer.
- True KB/RAG pipeline.
- True SiteFolio scheduled sync.
- Real IPECC report packet generation.
- Actual forms/template resource library.
- Actual branding customization beyond logo.

## Dead, Orphaned, Or Legacy-Looking Code

These files or areas appear unused, placeholder, or disconnected from current UI:

- `src/components/schedule/sf-schedule-panel.tsx` is only referenced in docs and appears orphaned. Current project detail uses `src/components/sitefolio/sf-synced-schedule.tsx`.
- `src/lib/schedule/sitefolio-html-import.ts` appears tied to the orphaned schedule panel.
- `src/lib/schedule/sitefolio-overview-import.ts`, `src/lib/schedule/sitefolio-files-reports-import.ts`, `uploadProjectImportFile`, and `/api/admin/parsing/apply` appear to be earlier parser/import workflow pieces with no current UI caller found.
- `src/components/projects/index.ts` exports nothing.
- `src/hooks/index.ts` exports nothing.
- `src/lib/customization/index.ts` exports nothing.
- Older task components such as `TaskSection`, `TaskTable`, and `NextStepsList` appear separate from the current `/tasks` hub.
- `NextStepsList` uses `dangerouslySetInnerHTML` and should be sanitized or converted to plain rendering if revived.
- `SfSchedulePanel` maps fragments without keys and can trigger React key warnings if revived.

## Security And Access Priority Findings

Highest priority:

1. Add project-level access checks to `/api/sitefolio/project/[id]/team`.
2. Fix Firestore rules for `taskProjects`, `ai-sessions`, project creates, KB nested docs, and cost review input access.
3. Tighten Storage rules to require project/org access.
4. Fix `/api/ai/tasks/suggest-next-steps` to use Firebase Admin SDK and verify project access.
5. Validate roles in `/api/admin/users/[uid]` PATCH.
6. Reconcile `/api/admin/projects/create` role access with intended product behavior.

## Feature Priority Findings

Recommended product priority order:

1. Update app-map/status docs so they match the current code.
2. Run Prettier or gradually format the codebase so `npm run format:check` passes.
3. Fix the date-only formatting bug before schedule/GO reporting grows further.
4. Reconcile project type model: decide whether `MR` exists and whether `F&D` needs separate SOP/flowchart/filter behavior.
5. Connect dashboard/projects list schedule health to the current SiteFolio synced subcollection model.
6. Wire FE Copilot quick actions to the specialized subroutes or remove the dead route expectation.
7. Integrate project-detail Tasks with the persistent `/tasks` hub.
8. Finish Forms AI UI wiring to the existing API routes.
9. Replace IPECC stub with real parser/output behavior or mark it explicitly as future.
10. Add missing Firestore indexes for estimates queries.
11. Implement real project creation wizard with phase seeding.
12. Add project/org access-aware team directory behavior.

## Source Inventory And Purpose Map

### `src/app`

- `page.tsx`: redirects root to dashboard.
- `(auth)`: login and forgot-password pages.
- `(app)`: authenticated app pages and layout.
- `api`: server route layer for admin, AI, SiteFolio, seeding, branding, health, and team.

### `src/components`

- `layout`: sidebar and topbar shell.
- `ui`: shadcn/Radix-style primitives.
- `copilot`: inline project copilot panel.
- `forms`: project forms tab and meeting form UI.
- `reports`: AI weekly/schedule status and IPECC stub.
- `schedule`: Gantt chart plus orphaned legacy SiteFolio schedule panel.
- `sitefolio`: current synced overview/schedule/team display components.
- `tasks`: persistent tasks hub components and older project task components.
- `projects`: empty placeholder barrel.

### `src/lib`

- `firebase`: client Firebase setup and client Firestore helpers.
- `firebase-admin`: server Admin SDK and request auth helpers.
- `ai`: runtime config, AI invocation client, historical comparison and parser helpers.
- `sitefolio`: server-side SiteFolio session/fetch/sync/parser logic.
- `schedule`: schedule templates, phase seeding, legacy import parsers.
- `utils`: formatting and UI utility helpers.
- `access-control`: client path/role access helper.
- `customization`: empty placeholder.

### `src/types`

Type definitions cover users, projects, schedule, budgets, smart tools, estimates, SOPs, tasks, AI sessions, customization, and SiteFolio.

Important type drift: `ProjectType` has six values and does not include `MR`.

### `src/constants`

Constants contain project type labels/funding, schedule data, SOP data, flowchart diagrams, estimate presets, Oracle report definitions, and Oracle parent mappings.

Important data reality: SOPs and flowcharts are real static source data, not Firestore-driven runtime data.

### Rules And Config

- `firestore.rules`: extensive but needs validation hardening.
- `storage.rules`: too broad for authenticated project/org files.
- `firestore.indexes.json`: missing estimates indexes.
- `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tailwind` through CSS v4 setup, `tsconfig.json`: project tooling.
- `.firebaserc`: points to Firebase project `facilione`.

### Scripts

- `scripts/refresh-sitefolio-session.ts`: Playwright-based SiteFolio SSO session refresh.
- `scripts/seed-flowcharts.mjs`, `scripts/seed-sops.mjs`, `scripts/seed-templates.mjs`: Firestore seed helpers.
- `scripts/render-sop-mermaid.mjs`: Mermaid/SOP rendering helper.

## Final Assessment

FaciliOne is in a useful middle stage: it has a real application foundation and several genuinely functional modules, but it also has a lot of planned-product surface area represented by docs, constants, stubs, and partially wired UI. The largest engineering risk is not compilation; the build passes. The larger risks are data integrity, access control, stale docs, Firestore rules/index gaps, disconnected modules, and features that look present in the UI but are not actually wired to persistence or processing.

The next best move is to stabilize the foundation before adding more modules: update docs, format code, fix access/data rules, align project types, fix date formatting, and wire the existing partial features before building brand-new pages.

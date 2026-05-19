# FaciliOne Product Scope Decisions - 2026-05-19

This file normalizes the edited tree decisions provided on 2026-05-19. It is now the working scope reference for what to keep, remove, move, complete, or defer.

No product code was changed when creating this file.

## Executive Direction

FaciliOne should become a tighter PM command center centered on:

- Dashboard
- Projects
- Project-specific Tasks
- FE Copilot
- Smart Tools
- Resources and Knowledge Base
- Admin
- Settings/Profile
- SiteFolio as the main synced data source

The app should remove or hide broad placeholder modules that are not useful yet, especially Team, standalone Tasks, project-detail Reports, project-detail Budget, notifications, topbar search, Cost Review, IPECC, Document Reviewer as a visible product feature, and most old roadmap modules.

SiteFolio synced data should be the main source whenever available. User-entered/manual data should remain available as an override or fallback.

## Major Keep/Remove Summary

### Keep And Complete

- Dashboard, using current SiteFolio synced data plus user-entered overrides.
- Projects list and project detail.
- Project detail Schedule tab, rebuilt around SiteFolio sync plus manual override.
- Project detail Forms tab, but redesigned around fixed structured forms provided by the user.
- Project detail Tasks tab, using persistent project tasks.
- FE Copilot, including specialized routing and real UI entry points.
- Smart Tools, especially Estimator and historical estimate comparison.
- Resources and Knowledge Base, backed by Firestore when content changes.
- Admin, with all known risks fixed.
- Profile functionality, but accessed through topbar/settings rather than sidebar bottom link.
- Settings module for profile/preferences and customization.
- SiteFolio integration and scheduled sync.
- Reports module only for direct SiteFolio report downloads.

### Remove Entirely

- Sidebar Tasks route.
- Sidebar Team route and Team page.
- Sidebar Profile link.
- Topbar search button.
- Topbar notification bell.
- Notification center/badge feature.
- Project detail Budget tab.
- Project detail Reports tab.
- Project detail Team tab.
- Standalone task-list workflow.
- Project comparison route.
- Portfolio timeline route.
- Cost Review.
- IPECC Builder.
- Data Completeness report.
- Custom Reports.
- Contacts resource route.
- MR project type from docs/source references.
- Legacy/orphaned SiteFolio parsers and old schedule panel.
- Most future roadmap modules not selected below.

### Keep In Docs/Plans Only

These should remain for future planning, but should not be current visible app modules:

- Project detail Bidding.
- Project detail Contracts.
- Project detail Requests.
- Project detail Documents.
- Project detail Photos.
- Project detail all-project Overview beyond current SiteFolio overview.
- SiteFolio data tabs beyond schedule/overview.

## Navigation Decisions

### Sidebar

Final sidebar should contain:

```text
Sidebar
├── Dashboard
├── Projects
├── FE Copilot
├── Smart Tools
├── Resources & KB
│   ├── SOP Reference
│   └── Flowcharts
├── Reports
├── Settings
└── Admin
```

Remove from sidebar:

- Tasks
- Team
- Profile

Profile remains accessible from the topbar user menu.

### Topbar

Keep:

- Page title.
- User menu.
- Profile link in user menu.
- Sign out.

Remove:

- Search icon button.
- Notification bell.

Fix:

- Page title mapping should include all kept routes.

## Auth And Branding

Keep:

- Login.
- Forgot password.
- Email/password auth.

Complete:

- Branding should allow users/admins to add, edit, or remove the logo completely.
- Branding should support app name/theme customization if kept in Settings/Admin customization.
- Forgot-password should align with branding if branding is active.

## Dashboard Decisions

Dashboard stays.

Dashboard data source priority:

1. SiteFolio synced data.
2. User-entered/manual override data.
3. Existing project fields as fallback.

Keep and complete:

- KPI cards.
- AI portfolio brief.
- Project health table.
- Projects by type chart.
- Phase/pipeline chart.
- Schedule risk/heat widget.
- Portfolio summary.
- Recent/active project summaries.
- Data freshness panel.
- Simple drilldown analytics.

Remove:

- Alerts and action items.
- Notification badge integration.

## Projects Decisions

Projects list stays.

Complete:

- Add `F&D` to type filter.
- Keep project list/cards.
- Keep search.
- Keep status/health display.
- Keep project detail links.

Remove from planned routes:

- `/projects/compare`
- `/projects/timeline`

## Project Detail Decisions

Project detail stays and should be completed around fewer, stronger tabs.

### Final Project Detail Tabs

```text
Project Detail
├── Overview
├── Schedule
├── Forms
└── Tasks
```

Conditional current SiteFolio overview may remain while the all-project overview stays in future docs/plans.

Remove current tabs:

- Budget.
- Reports.
- Team.

### Header

Keep:

- Back to Projects.
- Project type badge.
- Health badge.
- Store number/name/state.
- Grand opening date.
- Total budget.

### Overview Tab

Current decision is not fully explicit.

Working resolution:

- Keep current SiteFolio overview for linked projects.
- Do not expand into the full planned all-project Overview yet.
- Leave full Overview concept in docs/plans for future planning.

### Schedule Tab

Decision:

- Use SiteFolio sync at all times when available.
- Allow manual user overrides.
- Remove old alternate schedule/parsing systems.

Implementation direction:

- Replace legacy phase-template schedule logic with SiteFolio-backed schedule display/editing.
- Keep a Gantt/timeline only if it is fed by SiteFolio synced schedule plus manual overrides.
- Remove orphaned schedule parser code that is no longer part of this model.

### Forms Tab

Decision:

- Keep and rebuild around fixed structured forms the user will provide.
- Use placeholders inside those structured forms so AI can fill them.
- Use AI for agenda/minutes/form assistance.

Keep/complete:

- Meeting notes editor.
- AI structured form fill.
- AI agenda builder.
- AI minutes generation from typed notes or structured input.

Remove:

- Current template/form selector.
- Audio upload.
- Image upload.
- Export buttons.

### Tasks Tab

Decision:

- Complete tasks inside Projects instead of keeping `/tasks`.
- Add a dropdown to switch between projects.
- Use Firestore persistence.

Implementation direction:

- Remove current local-only `TaskKanbanBoard`.
- Move/refactor the persistent task hub model into Project Detail Tasks.
- Use project-linked task data only.
- Remove standalone task lists unless explicitly needed later.

### Inline Copilot

Keep and complete:

- Floating Copilot button.
- Chat panel.
- Open full page action.

Fix:

- Full page copilot should honor a selected/opened session or project context.

## Standalone Tasks Decisions

Remove:

- `/tasks` route.
- Sidebar Tasks nav item.
- Standalone task project selector.
- New standalone task list modal.
- Standalone task hub UI.
- Legacy task components.

Keep conceptually:

- The useful persistent task data model and controls should be reused inside Project Detail Tasks.

## Team Decisions

Remove entirely:

- `/team` route.
- Sidebar Team nav item.
- Team directory UI.
- Team analytics cards.
- Team page workload widgets.

Follow-up:

- Remove or restrict `/api/team/list` if no other kept feature needs it.
- SiteFolio project team tab is also removed from project detail.

## FE Copilot Decisions

Keep and complete:

- Full-page chat.
- Session history.
- Streaming responses.
- Suggested prompts/quick actions.
- SOP-grounded context.
- Specialized tool routing.

Implement in UI:

- SOP Q&A.
- Next Actions.
- Draft Communication / Email Drafter.
- Gate Check.
- Historical Search.
- Schedule Deviations / Schedule Analyzer.

Remove as visible Copilot features:

- Bid Review Assistant.
- SiteFolio Navigator.

Move into Forms/structured forms:

- Meeting Prep.
- Project Briefing.

## Copilot Conflict To Resolve

There is a conflict in the provided decisions:

- Section 7.1 says remove `budget-analysis` and `document-review` entirely.
- Section 15 says keep and complete every AI API route, including `budget-analysis` and `document-review`.

Working resolution until confirmed:

- Keep backend AI routes for now to avoid breaking build/config.
- Remove/hide Budget Analysis and Document Review from visible Copilot UI.
- Delete backend routes later only after confirming they are not needed by Smart Tools, Admin AI Setup, or future internal workflows.

## Smart Tools Decisions

Keep and complete Smart Tools.

### Estimator

Complete:

- Project info fields.
- Project type/source/funding fields.
- Estimate sections.
- Line item table.
- Presets.
- CSV/XLSX import.
- Save/load estimates.
- Export.
- AI analysis.
- Historical comparables.
- Estimate comparison workbook import.

### Bid Comparison / Historical Estimate Comparison

Rename or reshape into a historical estimate comparison tool.

Required behavior:

- User can compare the target estimate against 3 similar historical projects.
- User can manually select the 3 similar projects.
- AI can suggest the 3 similar projects.
- Tool shows how all 3 projects were estimated.
- Tool helps create a reasonable close estimate for the target project.
- No rigid rules beyond being reasonable and using available project details.

Remove as separate Smart Tools:

- Cost Review.
- PO Reference Tool.
- CA Log.
- Gate Compliance.
- IPECC Builder.
- Other future placeholder tools.

Fold into AI/Copilot/Forms instead of separate Smart Tool cards:

- Schedule Analyzer.
- Meeting Prep.
- Communication Drafter.
- Document Reviewer.

Complete:

- Historical Comparison with AI.

## Resources And Knowledge Base Decisions

Keep and complete Resources & KB.

### SOP Quick Reference

Keep:

- Search.
- Project type selector.
- NS.
- ER.
- WIW.
- FC.
- MC.
- Appendices.

Complete:

- Add F&D SOP and match it closely to WIW for now.

Remove:

- MR. There is no MR project type.

### Flowcharts

Keep:

- Mermaid rendering.
- Pan/zoom/navigation.
- NS.
- ER.
- WIW.
- FC.
- MC.

Complete:

- Add F&D flowchart.

Remove:

- MR flowchart references.

### Resources Routes

Complete:

- `/resources/knowledge-base`
- `/resources/procedures`
- `/resources/system-guides`
- `/resources/templates`

Remove:

- `/resources/contacts`
- Current placeholder Forms & Templates card as a vague stub.

Important data decision:

- Resources and KB should use Firestore as the source when content has changed.
- Static constants can remain as seed/fallback data, but runtime should load Firestore-backed content where appropriate.

## Admin Decisions

Keep Admin and fix all risks.

### Users Tab

Keep:

- Create user.
- Show temporary password.
- Copy temporary password.
- List users.
- Edit user.
- Delete user.

Fix:

- Validate role values on update.
- Ensure password/session expectations are clear.

### Projects Tab

Complete:

- Main source should be SiteFolio.
- User can still create a manual project if needed.
- Manual project shape should match SiteFolio synced projects as closely as possible.

Keep and fix:

- List projects.
- Quick create project.
- Edit project.
- Delete project.
- Bulk delete projects.
- Load estimate by project ID.

Move into Projects tab:

- SiteFolio preview import.
- Import selected projects.
- Sync all projects.
- Project mapping table.
- Sync single project.

Fix:

- Admin project create route should not allow CM/PM unless intentionally required.
- Manual create should seed or initialize schedule data using the selected source model.
- Deletes should clean related data or clearly archive instead.

### AI Setup Tab

Complete:

- Provider/global config.
- Model config.
- Feature model map.
- Agents config.
- Test config.
- Seed feature map.

### SiteFolio Tab

Working resolution:

- Move project import/sync controls to Admin Projects tab.
- Keep only session/connection settings elsewhere if still needed, likely Admin or Settings Sync.

### Branding Tab

Complete:

- Current logo preview.
- Upload/replace logo.
- Remove logo.
- App name override.
- Primary color/theme override.
- Nav/module customization only if still useful after removals.

## Profile And Settings Decisions

Profile functionality stays, but sidebar Profile is removed.

Recommended final route behavior:

- Topbar Profile opens `/settings/profile`.
- `/profile` can redirect to `/settings/profile` for compatibility.

### Settings Module

Create `/settings`.

Keep in Settings:

- Profile settings.
- App preferences.
- Branding/customization preferences if user-facing.

Keep in Admin instead of Settings:

- Projects management.
- SiteFolio project import/sync.
- AI settings.

Open question:

- Whether SiteFolio connection/session health belongs in Admin or `/settings/sync`.

Working resolution:

- Admin owns system-level SiteFolio/AI/project controls.
- Settings owns personal profile/preferences and app customization visible to non-admins if allowed.

### Profile

Complete:

- Account info.
- Role/org info.
- Change password.
- Sessions list.
- Delete session.
- Sign out all devices.

Fix:

- True sign-out-all-devices should revoke Firebase refresh tokens, not only delete Firestore session docs.

## Reports Decisions

Remove from Project Detail:

- Reports tab.
- IPECC Builder.
- AI Weekly Status.
- AI Schedule Status.

Create/complete top-level Reports module for direct SiteFolio downloads:

```text
Reports
├── Reports hub
├── Division Status
└── SiteFolio Reports
```

Behavior:

- Use specific reports already available in SiteFolio.
- Reports should be direct file downloads once clicked.

Remove:

- Data Completeness.
- Custom Reports.

## SiteFolio Decisions

Complete SiteFolio integration and fix all risks.

Keep:

- Playwright SSO session refresh script.
- Firestore session store.
- Server-side SiteFolio fetch/proxy.
- Import preview.
- Project import.
- Full sync.
- Single-project sync.
- Sync status.
- Project detail synced schedule.
- Project detail synced overview.

Fix:

- Project detail synced team is removed from UI, but any remaining route must be protected or removed.
- Dashboard/list should use synced SiteFolio schedule data.
- Scheduled automatic sync is important and should be implemented.

Remove:

- `SfSchedulePanel`.
- `sitefolio-html-import`.
- `sitefolio-overview-import`.
- `sitefolio-files-reports-import`.
- `/api/admin/parsing/apply`.

## AI API Decisions

Keep for now:

- `/api/ai/copilot`
- `/api/ai/copilot/sop-qa`
- `/api/ai/copilot/next-actions`
- `/api/ai/copilot/draft-communication`
- `/api/ai/copilot/gate-check`
- `/api/ai/copilot/historical-search`
- `/api/ai/copilot/schedule-deviations`
- `/api/ai/cost-estimate`
- `/api/ai/portfolio-insights`
- `/api/ai/weekly-update-draft`
- `/api/ai/historical-comparisons`
- `/api/ai/reports/schedule-status`
- `/api/ai/forms/auto-populate`
- `/api/ai/forms/agenda-builder`
- `/api/ai/forms/generate-minutes`
- `/api/ai/forms/image-minutes`
- `/api/ai/forms/transcribe-minutes`
- `/api/ai/tasks/extract`
- `/api/ai/tasks/suggest-next-steps`

Fix:

- `/api/ai/tasks/suggest-next-steps` must use server-side/Admin Firestore access and enforce project access.

Conflict noted:

- Budget analysis and document review routes need confirmation before deletion because one section says remove and a later section says keep all AI API routes.

## Data Domain Decisions

Keep:

- `users`
- `organizations`
- `projects`
- `projects/{id}/sitefolio`
- `estimates`
- `kb`
- `ai-sessions`
- `imports` if needed for SiteFolio/import history
- `userPreferences`
- `customization`
- `systemSettings`
- `comparisonSnapshots`
- `estimateComparisonForms`
- `sitefolio_sessions`
- `taskProjects`, refactored to project-specific tasks

Remove or deprecate if no kept feature needs them:

- `notifications`
- `costReviews`
- `costReviewImports`
- `costReviewInputs`
- `costReviewSettings`
- standalone task list records
- legacy `phases` schedule model if replaced fully by SiteFolio schedule plus manual overrides
- `weeklyUpdates` if reports/weekly status are fully removed

Fix rules/indexes:

- Firestore project create validation.
- Firestore task project validation.
- Firestore KB nested docs.
- Firestore AI session ownership.
- Storage project/org access.
- Estimates composite indexes.

## Project Type Decisions

Keep and fully support:

- NS - New Store.
- ER - Existing Remodel.
- WIW - Walk-In Walk-Out.
- FC - Fixture Changeout.
- MC - Minor Capital.
- F&D - Floor & Decor.

Remove:

- MR - Minor Remodel. This should be removed from docs/plans/source references because it does not exist as a real supported type.

Complete:

- F&D filter in Projects.
- F&D SOP.
- F&D flowchart.
- F&D schedule/data behavior.

## Roadmap Decisions

Complete:

- Reports module, limited to direct SiteFolio report downloads.
- Settings module, focused on profile/preferences/customization.
- True scheduled SiteFolio sync.
- True Firestore-backed KB/RAG-style retrieval where useful for Copilot/Resources.

Remove:

- Project comparison.
- Portfolio timeline.
- Budget tracker.
- Document upload/workflow as a separate module.
- Standalone Meetings module.
- Calendar module.
- Sequence Tracker.
- SWPPP Tracker.
- SPG Gate Tracker.
- CA Log.
- PO Reference Tool.
- Notification center.
- PWA/mobile for now.

## Implementation Phases

### Phase 1 - Navigation And Surface Cleanup

- Remove Sidebar Tasks, Team, and Profile.
- Remove topbar search and notification buttons.
- Add Settings and Reports to navigation if confirmed.
- Add F&D project filter.
- Remove Project Detail Budget, Reports, and Team tabs.
- Keep Project Detail Overview, Schedule, Forms, Tasks.
- Update page titles and access control.

### Phase 2 - Tasks Refactor

- Remove standalone `/tasks` route UI.
- Reuse persistent task data model inside Project Detail Tasks.
- Add project switch dropdown.
- Remove local-only `TaskKanbanBoard`.
- Remove legacy task components not needed.

### Phase 3 - SiteFolio First Data Model

- Make Dashboard and Projects consume SiteFolio synced schedule/overview data first.
- Add manual override model.
- Remove old schedule parser/template code.
- Move SiteFolio import/sync controls into Admin Projects.
- Add scheduled sync design/implementation.

### Phase 4 - Admin And Security Fixes

- Fix role validation.
- Fix project create roles and validation.
- Fix delete/orphan risks.
- Fix Firestore and Storage rules.
- Add missing indexes.
- Fix true sign-out-all-devices behavior.

### Phase 5 - Copilot And AI Completion

- Wire quick actions to specialized routes.
- Complete SOP Q&A, next actions, draft communication, gate check, historical search, and schedule deviations in UI.
- Fix session/project context handoff.
- Resolve budget-analysis/document-review route conflict.

### Phase 6 - Forms And Resources

- Rebuild forms tab after user provides fixed structured templates.
- Complete AI fill/agenda/minutes for structured forms.
- Remove audio/image/export features from forms.
- Move Resources to Firestore-backed content.
- Add F&D SOP and F&D flowchart.
- Remove MR references.
- Add planned resource routes except contacts.

### Phase 7 - Smart Tools And Reports

- Complete Estimator gaps.
- Build historical estimate comparison around 3 selected/AI-selected similar projects.
- Add top-level Reports module for direct SiteFolio report downloads.
- Remove Cost Review/IPECC and other unused tool placeholders.

## Resolved Implementation Decisions

1. Budget Analysis AI route:
   - Keep backend route for now; remove from visible Copilot quick actions until a kept feature needs it.

2. Document Review AI route:
   - Keep backend route for now; remove from visible Copilot quick actions until a kept feature needs it.

3. SiteFolio connection/settings location:
   - Admin owns system-level SiteFolio controls; Settings owns user profile/preferences.

4. Project Overview tab:
   - Keep current SiteFolio-linked overview for now. Leave full all-project overview in future planning.

5. `weeklyUpdates` and AI weekly/schedule status:
   - Keep backend routes for now; remove Project Detail Reports tab from current UI.

6. Legacy `phases` schedule data:
   - Keep until the SiteFolio-first/manual-override schedule refactor replaces it safely.

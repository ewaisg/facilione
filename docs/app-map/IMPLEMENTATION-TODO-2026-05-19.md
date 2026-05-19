# FaciliOne Scope Implementation TODO - 2026-05-19

This TODO tracks implementation against `docs/app-map/PRODUCT-SCOPE-DECISIONS-2026-05-19.md`.

## Conflict Resolutions

- [x] Budget Analysis AI route: keep backend for now; remove from visible Copilot quick actions until a kept feature needs it.
- [x] Document Review AI route: keep backend for now; remove from visible Copilot quick actions until a kept feature needs it.
- [x] SiteFolio settings location: Admin owns system-level SiteFolio controls; Settings owns user profile/preferences.
- [x] Project Overview tab: keep current SiteFolio-linked overview only for now; leave full all-project overview for future planning.
- [x] Weekly/status report routes: keep backend for now; remove the Project Detail Reports tab from the UI.
- [x] Legacy phases schedule model: keep until the SiteFolio-first/manual-override schedule refactor replaces it safely.

## Phase 1 - Navigation And Surface Cleanup

- [x] Remove Sidebar Tasks nav item.
- [x] Remove Sidebar Team nav item.
- [x] Remove Sidebar Profile bottom link.
- [x] Remove Topbar search button.
- [x] Remove Topbar notifications button.
- [x] Add Reports navigation.
- [x] Add Settings navigation at the sidebar bottom action area.
- [x] Route topbar Profile action to Settings profile.
- [x] Add F&D project type filter.
- [x] Remove Project Detail Budget tab from visible UI.
- [x] Remove Project Detail Reports tab from visible UI.
- [x] Remove Project Detail Team tab from visible UI.
- [x] Remove standalone Tasks page route.
- [x] Remove standalone Team page route.
- [x] Remove unused Team list API route.
- [x] Remove Budget Analysis quick action from FE Copilot empty state.
- [x] Remove Document Review quick action from FE Copilot empty state.
- [x] Remove Budget Analysis quick action from inline Copilot panel.
- [x] Add initial top-level Reports page for direct SiteFolio report links.
- [x] Add initial Settings routes.
- [x] Move Settings to sidebar bottom action area.
- [x] Collapse the app sidebar by default when entering FE Copilot.
- [x] Hide all logo placeholders when no branding logo is uploaded.

Phase 1 verification:

- [x] `npm run lint` passes with pre-existing warnings.
- [x] `npm run build` passes with pre-existing warnings.
- [ ] `npm run format:check` still needs the broader codebase formatting pass from the audit.

## Phase 2 - Project Tasks Refactor

- [x] Replace Project Detail local-only TaskKanbanBoard with persistent project-linked tasks.
- [x] Add project switch dropdown inside Project Detail Tasks.
- [x] Move the project switcher into the Tasks title area.
- [x] Show a switching status message when changing projects from Tasks.
- [x] Default Project Detail Tasks filter to All.
- [x] Add editable always-visible Project Info panel to Project Detail Tasks.
- [x] Migrate/reuse useful persistent task hub components inside Project Detail Tasks.
- [x] Remove legacy task UI components after the replacement compiles cleanly.
- [ ] Deprecate standalone task list data behavior after project-linked tasks are stable.
- [ ] Remove legacy section/custom-field Firestore APIs after confirming no migration need remains.

Phase 2 verification:

- [x] `npm run lint` passes with remaining unrelated warnings.
- [x] `npm run build` passes with remaining unrelated warnings.

## Phase 3 - SiteFolio-First Data Model

- [x] Add shared client schedule-summary helper that prefers `projects/{id}/sitefolio/schedule`.
- [x] Make Dashboard consume SiteFolio synced schedule data first for overdue milestone counts.
- [x] Add Dashboard SiteFolio data freshness panel.
- [x] Make Projects list consume SiteFolio synced schedule data first for progress/next milestone cards.
- [x] Clean up Project Detail Overview layout and label SiteFolio status as sourced data.
- [x] Add editable always-visible Project Info panel to Project Detail Overview.
- [x] Move Project Detail SiteFolio reports from Overview content into a Reports tab.
- [x] Remove legacy empty Gantt schedule message when SiteFolio schedule is the active source.
- [ ] Add manual override model for schedule/overview fields.
- [x] Move SiteFolio project import/sync controls into Admin Projects tab.
- [x] Remove separate Admin SiteFolio top-level tab after move.
- [ ] Remove orphaned SiteFolio parser code after dependency check.
- [ ] Design scheduled SiteFolio sync.
- [ ] Implement scheduled SiteFolio sync.

Phase 3 partial verification:

- [x] `npm run lint` passes with remaining unrelated warnings.
- [x] `npm run build` passes with remaining unrelated warnings.

## Phase 4 - Admin, Rules, And Security

- [x] Restrict admin project create route to admin unless a specific exception is needed.
- [x] Validate project create/update payloads.
- [x] Validate user role on PATCH.
- [x] Fix project delete/bulk delete orphan risks for project subcollections, linked task workspaces, estimates, and AI sessions.
- [x] Fix Firestore task project create rules.
- [x] Fix Firestore AI session ownership rules.
- [x] Fix nested Firestore KB rules.
- [x] Tighten Storage project/org access.
- [x] Add estimates composite indexes.
- [ ] Implement true Firebase refresh-token revocation for sign out all devices.

## Phase 5 - Copilot And AI Completion

- [ ] Wire full-page Copilot quick actions to specialized routes.
- [ ] Wire inline Copilot quick actions to specialized routes.
- [ ] Fix full-page session/project handoff from inline Copilot.
- [ ] Complete SOP Q&A UI flow.
- [ ] Complete Next Actions UI flow.
- [ ] Complete Draft Communication / Email Drafter UI flow.
- [ ] Complete Gate Check UI flow.
- [ ] Complete Historical Search UI flow.
- [ ] Complete Schedule Deviations UI flow.
- [ ] Fix `/api/ai/tasks/suggest-next-steps` to use Admin SDK and project access checks.

## Phase 6 - Forms And Resources

- [ ] Rebuild Project Forms tab after fixed structured forms are provided.
- [ ] Remove current form template selector.
- [ ] Remove form audio/image upload controls.
- [ ] Remove form export controls.
- [ ] Complete AI structured form fill.
- [ ] Complete AI agenda builder.
- [ ] Complete AI minutes generation.
- [ ] Move Resources runtime reads to Firestore-backed content where content changes.
- [ ] Add F&D SOP close to WIW.
- [ ] Add F&D flowchart.
- [ ] Remove MR references from docs/source.
- [ ] Add `/resources/knowledge-base`.
- [ ] Add `/resources/procedures`.
- [ ] Add `/resources/system-guides`.
- [ ] Add `/resources/templates`.
- [ ] Remove `/resources/contacts` from docs/plans.

## Phase 7 - Smart Tools And Reports

- [ ] Complete Estimator gaps.
- [ ] Build historical 3-project comparison workflow.
- [ ] Let user select 3 similar historical projects.
- [ ] Let AI suggest 3 similar historical projects.
- [ ] Use comparison to draft a reasonable target estimate.
- [ ] Expand Reports direct SiteFolio download UX after real report URLs are synced.

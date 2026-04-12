---
name: QA Verification History
description: Full QA verification results across runs, common drift patterns, and stable structural invariants
type: project
---

## Run 1: 2026-04-10 (initial)
14 issues found (3C, 7W, 4I). Common drift: API response formats (`{ok: true}` vs `{success: true}`), missing utils, orphaned constants, undocumented middleware/hooks, costReviewInputs access path description.

## Run 2: 2026-04-10 (re-verification)
0 issues found. All 14 fixes confirmed correct. Full PASS.

## Run 3: 2026-04-11 (full from-scratch Cartographer re-scan + QA)
8 issues found (1C, 5W, 2I). New Cartographer scan was mostly accurate but regressed on:
- firestore.ts function count (claims 11, actual 10)
- sf-schedule.ts missing 2 exports (isDatePast, formatScheduleDate)
- EstimateLoaderTab undocumented in MAP-admin.md
- EstimateLoaderTab broken API dependency (/api/admin/estimates) dropped from DISCREPANCIES.md
- src/docs/ directory and scripts/ not acknowledged in any MAP file

## Run 4: 2026-04-11 (re-verification after Cartographer fixes for Run 3)
1 issue found (0C, 0W, 1I). All 8 prior issues confirmed resolved. Only remaining item: MASTER-TREE.md UI component count says "14 components" but 15 files listed and exist on disk. Overall PASS.

## Stable structural invariants (verified across 4 runs):
- UserRole = admin | cm | pm (no director -- CLAUDE.md has stale reference)
- SmartToolId = estimator | bid-comparison
- AiFeature = exactly 15 values
- Sidebar nav order: Dashboard, Projects, Team, FE Copilot, Smart Tools, Resources & KB, Admin
- Admin tabs: Users, Projects, AI Setup
- Project detail tabs: Schedule, Budget, Forms, Tasks, Reports
- All deleted pages/constants/types confirmed absent

## Known permanent discrepancies (by design or deferred):
- CLAUDE.md `director` role -- doc error, not code
- 13 unauthenticated API routes -- security concern, not a doc issue
- 8 orphaned copilot sub-routes -- exist for future use
- F&D missing from project type filter buttons
- Cost review collections have rules but no client code
- Notifications collection has rules but no UI

**Why:** Tracks verification history to detect regression in future runs.
**How to apply:** Compare future runs against these baselines. If previously-fixed items regress, flag them as high priority.

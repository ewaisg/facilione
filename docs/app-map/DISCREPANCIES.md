# DISCREPANCIES.md — FaciliOne Codebase Discrepancies

Scan date: 2026-04-11
Scanner: App Cartographer (full from-scratch scan)

---

## 1. Role Discrepancy

| ID | Category | Description | Location |
|---|---|---|---|
| R-01 | Role mismatch | CLAUDE.md lists four roles including "director", but UserRole in src/types/user.ts only defines "admin" \| "cm" \| "pm". No "director" role exists anywhere in code, firestore.rules, or any component. | CLAUDE.md line "Four roles: admin, cm, pm, director" vs src/types/user.ts |

## 2. Missing Auth on API Routes

| ID | Category | Description | Location |
|---|---|---|---|
| A-01 | Missing auth | POST /api/admin/users — no requireRoles or requireAppUser call | src/app/api/admin/users/route.ts |
| A-02 | Missing auth | GET /api/admin/users/list — no auth middleware | src/app/api/admin/users/list/route.ts |
| A-03 | Missing auth | PATCH/DELETE /api/admin/users/[uid] — no auth middleware | src/app/api/admin/users/[uid]/route.ts |
| A-04 | Missing auth | GET /api/admin/projects/list — no auth middleware | src/app/api/admin/projects/list/route.ts |
| A-05 | Missing auth | PATCH /api/admin/projects/[id] — no auth middleware | src/app/api/admin/projects/[id]/route.ts |
| A-06 | Missing auth | POST /api/admin/parsing/apply — no auth middleware | src/app/api/admin/parsing/apply/route.ts |
| A-07 | Missing auth | POST /api/ai/portfolio-insights — no auth middleware | src/app/api/ai/portfolio-insights/route.ts |
| A-08 | Missing auth | POST /api/ai/cost-estimate — no auth middleware | src/app/api/ai/cost-estimate/route.ts |
| A-09 | Missing auth | POST /api/ai/weekly-update-draft — no auth middleware | src/app/api/ai/weekly-update-draft/route.ts |
| A-10 | Missing auth | POST /api/ai/historical-comparisons — no auth middleware | src/app/api/ai/historical-comparisons/route.ts |
| A-11 | Missing auth | POST /api/seed-sops — no auth middleware | src/app/api/seed-sops/route.ts |
| A-12 | Missing auth | POST /api/seed-flowcharts — no auth middleware | src/app/api/seed-flowcharts/route.ts |
| A-13 | Missing auth | POST /api/seed-templates — no auth middleware | src/app/api/seed-templates/route.ts |

Note: Routes A-01 through A-06 are under /api/admin/ but lack server-side auth. The admin page itself is guarded client-side by canAccessPath, but the API endpoints can be called directly.

## 3. Orphaned / Empty Files

| ID | Category | Description | Location |
|---|---|---|---|
| O-01 | Empty placeholder | src/components/projects/index.ts — exports nothing, contains only a comment about planned components | src/components/projects/index.ts |
| O-02 | Empty placeholder | src/hooks/index.ts — exports nothing, contains only comments about planned hooks | src/hooks/index.ts |
| O-03 | Empty placeholder | src/lib/customization/index.ts — exports nothing, planned for Phase 6 | src/lib/customization/index.ts |

## 4. Firestore Rules Without Client Code

| ID | Category | Description | Location |
|---|---|---|---|
| F-01 | Rules only | organizations/{orgId} — security rules exist but no code reads or writes this collection | firestore.rules line 49-53 |
| F-02 | Rules only | customization/{orgId}/{document=**} — security rules exist but no code uses this collection | firestore.rules line 56-61 |
| F-03 | Rules only | notifications/{notificationId} — security rules exist but no code uses this collection | firestore.rules line 129-136 |
| F-04 | Rules only | userPreferences/{userId} — security rules exist but no code uses this collection | firestore.rules line 158-162 |
| F-05 | Rules only | costReviewImports, costReviewInputs, costReviewSettings — security rules and indexes exist but no client code writes to these collections | firestore.rules lines 188-225 |

## 5. Collections Without Security Rules

| ID | Category | Description | Location |
|---|---|---|---|
| S-01 | No rules | systemSettings/ai — accessed via Admin SDK only (safe by default denial) but no explicit rule | Used by src/lib/ai/runtime-config.ts |
| S-02 | No rules | comparisonSnapshots/{id} — accessed via Admin SDK only | Used by historical-comparisons.ts, comparison-snapshots import route |
| S-03 | No rules | estimateComparisonForms/{id} — accessed via Admin SDK only | Used by historical-comparisons.ts, estimate-comparison-forms import route |

## 6. Unused Exports / Types

| ID | Category | Description | Location |
|---|---|---|---|
| U-01 | Unused type | SmartToolMeta interface is defined but never used in code | src/types/smart-tools.ts |
| U-02 | Unused type | BudgetLineItem interface is defined but never used in any component or API route | src/types/budget.ts |
| U-03 | Unused type | NavItem, NavConfig, ModuleConfig in customization.ts — defined but never used | src/types/customization.ts |
| U-04 | Unused type | OrgBranding interface — defined but never used | src/types/customization.ts |
| U-05 | Unused constant | ORACLE_PARENT_PROJECT_CATALOG — defined but never imported by any code | src/constants/oracle-parents.ts |
| U-06 | Unused constant | ORACLE_REPORTS — defined but never imported by any code | src/constants/oracle-reports.ts |

## 7. API Routes Not Called By Client Code

| ID | Category | Description | Location |
|---|---|---|---|
| C-01 | Uncalled route | POST /api/ai/copilot/sop-qa — sub-feature route not called from any client code | src/app/api/ai/copilot/sop-qa/route.ts |
| C-02 | Uncalled route | POST /api/ai/copilot/next-actions — not called from client | src/app/api/ai/copilot/next-actions/route.ts |
| C-03 | Uncalled route | POST /api/ai/copilot/draft-communication — not called from client | src/app/api/ai/copilot/draft-communication/route.ts |
| C-04 | Uncalled route | POST /api/ai/copilot/gate-check — not called from client | src/app/api/ai/copilot/gate-check/route.ts |
| C-05 | Uncalled route | POST /api/ai/copilot/historical-search — not called from client | src/app/api/ai/copilot/historical-search/route.ts |
| C-06 | Uncalled route | POST /api/ai/copilot/budget-analysis — not called from client | src/app/api/ai/copilot/budget-analysis/route.ts |
| C-07 | Uncalled route | POST /api/ai/copilot/schedule-deviations — not called from client | src/app/api/ai/copilot/schedule-deviations/route.ts |
| C-08 | Uncalled route | POST /api/ai/copilot/document-review — not called from client | src/app/api/ai/copilot/document-review/route.ts |
| C-09 | Uncalled route | POST /api/admin/ai/seed-feature-map — not called from admin page | src/app/api/admin/ai/seed-feature-map/route.ts |

Note: C-01 through C-08 are copilot sub-feature routes that exist as standalone endpoints but are not called from any current UI. The main /api/ai/copilot route handles all copilot interactions. These may be intended for future structured copilot features.

## 8. UI Inconsistencies

| ID | Category | Description | Location |
|---|---|---|---|
| I-01 | Filter gap | Projects page type filter does not include "F&D" — only "All", "NS", "ER", "WIW", "FC", "MC" | src/app/(app)/projects/page.tsx ALL_TYPES constant |
| I-02 | Placeholder | Dashboard visual analytics cards are "Coming soon" placeholders (Budget by Type, Schedule Trend, Heat Map) | src/app/(app)/dashboard/page.tsx |
| I-03 | Placeholder | Team page overview analysis cards are "Coming soon" placeholders | src/app/(app)/team/page.tsx |
| I-04 | Placeholder | Resources index "Forms & Templates" card is "Coming Soon" | src/app/(app)/resources/page.tsx |
| I-05 | Placeholder | Smart Tools "Bid Comparison" card is "Phase 4" placeholder | src/app/(app)/smart-tools/page.tsx |
| I-06 | Stub | Project detail Budget tab "Cost Review" button is disabled "Coming Soon" | src/app/(app)/projects/[id]/page.tsx |

## 9. KB Data Duplication

| ID | Category | Description | Location |
|---|---|---|---|
| D-01 | Duplication | SOP data exists in constants (loaded at build time) AND can be seeded to Firestore kb/sops. The SOP pages read from constants, not Firestore. The seed routes write to Firestore but nothing reads from Firestore. | Constants vs Firestore kb/sops |
| D-02 | Duplication | Flowchart data exists in constants AND can be seeded to Firestore kb/flowcharts. Pages read from constants. | Constants vs Firestore kb/flowcharts |
| D-03 | Duplication | Schedule templates exist in templates.json AND can be seeded to Firestore kb/templates. get-template.ts reads from JSON, not Firestore. | templates.json vs Firestore kb/templates |

## 10. CLAUDE.md vs Code Mismatches

| ID | Category | Description | Location |
|---|---|---|---|
| M-01 | Missing dir | CLAUDE.md references src/lib/cost-review/ as a key directory but this directory does not exist | CLAUDE.md "Key Directories" section |
| M-02 | Role count | CLAUDE.md states "Four roles" but code has three (admin, cm, pm) | CLAUDE.md |
| M-03 | Broken endpoint | EstimateLoaderTab in admin page calls `GET /api/admin/estimates?projectId=...` but no route exists at src/app/api/admin/estimates/. The fetch will always 404. | src/app/(app)/admin/page.tsx line ~136 |

## Summary

| Category | Count |
|---|---|
| Role discrepancy | 1 |
| Missing API auth | 13 |
| Empty/orphaned files | 3 |
| Rules without code | 5 |
| Collections without rules | 3 |
| Unused types/constants | 6 |
| Uncalled API routes | 9 |
| UI placeholders/stubs | 6 |
| Data duplication | 3 |
| Doc-vs-code mismatches | 3 |
| **Total** | **52** |

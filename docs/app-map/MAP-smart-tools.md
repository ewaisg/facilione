# MAP: Smart Tools

Scan date: 2026-04-11

---

## Module Tree

```
src/app/(app)/smart-tools/
├── page.tsx                                Smart Tools index
└── estimator/page.tsx                      Estimator tool
src/lib/firebase/estimates.ts               Estimate CRUD
src/lib/ai/
├── historical-comparisons.ts               Historical comparable search
└── comparison-snapshot-parser.ts           XLSX comparison snapshot parser
src/constants/estimate-presets.ts            Preset section definitions
src/types/estimate.ts                        Estimate types
src/types/smart-tools.ts                     SmartToolId, SmartToolMeta
src/app/api/ai/
├── cost-estimate/route.ts                  AI cost estimate analysis
└── historical-comparisons/route.ts         Historical comparables search
src/app/api/admin/ai/
├── comparison-snapshots/import/route.ts    Import comparison XLSX
└── estimate-comparison-forms/import/route.ts Import estimate comparison XLSX
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /smart-tools | src/app/(app)/smart-tools/page.tsx | Client | Yes | admin, cm, pm |
| /smart-tools/estimator | src/app/(app)/smart-tools/estimator/page.tsx | Client | Yes | admin, cm, pm |

## API Routes

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/ai/cost-estimate | None (no auth check in code) | AI analysis of estimate data |
| POST | /api/ai/historical-comparisons | None (no auth check in code) | Search comparable historical projects |
| POST | /api/admin/ai/comparison-snapshots/import | requireRoles(["admin","cm","pm"]) | Import XLSX comparison snapshot |
| POST | /api/admin/ai/estimate-comparison-forms/import | requireRoles(["admin","cm","pm"]) | Import XLSX estimate comparison form |

## Firestore Collections

| Collection Path | Operation | Purpose |
|---|---|---|
| estimates | saveEstimate(), getEstimate(), listEstimatesForUser(), listEstimatesForProject(), deleteEstimate() | Estimate persistence |
| comparisonSnapshots | adminDb.collection().doc().set() (server) | Store imported comparison snapshots |
| estimateComparisonForms | adminDb.collection().doc().set() (server) | Store imported estimate comparison forms |
| costReviews | adminDb.collection().limit(250).get() (read-only) | Historical comparisons search |

## Key Features (Estimator)

1. **Dynamic Sections**: Add/remove estimate sections with configurable columns
2. **Preset Sections**: Pre-defined templates (Soft Costs, GC Costs, dept-specific)
3. **Row Management**: Add/delete/reorder rows within sections
4. **Contingency**: Per-section contingency percentage calculation
5. **CSV/XLSX Import**: Import estimate data from spreadsheet files
6. **Excel Export**: Formatted Excel download
7. **Save/Load**: Persist estimates to Firestore, load from saved list
8. **Project Linking**: Optional projectId parameter links estimate to specific project
9. **Historical Comparisons**: Search for comparable past projects/estimates
10. **AI Analysis**: Generate AI cost analysis via /api/ai/cost-estimate

## Smart Tools Index

Two tools defined in TOOLS array:
- `estimator` (status: "live") — links to /smart-tools/estimator
- `bid-comparison` (status: "phase-4") — links to /smart-tools (disabled)

## Types & Interfaces

| Type Name | File | Used By |
|---|---|---|
| SmartToolId | src/types/smart-tools.ts | Smart tools pages |
| SmartToolMeta | src/types/smart-tools.ts | Not currently used in code |
| Estimate | src/types/estimate.ts | Estimator page, estimates.ts |
| EstimateSection | src/types/estimate.ts | Estimator page |
| EstimateRow | src/types/estimate.ts | Estimator page |
| EstimateProjectInfo | src/types/estimate.ts | Estimator page |
| EstimateComparable | src/types/estimate.ts | Estimator page |
| EstimateComparisonContext | src/types/estimate.ts | Estimator page |
| PresetSectionDef | src/types/estimate.ts | estimate-presets.ts |

## Dependencies

- Imports from: @/lib/firebase/auth-context, @/lib/firebase/firestore, @/lib/firebase/estimates, @/lib/ai/client, @/lib/ai/historical-comparisons, @/lib/ai/comparison-snapshot-parser, @/constants/estimate-presets, @/constants/project-types, @/lib/utils, @/types
- External: lucide-react, sonner, xlsx (via comparison-snapshot-parser)

## Status

Estimator: Fully implemented.
Bid Comparison: Not implemented (Phase 4 placeholder).

## Discrepancies Found

- /api/ai/cost-estimate and /api/ai/historical-comparisons have no auth middleware (no requireAppUser/requireRoles call). Any request with valid cookies could access them.
- SmartToolMeta type is defined but never used anywhere in code.

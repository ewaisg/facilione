# MAP: Resources & Knowledge Base

Scan date: 2026-04-11

---

## Module Tree

```
src/app/(app)/resources/
├── page.tsx                                Resources index
├── sops/page.tsx                           SOP Quick Reference viewer
└── flowcharts/page.tsx                     Project Flowcharts viewer
src/constants/
├── sop-data.ts                             SOP_DATA barrel export
├── sop-data-ns-er.ts                       NS and ER SOP content
├── sop-data-wiw-fc-mc.ts                   WIW, FC, MC SOP content
├── sop-data-appendices.ts                  Appendices A-D SOP content
└── flowchart-data.ts                       Mermaid flowchart definitions
src/types/sop.ts                            SOP type definitions
src/app/api/
├── seed-sops/route.ts                      Seed SOPs to Firestore
└── seed-flowcharts/route.ts                Seed flowcharts to Firestore
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /resources | src/app/(app)/resources/page.tsx | Client | Yes | admin, cm, pm |
| /resources/sops | src/app/(app)/resources/sops/page.tsx | Client | Yes | admin, cm, pm |
| /resources/flowcharts | src/app/(app)/resources/flowcharts/page.tsx | Client | Yes | admin, cm, pm |

## API Routes

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | /api/seed-sops | None | Seed all SOP data to kb/sops/types/{type} |
| POST | /api/seed-flowcharts | None | Seed all flowchart data to kb/flowcharts/types/{type} |

## Firestore Collections

| Collection Path | Written By | Purpose |
|---|---|---|
| kb/sops/types/{type} | seed-sops route | SOP reference data (9 entries: 5 project types + 4 appendices) |
| kb/flowcharts/types/{type} | seed-flowcharts route | Flowchart Mermaid definitions (5 entries) |

## Key Features (SOP Reference)

1. **Project Type Tabs**: ns, er, wiw, fc, mc + appA, appB, appC, appD
2. **Phase Accordion**: Expandable phases showing steps, gates, tips
3. **Cross-SOP Search**: Search across all SOPs (minimum 2 characters)
4. **Gate-Only Filter**: Toggle to show only gate steps
5. **Step Details**: Each step shows step number, text, owner, system badge, baseline week
6. **System Badges**: Color-coded by system (Oracle, SiteFolio, Coupa, Email)

## Key Features (Flowcharts)

1. **Type Tabs**: ns, er, wiw, fc, mc
2. **Mermaid Rendering**: Dynamic Mermaid.js initialization and rendering
3. **Pan/Zoom**: Mouse drag panning, wheel zoom, fit-to-view button
4. **Legend**: Color-coded node types (Action, Decision, Gate, Stop, Milestone)
5. **Phase Navigation**: (inherited from chart structure)

## Constants

| Constant | File | Contains |
|---|---|---|
| SOP_DATA | src/constants/sop-data.ts | All 9 SOP entries merged from 3 sub-files |
| PROJECT_KEYS | src/constants/sop-data.ts | ["ns", "er", "wiw", "fc", "mc"] |
| APPENDIX_KEYS | src/constants/sop-data.ts | ["appA", "appB", "appC", "appD"] |
| ALL_SOP_KEYS | src/constants/sop-data.ts | [...PROJECT_KEYS, ...APPENDIX_KEYS] |
| FLOWCHARTS | src/constants/flowchart-data.ts | Record<string, FlowchartDef> for 5 types |
| FLOWCHART_KEYS | src/constants/flowchart-data.ts | Array of flowchart type keys |
| LEGEND_ITEMS | src/constants/flowchart-data.ts | Color legend metadata |

## Resources Index

3 resource cards:
- SOP Quick Reference (status: "live") -> /resources/sops
- Project Flowcharts (status: "live") -> /resources/flowcharts
- Forms & Templates (status: "coming-soon") -> /resources (disabled)

## Dependencies

- Imports from: @/constants/sop-data, @/constants/flowchart-data, @/lib/utils, @/types/sop, @/components/ui/*
- External: lucide-react, mermaid (dynamic import in flowcharts page)

## Status

SOP Reference: Fully implemented.
Flowcharts: Fully implemented.
Forms & Templates: Placeholder only.

## Discrepancies Found

- Seed routes (/api/seed-sops, /api/seed-flowcharts) have no auth middleware. Any HTTP POST can trigger a seed.

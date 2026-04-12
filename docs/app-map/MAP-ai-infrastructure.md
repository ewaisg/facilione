# MAP: AI Infrastructure

Scan date: 2026-04-11

---

## Module Tree

```
src/lib/ai/
├── client.ts                               AI model invocation (invokeAiText, invokeAiModelText)
├── runtime-config.ts                       Runtime config resolution from Firestore systemSettings/ai
├── historical-comparisons.ts               Multi-collection similarity search for comparable projects
└── comparison-snapshot-parser.ts           XLSX parser for Store Project Comparison SOV workbooks
src/app/api/ai/
├── copilot/
│   ├── route.ts                            Main copilot (SSE streaming, SOP-grounded)
│   ├── sop-qa/route.ts
│   ├── next-actions/route.ts
│   ├── draft-communication/route.ts
│   ├── gate-check/route.ts
│   ├── historical-search/route.ts
│   ├── budget-analysis/route.ts
│   ├── schedule-deviations/route.ts
│   └── document-review/route.ts
├── forms/
│   ├── auto-populate/route.ts
│   ├── agenda-builder/route.ts
│   ├── generate-minutes/route.ts
│   ├── image-minutes/route.ts              (stub)
│   └── transcribe-minutes/route.ts         (stub)
├── cost-estimate/route.ts
├── historical-comparisons/route.ts
├── portfolio-insights/route.ts
├── reports/schedule-status/route.ts
└── weekly-update-draft/route.ts
src/app/api/admin/ai/
├── config/route.ts                         AI settings CRUD
├── test/route.ts                           Model connectivity test
├── seed-feature-map/route.ts               Seed default feature-model map
├── comparison-snapshots/import/route.ts
└── estimate-comparison-forms/import/route.ts
```

## AI Client (src/lib/ai/client.ts)

Two main functions:
- `invokeAiText(input)` — Invokes AI by feature key (resolves model via feature-model map)
- `invokeAiModelText(input)` — Invokes AI by model key directly

Supports two API styles:
- `chat-completions` — Standard OpenAI /chat/completions format
- `responses` — OpenAI /responses format (newer API)

Supports two auth modes:
- `api-key` — Header: `api-key: <key>`
- `authorization-bearer` — Header: `Authorization: Bearer <key>`

## Runtime Config (src/lib/ai/runtime-config.ts)

### AiFeature Type (15 features)

```
"weekly-update-draft" | "portfolio-insights" | "cost-estimate" | "sop-qa" |
"next-actions" | "draft-communication" | "gate-check" | "historical-search" |
"budget-analysis" | "schedule-deviations" | "document-review" |
"forms-auto-populate" | "forms-agenda-builder" | "forms-generate-minutes" |
"reports-schedule-status"
```

### Config Resolution

1. Reads systemSettings/ai document from Firestore (via adminDb)
2. Falls back to environment variables: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_API_VERSION, AZURE_OPENAI_DEPLOYMENT
3. Feature-model mapping selects which model key to use per feature
4. Per-model settings: targetUri, apiKey, deployment, model, apiStyle, authMode

### Stored Settings Shape (systemSettings/ai)

```typescript
{
  endpoint: string
  apiKey: string
  apiVersion: string
  models: Array<{
    key: string; name: string; deployment?: string; targetUri?: string;
    model?: string; apiStyle?: AiApiStyle; authMode?: AiAuthMode;
    apiKey?: string; enabled?: boolean
  }>
  featureModelMap: Partial<Record<AiFeature, string>>
  agents: Array<{
    key: string; name?: string; endpoint?: string; apiKey?: string;
    notes?: string; codeSnippet?: string
  }>
}
```

## Historical Comparisons (src/lib/ai/historical-comparisons.ts)

Searches 4 Firestore collections for comparable projects:
1. `estimates` — Saved project estimates
2. `costReviews` — PM cost reviews
3. `comparisonSnapshots` — Imported 3-project comparison workbooks
4. `estimateComparisonForms` — Imported estimate comparison forms

Scoring algorithm (0-1 score):
- Project type match: 0.55 weight
- Scope item overlap (Jaccard similarity): 0.30 weight
- Budget proximity: 0.15 weight
- Recency boost: 0.05 weight (decays over 365 days)

## Comparison Snapshot Parser (src/lib/ai/comparison-snapshot-parser.ts)

- Parses Store Project Comparison SOV XLSX workbooks
- Extracts: estimated project total, 3 reference project totals, scope items, project type
- Infers project type from location text (F/D, MC, NS, WIW, ER)
- Uses `xlsx` library for workbook parsing

## AI Feature-to-Route Map

| Feature | API Route | Auth | SOP Context |
|---|---|---|---|
| sop-qa | /api/ai/copilot/sop-qa | requireAppUser | Yes (detects type from question) |
| next-actions | /api/ai/copilot/next-actions | requireAppUser | Yes (current phase context) |
| draft-communication | /api/ai/copilot/draft-communication | requireAppUser | No |
| gate-check | /api/ai/copilot/gate-check | requireAppUser | Yes (gate criteria from SOP) |
| historical-search | /api/ai/copilot/historical-search | requireAppUser | No (uses historical-comparisons.ts) |
| budget-analysis | /api/ai/copilot/budget-analysis | requireAppUser | No |
| schedule-deviations | /api/ai/copilot/schedule-deviations | requireAppUser | Yes (SOP schedule context) |
| document-review | /api/ai/copilot/document-review | requireAppUser | Yes (KB context) |
| forms-auto-populate | /api/ai/forms/auto-populate | requireAppUser | Yes |
| forms-agenda-builder | /api/ai/forms/agenda-builder | requireAppUser | Yes |
| forms-generate-minutes | /api/ai/forms/generate-minutes | requireAppUser | No |
| reports-schedule-status | /api/ai/reports/schedule-status | requireAppUser | Yes |
| portfolio-insights | /api/ai/portfolio-insights | None | No |
| cost-estimate | /api/ai/cost-estimate | None | No |
| weekly-update-draft | /api/ai/weekly-update-draft | None | No |

## Stub Routes

| Route | Purpose | Reason |
|---|---|---|
| /api/ai/forms/image-minutes | OCR minutes from image | Requires Azure Computer Vision (not configured) |
| /api/ai/forms/transcribe-minutes | Audio transcription | Requires Azure Speech / Whisper (not configured) |

## Dependencies

- External: xlsx (comparison-snapshot-parser)
- Internal: @/lib/firebase-admin, @/constants/sop-data, @/types/sop

## Status

Core AI client and config: Fully implemented.
15 feature routes: 13 fully implemented, 2 stubs (image-minutes, transcribe-minutes).
Historical comparisons: Fully implemented.

## Discrepancies Found

- 3 AI routes have no auth: /api/ai/portfolio-insights, /api/ai/cost-estimate, /api/ai/weekly-update-draft
- Copilot sub-feature routes exist but are not called from any current client-side code

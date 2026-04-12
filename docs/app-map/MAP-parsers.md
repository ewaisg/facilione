# MAP: Parsers & Import Logic

Scan date: 2026-04-11

---

## Module Tree

```
src/lib/schedule/
├── template-parser.ts                      XLS schedule template parser
├── sitefolio-html-import.ts                SiteFolio schedule HTML parser + milestone mapper
├── sitefolio-overview-import.ts            SiteFolio project overview HTML parser
├── sitefolio-files-reports-import.ts       SiteFolio files & reports HTML parser
├── seed-phases.ts                          Phase seeding from parsed template
├── get-template.ts                         Template accessor (from templates.json)
└── templates.json                          Pre-parsed schedule templates (5 types)
src/lib/ai/
└── comparison-snapshot-parser.ts           XLSX comparison SOV workbook parser
src/lib/sitefolio/
├── fetch.ts                                SiteFolio API client (ASMX + page fetch)
├── playwright-auth.ts                      SiteFolio SSO via Playwright (local only)
└── session-store.ts                        SiteFolio session storage in Firestore
src/lib/firebase/
└── storage.ts                              Upload parsed files to Firebase Storage
src/app/api/admin/parsing/
└── apply/route.ts                          Apply parsed data to project
src/app/api/sitefolio/
├── auth/route.ts                           Check SiteFolio session status
└── proxy/[...path]/route.ts                Proxy SiteFolio requests
src/app/api/seed-templates/route.ts         Seed schedule templates
scripts/
└── refresh-sitefolio-session.ts            SiteFolio session refresh script (local CLI)
```

## Parsers

### 1. Schedule Template Parser (template-parser.ts)

**Exports**: `parseScheduleTemplate(rows, projectType)`, `parseMinorCapitalTemplate(rows)`

Parses XLS/XLSX schedule template files into ScheduleTemplate structures:
- NS, ER, WIW, FC: Category-based phases with Baseline Weeks to Open (column G)
- MC: Single-phase, no week offsets (user-entered dates only)
- Detects gate milestones from keyword patterns

**Input**: Raw 2D array of cell values (from XLSX parsing)
**Output**: ScheduleTemplate (projectType, phases[])

### 2. SiteFolio Schedule HTML Parser (sitefolio-html-import.ts)

**Exports**: `parseSiteFolioScheduleHtml(html)`, `mapSiteFolioRowsToMilestones(milestones, rows)`

Parses saved SiteFolio schedule page HTML:
- Finds `#tbScheduleDates` table
- Extracts category (CAT rows), milestone label (MSC rows), and 4 date columns (baseline, projected, projectedAlt, actual)
- Converts US dates (MM/DD/YYYY) to ISO format

Milestone mapper:
- Matches parsed rows to SfMilestoneState[] by normalized label
- Loose matching removes common stop words
- Returns matched count, unmatched milestones, unmatched rows, suggested GO date

**Input**: Raw HTML string from SiteFolio schedule page
**Output**: SiteFolioImportResult, SiteFolioMappingResult

### 3. SiteFolio Overview HTML Parser (sitefolio-overview-import.ts)

**Exports**: `parseSiteFolioOverviewHtml(html)`

Parses SiteFolio project overview page HTML:
- Project info: identifier, name, address, identifiers, description, status
- General comments: date, author, comment text
- Upcoming milestones: date, title, phase
- Contacts: role, name, phone, email
- Reports: title, href

**Input**: Raw HTML string from SiteFolio overview page
**Output**: SiteFolioOverviewImportResult

### 4. SiteFolio Files & Reports Parser (sitefolio-files-reports-import.ts)

**Exports**: `parseSiteFolioFilesReportsHtml(html)`

Parses SiteFolio document pages for file/folder/report links:
- Folders: Links containing ProjectDocuments.sf or idFolder=
- Files: Links containing /files/ or idDocument=
- Reports: Links containing /reports/

**Input**: Raw HTML string
**Output**: SiteFolioFilesReportsImportResult (folders, files, reports arrays)

### 5. Comparison Snapshot Parser (comparison-snapshot-parser.ts)

**Exports**: `parseComparisonSnapshotWorkbook(fileName, fileBuffer)`

Parses Store Project Comparison SOV Excel workbooks:
- Reads "Store Project Comparison SOV" sheet (or first sheet)
- Extracts 3 reference project stores/locations/totals and estimated project data
- Scans rows 16-350 for scope items and cost totals
- Infers project type from location text

**Input**: File name + ArrayBuffer
**Output**: ParsedComparisonSnapshot

## Import Apply Route (admin/parsing/apply)

Accepts parsed data and applies it to a project:
- `overview`: Updates project fields (storeAddress, storeCity, storeState), optionally writes weekly comment
- `schedule`: Updates sfSchedule field on project
- `files-reports`: Writes to imports collection as a log entry

Creates import log entry in `imports` collection for every apply operation.

## SiteFolio Infrastructure

### fetch.ts
- `sfAsmxCall(endpoint, params)` — POST to SiteFolio ASMX endpoints with form-encoded body
- `sfPageFetch(path)` — GET SiteFolio pages for HTML parsing
- Both use stored session cookies from Firestore

### playwright-auth.ts
- `authenticateSiteFolio(username, password, headless?)` — Full SSO flow via Playwright
- Handles PingOne DaVinci SAML 2.0 login flow
- Extracts Session/Member cookies and parses memberId/enterpriseId
- Local-only (not for Vercel deployment)

### session-store.ts
- `getStoredSession()` — Reads sitefolio_sessions/current, checks expiry
- `storeSession(session)` — Writes session to Firestore
- `getSessionStatus()` — Returns active/inactive with expiry info

### SiteFolio Proxy Route
- `POST /api/sitefolio/proxy/[...path]` — Proxies ASMX calls (admin only)
- `GET /api/sitefolio/proxy/[...path]` — Proxies page fetches (admin only)

## Phase Seeding (seed-phases.ts)

**Exports**: `seedPhasesFromTemplate(template, grandOpeningDate, projectId)`, `recalculatePhaseDates(phases, newDate)`

- Converts ScheduleTemplate into Phase[] with calculated target dates
- Formula: targetDate = grandOpeningDate + (weekOffset x 7 days)
- weekOffset is negative (weeks BEFORE grand opening)

## Firebase Storage

**Exports**: `uploadProjectImportFile(file, projectId, parserType)`

Path pattern: `projects/{projectId}/imports/{parserType}/{timestamp}_{fileName}`

## SiteFolio Session Refresh Script (scripts/refresh-sitefolio-session.ts)

CLI script to refresh the SiteFolio SSO session locally. Not part of the Next.js app.

**Run**: `npx tsx scripts/refresh-sitefolio-session.ts`

**Requires**:
- Playwright + Chromium installed locally
- `.env.local` with `SITEFOLIO_USERNAME` and `SITEFOLIO_PASSWORD`

**Flow**:
1. Reads credentials from `.env.local` via `dotenv`
2. Calls `authenticateSiteFolio(username, password, true)` from `src/lib/sitefolio/playwright-auth.ts`
3. Logs memberId, enterpriseId, cookie count, and expiry
4. Calls `storeSession(session)` from `src/lib/sitefolio/session-store.ts` to persist to Firestore (`sitefolio_sessions/current`)

**Imports**: `dotenv`, `../src/lib/sitefolio/playwright-auth`, `../src/lib/sitefolio/session-store`

## Dependencies

- External: xlsx (comparison-snapshot-parser), playwright (playwright-auth, local only)
- Internal: @/lib/firebase-admin, @/constants/sf-schedule-data, @/types/schedule

## Status

All parsers: Fully implemented.
SiteFolio integration: Fully implemented (requires local Playwright session refresh).
Phase seeding: Fully implemented.

## Discrepancies Found

- The admin/parsing/apply route has no auth middleware. Any authenticated user can POST parsed data to apply to any project.
- The admin/parsing/apply route references no auth middleware — see DISCREPANCIES.md A-06.

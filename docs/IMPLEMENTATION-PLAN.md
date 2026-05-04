# FaciliOne — Implementation Plan

**Created:** 2026-05-03
**Owner:** Gheiath Ewais
**Status:** Active — single source of truth for all build work going forward

---

## Hard Rules (Non-Negotiable)

1. **SiteFolio is READ-ONLY.** No writes, no form submissions, no mutations to SiteFolio from this app.
2. **No manual data entry for project data.** All project/portfolio data comes from SiteFolio via the existing server-side proxy.
3. **No guessing, no assumptions.** Every endpoint, selector, and field in this plan comes from `docs/pages/PAGE-XX-*.md` or `docs/architecture/MASTER-DATA-INVENTORY.md`.
4. **Server-side only.** All SiteFolio fetches happen inside Next.js API routes. The browser never touches SiteFolio directly.
5. **Test gate after every phase.** Owner tests and signs off before the next phase begins.
6. **Keep existing navigation.** The current nav items (Dashboard, Projects, Team, Tasks, FE Copilot, Smart Tools, Resources, Admin, Profile) are preserved. New modules (Reports, Settings) are added alongside them.

---

## Data Flow (for all SiteFolio-sourced features)

```
SiteFolio.net
  └─ authenticated via cookies in Firestore sitefolio_sessions/current
       ↓
  /api/sitefolio/proxy/[...path]        ← already built (admin-only)
       ↓  HTML or binary blob
  Parser function                        ← src/lib/sitefolio/parsers/
       ↓  typed TypeScript object
  Project-level API route                ← src/app/api/sitefolio/project/[id]/
       ↓  JSON (+ optional Firestore cache)
  React component (client fetch)
       ↓
  UI tab / page
```

For bulk reports (P15, P16):
```
SiteFolio.net (report download URL)
  └─ authenticated via proxy
       ↓  XLSX binary
  XLSX parser (SheetJS)                  ← src/lib/parsers/
       ↓  typed array of project objects
  Report sync API route                  ← src/app/api/reports/sync/
       ↓  written to Firestore
  reports/divisionStatus + reports/auditReport
       ↓
  /reports page components
```

---

## Phase Overview

| # | Name | Section | Testable Outcome |
|---|---|---|---|
| **1** | Critical Fixes | Codebase | Admin panel no longer 404s; all API routes require auth |
| **2** | Project Detail — Overview & Team | Project tabs | Real SF address, comments, team for any SF-linked project |
| **3** | Project Detail — Budget | Project tabs | Hierarchical CSI line items, version selector, export links |
| **4** | Project Detail — Bidding | Project tabs | Bid package list + detail with SOV analysis |
| **5** | Project Detail — Contracts & Requests | Project tabs | Contracts SOV table; ASI/PR/RFI filtered lists |
| **6** | Project Detail — Documents & Photos | Project tabs | Folder tree browser; photo library grid |
| **7** | Reports Module | New nav section | Download + parse P15/P16; interactive portfolio table |
| **8** | Dashboard — Real Data & Charts | Dashboard | Live alerts, schedule variance, charts from P15/P16 |
| **9** | Settings Module | New nav section | Profile, SF connection status, sync trigger, preferences |
| **10** | Copilot — Wire Sub-Features | FE Copilot | Each sub-feature route invokable from Copilot UI |
| **11** | Portfolio Views | Projects | Side-by-side comparison; multi-project timeline |
| **12** | Smart Tools — Bid Comparison | Smart Tools | ST-02 fully functional |

---

## Phase 1 — Critical Fixes

**Goal:** Fix the one broken endpoint and add authentication to all unprotected API routes before any new code goes on top of them.

### Issues Being Fixed (from `docs/app-map/DISCREPANCIES.md`)

| ID | File | Problem |
|---|---|---|
| M-03 | `src/app/(app)/admin/page.tsx` | Calls `GET /api/admin/estimates?projectId=…` — route does not exist (404) |
| A-01 | `src/app/api/admin/users/route.ts` | POST — no `requireRoles()` |
| A-02 | `src/app/api/admin/users/list/route.ts` | GET — no auth middleware |
| A-03 | `src/app/api/admin/users/[uid]/route.ts` | PATCH/DELETE — no auth middleware |
| A-04 | `src/app/api/admin/projects/list/route.ts` | GET — no auth middleware |
| A-05 | `src/app/api/admin/projects/[id]/route.ts` | PATCH — no auth middleware |
| A-06 | `src/app/api/admin/parsing/apply/route.ts` | POST — no auth middleware |
| A-07 | `src/app/api/ai/portfolio-insights/route.ts` | POST — no auth middleware |
| A-08 | `src/app/api/ai/cost-estimate/route.ts` | POST — no auth middleware |
| A-09 | `src/app/api/ai/weekly-update-draft/route.ts` | POST — no auth middleware |
| A-10 | `src/app/api/ai/historical-comparisons/route.ts` | POST — no auth middleware |
| A-11 | `src/app/api/seed-sops/route.ts` | POST — no auth middleware |
| A-12 | `src/app/api/seed-flowcharts/route.ts` | POST — no auth middleware |
| A-13 | `src/app/api/seed-templates/route.ts` | POST — no auth middleware |
| A-14 | `src/app/api/ai/tasks/extract/route.ts` | POST — no auth middleware |
| A-15 | `src/app/api/ai/tasks/suggest-next-steps/route.ts` | POST — no auth middleware |

### Tasks

- [ ] **Create** `src/app/api/admin/estimates/route.ts` — `GET` handler; returns estimates for a given `projectId`; requires `admin` role. This resolves the 404 in the admin panel.
- [ ] **Add** `requireRoles(['admin'])` to every route in the A-01 → A-06 list (admin-only routes).
- [ ] **Add** `requireAppUser()` (or appropriate role check) to every route in the A-07 → A-15 list (authenticated-user routes).
- [ ] **Verify** `npm run build` passes with zero errors after all changes.

### Test Criteria
- Open Admin panel → no console 404 errors.
- Attempt to call any of the A-01–A-15 routes without a valid `__session` cookie → receive 401.
- All admin routes called with a non-admin session → receive 403.

---

## Phase 2 — Project Detail: Overview & Team Tabs

**Goal:** When a user opens a project that has a `siteFolioJobNumber`, the Overview and Team tabs show live-fetched data from SiteFolio. No manual input required.

**SiteFolio Sources:**
- Overview tab → `PAGE-03-PROJECT-OVERVIEW.md` (P3): `/Kroger/ProjectOverviewView.sf?idProject={sfId}`
- Team tab → `PAGE-05-PROJECT-DIRECTORY.md` (P5): `GET /Kroger/Directory2/Directory/Index?projectID={sfId}`

**What Overview tab shows (from P3):**
- Address + Google Maps link
- Project status (current phase label)
- Latest general comment (fixed section) + older comments (expandable, up to all historical)
- Team contact summary (role, name, phone, email — server-rendered on P3)
- Upcoming milestones (next 7: date, milestone name, phase)
- CA Numbers and Amounts (Land/Site/Building/Fixturing/Equipment) — from P13 Classification page
- Report download links (PUR, Change Order Log, Project Directory, Notification History)

**What Team tab shows (from P5):**
- Contacts grouped by category: Owner, Consultant, Contractor, Subcontractor, Government Entity, Equipment/Materials Vendor, Other, Utility Company, Broker, Subconsultant
- Per contact: name, role, company, phone, email
- Category counts

### Parser Tasks

- [ ] **Review** existing `src/lib/sitefolio/parsers/overview.ts` — confirm what it currently extracts and what needs to be added (comments, CA numbers, upcoming milestones, report links).
- [ ] **Extend** the overview parser (or add new function) to extract: full general comments (fixed + variable), CA numbers/amounts from the Classification page selector, report download URLs, upcoming milestones.
- [ ] **Build** `src/lib/sitefolio/parsers/team.ts` — parse AJAX GET response from `GET /Kroger/Directory2/Directory/Index?projectID={sfId}`. Extract: category groups, contact rows (name, role, company, phone, email) per the selectors in MASTER-DATA-INVENTORY.md Section 1.1.
- [ ] **Build** `src/lib/sitefolio/parsers/classification.ts` — parse P13 page (`/Kroger/SiteProjClassView.sf?idProject={sfId}`) for CA numbers and CA amounts using selectors `BusinessCustomLabel7_v` through `BusinessCustomLabel19_v`.

### API Route Tasks

- [ ] **Create** `src/app/api/sitefolio/project/[id]/overview/route.ts` — `GET`; requires authenticated user with project access. Calls proxy for P3 + P13, runs parsers, returns structured JSON. Caches result in `projects/{id}/sfCache/overview` in Firestore with timestamp.
- [ ] **Create** `src/app/api/sitefolio/project/[id]/team/route.ts` — `GET`; requires authenticated user with project access. Calls proxy for P5 AJAX endpoint, runs team parser, returns structured JSON. Caches in `projects/{id}/sfCache/team`.

### Firestore Tasks

- [ ] **Add** subcollection `projects/{projectId}/sfCache/{tab}` for storing on-demand SF fetch results (with `data`, `fetchedAt`, `sfProjectId` fields). Add Firestore security rules: same read access as parent project; write access via Admin SDK only (server-side).

### Type Tasks

- [ ] **Add** types to `src/types/sitefolio.ts`: `SfOverviewData`, `SfTeamContact`, `SfTeamCategory`, `SfMilestonePreview`, `SfCaNumbers`, `SfReportLink`.

### Frontend Tasks

- [ ] **Add** "Overview" tab to the project detail page (`src/app/(app)/projects/[id]/page.tsx`) — visible only when `project.siteFolioJobNumber` is set; shows "Connect SiteFolio" prompt otherwise.
- [ ] **Add** "Team" tab to the project detail page — same visibility condition.
- [ ] **Build** `src/components/sitefolio/sf-overview-tab.tsx` — displays all Overview data. Sections: Address card, Status badge, Comments accordion (latest pinned, older collapsible), Team contacts summary, Upcoming milestones table, CA amounts grid, Report download buttons.
- [ ] **Build** `src/components/sitefolio/sf-team-tab.tsx` — displays full directory by category. Each category is an expandable section. Contact cards show name, role, company, phone (click to call), email (click to compose).
- [ ] Both components: show Skeleton loading state while fetching; show Alert on error (e.g., session expired, no SF job number).

### Test Criteria
- Open a project with a valid `siteFolioJobNumber` → Overview tab loads with real SF data.
- General comment history shows at least the latest comment.
- Upcoming milestones show dates.
- Team tab shows categorized contacts with emails.
- Open a project with no `siteFolioJobNumber` → both tabs show a "not connected" state.
- Session expired → error alert with clear message.

---

## Phase 3 — Project Detail: Budget Tab

**Goal:** The Budget tab in project detail shows the live SiteFolio budget: all CSI line items in the current version, a version selector to switch between versions, and direct Excel export links.

**SiteFolio Source:** `PAGE-09-BUDGET.md` (P9)
- Budget page URL: `/Kroger/BudgetVersionView.sf?idProject={sfId}&bn=256&idfilter=8252`
- Export endpoints (GET, direct download):
  - Versions XLSX: `GET /ws/Budgeting/Budgeting.asmx/ExportVersionsToExcel?enterpriseID=8252&projectID={sfId}&viewID=20&budgetProjectIDCsv={csvIds}`
  - Actuals XLSX: `GET /ws/Budgeting/Budgeting.asmx/ExportActualsToExcel?enterpriseID=8252&projectID={sfId}&viewID=20`
  - Baseline XLSX: `GET /ws/Budgeting/Budgeting.asmx/ExportBaselineToExcel?enterpriseID=8252&projectID={sfId}&viewID=20`

**What Budget tab shows:**
- Total project budget (grand total)
- Version selector: dropdown of all versions with stage (Import / Under Development / Commitment / Reconcile / Publish), dollar amount, date, author
- Hierarchical line items by CSI division (expandable tree: Level 0 = division, Level 1 = sub, Level 2 = cost type)
- Per line: name, dollar amount
- Export buttons: Versions XLSX, Actuals XLSX, Baseline XLSX (links via proxy to stream the file)

### Parser Tasks

- [ ] **Build** `src/lib/sitefolio/parsers/budget.ts` — parse P9 server-rendered HTML:
  - Extract version list: `sfBudgetProjectID`, stage, total amount, date, author from the versions popup structure.
  - Extract line item tree: iterate `tr[_level]` rows; capture `_level`, `_leafnode`, line item name (`td.LINEITEM span:last`), amount (`td.MONEY span`).
  - Extract grand total: `input[id$="budgetGridControl_TOTAL"]`.
  - Return: `SfBudgetData { versions[], lineItems[], total }`.

### API Route Tasks

- [ ] **Create** `src/app/api/sitefolio/project/[id]/budget/route.ts` — `GET`; authenticated user with project access. Fetches P9 for the project's `sfId`, runs budget parser, returns `SfBudgetData`. Accepts optional `?version={sfBudgetProjectID}` to fetch a specific version. Caches in `projects/{id}/sfCache/budget`.
- [ ] **Create** `src/app/api/sitefolio/project/[id]/budget/export/route.ts` — `GET`; authenticated user. Proxies the ExportVersionsToExcel / ExportActualsToExcel / ExportBaselineToExcel endpoints and streams the XLSX file back to the browser. Accepts `?type=versions|actuals|baseline&budgetProjectIdCsv={csv}&viewId={id}`.

### Type Tasks

- [ ] **Add** to `src/types/sitefolio.ts`: `SfBudgetVersion`, `SfBudgetLineItem`, `SfBudgetData`.

### Frontend Tasks

- [ ] **Replace** the existing stub Budget tab in project detail with a real implementation.
- [ ] **Build** `src/components/sitefolio/sf-budget-tab.tsx`:
  - Version selector dropdown (stage badge + amount + date + author).
  - Collapsible tree: Level 0 rows always visible; Level 1+ toggle on click.
  - Amount column right-aligned, formatted as currency.
  - Grand total row pinned at bottom.
  - Three export buttons: "Versions XLSX", "Actuals XLSX", "Baseline XLSX" — each triggers `/budget/export` with correct params.
  - Skeleton loader while fetching; error Alert on failure.

### Test Criteria
- Open Budget tab on SF-linked project → line items load with CSI divisions.
- Switch version via dropdown → line items reload for selected version.
- Click "Versions XLSX" → file downloads.
- Grand total matches the displayed version total.

---

## Phase 4 — Project Detail: Bidding Tab

**Goal:** The Bidding tab shows all bid packages for the project. Clicking a package shows full detail: scope, GC comparison (Bid Package Analysis), and the line-item SOV grid (Detail Analysis).

**SiteFolio Sources:** `PAGE-11-BIDDING.md` (P11)
- Bid package list URL: `/Kroger/BidPackageList.sf?idProject={sfId}&bn=5010&idfilter=8252`
- Bid package detail URL: `/Kroger/BidPackageView.sf?idProject={sfId}&idBP={bpId}&idSubtype=1&bn=5010`
  - Tab 1 `#tabs-scope`: bid package name, status, participants (GC names + business IDs), alternates, bid events timeline
  - Tab 2 `#tabs-bidanalysis`: base bid totals per GC, budget, exclusions, duration, rank
  - Tab 3 `#tabs-detailanalysis`: full CSI line-item SOV with budget + each GC's bid per line (data in `data-A_1` attributes on `td._BP_ANALYSIS_INIT`)
- Bid Package Detail Analysis XLSM report link: `/reports/idProject!{sfId}|idBP!{bpId}|idSubtype!1|bn!5010|reportname!sR/BidPackageDetailAnalysis|idcurrententerprise!8252|format!14|.../BidPackageDetailAnalysis.xlsm`

**What Bidding tab shows:**
- **List view:** table of bid packages (identifier, status badge, name, bid due date, selected bidder).
- **Detail view (clicking a package):**
  - Scope tab: bid package info, participants with contact info, alternates, timeline of bid events.
  - Bid Analysis tab: GC comparison table (base bid, budget, exclusions, duration, rank).
  - Detail Analysis tab: CSI line-item SOV with budget column and one column per GC.
  - Download button for Bid Package Detail Analysis XLSM (direct link via proxy).

### Parser Tasks

- [ ] **Build** `src/lib/sitefolio/parsers/bidding.ts`:
  - `parseBidPackageList(html)` — parse `table.BIDDING_LIST`; extract identifier, `idBP` from URL, status (from CSS class), name, bid due date, selected bidder.
  - `parseBidPackageDetail(html)` — parse the 3-tab page:
    - Scope: bid package name/status, participant rows (GC name, contact, business ID), alternates, bid events.
    - Bid Analysis: per-GC rows (name, base bid, budget, exclusions, duration, rank, selected flag).
    - Detail Analysis: CSI rows from `td._BP_ANALYSIS_INIT` using `data-A_1` … `data-A_N` attributes for GC bids; budget column. Return hierarchical structure respecting `_virtual`, `_indent`, `_rowid`.

### API Route Tasks

- [ ] **Create** `src/app/api/sitefolio/project/[id]/bidding/route.ts` — `GET`; returns parsed bid package list. Caches in `projects/{id}/sfCache/bidding`.
- [ ] **Create** `src/app/api/sitefolio/project/[id]/bidding/[bpId]/route.ts` — `GET`; returns parsed bid package detail (all 3 tabs). Caches in `projects/{id}/sfCache/bidding/{bpId}`.

### Type Tasks

- [ ] **Add** to `src/types/sitefolio.ts`: `SfBidPackage`, `SfBidParticipant`, `SfBidAnalysisRow`, `SfDetailAnalysisRow`, `SfBidPackageDetail`.

### Frontend Tasks

- [ ] **Build** `src/components/sitefolio/sf-bidding-tab.tsx`:
  - Package list: table with status badge (Open / Closed / etc.), bid due date, selected bidder.
  - Clicking a row expands detail inline (or slide-over panel).
  - Detail uses sub-tabs: Scope | Bid Analysis | Detail Analysis.
  - Detail Analysis tab: sticky GC name columns; budget column highlighted; $0 cells on non-zero budget rows highlighted in amber (missing scope indicator).
  - XLSM download button for each package.

### Test Criteria
- Open Bidding tab → package list loads.
- Click a package → detail opens with 3 sub-tabs.
- Detail Analysis tab shows CSI line items with GC bids.
- $0 bids on non-zero budget rows are visually highlighted.
- XLSM download link works.

---

## Phase 5 — Project Detail: Contracts & Requests Tabs

**Goal:** Contracts tab shows the SOV table from SiteFolio. Requests tab shows searchable ASI, PR, and RFI lists.

**SiteFolio Sources:**
- Contracts: `PAGE-10-CONTRACTS.md` (P10) — `/Kroger/ContractorContract2Main.sf?idProject={sfId}&bn=512`
- Requests (ASI): `PAGE-06-REQUESTS-ASI.md` (P6) — `GET /ws/Contracts2/Asi2.asmx/AsiSearch` with project context
- Requests (PR): `PAGE-07-REQUESTS-PR.md` (P7) — `GET /ws/Contracts2/PR2.asmx/PRSearch`
- Requests (RFI): `PAGE-08-REQUESTS-RFI.md` (P8) — `GET /ws/Contracts2/Rfi2.asmx/RfiSearch`

**What Contracts tab shows:**
- Contract list: contract name, sum, approved changes, % complete, retainage
- Per-contract detail link (read-only view of contract page)
- Contract attachments download (ZIP via ASMX: `GET /ws/Contracts2/Contracts2.asmx/GetContractAttachments?enterpriseID=8252&idProject={sfId}`)

**What Requests tab shows (3 sub-tabs):**
- ASI: searchable list; statuses: Issued, Voided
- PR: searchable list; statuses: Not Issued, Issued, Void
- RFI: searchable list; statuses: Submitted, Under Review, Final, Under Clarification

### Parser Tasks

- [ ] **Build** `src/lib/sitefolio/parsers/contracts.ts` — parse P10 HTML:
  - Extract `table.SOV` rows: contract name, sum (`td[id$="tdContractSum"]`), approved changes, % complete, retainage, contract ID from URL.
  - Return `SfContractRow[]`.

- [ ] **Build** `src/lib/sitefolio/parsers/requests.ts` — parse AJAX GET HTML responses for ASI, PR, and RFI:
  - Each returns an HTML fragment; extract table rows with number, title, status, date, author.
  - Three functions: `parseAsiList(html)`, `parsePrList(html)`, `parseRfiList(html)`.
  - Statuses mapped per MASTER-DATA-INVENTORY.md Section 1.8.

### API Route Tasks

- [ ] **Create** `src/app/api/sitefolio/project/[id]/contracts/route.ts` — `GET`; fetches + parses P10; returns contract list. Caches in `projects/{id}/sfCache/contracts`.
- [ ] **Create** `src/app/api/sitefolio/project/[id]/requests/route.ts` — `GET`; accepts `?type=asi|pr|rfi`; calls the appropriate ASMX GET endpoint via proxy; returns parsed list. No cache (live search).

### Type Tasks

- [ ] **Add** to `src/types/sitefolio.ts`: `SfContractRow`, `SfAsiItem`, `SfPrItem`, `SfRfiItem`.

### Frontend Tasks

- [ ] **Build** `src/components/sitefolio/sf-contracts-tab.tsx`:
  - Contract table with columns: Name, Contract Sum, Approved Changes, % Complete, Retainage.
  - Amounts formatted as currency.
  - "Download Attachments" button per contract → triggers ZIP download via proxy.

- [ ] **Build** `src/components/sitefolio/sf-requests-tab.tsx`:
  - Sub-tabs: ASI | PR | RFI (using shadcn Tabs).
  - Each sub-tab: searchable table (number, title, status badge, date).
  - Status filter chips matching the valid statuses per request type.
  - Search filters on frontend (data already loaded).

### Test Criteria
- Contracts tab loads with real contract amounts.
- "Download Attachments" produces a ZIP download.
- Requests tab shows ASI/PR/RFI lists.
- Status filter chips filter the list correctly.
- Search input filters by title/number.

---

## Phase 6 — Project Detail: Documents & Photos Tabs

**Goal:** Documents tab provides a read-only folder tree browser for project text documents and drawings. Photos tab shows all construction photo libraries with thumbnails.

**SiteFolio Sources:**
- Documents: `PAGE-12-FILES-TEXT-DOCUMENTS.md` (P12) — lazy-loaded via ASMX `/ws/Documents/Documents.asmx/` with `enterpriseID=8252&projectID={sfId}&maxItemCount=48&includeFolderPath=false&enterpriseContextID=8252`
- Photos: `PAGE-03-PROJECT-OVERVIEW.md` (P3) — photo library via:
  - `POST /ws/Projects/PhotoLibrary.asmx/GetMiniPhotoLibraryMarkup` with `idProject={sfId}&photoLibraryID={libId}`
  - `POST /ws/Projects/PhotoLibrary.asmx/GetBlobSrc` with `photoLibraryImageID={imgId}`
  - Library list from P3 page `select#cboPhotoLibrary`

**What Documents tab shows (read-only):**
- Folder tree (lazy-loaded): root folders expand on click to reveal subfolders and files.
- Per file: name, extension icon, download button (via file URL pattern `/files/idProject!{sfId}|...|iditem!{fileId}|itemtype!22|.../filename`).
- Separate sub-tabs for Text Documents (`bn=18751926`) and Drawings (`bn=18752105`).
- No upload, delete, rename, or move actions (read-only).

**What Photos tab shows:**
- Library selector dropdown (library name + date + count).
- Thumbnail grid for the selected library.
- Clicking a thumbnail opens full-size image.

### Parser Tasks

- [ ] **Review** existing `src/lib/schedule/sitefolio-files-reports-import.ts` (`parseSiteFolioFilesReportsHtml()`) — determine if it covers the folder tree structure or is only for the Files/Reports sub-section. Extend or replace as needed.
- [ ] **Build** `src/lib/sitefolio/parsers/documents.ts`:
  - `parseDocumentFolderHtml(html)` — parse ASMX response that returns folder/file HTML fragments. Extract: folder ID (`_folderID`), folder name, file rows (`TR.DOCSECTIONFILE` with `_fileID`, `_extension`, filename).
  - Returns `SfFolder[]` with nested `SfFile[]`.
- [ ] **Build** `src/lib/sitefolio/parsers/photos.ts`:
  - `parsePhotoLibraryList(html)` — parse the `select#cboPhotoLibrary` from P3 page to get library IDs, names, dates.
  - `parsePhotoLibraryContents(html)` — parse ASMX `GetMiniPhotoLibraryMarkup` response to extract photo image IDs and metadata.

### API Route Tasks

- [ ] **Create** `src/app/api/sitefolio/project/[id]/documents/route.ts` — `GET`; fetches root folder contents via proxy+ASMX; returns parsed folder/file list. Accepts `?bn=18751926|18752105` for sub-page selection.
- [ ] **Create** `src/app/api/sitefolio/project/[id]/documents/folder/[folderId]/route.ts` — `GET`; lazy-loads a specific folder's contents on demand via ASMX.
- [ ] **Create** `src/app/api/sitefolio/project/[id]/documents/download/route.ts` — `GET`; streams a file from SiteFolio using the file download URL pattern. Accepts `?fileId={id}&fileName={name}`. This proxies the file so the browser downloads it from FaciliOne, not SiteFolio directly.
- [ ] **Create** `src/app/api/sitefolio/project/[id]/photos/route.ts` — `GET`; fetches P3 page, extracts photo library list; returns array of `SfPhotoLibrary`.
- [ ] **Create** `src/app/api/sitefolio/project/[id]/photos/[libraryId]/route.ts` — `GET`; calls ASMX `GetMiniPhotoLibraryMarkup` via proxy; returns parsed photo list with image IDs.
- [ ] **Create** `src/app/api/sitefolio/project/[id]/photos/image/[imageId]/route.ts` — `GET`; calls ASMX `GetBlobSrc` via proxy and streams image blob back to browser.

### Type Tasks

- [ ] **Add** to `src/types/sitefolio.ts`: `SfFolder`, `SfFile`, `SfPhotoLibrary`, `SfPhoto`.

### Frontend Tasks

- [ ] **Build** `src/components/sitefolio/sf-documents-tab.tsx`:
  - Sub-tabs: Text Documents | Drawings.
  - Collapsible folder tree (accordion-style). Root folders visible on load. Click to lazy-load subfolder contents.
  - File rows: extension icon, filename, download button.
  - No edit/delete/upload controls (read-only).
  - Skeleton loader on each folder expand.

- [ ] **Build** `src/components/sitefolio/sf-photos-tab.tsx`:
  - Library selector dropdown showing library name, date, photo count.
  - Thumbnail grid (4 columns on desktop) using proxied image URLs.
  - Click thumbnail → opens full-size image in a dialog/lightbox.
  - Skeleton grid while loading.

### Test Criteria
- Documents tab shows root folders.
- Expanding a folder loads subfolders/files.
- Clicking "Download" on a file triggers browser download.
- Photos tab shows library dropdown with dates and counts.
- Selecting a library shows thumbnail grid.
- Clicking a thumbnail opens full-size.

---

## Phase 7 — Reports Module

**Goal:** Add a Reports section to the app (new nav item). It provides three data-driven pages: Division Status (P15), Data Completeness (P16), and SiteFolio Reports (direct links). All data is fetched live from SiteFolio on demand.

**SiteFolio Sources:**
- P15 Construction Status Report (XLSX): `PAGE-15-CONSTRUCTION-STATUS-REPORT.md`
  - URL: `https://www.sitefolio.net/RunReport.aspx?parameters=reportname!Kroger/ConstStatus_Divisional|idcurrententerprise!8252|format!3|Parameters!Region^Midcentral$ReportName^MidCentral_ConstStatus$_idCurrentMember^0$BusinessUnit^3`
- P16 Audit Report (XLS): `PAGE-16-AUDIT-REPORT.md`
  - URL: `https://www.sitefolio.net/reports/reportname!Kroger/sf_AuditReport|idcurrententerprise!8252|format!3|parameters!Region^3$ReportName^sf_AuditReport$_idCurrentMember^0/sf_AuditReport.xls`

**Important parsing notes (from PAGE-15 and PAGE-16):**
- P15: 375 rows × 112 columns. **4 sections** (New Store, Expansion Remodel, Interior Remodel, Fuel). Each project spans 5–6 rows. Column mappings differ per section. Parser must detect section header rows and apply the correct column map.
- P16: 240 rows × 26 columns. Row 9 = category groupings, Row 10 = column names. Project data starts at Row 11. C3 (Store #) is the primary key.

### Parser Tasks

- [ ] **Build** `src/lib/parsers/construction-status.ts`:
  - Download P15 XLSX via proxy.
  - Parse with SheetJS (`xlsx` — already in project).
  - Detect 4 section headers by scanning C1 for "King Soopers/City Market" + section keywords.
  - For each section, identify project rows by "620-" pattern in C1.
  - Per project: collect 5–6 consecutive rows and map fields using the per-section column maps defined in PAGE-15 documentation.
  - Return: `ConstructionStatusProject[]` — typed array with fields: `projectNumber`, `pmInitials`, `projectType`, `sizesqft`, `city`, `gcName`, `architect`, `milestones{}` (key = milestone name, value = date), `caNumbers{}`, `caAmounts{}`, `decor`, `statusComment`, `openingYear`.

- [ ] **Build** `src/lib/parsers/audit-report.ts`:
  - Download P16 via proxy (XLS extension, XLSX internally — use SheetJS).
  - Skip rows 1–10.
  - For each row 11+: extract all 26 fields per PAGE-16 column map.
  - Return: `AuditReportProject[]` — typed array with fields: `pm`, `projectType`, `storeNumber`, `lastCommentDate`, `photoOnOverview`, `hasF1`, `status`, `lastActualDate`, `teamChecks{}` (kroger, archEng, testingInsp, gcBidders), `fileChecks{}` (bidDocs, costSummary, gcConstDocs, etc.), `latestPhotoDate`.

### API Route Tasks

- [ ] **Create** `src/app/api/reports/sync/route.ts` — `POST`; admin-only; downloads P15 and P16 via proxy, runs both parsers, writes results to Firestore `reports/divisionStatus` and `reports/auditReport` with a `syncedAt` timestamp. Returns summary: project count, parse errors.
- [ ] **Create** `src/app/api/reports/division-status/route.ts` — `GET`; authenticated; reads from Firestore `reports/divisionStatus`. Returns the full `ConstructionStatusProject[]` plus `syncedAt`.
- [ ] **Create** `src/app/api/reports/audit/route.ts` — `GET`; authenticated; reads from Firestore `reports/auditReport`. Returns the full `AuditReportProject[]` plus `syncedAt`.

### Firestore Tasks

- [ ] **Add** top-level collection `reports` with documents `divisionStatus` and `auditReport`. Each document contains the parsed array and `syncedAt`.
- [ ] **Add** Firestore security rules: `reports/*` — read: any authenticated user; write: admin only (or server-side only).

### Type Tasks

- [ ] **Create** `src/types/reports.ts` — `ConstructionStatusProject`, `AuditReportProject`, `ReportSyncMeta`.

### Frontend Tasks (Routes + Pages)

- [ ] **Add** "Reports" nav item to sidebar (`src/components/layout/sidebar.tsx`) — visible to all authenticated users.
- [ ] **Create** `src/app/(app)/reports/page.tsx` — Reports hub: cards for Division Status, Data Completeness, SiteFolio Reports, Custom Reports. Shows `syncedAt` timestamp and a "Sync Now" button (admin only).
- [ ] **Create** `src/app/(app)/reports/division-status/page.tsx`:
  - Fetch from `/api/reports/division-status`.
  - shadcn DataTable (TanStack Table) with columns: Project #, PM, Type, Size, GC, Status Comment, Grand Opening.
  - Filters: Project Type, PM initials, Opening Year.
  - Search: project number, city.
  - Row click → navigate to project detail (if project exists in Firestore) or show a read-only detail drawer.
  - Export button → download P15 XLSX directly via proxy (use the P15 URL from PAGE-15).

- [ ] **Create** `src/app/(app)/reports/completeness/page.tsx`:
  - Fetch from `/api/reports/audit`.
  - DataTable: Project #, PM, Type, Status, Last Comment Date, Latest Photo Date, Completeness Score (count of X's out of applicable checks).
  - Completeness score shown as progress bar.
  - Filters: PM, Project Type, Status.
  - Detail drawer: click any project row to see which specific check columns are X vs. empty.
  - Color-coded: green (≥80%), yellow (50–79%), red (<50%).

- [ ] **Create** `src/app/(app)/reports/sitefolio/page.tsx`:
  - Project selector (search/dropdown using Firestore projects list).
  - On select: generate and display all native SF report download links for that project (using URL patterns from PAGE-03 and PAGE-09 docs):
    - Change Order Log (PDF + XLSX)
    - Project Directory (PDF + XLSX)
    - Project Update Report (PDF)
    - Project Notification History (XLSX)
    - Budget: Versions XLSX, Actuals XLSX, Baseline XLSX
  - Each link: named button that opens/downloads via the proxy.

- [ ] **Create** `src/app/(app)/reports/custom/page.tsx`:
  - Placeholder connected to FE Copilot: button "Ask Copilot to generate a report" → navigates to `/fe-copilot` with a pre-seeded prompt for custom analysis.

### Test Criteria
- Admin clicks "Sync Now" → both reports download and parse without errors.
- Division Status table shows all ~58 active projects with milestones.
- Filters narrow the table correctly.
- Data Completeness shows completeness scores; project rows expandable.
- SiteFolio Reports page: select a project → report download buttons appear and work.
- `syncedAt` timestamp updates after sync.

---

## Phase 8 — Dashboard: Real Data & Charts

**Goal:** Replace all "Coming Soon" dashboard placeholders with live widgets powered by P15/P16 data (available from Phase 7). Add Alerts & Action Items and Schedule Variance.

**Data Sources:** Firestore `reports/divisionStatus` and `reports/auditReport` (written in Phase 7).

**What's currently placeholder (from DISCREPANCIES.md I-02):**
- Budget by Type chart
- Schedule Trend chart
- Heat Map
- Alerts & Action Items (has real structure but no live data)
- Schedule Variance widget
- Data Freshness indicator

### Backend Tasks

- [ ] **Create** `src/app/api/dashboard/metrics/route.ts` — `GET`; authenticated; reads `reports/divisionStatus` and `reports/auditReport` from Firestore; computes and returns:
  - `projectCountsByType`: count per project type (NS, ER, WIW, FC, MC, MR).
  - `projectCountsByPhase`: count per lifecycle phase.
  - `scheduleVariance[]`: top 10 projects sorted by largest baseline-to-projected delta on Grand Opening milestone (calculated from `milestones.grandOpening` baseline vs. projected dates in P15 data).
  - `alertItems[]`: overdue milestones (projected date < today and no actual date), projects missing team contacts (from P16 `teamChecks`), projects missing photos (from P16 `photoOnOverview === 'N'` for active projects).
  - `dataFreshness`: `divisionStatus.syncedAt`, `auditReport.syncedAt`.

### Frontend Tasks

- [ ] **Replace** "Budget by Type" placeholder with a shadcn-compatible Recharts bar chart using `projectCountsByType` data (count per type, not budget — rename to "Projects by Type" to match available data).
- [ ] **Replace** "Schedule Trend" placeholder with a Recharts bar chart showing `projectCountsByPhase` data (counts per lifecycle phase as a pipeline/funnel view).
- [ ] **Replace** "Heat Map" placeholder with a Recharts scatter or grid chart showing schedule variance magnitude per project type.
- [ ] **Wire** Alerts & Action Items widget to real `alertItems[]` data. Group by: Overdue Milestones, Missing Team Contacts, Missing Photos.
- [ ] **Wire** Schedule Variance widget to `scheduleVariance[]` — ranked list of top 10 projects with largest delay (in days).
- [ ] **Wire** Data Freshness indicator to `dataFreshness` — show last sync timestamps; "Sync Now" button (admin only) calls `/api/reports/sync`.
- [ ] Recharts must be installed if not already present: `npm install recharts`. Use responsive containers.

### Test Criteria
- Dashboard loads with charts showing real data, not placeholders.
- Alerts show real overdue milestones (projects where projected date < 2026-05-03 and no actual).
- Schedule Variance shows real project delays.
- "Sync Now" triggers re-fetch and widgets refresh.
- Data Freshness shows correct timestamp.

---

## Phase 9 — Settings Module

**Goal:** Add a Settings section to the nav. Consolidates user profile, SiteFolio connection status, data sync control, app preferences, and AI configuration (moved from Admin) into one place accessible to all roles with appropriate permissions.

**Note:** Admin-only operations (user management, project bulk ops) stay in Admin. Settings is for per-user configuration and system monitoring.

### Pages to Build

- [ ] **Add** "Settings" nav item to sidebar — visible to all authenticated users; pinned to bottom above Profile.
- [ ] **Create** `src/app/(app)/settings/page.tsx` — Settings hub: cards/links to each sub-page.
- [ ] **Create** `src/app/(app)/settings/profile/page.tsx` — name, email (read-only, from Firebase Auth), role (read-only), avatar (if already supported in profile page, link to it; otherwise show info).
- [ ] **Create** `src/app/(app)/settings/sitefolio/page.tsx` — SiteFolio connection status card:
  - Reads from `/api/sitefolio/auth` (already exists).
  - Shows: Connected / Expired / Error status badge, `obtainedAt`, `expiresAt`, `memberId`.
  - If expired/error: shows "Session needs refresh — contact admin" message (no trigger button for end users; re-auth requires admin action via Playwright).
- [ ] **Create** `src/app/(app)/settings/sync/page.tsx` — Data Sync page:
  - Shows last sync timestamps (from `reports/divisionStatus.syncedAt` and `reports/auditReport.syncedAt`).
  - "Sync Reports Now" button → calls `POST /api/reports/sync` (admin only; hidden for non-admin).
  - Sync log (last 10 sync events stored in Firestore `syncLogs` collection).
- [ ] **Create** `src/app/(app)/settings/preferences/page.tsx` — App Preferences:
  - Theme toggle (light/dark) — wire `next-themes` if not already wired (noted as pending in STATUS.md).
  - Default landing page selector.
  - Date format preference (MM/DD/YYYY default).
  - Save preferences to Firestore `userPreferences/{userId}` (rules already exist).
- [ ] **Create** `src/app/(app)/settings/ai/page.tsx` — AI Settings:
  - Move the AI Setup tab content from Admin panel to here; Admin AI Setup redirects to this page (or duplicate read-only view in admin, full edit here).
  - Model config, feature-model map, agent registry (admin-only edit; read-only for others).

### Firestore Tasks

- [ ] **Create** `syncLogs` collection: `POST /api/reports/sync` writes a new doc per sync event with `type`, `syncedAt`, `projectCount`, `errors[]`, `triggeredBy`.
- [ ] **Add** Firestore rule for `syncLogs`: read: admin; write: Admin SDK only.
- [ ] **Wire** `userPreferences/{userId}` reads/writes to the Preferences page (rules already exist per DISCREPANCIES.md F-04; just need client code).

### Test Criteria
- Navigate to Settings from sidebar.
- Profile page shows correct name/email/role.
- SiteFolio page shows session status with timestamps.
- Sync page shows last sync time; admin can trigger sync.
- Preferences: change theme → app theme changes immediately.
- Preferences: change landing page → on next login, app opens to selected page.

---

## Phase 10 — FE Copilot: Wire Sub-Feature Routes

**Goal:** The 8 built copilot sub-feature routes are currently unreachable from the UI. Wire them to explicit UI actions in the FE Copilot so each feature can be invoked directly.

**Routes to wire (all already exist per MASTER-TREE.md):**
- `/api/ai/copilot/sop-qa` — SOP procedure Q&A
- `/api/ai/copilot/next-actions` — Next actions advisor for a project
- `/api/ai/copilot/draft-communication` — Draft emails / letters
- `/api/ai/copilot/gate-check` — Gate readiness check for a phase
- `/api/ai/copilot/historical-search` — Historical project search
- `/api/ai/copilot/budget-analysis` — Budget analysis
- `/api/ai/copilot/schedule-deviations` — Schedule deviation analysis
- `/api/ai/copilot/document-review` — Document review

### Design Principle
The main `/api/ai/copilot` route handles open-ended chat. The 8 sub-feature routes handle structured, scoped requests. The Copilot UI should expose these as:
- **Quick Action buttons / chips** in the chat interface (e.g., "Analyze Schedule", "Draft Communication", "Check Gate Readiness").
- Clicking a Quick Action pre-populates the input with a structured prompt template and routes the request to the correct sub-feature endpoint instead of the main chat route.
- The result streams back into the same chat UI.

### Frontend Tasks

- [ ] **Define** a `CopilotFeature` config array in the FE Copilot page: each entry has `id`, `label`, `icon`, `routeSuffix`, `promptTemplate(projectContext)`.
- [ ] **Add** Quick Action chips below the chat input (8 chips, scrollable row on mobile).
- [ ] **Wire** each chip: on click, set the input field to the prompt template, mark `selectedFeature = routeSuffix`, and on submit route to `/api/ai/copilot/{routeSuffix}` instead of the main route.
- [ ] **Add** "Analyze Project" mode: if user is viewing a project when they open the inline panel, pass `projectId` and `projectType` as context to the selected sub-feature.
- [ ] **Update** inline panel (`src/components/copilot/inline-panel.tsx`) to also expose the Quick Action chips.

### Test Criteria
- FE Copilot shows 8 Quick Action chips.
- Clicking "Analyze Schedule" pre-fills input with schedule prompt.
- Submitting → response comes from the schedule-deviations route (verifiable in network tab).
- Inline panel on project detail page also shows Quick Actions.
- All 8 features return a coherent response.

---

## Phase 11 — Portfolio Views

**Goal:** Two new views under Projects: side-by-side project comparison, and a multi-project timeline (portfolio Gantt).

**Data Sources:** Firestore `reports/divisionStatus` (P15 data from Phase 7) + project Firestore documents.

### Routes to Create

- [ ] **Create** `src/app/(app)/projects/compare/page.tsx` — Project Comparison view.
- [ ] **Create** `src/app/(app)/projects/timeline/page.tsx` — Portfolio Timeline view.
- [ ] **Add** nav links in the Projects section (e.g., sub-nav or links on the projects list page header).

### Comparison View Tasks

- [ ] Multi-select (up to 4 projects) from a searchable dropdown using Firestore project list.
- [ ] Side-by-side comparison panels: each column = one project.
- [ ] Rows: project type, phase, GC, size, Grand Opening date (baseline vs. projected), schedule variance (days), key milestone dates from P15 data.
- [ ] Uses P15 milestone data from `reports/divisionStatus` keyed by `projectNumber`.

### Timeline View Tasks

- [ ] Gantt-style horizontal timeline (built with a lightweight SVG or CSS grid approach — no external Gantt library required; use what's already in project for Gantt if applicable).
- [ ] Each row = one active project. X-axis = date range (current year ± 1).
- [ ] Plot 3 milestone markers per project: Construction Start, Grand Opening Baseline, Grand Opening Projected.
- [ ] Filter by: Project Type, PM initials, Opening Year.
- [ ] Data source: `reports/divisionStatus` (P15).

### Test Criteria
- Select 2 projects in Compare → columns render side-by-side with key data.
- Timeline shows active projects as horizontal bars.
- Filter by project type → timeline narrows.
- Grand Opening Projected vs. Baseline clearly distinguishable.

---

## Phase 12 — Smart Tools: Bid Comparison (ST-02)

**Goal:** Build the Bid Comparison smart tool as ST-02. This uses SiteFolio Bidding data (already available from Phase 4 parsers/routes) to produce a structured comparison across GCs.

**SiteFolio Source:** Reuse Phase 4 work — `GET /api/sitefolio/project/{id}/bidding/{bpId}` returns the full Detail Analysis SOV.

**What ST-02 does:**
1. User selects a project + bid package (or enters a project number and the tool fetches available packages).
2. The tool fetches the Bid Package Detail Analysis from SiteFolio.
3. AI (`/api/ai/cost-estimate` or a new `/api/ai/bid-comparison` route) analyzes the SOV data.
4. Output: structured comparison showing — missing scope per GC (GC bid $0 where budget > $0 or other GCs priced it), extra scope (GC priced where budget = $0), schedule duration comparison, key variances (largest spread between highest and lowest GC per line item).
5. Downloadable XLSX with tabs: Bid Summary, Missing Scope, Extra Scope, Key Variances.

### Backend Tasks

- [ ] **Create** `src/app/api/ai/bid-comparison/route.ts` — `POST`; authenticated; accepts `{ projectId, sfProjectId, bpId, detailAnalysisData: SfBidPackageDetail }`; prompts the AI model to produce the structured analysis; returns JSON with `missingScopePerGc`, `extraScopePerGc`, `scheduleComparison`, `keyVariances`.
- [ ] **Create** `src/app/api/smart-tools/bid-comparison/export/route.ts` — `POST`; accepts analysis result; generates XLSX with ExcelJS (4 tabs); returns file.

### Type Tasks

- [ ] **Add** `BidComparisonResult` to `src/types/smart-tools.ts`.

### Frontend Tasks

- [ ] **Replace** the ST-02 placeholder card in Smart Tools index with a real link to `/smart-tools/bid-comparison`.
- [ ] **Create** `src/app/(app)/smart-tools/bid-comparison/page.tsx`:
  - Step 1: Project selector (search Firestore projects by name/number; must have `siteFolioJobNumber`).
  - Step 2: Bid package selector (auto-populated from `/api/sitefolio/project/{id}/bidding`).
  - Step 3: "Analyze" button → calls `/api/ai/bid-comparison`.
  - Results: 4 collapsible sections (Missing Scope, Extra Scope, Key Variances, Schedule). Each shows a table.
  - "Export to XLSX" button.

### Test Criteria
- Select project with an active bid package → packages load in dropdown.
- Click "Analyze" → analysis returns in under 30 seconds.
- Missing scope section correctly identifies $0 bids where other GCs priced the item.
- XLSX download produces file with 4 sheets.

---

## Appendix A — Existing Infrastructure Reference

| What | Where | Notes |
|---|---|---|
| SiteFolio proxy | `/api/sitefolio/proxy/[...path]` | Admin-only currently; project-level routes need `requireAppUser()` + project access check |
| Session cookies | `sitefolio_sessions/current` in Firestore | Already read by `src/lib/sitefolio/session-store.ts` |
| Existing parsers | `src/lib/sitefolio/parsers/` | overview.ts, schedule.ts, projects-list.ts |
| Auth middleware | `src/lib/firebase-admin/request-auth.ts` | `requireAppUser()`, `requireRoles()` |
| AI client | `src/lib/ai/client.ts` | `invokeAiText()`, `invokeAiModelText()` |
| SheetJS | `xlsx` package | Already used for Estimator CSV/XLSX import |
| ExcelJS | `exceljs` package | Already used for Estimator XLSX export |
| SF sync engine | `src/lib/sitefolio/sync.ts` | Full/single project sync already operational |

## Appendix B — Firestore Cache Collections Added in This Plan

| Collection | Written By | Read By |
|---|---|---|
| `projects/{pid}/sfCache/{tab}` | Per-tab API routes (Phases 2–6) | Tab components |
| `reports/divisionStatus` | `/api/reports/sync` (Phase 7) | Dashboard, Reports pages |
| `reports/auditReport` | `/api/reports/sync` (Phase 7) | Dashboard, Reports pages |
| `syncLogs/{id}` | `/api/reports/sync` (Phase 9) | Settings/Sync page |

## Appendix C — New Routes Added in This Plan

| Route | Phase | Auth |
|---|---|---|
| `GET /api/admin/estimates` | 1 | admin |
| `GET /api/sitefolio/project/[id]/overview` | 2 | user + project access |
| `GET /api/sitefolio/project/[id]/team` | 2 | user + project access |
| `GET /api/sitefolio/project/[id]/budget` | 3 | user + project access |
| `GET /api/sitefolio/project/[id]/budget/export` | 3 | user + project access |
| `GET /api/sitefolio/project/[id]/bidding` | 4 | user + project access |
| `GET /api/sitefolio/project/[id]/bidding/[bpId]` | 4 | user + project access |
| `GET /api/sitefolio/project/[id]/contracts` | 5 | user + project access |
| `GET /api/sitefolio/project/[id]/requests` | 5 | user + project access |
| `GET /api/sitefolio/project/[id]/documents` | 6 | user + project access |
| `GET /api/sitefolio/project/[id]/documents/folder/[folderId]` | 6 | user + project access |
| `GET /api/sitefolio/project/[id]/documents/download` | 6 | user + project access |
| `GET /api/sitefolio/project/[id]/photos` | 6 | user + project access |
| `GET /api/sitefolio/project/[id]/photos/[libraryId]` | 6 | user + project access |
| `GET /api/sitefolio/project/[id]/photos/image/[imageId]` | 6 | user + project access |
| `POST /api/reports/sync` | 7 | admin |
| `GET /api/reports/division-status` | 7 | authenticated |
| `GET /api/reports/audit` | 7 | authenticated |
| `GET /api/dashboard/metrics` | 8 | authenticated |
| `POST /api/ai/bid-comparison` | 12 | authenticated |
| `POST /api/smart-tools/bid-comparison/export` | 12 | authenticated |

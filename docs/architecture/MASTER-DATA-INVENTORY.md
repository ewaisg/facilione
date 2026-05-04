# SiteFolio Master Data Inventory

**Compiled from:** 14 page analyses (P1–P14)
**Source project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956) + 620-00152-01 KS-152 Lone Tree (SF ID: 131317)
**Date:** April 2026

---

## 1. DATA DOMAINS

### 1.1 People & Contacts

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| Contact name, title, email, phone | P1 Contact Profile | Server | `td[id$="tdFirstName"]`, `td[id$="tdEmail"]`, etc. |
| Contact status (Active/Inactive) | P1 | Server | `td[id$="tdStatus"]` |
| Contact location / office | P1 | Server | `td[id$="tdLocation"]` |
| vCard export | P1 | ASMX | `GET /ws/Directory/Contact.asmx/GetVCard?contactID={id}` |
| Project team (role, name, phone, email) | P3 Overview | Server | `td[id$="tdJob"]`, `td[id$="tdContact"]`, `td[id$="tdPhone"]`, `td[id$="tdEmail"]` |
| Full project directory (by category) | P5 Directory | AJAX GET | `GET /Kroger/Directory2/Directory/Index?projectID={id}` |
| Team categories (11 types) | P5 | Server | bn values: Owner=4, Consultant=2, Contractor=3, Sub=6, GovEntity=8, Vendor=12, Utility=20, Other=7, Broker=5, Subconsultant=16 |

### 1.2 Projects & Portfolio

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| All projects for a contact (active + completed) | P2 Projects List | Server | `a[href*="ProjectOverviewView"]` in `table.WP_DATATABLE` |
| Project number, year, description, phase, type | P2 | Server | Parsed from link text |
| Project role (PM, PM2, Maintenance Engineer) | P2 | Server | Text after `</a>` tag: "Role: {role}" |
| Store number and location | P2 | Server | Store header rows with `colspan="3"` |
| SF Project ID (idProject) | P2 | Server | URL param in project links |
| Associated projects (related phases) | P3 Overview | ASMX POST | `/ws/Projects/AssociatedProjects.asmx/GetAssociatedProjectsMarkup` |

### 1.3 Project Overview & Status

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| Project address + Google Maps link | P3 Overview | Server | `div[id$="spnAddress"]`, `div[id$="spnMapLink"]` |
| Project status (phase label) | P3 Overview | Server | `span[id$="spnProjectStatus"]` |
| Project description | P3 Overview | Server | `div[id$="spnDescription"]` |
| General comments (weekly status updates) | P3 Overview | Server | `div.GENERALREPORTCOMMENTS` — fixed + variable sections |
| Upcoming milestones (next 7) | P3 Overview | Server | `a[id*="aStatusTopicDate"]`, `td[id*="tdStatusTopicData"]` |
| Photo library metadata | P3 Overview | ASMX POST | `/ws/Projects/PhotoLibrary.asmx/GetMiniPhotoLibraryMarkup` |
| Photo images | P3 Overview | ASMX POST | `/ws/Projects/PhotoLibrary.asmx/GetBlobSrc` |

### 1.4 Schedule

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| All milestones (53 for New Store) | P4 Schedule | Server | `table#tblScheduleDates > tbody#tbScheduleDates` |
| 4 date columns per milestone | P4 | Server | `td.SD[data-num="1"]` (Baseline), `[data-num="2"]` (Projected), `[data-num="3"]` (Proj Alt), `[data-num="4"]` (Actual) |
| Phase headers with bn IDs | P4 | Server | `tr.CAT[data-id]` |
| Completion % per milestone | P4 | Server | `td.SP` |
| Milestone notes (date, author, text) | P4 | Server | `tr.MSCN` → `div.BY` + `div.NOTE` |
| Assigned contact per milestone | P4 | Server | `td.TC > span.CONTACT[data-cid]` |
| Schedule template name | P4 | Server | Bottom of page text |
| Gantt chart URLs (3 types) | P4 | Server | `/Kroger/Gantt.sf?idProject={id}&gantt={10|19|20}` |

### 1.5 Financial — Budget

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| Hierarchical budget line items (CSI) | P9 Budget | Server | `table` rows with `_level` attribute (0–3) |
| Budget version history (6 versions) | P9 | Server | Version dropdown with `sfBudgetProjectID`, amount, date, author |
| Budget stage workflow | P9 | Server | Import → Under Development → Commitment → Reconcile → Publish |
| 15 budget views (different perspectives) | P9 | Server | View dropdown in page controls |
| Budget export (Versions, Actuals, Baseline) | P9 | ASMX GET | `/ws/Budgeting/Budgeting.asmx/ExportVersionsToExcel`, `ExportActualsToExcel`, `ExportBaselineToExcel` |

### 1.6 Financial — Contracts

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| Contract list with SOV columns | P10 Contracts | Server | `table.SOV` |
| Per-contract: sum, changes, % complete, retainage | P10 | Server | `td[id$="tdContractSum"]`, `tdApprovedChanges`, `tdPercentComplete`, `tdRetainage`, etc. |
| Contract detail page | P10 | Server | `/Kroger/ContractorContract2View.sf?...&idContract={id}` |
| Contract attachments download | P10 | ASMX GET | `/ws/Contracts2/Contracts2.asmx/GetContractAttachments?enterpriseID=8252&idProject={id}` |
| Copy contract to budget | P10 | Server | Dropdown of budget versions + stages |

### 1.7 Financial — Bidding

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| Bid package list (number, status, name, due date) | P11 Bidding | Server | `table.BIDDING_LIST` |
| Bid package detail | P11 | Server | `/Kroger/BidPackageView.sf?...&idBP={id}&idSubtype=1` |
| Copy bid to budget | P11 | Server | Same dropdown as Contracts |

### 1.8 Requests (ASI / PR / RFI)

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| ASI list (search, filter, sort) | P6 ASI | AJAX GET | `/ws/Contracts2/Asi2.asmx/AsiSearch` |
| PR list (search, filter, sort) | P7 PR | AJAX GET | `/ws/Contracts2/PR2.asmx/PRSearch` |
| RFI list (search, filter, sort) | P8 RFI | AJAX GET | `/ws/Contracts2/Rfi2.asmx/RfiSearch` |
| ASI statuses: Issued (2), Voided (3) | P6 | — | — |
| PR statuses: Not Issued (1), Issued (2), Void (3) | P7 | — | — |
| RFI statuses: Submitted (2), Under Review (3), Final (4), Under Clarification (5) | P8 | — | — |

### 1.9 Documents & Files

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| Folder tree (lazy-loaded) | P12 Files | ASMX POST | `/ws/Documents/Documents.asmx/` + multiple methods |
| File download | P12 | URL | `/files/idProject!{id}|...|iditem!{fileID}|itemtype!22|.../filename` |
| Folder CRUD (create, delete, rename, reorder, recolor) | P12 | ASMX POST | `CreateProjectDocumentFolder`, `DeleteProjectDocumentFolder`, `ModifyProjectDocumentFolder` |
| File move/copy | P12 | ASMX POST | `MoveProjectDocuments`, `CopyFolderToFolder`, `CopyFileToFolder`, `CopyFileToFile` |
| Drag-and-drop upload | P12 | POST | `/DragAndDropUpload.aspx` |
| Email upload | P12 | Email | `P={projectID}+=Files~Unknown~UnZip~{folderID}@kroger.sitefolio-mail.net` |
| Markup viewer (25+ file types) | P12 | URL | `/Kroger/Markup?idProject={id}&versionID={vid}&ait=22` |
| Folder permission bitmask | P12 | DOM | `_fp` attribute on folder TABLE elements |

### 1.10 Project Classification & Metadata

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| Site address | P13 Classification | Server | `#spnAddress` |
| Facility Number, DLT Number | P13 | Server | `td[id$="tdSiteIdentifier1"]`, `td[id$="tdSiteIdentifier2"]` |
| Business Unit | P13 | Server | `td[id$="tdRegion"]` |
| Project Type (New Store, WIW, MC, etc.) | P13 | Server | `td[id$="tdProjectType"]` |
| Building Type (MarketPlace, etc.) | P13 | Server | `td[id$="tdBuildingType"]` |
| Project Status (Fixturing, etc.) | P13 | Server | `td[id$="tdProjectStatus"]` |
| Real Estate type (Kroger-owned, etc.) | P13 | Server | `td[id$="tdRealEstateType"]` |
| Legal Entity (Dillon Companies, etc.) | P13 | Server | `BusinessCustomDropDown4_v` |
| FE Region (Mid-Central, etc.) | P13 | Server | `BusinessCustomDropDown2_v` |
| Budget Year | P13 | Server | `BusinessCustomLabel1_v` |
| CA Numbers (Land, Building, Equipment, DD, Fixturing, Fuel) | P13 | Server | `BusinessCustomLabel7_v` through `BusinessCustomLabel19_v` |
| CA Amounts ($) | P13 | Server | Same pattern with sequential label numbers |
| Capital Approval Status | P13 | Server | `BusinessCustomDropDown1_v` |
| Project Notes (date, author, text, CRUD) | P13 | Server | `ProjectNotes` property page dialog |
| Site-level custom fields (Décor, Ownership, Cluster, Gas Station) | P13 | Server | `BusinessCustomDropDown` pattern |

### 1.11 Building Design & Physical Specs

| Data Point | Source Page | Loading | Selector / Endpoint |
|---|---|---|---|
| Stories, parking counts | P14 Design Attributes | Server | `td[id$="tdStories"]`, `td[id$="tdStalls"]` |
| Building dimensions (width, depth) | P14 | Server | `td[id$="tdBuildingWidth"]`, `td[id$="tdBuildingDepth"]` |
| F1 Gross Building Area (sqft) | P14 | Server | Site size repeater rows |
| F1 Sales Area (sqft) | P14 | Server | Site size repeater rows |
| Construction methods (roof, foundation, superstructure, enclosure) | P14 | Server | `td[id$="tdRoofStyles"]`, `tdFoundations`, etc. |
| Fuel center specs (dispensers, tanks, diesel, E85) | P14 | Server | `EnterpriseCustomDropDown` pattern |

---

## 2. ASMX / API ENDPOINT REGISTRY

### 2.1 POST Endpoints (Form-Encoded)

| Endpoint | Purpose | Source |
|---|---|---|
| `/ws/Directory/Contact.asmx/GetVCard` | Export contact vCard | P1 |
| `/ws/Projects/AssociatedProjects.asmx/GetAssociatedProjectsMarkup` | Related projects | P3 |
| `/ws/Projects/PhotoLibrary.asmx/GetMiniPhotoLibraryMarkup` | Photo library contents | P3 |
| `/ws/Projects/PhotoLibrary.asmx/GetBlobSrc` | Individual photo blob | P3 |
| `/ws/Documents/Documents.asmx/CreateProjectDocumentFolder` | Create folder | P12 |
| `/ws/Documents/Documents.asmx/DeleteProjectDocumentFolder` | Delete folder | P12 |
| `/ws/Documents/Documents.asmx/ModifyProjectDocumentFolder` | Rename/reorder/recolor | P12 |
| `/ws/Documents/Documents.asmx/MoveProjectDocuments` | Move files | P12 |
| `/ws/Documents/Documents.asmx/CopyFolderToFolder` | Copy folder | P12 |
| `/ws/Documents/Documents.asmx/CopyFileToFolder` | Copy file to folder | P12 |
| `/ws/Documents/Documents.asmx/CopyFileToFile` | Copy file as version | P12 |
| `/ws/User/Watches.asmx/Add` | Add favorite | Global |
| `/ws/User/Watches.asmx/Remove` | Remove favorite | Global |
| `/ws/User/Watches.asmx/Move` | Move watch | Global |
| `/ws/User/Watches.asmx/IsSupportedOnEnterprise` | Check enterprise support | Global |

### 2.2 GET Endpoints (Return HTML)

| Endpoint | Purpose | Source |
|---|---|---|
| `/Kroger/Directory2/Directory/Index?projectID={id}` | Full project directory | P5 |
| `/ws/Contracts2/Asi2.asmx/AsiSearch` | ASI list | P6 |
| `/ws/Contracts2/PR2.asmx/PRSearch` | PR list | P7 |
| `/ws/Contracts2/Rfi2.asmx/RfiSearch` | RFI list | P8 |
| `/ws/Contracts2/Contracts2.asmx/GetContractAttachments` | Contract attachments ZIP | P10 |

### 2.3 GET Endpoints (Return Excel)

| Endpoint | Purpose | Source |
|---|---|---|
| `/ws/Budgeting/Budgeting.asmx/ExportVersionsToExcel` | Budget versions export | P9 |
| `/ws/Budgeting/Budgeting.asmx/ExportActualsToExcel` | Budget actuals export | P9 |
| `/ws/Budgeting/Budgeting.asmx/ExportBaselineToExcel` | Budget baseline export | P9 |

### 2.4 File & Upload Endpoints

| Endpoint | Purpose | Source |
|---|---|---|
| `/files/idProject!{id}|...|iditem!{fileID}|itemtype!22|.../filename` | File download | P12 |
| `/DragAndDropUpload.aspx` | Drag-and-drop file upload | P12 |
| `/Kroger/Markup?idProject={id}&versionID={vid}&ait=22` | Document markup viewer | P12 |

---

## 3. DOWNLOADABLE REPORTS

| Report | Format | Source Page |
|---|---|---|
| Change Order Report | XLSX | P10 Contracts |
| Change Order Summary | XLSX | P10 Contracts |
| Project Invoice Report | XLSM | P10 Contracts |
| Contract Attachments (all) | ZIP | P10 Contracts |
| Project Directory | PDF / XLSX | P3 Overview, P5 Directory |
| GC Bidder for eSourcing | XLSM | P5 Directory |
| Project Update Report (PUR) | PDF | P3 Overview |
| Project Notification History | XLSX | P3 Overview |
| IPECC Report | (advanced) | P9 Budget |
| Budget: SEF, SOV reports | (various) | P9 Budget |
| Document Activity | PDF | P12 Files |
| Document Notification History | PDF / XLSX | P12 Files |

---

## 4. DATA LOADING PATTERNS

| Pattern | Pages | How to Extract |
|---|---|---|
| **Server-rendered** | P1, P2, P3, P4, P9, P10, P11, P13, P14 | Single page fetch → parse HTML |
| **AJAX GET (returns HTML)** | P5, P6, P7, P8 | Separate GET request with cookies → parse returned HTML |
| **Lazy-loaded tree (ASMX POST)** | P12 | Initial fetch shows spinner; folder/file tree loads via `/ws/Documents/Documents.asmx/` |

---

## 5. KEY ID MAPPINGS

### Tab bn Values
| Tab | Sub-page | bn |
|---|---|---|
| $ | Budget | 256 |
| $ | Contracts | 512 |
| $ | Bidding | 5010 |
| REQUESTS | ASI | 1024 |
| REQUESTS | PR | 33554432 |
| REQUESTS | RFI | 65536 |
| FILES | Text Documents | 18751926 |
| FILES | Drawings | 18752105 |
| OVERVIEW | Classification | 8253 |
| OVERVIEW | Design Attributes | 8254 |

### Schedule Phase bn Values (Project-Specific — KS-152)
| Phase | bn |
|---|---|
| Evaluation | 789808 |
| Real Estate | 789809 |
| Due Diligence / Entitlements | 789801 |
| Fixture Plan Development | 789802 |
| Design Development | 789803 |
| Internal Approval | 789804 |
| Construction | 789805 |
| Fixturing | 789806 |
| Project Close-Out | 789807 |

Note: Schedule phase bn values are **project-specific** (not global). KS-142 uses different bn values (1052204–1052212).

### SiteFolio Constants
| Constant | Value |
|---|---|
| Base URL | `https://www.sitefolio.net` |
| Enterprise ID (Kroger) | 8252 |
| Team ID | 1077 |
| Team Page Group | 22 |
| Member ID (Gheiath) | 83709 |
| Contact ID (Evyn Sprenkel) | 74745 |

### Report Format Codes
| Code | Format |
|---|---|
| format!2 | PDF |
| format!3 | XLSX |
| format!11 | XLSX |
| format!14 | XLSM |

### Budget Stage IDs
| ID | Stage |
|---|---|
| 53 | Import |
| 1 | Under Development |
| 2 | Commitment |
| 3 | Reconcile |
| 4 | Publish |

### Custom Field Prefix Patterns
| Prefix | Scope | Source Page |
|---|---|---|
| `BusinessCustomLabel` / `BusinessCustomDropDown` / `BusinessCustomDate` / `BusinessCustomCurrencyAmount` / `BusinessCustomMultiSelect` | Kroger-specific (business-level) | P13 Classification |
| `EnterpriseCustomLabel` / `EnterpriseCustomDropDown` / `EnterpriseCustomMultiSelect` | Enterprise-level | P14 Design Attributes |

---

## 6. PROJECT LIFECYCLE PHASES (Observed)

From P2 Projects List across 33 projects:

| Phase | Lifecycle Position |
|---|---|
| Conceptual | Early planning |
| Due Diligence / Estimating | Early planning |
| Final Planning | Mid planning |
| Construction Documents | Mid planning |
| Construction Planning | Late planning |
| Bidding | Procurement |
| Under Construction | Execution |
| Fixturing | Late execution (retail-specific) |
| Open | Post-construction |
| Completed | Closed |

---

## 7. PROJECT TYPES (Observed)

| Type | Abbreviation | Example |
|---|---|---|
| New Store-Net New | NS | KS-152, KS-142 |
| Within-the-Walls Remodel | WIW | KS-012, KS-020, KS-118 |
| Minor Capital | MC | KS-052, KS-096 |
| Minor Remodel | MR | KS-028, KS-065 |
| Fixtures & Equipment | F&D | (observed in project names) |
| Fuel Center | FC | (known from Kroger context) |
| Expansion Remodel | ER | (known from Kroger context) |

# SiteFolio Page Analysis — Page 3: Project Overview

**URL:** `/Kroger/ProjectOverviewView.sf?idProject=131317`
**Page Title:** Project Overview
**Type:** Project-level overview page (the main dashboard for a single project)
**Project:** 620-00152-01 KS-152 2027 New Store, Lone Tree, CO - Ridgegate (SF ID: 131317)

---

## What This Page Is

This is the **richest single page in SiteFolio**. It's the project-level hub that aggregates address, status, comments, team contacts, upcoming milestones, report links, photo libraries, and project documents into one view. Every project has this page. It's the first thing a PM sees when clicking a project link.

---

## Project Navigation (Tab Bar)

The project nav bar shows **8 top-level modules**, each with sub-menus:

| Tab | Sub-items | URLs |
|---|---|---|
| **OVERVIEW** (active) | Overview, Classification, Design Attributes | `ProjectOverviewView.sf`, `SiteProjClassView.sf`, `SiteBuildingDesignView.sf` |
| **SCHEDULE** | All, Evaluation, Real Estate, Due Diligence/Entitlements, Fixture Plan Development, Design Development, Internal Approval, Construction, Fixturing, Project Close-Out | `Scheduling.sf?idProject=131317&bn={phaseId}` |
| **TEAM** | Send Team Notification, All, Owner, Broker/Developer, Professional Consultant, Subconsultant, Contractor, Subcontractor, Government Entity, Equipment/Materials Vendor, Other, Utility Company | `ProjectDirectoryHome2.sf?idProject=131317&bn={categoryId}` |
| **TASKS** | General Project | `ProjectTasks.sf` |
| **REQUESTS** | ASI, PR, RFI | `Asi2Main.sf`, `PR2Main.sf`, `Rfi2Main.sf` |
| **$** | Budget, Contracts, Bidding | `BudgetVersionView.sf`, `ContractorContract2Main.sf`, `BidPackageList.sf` |
| **FILES** | Text Documents, Drawings | `ProjectDocuments.sf` |
| **PHOTOS** | Existing Conditions, Work-in-Progress, Final Product | `ProjectPhotos.sf` |

The Schedule sub-menu reveals **all 8 schedule phases for New Store**: Evaluation, Real Estate, Due Diligence/Entitlements, Fixture Plan Development, Design Development, Internal Approval, Construction, Fixturing, Project Close-Out. Each has a `bn={phaseId}` parameter.

The **$** tab reveals three financial modules: Budget, Contracts, and Bidding — all separate pages we can analyze later.

---

## Data Found on This Page

### 1. Project Header

**Selector:** `span[id$="spnProjectIdentifierAndName"]`
**Value:** `620-00152-01 KS-152 2027 Lone Tree, CO - Ridgegate`

**ASMX endpoint for associated projects:**
```
/ws/Projects/AssociatedProjects.asmx/GetAssociatedProjectsMarkup
Parameters: projectID=131317, enterpriseID=8252
```

### 2. Address & Identifiers

| Field | Selector | Value |
|---|---|---|
| Address | `div[id$="spnAddress"]` | 12600 Ridgegate Pkwy, Lone Tree, CO 80134, UNITED STATES |
| Google Maps | `div[id$="spnMapLink"] a[href]` | `http://maps.google.com/maps?f=q&hl=en&q=12600+Ridgegate+Pkwy+Lone+Tree...` |
| Identifiers | `div[id$="spnIdentifiers"]` | Kroger - 620-00152-01 |
| Project Description | `div[id$="spnDescription"]` | 2027 New Store |
| Project Status | `span[id$="spnProjectStatus"]` | Under Construction |

### 3. General Comments (58 total: 1 fixed + 57 variable)

**Container:** `div.GENERALREPORTCOMMENTS`

**Fixed comment (latest):** In the first visible table after `.HEADER`

| Date | Author | Initials | Comment | Comment ID |
|---|---|---|---|---|
| 04/06/2026 | Evyn Sprenkel | es | Starting Footers | 654557 |

**Variable comments (older 57):** In `div[id$="divVariableComments"]` (hidden by default, toggled by expand button)

Spans from 04/06/2026 back to 12/15/2021 — **over 4 years of weekly status updates**. Multiple authors:
- **Evyn Sprenkel (es)** — current PM, comments from 01/02/2025 to 04/06/2026
- **Pat Devereaux (pd)** — previous PM, comments from 07/12/2024 to 12/30/2024
- **Jimmy Creamer (jc)** — earlier PM, comments from 01/05/2023 to 08/11/2023
- **Charles Boehm (cb)** — earliest, comments from 12/15/2021 to 02/23/2023

Comment content reveals the full project narrative: Cap-X approval (12/2021), SDPA signing (01/2023), hold period (08/2023), lease negotiations (2024), transfer to new PM (01/2025), design development (2025), CD reviews, bidding, permits, and construction start (2026).

**DOM selectors per comment row:**
- Date: `span[id*="date"]` → `.attr('title')` for full date (MM/DD/YYYY)
- Author: `span[id*="author"]` → `.attr('title')` for full name, `.text()` for initials
- Comment: `span[id*="comment"]` → `.text()`
- Comment ID: extracted from `onclick` of edit button → first param of `JS_WP_RL305342222({commentId},8252,...)`
- Restricted flag: `span[id*="restricted"]` → check class for `UNRESTRICTED` vs `RESTRICTED`

### 4. Site Building Notes

Empty for this project: "There are no site building notes for Kroger."

### 5. Project Image

Default Kroger branding image. URL: `/files/blobname!kroger\Branding\project_photo.jpg|...|idcurrententerprise!8252/project_photo.jpg`

### 6. Job Site Contact

All fields show "(None)" for this project: Job Site Contact, Job Site Phone, Job Site Email.

### 7. Project Team Contacts (Summary)

**Container:** table with `td[id$="tdEnterprise"]` containing "Project Team Contacts - Kroger"

17 contacts listed with role, name, phone, email:

| Role | Name | Phone | Email |
|---|---|---|---|
| FE Project Manager | Sprenkel, Evyn | 303-778-2017 | evyn.sprenkel@kingsoopers.com |
| Architectural Project Manager | Jansen, Jared | (None) | jared.jansen@effecterra.com |
| Architectural Project Manager | Atherton, Mark | (None) | mark.atherton@effecterra.com |
| Architectural Project Manager | Burton, Louis | (480) 292-8034 | lburton@telgian.com |
| Architectural Project Manager | Gleason, Chad | 303-759-5777 | chadg@Naosdg.com |
| Architectural Project Manager | Anderson, Jen | 303-759-5777 | jena@Naosdg.com |
| Architectural Project Manager | Heck, John | 480.241.4870 | John.Heck@schaefer-inc.com |
| Architectural Project Manager | Daley, Shawn M. | (513) 699-2583 | shawn.daley@schaefer-inc.com |
| Architectural Project Manager | Peul, Eric | 513-699-2579 | eric.peul@schaefer-inc.com |
| Architectural Project Manager | Dowodzenka, Shane | 517-376-1963 | shane.dowodzenka@effecterra.com |
| Architectural Project Manager | Greenough, Ryan | (None) | ryan.greenough@effecterra.com |
| GC Project Manager | Carlson, Matt | 303-776-1449 | mcarlson@markyoungconstruction.com |
| GC Project Manager | Ingham, Derek | 303-776-1449 | dingham@markyoungconstruction.com |
| GC Project Manager | Sander, Travis | (None) | tsander@markyoungconstruction.com |
| GC Project Manager | Martinez, Joel | (None) | jmartinez@markyoungconstruction.com |
| GC Project Manager | Vandrew, Jake | 303-776-1449 | jvandrew@markyoungconstruction.com |
| GC Project Manager | Whittle, Christopher | 303-710-9165 | cwhittle@markyoungconstruction.com |

**Selectors per row:**
- `td[id$="tdJob"]` → role
- `td[id$="tdContact"]` → name
- `td[id$="tdPhone"]` → phone
- `td[id$="tdEmail"] a` → email (from mailto href or text)

**Firms identified from email domains:**
- Kroger/King Soopers (kingsoopers.com) — FE PM
- Effecterra (effecterra.com) — Architecture
- NAOS Design Group (Naosdg.com) — Architecture
- Schaefer (schaefer-inc.com) — Architecture/Engineering
- Telgian (telgian.com) — Fire protection
- Mark Young Construction (markyoungconstruction.com) — GC

### 8. Photo Libraries

**Container:** `select#cboPhotoLibrary`

9 photo libraries spanning Feb–Apr 2026:

| Date | Name | Photo Count |
|---|---|---|
| 04/10/2026 | KS#152 - Photos Week of 4.6.26 | 29 |
| 04/06/2026 | KS#152 - Photos Week of 3.30.26 | 29 |
| 03/30/2026 | Photos Week of 3.23.26 | 38 |
| 03/23/2026 | KS#152 - Photos Week of 3.16.26 | 13 |
| 03/23/2026 | KS#152 - Photos Week of 3.9.26 | 27 |
| 03/23/2026 | KS#152 - Photos Week of 3.2.26 | 11 |
| 03/03/2026 | KS#152 - Photos Week of 2.23.26 | 28 |
| 03/03/2026 | KS#152 - Photos Week of 2.16.26 | 14 |
| 02/06/2026 | KS#152 - Pre-Construction Photos | 14 |

**ASMX endpoint for photos:**
```
/ws/Projects/PhotoLibrary.asmx/GetMiniPhotoLibraryMarkup
Parameters: idProject=131317, photoLibraryID={id from select}
```
```
/ws/Projects/PhotoLibrary.asmx/GetBlobSrc
Parameters: photoLibraryImageID={imageId}
```

### 9. Upcoming Milestones

7 upcoming milestones:

| Date | Milestone | Phase |
|---|---|---|
| 04/24/2026 | Possession Received | Real Estate |
| 06/07/2026 | Fixtures Ordered | Construction |
| 06/11/2026 | Roof Completed | Construction |
| 06/29/2026 | Permanent Utilities Completed | Construction |
| 07/13/2026 | Colored Slab Poured | Construction |
| 07/20/2026 | Building Shell Completed (in the dry) | Construction |
| 12/07/2026 | Fixturing Started | Fixturing |

**Selectors:**
- Date: `a[id*="aStatusTopicDate"]` → `.attr('title')`
- Milestone: `td[id*="tdStatusTopicData"]` → `.text()`
- Phase: `td[id*="tdStatusTopicAbbr"]` → `.attr('title')`

### 10. Reports (Downloadable)

6 report links:

| Report | Format | URL Pattern |
|---|---|---|
| Change Order Log | PDF | `/reports/idProject!131317|reportname!CO_COPLog/CO_COPLog|...|format!2|.../CO_COPLog.pdf` |
| Change Order Log (Excel) | XLSX | `format!3` → `.xlsx` |
| Project Directory Report | PDF | `reportname!ProjectDirectory/ProjectDirectory` → `format!2` |
| Project Directory (Excel) | XLSX | `format!3` |
| Project Update Report | PDF | `reportname!ProjectUpdateReport/sPUR` → `format!2` |
| Project Notification History | XLSX | `reportname!DocumentActivity/NotificationHistory` → `format!11` |

**Format codes:** `format!2` = PDF, `format!3` = XLSX, `format!11` = XLSX

### 11. Project Documents (lazy-loaded)

Documents load asynchronously via ASMX. Parameters from JS:
```
g_docs_sWSPrefix = '/ws/Documents/Documents.asmx/'
g_docs_sWSType = 'Project'
g_docs_sWSParameters = 'enterpriseID=8252&projectID=131317&maxItemCount=48&includeFolderPath=false&enterpriseContextID=8252'
```

File URL template:
```
/files/idProject!131317|forcesave!1|iditem!{fileId}|itemtype!22|idcurrententerprise!8252/filename
```

---

## ASMX Endpoints Discovered

| Endpoint | Purpose |
|---|---|
| `/ws/Projects/AssociatedProjects.asmx/GetAssociatedProjectsMarkup` | Get related projects |
| `/ws/Projects/PhotoLibrary.asmx/GetMiniPhotoLibraryMarkup` | Get photo library contents |
| `/ws/Projects/PhotoLibrary.asmx/GetBlobSrc` | Get individual photo blob |
| `/ws/Documents/Documents.asmx/` + various methods | Project document CRUD |

---

## What's Useful Here

### High Value
1. **General Comments** — Full project history in weekly status updates. 58 comments spanning 4+ years with multiple PMs. This is the project narrative — invaluable for AI-powered summaries, trend analysis, and handoff context.
2. **Address & Identifiers** — Physical location, project number, description, current status.
3. **Team Contacts** — Full directory with roles, names, phones, emails. Identifies the GC, architect firms, and all consultants.
4. **Upcoming Milestones** — Next 7 milestones with dates and phases. Ready-made for dashboard display.
5. **Report Download Links** — Change Order Log, Project Directory, PUR, Notification History — all downloadable as PDF/XLSX.
6. **Project Status** — "Under Construction" extracted from a single selector.

### Medium Value
7. **Photo Libraries** — Weekly construction progress photos with counts and dates. Could display thumbnails or track progress visually.
8. **Project Navigation structure** — The tab sub-menus reveal all available modules and their URLs. The Schedule sub-menu specifically lists all 8 phases with their `bn` IDs.
9. **Associated Projects ASMX** — Can find related projects (e.g., other phases on the same site).
10. **Comment authors and dates** — Track PM handoffs, identify who was responsible when.

### Low Value
11. **Site Building Notes** — Empty for this project.
12. **Job Site Contact** — All "(None)" for this project.
13. **Project Image** — Default branding image, not project-specific.

---

## Relationships to Other Pages

| From this page... | To... | How |
|---|---|---|
| Schedule tab | `Scheduling.sf?idProject=131317` | Full schedule with all milestones (Page 4) |
| Team tab | `ProjectDirectoryHome2.sf?idProject=131317` | Full team directory by category |
| $ > Budget | `BudgetVersionView.sf?idProject=131317&bn=256` | Budget data |
| $ > Contracts | `ContractorContract2Main.sf?idProject=131317` | Contract documents |
| $ > Bidding | `BidPackageList.sf?idProject=131317` | Bid packages |
| Requests > ASI | `Asi2Main.sf?idProject=131317` | Architect's Supplemental Instructions |
| Requests > PR | `PR2Main.sf?idProject=131317` | Proposal Requests |
| Requests > RFI | `Rfi2Main.sf?idProject=131317` | Requests for Information |
| Tasks | `ProjectTasks.sf?idProject=131317` | Project tasks |
| Files | `ProjectDocuments.sf?idProject=131317` | Project documents (text + drawings) |
| Photos | `ProjectPhotos.sf?idProject=131317` | Photo libraries |
| Report links | `/reports/...` | Downloadable PDF/XLSX reports |
| Overview > Classification | `SiteProjClassView.sf?idProject=131317` | Project classification data |
| Overview > Design Attributes | `SiteBuildingDesignView.sf?idProject=131317` | Building design attributes |

---

## Notes

- This is the **most data-rich page** in SiteFolio. A single fetch gives us address, status, team contacts, comment history, upcoming milestones, report links, and photo library metadata.
- Comments are split into "fixed" (latest, always visible) and "variable" (older, hidden behind expand toggle). The parser must handle both sections.
- The comment history shows **PM handoffs** — the project transferred from cb → jc → pd → es over 4 years. This is trackable from author changes in the comment timeline.
- Team contacts on this page are a **summary** — the full Team/Directory page (`ProjectDirectoryHome2.sf`) has more detail including company/business associations.
- The Schedule sub-menu reveals **phase-specific `bn` IDs** (789801–789809) which can be used to fetch schedule data filtered by phase.
- Photo library data loads via ASMX — the `select` dropdown contains library IDs and metadata, but actual images require a second ASMX call.
- The `$` tab confirms three financial modules exist: Budget, Contracts, Bidding. These are separate pages worth analyzing.
- Report URLs contain the project ID and enterprise ID — they can be constructed programmatically for any project.

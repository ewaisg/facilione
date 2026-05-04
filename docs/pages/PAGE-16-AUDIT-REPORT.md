# SiteFolio Data Source Analysis — Report 16: Projects Audit Report

**Location:** REGIONS > King Soopers/City Market > LINKS > Reports > "Projects Audit Report on Use of Web Pages"
**Type:** Downloadable report (direct URL, no page scraping)
**Scope:** All projects (active + completed) in the King Soopers/City Market division
**Report Name:** `Kroger/sf_AuditReport`

---

## Download URL

```
https://www.sitefolio.net/reports/reportname!Kroger/sf_AuditReport|idcurrententerprise!8252|format!3|parameters!Region^3$ReportName^sf_AuditReport$_idCurrentMember^0/sf_AuditReport.xls
```

Format: XLS extension but actually XLSX internally. Parseable with openpyxl.
Authentication: Requires SiteFolio session cookies.

---

## XLSX Structure

- **File:** Single sheet named `sf_AuditReport`
- **Size:** 240 rows x 26 columns
- **229 projects** (rows 11–239)
- **Header rows:** Row 9 (category groupings), Row 10 (column names)
- Row 8: "King Soopers/City Market" label

---

## Column Map

### Category Groupings (Row 9)

| Columns | Category |
|---|---|
| C3–C6 | OVERVIEW |
| C7 | STATUS |
| C8 | SCHEDULE |
| C9–C12 | TEAM |
| C13 | $ |
| C14–C18 | TEXT FILES |
| C19–C24 | DRAWINGS |
| C25 | PHOTOS |
| C26 | NOTES |

### Full Column Definitions (Row 10)

| Column | Field | Data Type | Notes |
|---|---|---|---|
| C1 | PM | Text | PM initials (e.g., "GE", "ES", "CD", "JC") |
| C2 | Project Type | Text | "Minor Capital", "WW" (WIW), "Minor Remodel", "New Store", "Fuel", "Expansion" |
| C3 | Store # | Text | Project number (e.g., "620-00012-03") |
| C4 | Date of General Comment (where req'd) | Datetime | Last comment date on Overview page |
| C5 | Photo On Overview (Y or N) | Text | Whether project has a photo on Overview |
| C6 | Is there an F1? (Y or N) | Text | Whether F1 fixture plan exists |
| C7 | Status of Project Indicated | Text | Current phase (e.g., "Bidding", "Under Construction", "Completed") |
| C8 | Last "Actual" date entered (item date) | Text | Last actual milestone date + milestone name |
| C9 | Kroger Cont. | Text | "X" if Kroger contacts populated in Team |
| C10 | Arch. / Eng. | Text | "X" if architect/engineering contacts populated |
| C11 | Testing & Insp. | Text | "X" if testing/inspection contacts populated |
| C12 | GC Bidders and / or GC | Text | "X" if GC/bidder contacts populated |
| C13 | Conts Contract* | Text | "X" if contracts populated in $ module |
| C14 | ALL Direct Buy Letters sub'd | Text | "X" if direct buy letters uploaded |
| C15 | Bidding Docs. | Text | "X" if bidding documents uploaded |
| C16 | Cost Sumr. | Text | "X" if cost summary uploaded |
| C17 | GC Const Docs | Text | "X" if GC construction docs uploaded |
| C18 | Two Week Look Ahead | Text | "X" if two-week look ahead uploaded |
| C19 | Prelim. Doc. | Text | "X" if preliminary drawings uploaded |
| C20 | Refr Dwgs | Text | "X" if refrigeration drawings uploaded |
| C21 | Fuel Center Plans | Text | "X" if fuel center plans uploaded |
| C22 | 65% Review set | Text | "X" if 65% review drawing set uploaded |
| C23 | 100% Review Set | Text | "X" if 100% review drawing set uploaded |
| C24 | Bid set | Text | "X" if bid drawing set uploaded |
| C25 | Date of Latest Photos | Datetime | Timestamp of most recent photo upload |
| C26 | *Contract Secured/Access Enabled | Text | Note about contract status |

---

## Data Characteristics

### Project Types Observed

| Type Code | Full Name | Count (approx) |
|---|---|---|
| Minor Capital | Minor Capital | ~150+ (majority) |
| WW | Within-the-Walls Remodel | ~20 |
| Minor Remodel | Minor Remodel | ~15 |
| New Store | New Store | ~12 |
| Fuel | Fuel Center | ~10 |
| Expansion | Expansion Remodel | ~5 |

### Project Phases Observed

Conceptual, Due Diligence / Estimating, Final Planning, Construction Documents, Construction Planning, Bidding, Under Construction, Fixturing, Punchlist, Open, Completed

### PM Initials Observed

JC, NS, ES, CD, TM, TR, GE, KM, ZB, LG, BY, PD, NM (and some blank — unassigned projects)

### Completeness Check Fields

The "X" columns (C9–C24) form a **completeness scorecard** per project. A fully populated project would have "X" in all applicable columns. Missing "X" values indicate data gaps in SiteFolio.

Example row (620-00012-03, Gheiath's WIW project):
- PM: GE
- Type: WW
- Status: Bidding
- Last Comment: 4/13/2026
- Last Actual: "Direct Buy Items (incl. Refrigeration) Ordered-04/07/26"
- Team: Kroger=X, Arch=X
- Files: (mostly empty — bidding docs not yet uploaded to expected folders)
- Photos: 3/26/2026

---

## Parsing Strategy

1. **Skip rows 1–10** (headers and labels).
2. **Read rows 11–end** as project data.
3. **C3 (Store #)** is the primary key — filter for "620-" pattern.
4. **C1 (PM)** may be blank for some projects (unassigned or historical).
5. **C4 (Comment Date)** and **C25 (Photo Date)** are datetime objects.
6. **C8 (Last Actual)** is a text string combining milestone name and date (e.g., "Construction / Fixturing Completed-10/18/24"). Parse by splitting on "-" to get milestone and date.
7. **C9–C24** are either "X" (populated) or blank (missing). Count X's per project for a completeness score.
8. **C7 (Status)** is the current project phase — use this for filtering/grouping.

---

## What This Report Provides

**The largest project list available** — 229 projects spanning active and completed work. Combined with the Construction Status Report (Page 15), this gives us:

| Use Case | Data Source |
|---|---|
| Master project list (all 229) | This report (Page 16) |
| Active project details + milestones | Construction Status Report (Page 15) |
| Data completeness audit per project | This report (Page 16) |
| PM workload distribution | This report (C1 + C3 + C7) |
| SiteFolio compliance tracking | This report (C9–C24 check marks) |

**App features this enables:**
- Dashboard widget: "X projects missing team contacts" / "Y projects with no photos"
- Data completeness heatmap by PM or by project type
- PM workload table: projects per PM, by phase
- Master project dropdown/search (229 project numbers)
- Historical project lookup (completed projects still in this report)

---

## Notes

- The `_idCurrentMember^0` parameter means "all members." Could potentially filter by member ID.
- `Region^3` = King Soopers/City Market division.
- Some projects have no PM assigned (C1 blank) — these are likely very old or placeholder projects.
- The "X" check marks represent SiteFolio data presence, not data quality. A project could have "X" for contacts but the contact list could be incomplete.
- The report includes completed projects, which is valuable for historical analysis but means the 229 count includes closed work.
- File downloads as `.xls` but is actually XLSX format internally — use openpyxl (not xlrd) to parse.

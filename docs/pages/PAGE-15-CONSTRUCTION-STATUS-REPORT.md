# SiteFolio Data Source Analysis — Report 15: Division Construction Status Report

**Location:** REGIONS > King Soopers/City Market > LINKS > Reports > "Division Construction Status Report"
**Type:** Downloadable report (direct URL, no page scraping)
**Scope:** All active projects in the King Soopers/City Market division
**Report Name:** `Kroger/ConstStatus_Divisional`

---

## Download URLs

**PDF version (format!2):**
```
https://www.sitefolio.net/RunReport.aspx?parameters=reportname!Kroger/ConstStatus_Divisional|idcurrententerprise!8252|format!2|Parameters!Region^Midcentral$ReportName^MidCentral_ConstStatus$_idCurrentMember^0$BusinessUnit^3
```

**XLSX version (format!3) — preferred for parsing:**
```
https://www.sitefolio.net/RunReport.aspx?parameters=reportname!Kroger/ConstStatus_Divisional|idcurrententerprise!8252|format!3|Parameters!Region^Midcentral$ReportName^MidCentral_ConstStatus$_idCurrentMember^0$BusinessUnit^3
```

Authentication: Requires SiteFolio session cookies.

---

## XLSX Structure

- **File:** Single sheet named `ConstStatus_Divisional`
- **Size:** 375 rows x 112 columns
- **58 active projects** across 4 sections (project types)
- Each project spans **5–6 rows** (project #, city/location, revision data, GC name, status comment on separate rows)

---

## Section 1: New Store Sequence & Cost

**Section header row:** "King Soopers/City Market New Store Sequence & Cost"
**Header row:** Row 5
**Projects found:** ~12 (spanning 2026–2028 opening years)

### Column Map

| Column | Field |
|---|---|
| C1 | Store / Project # (e.g., "620-00142-01") |
| C3 | PM initials (e.g., "TR", "KM", "ES") |
| C6 | Size in sqft (e.g., 135520.0) |
| C10 | New Store Type ("New Store-Net New", "New Store-Relocation") |
| C13 | Project Identified (date) |
| C17 | Preliminary Site Plan Received (date) |
| C21 | Due Diligence Started (date) |
| C24 | Preliminary Fixture Plan Requested (date) |
| C28 | Project Approval Received (date) |
| C32 | Final Fixture Plan Received — Original Date (date) |
| C34 | Env DD Completed (date) |
| C38 | Architect Authorized for Construction Documents (date) |
| C42 | Capital Appropriation Approval Received (date) |
| C46 | Property Closed / Lease Signed (date) |
| C50 | Construction Documents Submitted for Permits (date) |
| C53 | Bids Solicited (date) |
| C57 | Permits Received (date) |
| C59 | Sitework / Demolition Started (date) |
| C62 | Building Construction / Footers Started (date) |
| C67 | Fixtures Ordered (date) |
| C69 | Roof Completed (date) |
| C72 | Colored Slab Poured (date) |
| C75 | Sitework Completed (date) |
| C79 | Temporary Certificate of Occupancy Received (date) |
| C82 | Fixturing Started (date) |
| C86 | Final Certificate of Occupancy Received (Actual) (date) |
| C90 | Grand Opening (date) |
| C94 | R.E. 4th Quarter Progress Report Opening (date) |
| C98 | New Décor (e.g., "Fresh For Everyone", "Artisan") |
| C101 | C.A. Numbers (multi-line: L/S/B/F/E) |
| C105 | C.A. Amounts (multi-line: L/S/B/F/E with dollar values) |

**Weeks from Opening reference (Row 9):** 90, 86, 82, 70, 66, 64, 60, 55, 48, 45, 44, 39, 38, 34, 28, 24, 20, 12, 11, 10, 5, 0

### Multi-Row Layout per Project

| Row Offset | Content |
|---|---|
| +0 | Project #, PM, Size, Type, milestone dates (main data row) |
| +1 | Final Fixture Plan Received — Date of Last Revision |
| +2 | City/Location, Due Diligence Completed date |
| +3 | # Revisions count, GC name (at Bids Solicited column), Bids Received date |
| +4 | Status comment: `{Phase} // {comment} // {CA notes}` |
| +5 | (sometimes blank spacer) |

---

## Section 2: Expansion Remodel Sequence & Cost

**Section header:** "King Soopers/City Market Expansion Remodel Sequence & Cost"
**Header row:** Row 112
**Projects found:** 1 (620-00440-11, Montrose)

### Column Map

| Column | Field |
|---|---|
| C1 | Store / Project # |
| C5 | PM initials |
| C7 | Existing sqft (row +0), Expansion sqft (row +1), Total sqft (row +3) |
| C12 | Project Identified |
| C15 | Site Plan & Scope Info Received |
| C18 | Preliminary Fixture Plan Requested |
| C22 | Preliminary Estimate Completed |
| C25 | Project Approval Received |
| C29 | Original Date / Date of Last Revision / # Revisions (rows +0/+1/+3) |
| C33 | Env DD Completed |
| C37 | Refrigeration Plans Received |
| C40 | Architect Authorized for Construction Documents |
| C44 | Capital Appropriation Approval Received |
| C47 | Architectural Consultant (e.g., "Naos Design Group, LLC") |
| C51 | Property Closed / Lease Signed |
| C55 | Bids Solicited / Bids Received / GC name (rows +0/+1/+3) |
| C60 | Construction Documents Submitted for Permits |
| C64 | Permits Received |
| C66 | Sitework / Demolition Started |
| C70 | Fixtures Ordered |
| C74 | Building Construction / Footers Started |
| C77 | Expansion Opened |
| C81 | Exterior Construction Complete |
| C85 | Project Completed |
| C89 | Grand Opening |
| C93 | R.E. 4th Quarter Progress Report Opening |
| C96 | Existing Décor (row +0), New Décor (row +4) |
| C100 | C.A. Numbers (multi-line) |
| C104 | C.A. Amounts (multi-line) |

---

## Section 3: Interior Remodel Sequence & Cost

**Section header:** "King Soopers/City Market Interior Remodel Sequence & Cost"
**Header row:** Row 129
**Projects found:** ~35 (largest section — includes WIW Remodel, Minor Remodel)

### Column Map

| Column | Field |
|---|---|
| C1 | Store / Project # |
| C4 | PM initials |
| C9 | Size in sqft |
| C14 | Interior Remodel Type ("Within-the-Walls Remodel", "Minor Remodel") |
| C19 | Project Identified |
| C23 | Remodel Survey & Scope Info Received |
| C27 | Preliminary Fixture Plan Requested |
| C30 | Original Date / Date of Last Revision / # Revisions (rows +0/+1/+3) |
| C36 | Env DD Completed / Due Diligence Completed (rows +0/+3) |
| C39 | Final Estimate Completed |
| C43 | Refrigeration Plans Received |
| C48 | Architectural Consultant |
| C52 | Project Approval Received / Architect Authorized for CDs (rows +0/sub-row) |
| C56 | Capital Appropriation Approval Received |
| C61 | Property Closed / Lease Signed |
| C65 | Construction Documents Submitted |
| C68 | Bids Solicited / Bids Received / GC name (rows +0/+1/+3) |
| C73 | Fixtures Ordered |
| C76 | Permits Received |
| C80 | Construction Started |
| C84 | Exterior Completed |
| C87 | Project Completed |
| C91 | Grand Opening |
| C95 | R.E. 4th Quarter Progress Report Opening |
| C99 | Existing Décor (row +0), New Décor (row +4) |
| C103 | C.A. Amounts (multi-line) |

---

## Section 4: Fuel Sequence & Cost

**Section header:** "King Soopers/City Market Fuel Sequence & Cost"
**Header row:** Row 313
**Projects found:** ~13

### Column Map

| Column | Field |
|---|---|
| C1 | Store / Project # |
| C8 | PM initials |
| C11 | FC Type ("New Fuel Center", "Fuel Relocation") |
| C16 | Project Identified |
| C20 | Site Conceptually Reviewed with SPG |
| C26 | Market Research Received |
| C31 | Preliminary Site Plan Approved by SPG |
| C35 | Civil Engineering Consultant (e.g., "Galloway & Company, Inc.") |
| C41 | Env DD Completed |
| C45 | SPG Approval Received |
| C49 | Capital Appropriation Submitted |
| C54 | Capital Appropriation Approval Received |
| C58 | Property Closed / Lease Signed |
| C63 | Construction Documents Submitted for Permits |
| C68 | Tanks / Canopy / Equipment Ordered |
| C71 | Bids Received (row 314 spillover) |
| C78 | Permits Received |
| C83 | Sitework / Demolition Started |
| C88 | Project Complete |
| C92 | Grand Opening |
| C97 | R.E. 4th Quarter Progress Report Opening |
| C102 | C.A. Numbers (row 314 spillover) |

**Fuel-specific fields:** FC Type, Dispenser Layout (in multi-row data), SPG review milestones, Civil Engineering Consultant, Tanks/Canopy/Equipment Ordered.

---

## Parsing Strategy

1. **Identify sections** by scanning for rows containing "King Soopers/City Market" in C1.
2. **Identify project rows** by scanning for "620-" pattern in C1.
3. **For each project**, read 5–6 consecutive rows to collect all data:
   - Row +0: Main data (project #, PM, size, type, most milestone dates)
   - Row +1: City/location, revision date, secondary dates
   - Row +2: Additional dates (varies by section)
   - Row +3: Tier label (for remodels), revision count, GC name
   - Row +4: Décor info, status comment
4. **Column mappings differ by section** — the parser must detect which section it's in and apply the correct column map.
5. **Status comment format:** `{Phase} // {detail comment} // {CA/budget notes}`
6. **CA Numbers and Amounts** are multi-line strings with `L:`, `S:`, `B:`, `F:`, `E:` prefixes (Land, Site, Building, Fixturing, Equipment).
7. **Date formats:** Mix of `datetime` objects and string dates (`MM/DD/YYYY`). Parser must handle both.

---

## What This Report Provides

This is the **single most valuable bulk data source** for the app. One download gives:

- Every active project number, PM, size, type, and phase
- Full milestone schedule (15–22 dates per project, type-specific)
- GC assignments
- Architectural consultant names
- CA numbers and dollar amounts (Land/Site/Building/Fixturing/Equipment)
- Décor type (existing and new)
- Latest status comment with phase and narrative
- Opening year grouping

**This eliminates the need to scrape individual project pages for portfolio-level data.** Individual page scraping (P1–P14) is only needed for drill-down detail (comments history, RFIs, bid SOV analysis, document browsing, team contact details).

---

## Notes

- Report is generated live — always current as of download time.
- The `_idCurrentMember^0` parameter means "all members" (not filtered to a specific PM). Changing to a specific member ID may filter to that PM's projects only.
- `BusinessUnit^3` = King Soopers/City Market. Other divisions would have different values.
- The XLSX has merged cells and multi-row project layouts — requires careful parsing, not simple row-by-row reading.
- Year groupings (2026, 2027, 2028) appear as standalone rows between project blocks.

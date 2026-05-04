# SiteFolio Page Analysis — Page 13: OVERVIEW > Classification

**URL:** `/Kroger/SiteProjClassView.sf?idProject=177956&bn=8253&idfilter=8252`
**Page Title:** Site & Project Classification
**Type:** Project and site metadata with Kroger-custom classification fields
**Project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956)

---

## What This Page Is

The **Classification** page is an OVERVIEW sub-page containing structured metadata about the physical site and the project. It's **server-rendered** with all data in the initial HTML — no AJAX loading. The page is organized into 6 web-part sections in a 2-column layout. This is the richest source of project classification metadata in SiteFolio.

Edit URL: `/Kroger/SiteProjClassEdit.sf?idProject=177956&bn=8253&idfilter=8252`

---

## Section 1: Site

| Field | Value | Selector |
|---|---|---|
| Site ID & Name | 620-00142 Louisville, CO - W Dillon Rd | `#U_WP830329326_spnSiteIDandName` |
| Address | 1171 W Dillon Rd, Louisville, CO 80027, UNITED STATES | `#U_WP830329326_spnAddress` |

---

## Section 2: Project

| Field | Value | Selector |
|---|---|---|
| Project ID | 620-00142-01 | `#U_WP349251975_spnProjectID` |
| Project Name | Louisville, CO - W Dillon Rd | `#U_WP349251975_spnProjectName` |
| Description | 2026 New Store | `#U_WP349251975_spnProjectDescription` |

---

## Section 3: Site Owner Classification

Standard fields:

| Field | Value | Selector Pattern |
|---|---|---|
| Facility Number | 620-00142 | `td[id$="tdSiteIdentifier1"]` |
| DLT Number | 013186 | `td[id$="tdSiteIdentifier2"]` |
| Facility Open Date | (None) | `td[id$="tdOpeningDate"]` |
| Business Unit (KMAnm) | King Soopers/City Market | `td[id$="tdRegion"]` |
| Open | No | `td[id$="tdOperatingStatus"]` |

Kroger-custom fields:

| Field | Value |
|---|---|
| Year of Last Improvement | (empty) |
| Facility Format | (empty) |
| Gas Open Date | (empty) |
| Operating Zone / District | (empty) |
| Kroger Store | Yes |
| Interior Décor | Artisan |
| Gas Station | Yes |
| Ownership Code Text | Ground Leased |
| Store Cluster Existing | Upper Mainstream |

---

## Section 4: Project Owner Classification

Standard fields:

| Field | Value | Selector Pattern |
|---|---|---|
| Project Number | 620-00142-01 | `td[id$="tdProjectIdentifier"]` |
| Owner | Kroger | `td[id$="tdOwnerName"]` |
| Project Status | Fixturing | `td[id$="tdProjectStatus"]` |
| Project Type | New Store-Net New | `td[id$="tdProjectType"]` |
| Building Type | MarketPlace | `td[id$="tdBuildingType"]` |
| Real Estate | Kroger-owned | `td[id$="tdRealEstateType"]` |
| Report Hold | No | `td[id$="tdReportHold"]` |
| site\|folio Status | Active | `td[id$="tdSiteFolioStatus"]` |

Kroger-custom fields (Capital Appropriation data):

| Field | Value |
|---|---|
| Budget Year | 2026 |
| Active Capital Appropriation Number | 2030724 |
| Manpower Charges ($) | $175,000 |
| Land CA Number | 2036973 |
| Land CA Amount ($) | $22,600,000 |
| Building CA Number | 2030724 |
| Building CA Amount ($) | $23,645,284 |
| Equipment Pre-Order CA Number | 2030724 |
| Equipment Pre-Order CA Amount ($) | $3,906,816 |
| Due Diligence Pre-Con CA Number | 2028870 |
| Capital Approval Status | Approved |
| FE Region | Mid-Central |
| New Décor | Fresh For Everyone |
| Legal Entity | Dillon Companies, Inc. |
| Environmental Due Diligence Completed | 01/16/2026 |
| eSource Budget Number ($) | $0.00 |

---

## Section 5: Site Contact / Job Site Contact

Both sections are empty (`(None)`) for this project. Fields available: Site Contact Name/Phone/Fax/Email/URL and Job Site Contact/Phone/Email.

---

## Section 6: Project Notes

One note present:

| Date | Author | Text |
|---|---|---|
| 04/21/2025 | cb (Boehm, Charles) | Pre-Con CA 2028870 $250K division bumped to $750K on 4-21-25 |

Notes have edit/delete buttons with note ID 72175 via `ProjectNotes` property page dialog.

---

## Key Data for App Development

This page contains **critical project metadata** not available anywhere else:

1. **Capital Appropriation (CA) Numbers** — Land, Building, Fixturing/WIW, Fuel, Equipment Pre-Order, Due Diligence. These are the Oracle/KAM system identifiers for budget tracking.
2. **Project Type** — "New Store-Net New" confirms the project classification.
3. **Building Type** — "MarketPlace" is the store format.
4. **Project Status** — "Fixturing" shows current lifecycle phase.
5. **Real Estate Type** — "Kroger-owned" vs. leased.
6. **Legal Entity** — "Dillon Companies, Inc." (the King Soopers/City Market parent).
7. **Budget Year** — 2026.
8. **FE Region** — "Mid-Central" (Kroger Facilities Engineering region).

---

## DOM Selectors

Standard fields use `td[id$="td{FieldName}"]` pattern. Custom fields use `div[id$="BusinessCustomLabel{N}_v"]` for text and `div[id$="BusinessCustomDropDown{N}_v"]` for dropdowns, where N is a sequential number.

---

## Notes

- **Server-rendered**, no ASMX calls needed — all data in initial HTML.
- No new ASMX endpoints discovered.
- The custom fields structure (`BusinessCustomLabel`, `BusinessCustomDropDown`, `BusinessCustomDate`, `BusinessCustomCurrencyAmount`, `BusinessCustomMultiSelect`) reveals SiteFolio's configurable field system — Kroger has defined ~30+ custom fields across site and project classification.
- The CA numbers on this page are the bridge between SiteFolio and Oracle/KAM — essential for any integration work.
- The `bn=8253` value is shared between Classification and Photos (Existing Conditions) — these are different page types that happen to use the same bn value.

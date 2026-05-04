# SiteFolio Page Analysis — Page 9: $ > Budget

**URL:** `/Kroger/BudgetVersionView.sf?idProject=177956&bn=256&idfilter=8252`
**Page Title:** site|folio (generic — no specific title set)
**Type:** Project budget with versioned estimates, hierarchical line items, and export/report tools
**Project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956)

---

## What This Page Is

This is the **Budget** page under the `$` tab. It's the most data-rich page analyzed so far — a complete project cost estimate broken down by CSI division, with versioned budgets, multiple views, comparison tools, and export capabilities. Unlike the AJAX-loaded pages (Directory, Requests), this page is **fully server-rendered** — all budget line items are in the initial HTML.

---

## Page Architecture: 3 Sub-Pages

The Budget module has its own internal navigation with 3 sub-pages:

| Sub-page | URL Pattern | Description |
|---|---|---|
| **Budget** (current) | `BudgetVersionView.sf` | Line-item budget by version |
| Budget to Actuals | `BudgetActualsView.sf` | Budget vs. actual spend comparison |
| Reports | (popup) | Export and report generation |

---

## Budget Version System

The page reveals a **multi-version budget system** with staged workflow:

### Version Stages (from versions popup)
| Stage | Color | Versions Found |
|---|---|---|
| **Publish** | — | (no version) |
| **Reconcile** | — | (no version) |
| **Commitment** | Green (#6aa84f) | v.6 — $23,645,284 (09/17/2025, tcr) |
| **Under Development** | Orange (#f6b26b) | v.5 — $23,645,284 (07/19/2025, rmm), v.4 — $23,561,923, v.3 — $23,721,309, v.2 — $22,096,684, v.1 — $22,085,184 |
| **Import** | — | (no version) |

### Version Data per Entry
Each version row contains: `sfBudgetProjectID` (e.g., 110045, 108354), total amount, version number, description, date, author initials, and a "View Sources" link for comparison.

### Budget Status IDs (from `SaveButtonManager._stagePerms`)
```javascript
_stagePerms: {
    '_4': { id: 4, permissions: 3, exclusionary: true },   // Publish
    '_3': { id: 3, permissions: 7, exclusionary: false },  // Reconcile
    '_2': { id: 2, permissions: 3, exclusionary: true },   // Commitment (current)
    '_1': { id: 1, permissions: 7, exclusionary: false },  // Under Development
    '_53': { id: 53, permissions: 7, exclusionary: false }, // (unknown stage)
    '_0': 0
}
```

---

## Budget Grid: Hierarchical Line Items (Server-Rendered)

The budget data is rendered as a **hierarchical table** with `_level` attributes (0-3) for nesting depth. Each row has:

| Attribute | Purpose |
|---|---|
| `_level` | Nesting depth (0=top category, 1=sub, 2=cost type, 3=sub-detail) |
| `_leafnode` | `true`/`false` — whether row has children |
| `td.LINEITEM` | Line item name with indent via `padding-left` |
| `td.MONEY span` | Dollar amount |
| `input.LINEITEMCOMMENT` | Hidden comment field |
| `input.LINEITEMCOMMENT_AUTHOR` | Hidden comment author field |

### Top-Level Budget Categories (Level 0)
From the grid, the CSI-based cost structure:

| Category | Amount |
|---|---|
| A1 DEVELOPMENT COST | $2,153,027 |
| A2 MISCELLANEOUS COST - Sitework | $0 |
| A2 MISCELLANEOUS COST - Building | $0 |
| A3 Land - Hard Costs | $0 |
| A4 Equipment | $6,646,000 |
| A5 Expense | $0 |
| 00 Procurement & Contracting | $0 |
| 01-S GENERAL REQUIREMENTS - Sitework | $0 |
| 01-B GENERAL REQUIREMENTS - Building | $1,334,597 |
| 02 EXISTING CONDITIONS | $686,694 |
| 03 CONCRETE | $738,183 |
| 04 MASONRY | $342,606 |
| 05 METALS | $417,976 |
| 06 WOODS, PLASTICS & COMPOSITES | $479,117 |
| 07 THERMAL AND MOISTURE PROTECTION | $621,724 |
| 08 OPENINGS | $399,680 |
| 09 FINISHES | $900,881 |
| 10 SPECIALTIES | $224,626 |
| 11 EQUIPMENT | $319,000 |
| 12 FURNISHINGS - FIXTURE INSTALLATION | $1,370,881 |
| 13 SPECIAL CONSTRUCTION | $300,000 |
| 14 CONVEYING EQUIPMENT | $0 |
| 21 FIRE SUPPRESSION | $135,565 |
| 22 PLUMBING | $942,979 |
| 23 HVAC | $755,041 |
| 26 ELECTRICAL | $2,975,000 |
| 27 COMMUNICATIONS | $0 |
| 28 ELECTRONIC SAFETY AND SECURITY | $279,500 |
| 31 EARTHWORK | $267,130 |
| 32 EXTERIOR IMPROVEMENTS | $1,111,128 |
| 33 UTILITIES | $243,949 |
| 34 Transportation | $0 |
| 35 Waterway & Marine Construction | $0 |
| **TOTAL** | **$23,645,284** |

### Cost Type Breakdown (Level 2 leaf nodes)
Each line item breaks down by cost type: Contractor, Direct Buy, Kroger non-DB, Non-Kroger Developer, Expense.

---

## Budget View Selector

15 predefined budget views available via dropdown:

| View ID | Name |
|---|---|
| 20 | Store - Project Cost by Line Item (default) |
| 22 | Store - Full Comparison |
| 23 | Store - Recap View |
| 24 | Store - Fixturing Cost View |
| 25 | Store - Building & Site Cost |
| 26 | Store - Hard Cost |
| 27 | Store - Soft Cost |
| 28 | Store - SOV |
| 29 | Store - Preliminary Estimate Form |
| 30 | Store - Contractor Cost Type |
| 31 | Store - Direct Buy Cost Type |
| 32 | Store - Kroger non-DB Cost Type |
| 33 | Store - Non-Kroger Developer Cost Type |
| 34 | Store - Expense Cost Type |

Changing the view navigates to the same page with a `vi={viewID}` query parameter.

---

## ASMX Endpoints Discovered

### Budget Export (new)
```
GET /ws/Budgeting/Budgeting.asmx/ExportVersionsToExcel
    ?enterpriseID=8252
    &projectID=177956
    &viewID={viewID}
    &budgetProjectIDCsv={comma-separated sfBudgetProjectIDs}

GET /ws/Budgeting/Budgeting.asmx/ExportActualsToExcel
    ?enterpriseID=8252
    &projectID=177956
    &viewID={viewID}

GET /ws/Budgeting/Budgeting.asmx/ExportBaselineToExcel
    (same params as ExportVersionsToExcel)
```

These are **direct download URLs** — they return Excel files. No AJAX wrapper needed.

---

## Reports on This Page

| Report | Format | Key Parameters |
|---|---|---|
| Export Screen to Excel | (JS function) | Via `BudgetingNav._export()` |
| Excel Version Uploader | XLSM (format!14) | `sfBudgetProjectID=110045`, `sfBudgetViewID=20` |
| Excel Version Uploader Including Sources | XLSM (format!14) | Same + sources |
| sf IPECC | (advanced report) | `/advreport/kroger/ipecc.aspx?sfBudgetProjectID=108354` |
| Preliminary SEF | XLSX (format!11) | `sfBudgetProjectID=108354` |
| Final SEF | XLSX (format!11) | `sfBudgetProjectID=108354` |
| Bid Comparison SOV | XLSX (format!11) | `sfBudgetProjectID=108354` |
| Project Comparison | XLSX (format!11) | `sfBudgetProjectID=108354` |

**New format code:** `format!11` = XLSX (standard Excel). **New report path:** `/advreport/kroger/ipecc.aspx` (advanced report outside the standard `/reports/` pattern).

---

## Related URLs

| Page | URL Pattern |
|---|---|
| Budget View | `BudgetVersionView.sf?idProject={id}&bn=256&idfilter=8252` |
| Budget Edit | `BudgetVersionEdit.sf?...` |
| Budget Actuals | `BudgetActualsView.sf?...` |
| Budget Compare | `BudgetCompareView.sf?idProject={id}&idFilter=8252&bn=256&ct={type}&vc={versionCSV}` |
| Budget Version Search | `BudgetVersionSearch.sf?idProject={id}&bn=256&idFilter=8252` |

---

## DOM Selectors for Budget Grid

| Selector | Data |
|---|---|
| `div.BUDGETGRID table` | Main budget table |
| `tr.GRIDHEADTOTALS th.MONEY span` | Grand total |
| `tr[_level="0"] td.LINEITEM span:last` | Top-level category name |
| `tr[_level="0"] td.MONEY span` | Top-level category amount |
| `tr[_level][_leafnode="true"] td.LINEITEM span:last` | Leaf node (cost type) name |
| `tr[_level][_leafnode="true"] td.MONEY span` | Leaf node amount |
| `input[id$="budgetGridControl_TOTAL"]` | Total as raw number (23645284.0000) |

---

## Notes

- This is the **most complex page analyzed so far**. Unlike all previous AJAX-loaded pages, the budget grid is fully server-rendered in the initial HTML — hundreds of `<tr>` rows with hierarchical budget data.
- The budget uses **Kroger's CSI MasterFormat** numbering (divisions 00-35 plus custom A1-A5 prefixes for development cost, equipment, and expense categories).
- Budget versions have a **staged workflow**: Import → Under Development → Commitment → Reconcile → Publish. Each stage has permission flags controlling edit/save capabilities.
- The `sfBudgetProjectID` values (e.g., 110045, 108354) are **different from the SiteFolio project ID** (177956). They identify specific budget version instances.
- The `/ws/Budgeting/Budgeting.asmx` namespace is **new** — not seen on any previous page. This is a separate ASMX module from the Contracts2 and Directory2 modules.
- The `$` tab `bn` value is **256** for Budget, **512** for Contracts, **5010** for Bidding.

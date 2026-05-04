# SiteFolio Page Analysis — Page 6: Requests > ASI (Architect Supplemental Information)

**URL:** `/Kroger/Asi2Main.sf?idProject=177956&bn=1024&idfilter=8252`
**Page Title:** Architect Supplemental Information
**Type:** ASI request list for a single project
**Project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956)

---

## What This Page Is

This is the **ASI list** under the REQUESTS tab. ASIs (Architect Supplemental Instructions) are formal change directives from the architect to the contractor during construction. This page lists all ASIs for a project with search, filter, sort, and grouping controls. The same page structure likely applies to PR (Proposal Requests) and RFI (Requests for Information) pages.

This page is from a **different project** than Pages 3–5. Project 177956 is 620-00142-01 (Louisville, CO - W Dillon Rd), not KS-152 (Lone Tree). This confirms the page structure is consistent across projects.

---

## Critical Finding: AJAX-Loaded Content (ASMX Endpoint)

Like Page 5 (Directory), the ASI list content is **lazy-loaded via AJAX**. The initial HTML contains an empty container:

```html
<div id="U_WP1036828416_divAsiList" style="width: 100%;"></div>
```

The data is fetched via an **ASMX GET request** (not POST like most SiteFolio ASMX calls):

```javascript
$.ajax({
    url: '/ws/Contracts2/Asi2.asmx/AsiSearch',
    type: 'GET',
    data: {
        enterpriseID: 8252,
        projectID: 177956,
        contractID: 0,
        aliasedStatusID: '0',    // from filter dropdown
        grouping: '1',           // from group dropdown
        search: '',              // from search input
        sortKey: '',             // from sort state
        sortDirection: 0         // 0=asc, 1=desc
    },
    dataType: 'html',
    success: function (html) {
        $('#divAsiList').html(html);
    }
});
```

**New ASMX endpoint discovered:**
```
GET /ws/Contracts2/Asi2.asmx/AsiSearch
```

This returns **HTML** (not XML), which is unusual for ASMX — it's using `dataType: 'html'` and the response gets inserted directly into the DOM.

---

## Filter/Search Controls

The page provides three UI controls for filtering the ASI list:

| Control | ID | Options | Purpose |
|---|---|---|---|
| Search | `txtSearch` | Free text (max 20 chars) | Text search with 350ms debounce |
| Filter | `cboFilter` | All statuses (0), Issued (2), Voided (3) | Status filter |
| Group | `cboGroup` | By project (0), By contract (1, default) | Grouping mode |

**ASI Status Values:**
- `0` = All statuses
- `2` = Issued (CSS class: `CONTRACT2_APPROVED`)
- `3` = Voided (CSS class: `CONTRACT2_NOTAPPROVED`)

The sort is handled by clicking table column headers in the AJAX-returned HTML. Headers have `_sortkey` and `_sortDir` attributes.

---

## ASMX Endpoint Parameters

```
GET /ws/Contracts2/Asi2.asmx/AsiSearch

Parameters:
  enterpriseID    = 8252        (Kroger enterprise)
  projectID       = {id}        (SiteFolio project ID)
  contractID      = 0           (0 = all contracts)
  aliasedStatusID = 0|2|3       (filter: all/issued/voided)
  grouping        = 0|1         (0=by project, 1=by contract)
  search          = {text}      (free text search)
  sortKey         = {key}       (column sort key from header)
  sortDirection   = 0|1         (0=asc, 1=desc)
```

---

## Sibling Request Types (from nav sub-menu)

The REQUESTS tab has 3 sub-items, all using the same pattern:

| Request Type | URL | `bn` Value |
|---|---|---|
| **ASI** (selected) | `Asi2Main.sf?idProject={id}&bn=1024&idfilter=8252` | 1024 |
| PR | `PR2Main.sf?idProject={id}&bn=33554432&idfilter=8252&idPsl=33554432` | 33554432 |
| RFI | `Rfi2Main.sf?idProject={id}&bn=65536&idfilter=8252` | 65536 |

PR has an additional `idPsl` parameter. All three likely use similar AJAX-loaded list patterns with their own ASMX endpoints (likely `/ws/Contracts2/PR2.asmx/...` and `/ws/Contracts2/Rfi2.asmx/...`).

---

## New Observations from This Project

This page is from project **177956** (620-00142-01, Louisville, CO - W Dillon Rd), which reveals:

- **Schedule phase `bn` IDs are project-specific.** KS-152 used `bn=789801–789809` for phases. This project uses `bn=1052204–1052212` for the same phase names. The `bn` values are NOT global constants — they're generated per project. Phase names are consistent but IDs are not.
- Same 8 project tabs (OVERVIEW, SCHEDULE, TEAM, TASKS, REQUESTS, $, FILES, PHOTOS) with identical sub-menu structure.

---

## What's Useful Here

### High Value
1. **ASMX endpoint for ASI search** — `GET /ws/Contracts2/Asi2.asmx/AsiSearch` returns HTML with all ASI records. Supports filtering by status, grouping, search, and sort. Can be called directly with cookies.
2. **Request type URL patterns** — ASI, PR, and RFI all have confirmed URLs with `bn` values.
3. **ASI status codes** — Issued (2), Voided (3), used for filtering.

### Medium Value
4. **Phase `bn` IDs are project-specific** — Cannot hardcode phase IDs across projects; must read them from the nav sub-menu of each project.
5. **Sortable columns** — The AJAX response includes sortable headers with `_sortkey` attributes, enabling server-side sorted queries.

---

## DOM Selectors

Since the ASI list is AJAX-loaded, selectors apply to the **returned HTML** inside `#divAsiList`. The actual structure of individual ASI records is unknown from this page source alone — we'd need to capture the AJAX response.

**Static elements on the page:**
- Search input: `input#U_WP1036828416_txtSearch`
- Filter dropdown: `select#U_WP1036828416_cboFilter`
- Group dropdown: `select#U_WP1036828416_cboGroup`
- ASI list container: `div[id$="divAsiList"]`

---

## Relationships to Other Pages

| From this page... | To... | How |
|---|---|---|
| ASMX endpoint | `GET /ws/Contracts2/Asi2.asmx/AsiSearch?projectID={id}` | Fetches ASI list HTML |
| PR page | `PR2Main.sf?idProject={id}&bn=33554432` | Proposal Requests list |
| RFI page | `Rfi2Main.sf?idProject={id}&bn=65536` | RFI list |
| Overview | `ProjectOverviewView.sf?idProject=177956` | Back to project overview |

---

## Notes

- This is the **second page type using AJAX-loaded content** (after Directory on Page 5). The pattern is similar: initial HTML has an empty container, JS makes an AJAX call on page load, and the response HTML is inserted.
- Unlike the Directory page (which used a standard MVC GET endpoint), this page uses an **ASMX endpoint** (`/ws/Contracts2/Asi2.asmx/AsiSearch`) but with `GET` method and `dataType: 'html'` — a hybrid pattern. Most ASMX calls we've seen use POST and return XML.
- The search input has a **350ms debounce** (`_DELAY: 350`) — each keystroke resets a timer before firing the AJAX call.
- The **schedule phase `bn` IDs differ between projects** (789801–789809 for KS-152 vs 1052204–1052212 for this project). This is an important architectural note: `bn` values for schedule phases must be read dynamically from each project's nav sub-menu, not hardcoded.
- PR and RFI pages likely follow an identical AJAX pattern with their own `/ws/Contracts2/` endpoints. Getting HTML from one would confirm the pattern for all three.

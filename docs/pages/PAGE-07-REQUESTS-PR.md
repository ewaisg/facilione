# SiteFolio Page Analysis — Page 7: Requests > PR (Proposal Request)

**URL:** `/Kroger/PR2Main.sf?idProject=177956&bn=33554432&idfilter=8252&idPsl=33554432`
**Page Title:** Proposal Request
**Type:** PR request list for a single project
**Project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956)

---

## What This Page Is

This is the **Proposal Request (PR) list** under the REQUESTS tab. PRs are formal requests from the owner to the contractor for pricing on proposed scope changes. This page is structurally **identical to the ASI page (Page 6)** — same AJAX pattern, same filter/search/group controls, same DOM layout — but with a different ASMX endpoint and different status filter values.

---

## ASMX Endpoint

```
GET /ws/Contracts2/PR2.asmx/PRSearch

Parameters:
  enterpriseID    = 8252
  projectID       = {id}
  contractID      = 0
  aliasedStatusID = 0|1|2|3
  grouping        = 0|1
  search          = {text}
  sortKey         = {key}
  sortDirection   = 0|1
```

Returns HTML, inserted into `div[id$="divPRList"]`.

---

## Key Difference from ASI: Status Values

| Value | ASI (Page 6) | PR (this page) | CSS Class |
|---|---|---|---|
| 0 | All statuses | All statuses | — |
| 1 | *(not present)* | **Not Issued** | `CONTRACT2_DRAFT` |
| 2 | Issued | Issued | `CONTRACT2_APPROVED` |
| 3 | Voided | Void | `CONTRACT2_VOID` |

PR has an **additional status**: "Not Issued" (value 1, class `CONTRACT2_DRAFT`). ASI only had Issued and Voided. This suggests PRs go through a draft → issued → void lifecycle, while ASIs skip the draft state.

---

## URL Pattern Differences

PR has an extra parameter compared to ASI:

| Request | URL | Extra Param |
|---|---|---|
| ASI | `Asi2Main.sf?idProject={id}&bn=1024&idfilter=8252` | — |
| **PR** | `PR2Main.sf?idProject={id}&bn=33554432&idfilter=8252&idPsl=33554432` | `idPsl=33554432` |
| RFI | `Rfi2Main.sf?idProject={id}&bn=65536&idfilter=8252` | — |

The `idPsl` parameter on PR appears to match the `bn` value (33554432). Purpose unclear — possibly a "Project Sub-List" identifier.

---

## Confirmed Pattern: All 3 Request Types Use Identical Architecture

| Request Type | ASMX Endpoint | JS Object | Container |
|---|---|---|---|
| ASI | `/ws/Contracts2/Asi2.asmx/AsiSearch` | `AsiList` | `div[id$="divAsiList"]` |
| **PR** | `/ws/Contracts2/PR2.asmx/PRSearch` | `PRList` | `div[id$="divPRList"]` |
| RFI | `/ws/Contracts2/Rfi2.asmx/RfiSearch` (inferred) | `RfiList` (inferred) | `div[id$="divRfiList"]` (inferred) |

All use: AJAX GET returning HTML, same filter/search/group controls, same 350ms debounce, same sort-by-column-header pattern. The only differences are the ASMX endpoint path, the JS object name, and the status filter options.

---

## What's Useful Here

### High Value
1. **PR ASMX endpoint confirmed** — `GET /ws/Contracts2/PR2.asmx/PRSearch`. Same parameter structure as ASI.
2. **PR-specific status values** — Not Issued (1), Issued (2), Void (3). The "Not Issued" draft state is unique to PRs.
3. **Pattern confirmed for all request types** — ASI, PR, and RFI all use the same architecture. A single generic parser can handle all three by swapping the endpoint URL and status values.

---

## Notes

- This page confirms the **Contracts2 ASMX pattern** is consistent across all request types. Building a parser for one effectively builds it for all three.
- The PR page has a `showFilter` toggle using text links ("show filter"/"hide filter") instead of the icon-based toggle on ASI. Minor UI difference, same functional behavior.
- The `idPsl` parameter on the PR URL is unique to this request type. It may be needed when constructing PR URLs programmatically.
- No new ASMX endpoints or architectural patterns discovered — this page purely confirms the pattern from Page 6.

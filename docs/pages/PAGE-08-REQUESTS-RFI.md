# SiteFolio Page Analysis — Page 8: Requests > RFI (Request For Information)

**URL:** `/Kroger/Rfi2Main.sf?idProject=177956&bn=65536&idfilter=8252`
**Page Title:** Request For Information
**Type:** RFI request list for a single project
**Project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956)

---

## What This Page Is

This is the **RFI list** under the REQUESTS tab. RFIs are formal information requests between project parties (typically contractor → architect, or PM → architect). Same AJAX-loaded architecture as ASI and PR, but with a **completely different status lifecycle**.

---

## ASMX Endpoint (Confirmed — was inferred on Page 7)

```
GET /ws/Contracts2/Rfi2.asmx/RfiSearch

Parameters:
  enterpriseID    = 8252
  projectID       = {id}
  contractID      = 0
  aliasedStatusID = 0|2|3|4|5
  grouping        = 0|1
  search          = {text}
  sortKey         = {key}
  sortDirection   = 0|1
```

Returns HTML, inserted into `div[id$="divRfiList"]`.

---

## Key Difference: RFI Has a Unique 4-Status Lifecycle

| Value | Label | CSS Class | Lifecycle Position |
|---|---|---|---|
| 0 | All statuses | — | (filter) |
| 2 | Submitted | `CONTRACT2_PROPOSED` | Initial |
| 3 | Under Review | `CONTRACT2_PROPOSED` | In progress |
| 4 | Final | `CONTRACT2_APPROVED` | Closed |
| 5 | Under Clarification | `CONTRACT2_PROPOSED` | Re-opened |

This is **completely different** from ASI (Issued/Voided) and PR (Not Issued/Issued/Void). RFIs have a proper workflow: Submitted → Under Review → Final, with an "Under Clarification" loop-back state.

Note: Values 2, 3, and 5 all share the CSS class `CONTRACT2_PROPOSED`, while only value 4 uses `CONTRACT2_APPROVED`. This maps to an open/closed visual distinction.

---

## Complete Request Type Status Comparison

| Value | ASI | PR | RFI |
|---|---|---|---|
| 0 | All statuses | All statuses | All statuses |
| 1 | — | Not Issued (`DRAFT`) | — |
| 2 | Issued (`APPROVED`) | Issued (`APPROVED`) | Submitted (`PROPOSED`) |
| 3 | Voided (`NOTAPPROVED`) | Void (`VOID`) | Under Review (`PROPOSED`) |
| 4 | — | — | Final (`APPROVED`) |
| 5 | — | — | Under Clarification (`PROPOSED`) |

Each request type has its own status semantics despite sharing the same AJAX architecture.

---

## Complete Contracts2 ASMX Endpoint Map

| Request Type | Endpoint | JS Object | Container | Status Count |
|---|---|---|---|---|
| ASI | `/ws/Contracts2/Asi2.asmx/AsiSearch` | `AsiList` | `div[id$="divAsiList"]` | 2 (Issued, Voided) |
| PR | `/ws/Contracts2/PR2.asmx/PRSearch` | `PRList` | `div[id$="divPRList"]` | 3 (Not Issued, Issued, Void) |
| RFI | `/ws/Contracts2/Rfi2.asmx/RfiSearch` | `RfiList` | `div[id$="divRfiList"]` | 4 (Submitted, Under Review, Final, Under Clarification) |

All three confirmed with identical architecture, different status values.

---

## Notes

- RFI confirms the inferred endpoint from Page 7: `/ws/Contracts2/Rfi2.asmx/RfiSearch` — exact match.
- The RFI status lifecycle reflects a real workflow: submit → review → finalize, with a clarification loop. This is the most complex of the three request types.
- All three request types (ASI, PR, RFI) are now fully documented. A generic parser needs only the endpoint URL and status map per type.
- No `idPsl` parameter on RFI (only PR has it).

# SiteFolio Page Analysis — Page 11: $ > Bidding

**URL:** `/Kroger/BidPackageList.sf?idProject=177956&bn=5010&idfilter=8252`
**Page Title:** Bid Package List
**Type:** Bid package list with status tracking and copy-to-budget integration
**Project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956)

---

## What This Page Is

This is the **Bidding** page, the third and final sub-page under the `$` tab (after Budget and Contracts). It lists bid packages for a project with their status, due dates, and selection information. The page is **server-rendered** and relatively simple compared to Budget and Contracts.

---

## Bid Package Data

One bid package visible on this project:

| Field | Value | Selector |
|---|---|---|
| Identifier | 001 | `a[id$="aIdentifier"]` |
| Bid Package ID | 13383 | URL param `idBP=13383` |
| Status | Closed | `td[id$="tdStatus"]` (class `BIDDING_CLOSED`) |
| Name | King Soopers New Store #142 | `td[id$="tdName"]` |
| Intent Due | (empty) | `td[id$="tdIntentDue"]` |
| Bid Due | 7/1/2025 11:00 AM Pacific Time | `td[id$="tdBidDue"]` |
| Selection | (empty) | `td[id$="tdSelection"]` |

### Bid Package Detail URL
`/Kroger/BidPackageView.sf?idProject=177956&idBP=13383&idSubtype=1&bn=5010`

### Create New Bid Package URL
`/Kroger/BidPackageAdd.sf?idProject=177956&idSubtype=1&bn=5010`

---

## Table Columns

| Column | Description |
|---|---|
| (checkbox) | Copy-to-budget selection |
| Identifier | Bid package number (001, 002, etc.) |
| Status | Closed, Open, etc. (class-based: `BIDDING_CLOSED`) |
| Name | Bid package description |
| Intent Due | Intent to bid deadline |
| Bid Due | Bid submission deadline (date + time + timezone) |
| Selection | Selected bidder (empty until awarded) |

---

## Copy to Budget Feature

Identical to the Contracts page — same budget version dropdown, same stage options (Reconcile/Under Development/Import), same merge behavior. Bid package breakdowns can be copied into budget versions just like contract SOVs.

---

## DOM Selectors

| Selector | Data |
|---|---|
| `table.BIDDING_LIST` | Main bid package table |
| `a[id$="aIdentifier"]` | Bid package number link |
| `td[id$="tdStatus"]` | Status (class indicates state) |
| `td[id$="tdName"]` | Bid package name |
| `td[id$="tdBidDue"] span.DATE` | Bid due date |
| `td[id$="tdBidDue"] span.TIME` | Bid due time + timezone |
| `td[id$="tdSelection"]` | Selected bidder |
| `input[id$="txtBidPackageID"]` | Hidden bid package ID |

---

## Related URLs

| Page | URL Pattern |
|---|---|
| Bid Package List | `BidPackageList.sf?idProject={id}&bn=5010&idfilter=8252` |
| Bid Package Detail | `BidPackageView.sf?idProject={id}&idBP={bpId}&idSubtype=1&bn=5010` |
| Create Bid Package | `BidPackageAdd.sf?idProject={id}&idSubtype=1&bn=5010` |

---

## Notes

- Simplest of the 3 `$` tab pages. Server-rendered, no new ASMX endpoints.
- The `bn=5010` value for Bidding is confirmed (vs. Budget=256, Contracts=512).
- The `idSubtype=1` parameter appears in bid package URLs — suggests bid packages can have subtypes (only subtype 1 observed here).
- Bid due dates include timezone info ("Pacific Time"), which is unusual for SiteFolio — most other date fields are timezone-agnostic.
- The `BIDDING_CLOSED` CSS class on the status `td` follows the same pattern as `CONTRACT2_APPROVED` on the Contracts page — status is encoded in the CSS class name.
- The Copy to Budget feature appears on both Contracts (P10) and Bidding (P11) — both can merge financial breakdowns into budget versions.
- This completes all 3 sub-pages under the `$` tab: Budget, Contracts, Bidding.

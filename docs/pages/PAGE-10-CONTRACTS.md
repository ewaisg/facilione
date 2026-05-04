# SiteFolio Page Analysis — Page 10: $ > Contracts

**URL:** `/Kroger/ContractorContract2Main.sf?idProject=177956&bn=512&idfilter=8252`
**Page Title:** Contracts
**Type:** Project contracts list with SOV (Schedule of Values) summary
**Project:** 620-00142-01 Louisville, CO - W Dillon Rd (SF ID: 177956)

---

## What This Page Is

This is the **Contracts** page under the `$` tab. It lists all contracts for a project with financial summary data (SOV columns), grouped by contract subtype. The page is **server-rendered** — all contract data is in the initial HTML. It also has a "Copy to Budget" feature that merges contract breakdowns into budget versions.

---

## Contract Data (Server-Rendered)

One contract visible on this project:

| Field | Value | Selector |
|---|---|---|
| Contract Number | 620-00142-01-1 | `a[id$="aContractNumber"]` |
| Contract ID (hidden) | 124189 | `input[id$="txtContractID"]` |
| Status | Approved | `div[id$="divStatus"]` (class `CONTRACT2_APPROVED`) |
| Business | Mark Young Construction | `div[id$="tdBusiness"]` |
| Scope | Building/Site | `div[id$="tdScopes"]` |
| Contract Sum | $11,012,257.00 | `td[id$="tdContractSum"]` |
| Approved Changes | $30,217.85 | `td[id$="tdApprovedChanges"]` |
| Sum to Date | $11,042,474.85 | `td[id$="tdSumToDate"]` |
| Approved Change % | 0.27% | `td[id$="tdVariance"]` |
| Completed & Stored | $7,751,040.59 | `td[id$="tdCompletedAndStored"]` |
| Percent Complete | 70.19% | `td[id$="tdPercentComplete"]` |
| Balance to Finish | $3,291,434.26 | `td[id$="tdBalanceToFinish"]` |
| Retainage Held | $387,552.03 | `td[id$="tdRetainage"]` |

### Contract Detail URL
Each contract links to a detail page: `/Kroger/ContractorContract2View.sf?idProject=177956&bn=512&idContract=124189&cstid=512`

### Contract Subtype Sections
Contracts are grouped by subtype. This page shows "Contractor Contract" as the section. The `_mask` attribute on checkboxes suggests a bitmask system for subtypes (mask=1 for Contractor).

---

## SOV Table Columns

The table header reveals the full SOV (Schedule of Values) column structure:

1. Contract # and Status
2. Business name and Scope
3. **Contract Sum** — original contract value
4. **Approved Changes** — total approved change orders
5. **Sum to Date** — contract sum + approved changes
6. **Approved Change %** — change order percentage
7. **Completed and Stored** — work completed to date
8. **Percent Complete** — completion percentage
9. **Balance to Finish** — remaining contract value
10. **Retainage Held** — retainage withheld

---

## Copy to Budget Feature

The page has a "Copy to Budget" tool that merges contract SOV breakdowns into a budget version. The dropdown shows available budget versions to copy into:

| Version | Description |
|---|---|
| New budget version | Creates a new version |
| Under Development (V5) rmm | Round 2 MYC Budget |
| Under Development (V4) tcr | Round 1 MYC Budget |
| Under Development (V3) rmm | Round 1 MYC Budget |
| Under Development (V2) tcr | New Budget Pre-Bid |
| Under Development (V1) rmm | New Budget |

Target stage options: Reconcile (3), Under Development (1), Import (53).

---

## ASMX Endpoints

### New endpoint discovered:
```
GET /ws/Contracts2/Contracts2.asmx/GetContractAttachments
    ?enterpriseID=8252
    &idProject=177956
```
Downloads all contract attachments for a project. This is the first `Contracts2.asmx` method we've seen outside of the request search endpoints (Asi2, PR2, Rfi2).

---

## Reports on This Page

| Report | Format | Description |
|---|---|---|
| Project Change Order Report | XLSX (format!11) | `/reports/.../sR_ProjectChangeOrder.xlsx` |
| Project Change Order Summary | XLSX (format!11) | `/reports/.../ProjectChangeOrderSummary.xlsx` |
| Project Invoice Report | XLSM (format!14) | `/reports/.../sR_PortfolioInvoiceLog.xlsm` |
| Download all Attachments | (direct) | Via `Contracts2.asmx/GetContractAttachments` |

---

## DOM Selectors

| Selector | Data |
|---|---|
| `table.SOV` | Main contracts table |
| `input[id$="txtContractID"]` | Hidden contract ID per row |
| `a[id$="aContractNumber"]` | Contract number link |
| `div[id$="divStatus"]` | Status badge (class indicates status) |
| `div[id$="tdBusiness"]` | Contractor business name |
| `div[id$="tdScopes"]` | Contract scope description |
| `td[id$="tdContractSum"]` | Original contract sum |
| `td[id$="tdSumToDate"]` | Current contract total |
| `td[id$="tdPercentComplete"]` | Completion percentage |
| `td[id$="tdBalanceToFinish"]` | Remaining balance |
| `td[id$="tdRetainage"]` | Retainage held |

---

## Notes

- This page is **server-rendered** like the Budget page — no AJAX loading needed.
- Contract IDs (e.g., 124189) are separate from project IDs and budget version IDs.
- The SOV columns give a complete financial snapshot per contract: original sum, changes, completion, retainage.
- The "Copy to Budget" feature reveals a tight integration between Contracts and Budget modules — contract SOV data can be merged into budget versions.
- The ILP lock icon (`material-icons: lock`) with title "ILPs are configured for this item" indicates invoice line-item processing is enabled on this contract.
- New ASMX method: `Contracts2.asmx/GetContractAttachments` for bulk attachment download.

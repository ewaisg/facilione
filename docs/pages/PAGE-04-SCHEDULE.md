# SiteFolio Page Analysis — Page 4: Project Schedule

**URL:** `/Kroger/Scheduling.sf?idProject=131317&idfilter=0`
**Page Title:** Schedule
**Type:** Full milestone schedule for a single project (all phases view)
**Project:** 620-00152-01 KS-152 2027 New Store, Lone Tree, CO - Ridgegate (SF ID: 131317)

---

## What This Page Is

This is the **complete project schedule** — every milestone across every phase, with Baseline, Projected, Projected Alt., and Actual dates, plus completion percentage, notes, and assigned contacts. This is the data that drives the "Upcoming Milestones" widget on the Overview page, but here it shows **all milestones** including completed ones. For a New Store project, this page contains **53 milestones across 8 phases**.

---

## Schedule Template

At the bottom of the page: **"Kroger: New Store Default"** — confirms this is the standard New Store schedule template. Different project types (WIW, MC, etc.) will have different templates with different milestones.

---

## Data Structure

### Container

`table#tblScheduleDates > tbody#tbScheduleDates`

All data is server-rendered HTML — no ASMX lazy loading.

### Row Types

**1. Category Header Row** (`tr.CAT`)
- `data-id` = phase/category ID (e.g., 789808 for Evaluation)
- `td.SC` = phase name text

**2. Milestone Row** (`tr.MSC`)
- `data-id` = milestone ID (unique per milestone)
- `data-eid` = enterprise ID (always 8252)
- `data-pm` = permission mode
- `data-stid` = schedule topic ID
- `data-etid` = enterprise topic ID (milestone type identifier)
- `data-tcdm` / `data-cdm` = calculation/date mode flags
- `data-taskid` = linked task ID (0 if none)
- CSS class `COMPLETE` present when milestone is 100%
- CSS class `TASK` present on all milestone rows

**3. Milestone Note Row** (`tr.MSCN`)
- Immediately follows milestone row when notes exist
- Contains `div.BY` (date + author initials) and `div.NOTE` (note text)
- Only present if the milestone has notes (indicated by `(n)` count in `td.SN`)

**4. Spacer Row** (`tr.SPCR`) — between phases

### Column Structure per Milestone Row

| Column | CSS Class | Content | Notes |
|---|---|---|---|
| Milestone Name | `td.ST` | Text | The milestone name |
| Baseline Label | `td.SL` | "Baseline" | Label cell |
| **Baseline Date** | `td.SD` with `data-num="1"` | MM/DD/YYYY or empty | `data-edid="83"` |
| Projected Label | `td.SL` | "Projected" | Label cell |
| **Projected Date** | `td.SD` with `data-num="2"` | MM/DD/YYYY or "——" | `data-edid="84"` |
| Proj. Alt. Label | `td.SL` | "Projected Alt." | Label cell (not always present) |
| **Projected Alt. Date** | `td.SD` with `data-num="3"` | MM/DD/YYYY or "——" | `data-edid="156"` |
| Actual Label | `td.SL` | "Actual" | Has class `AUTOCOMPLETE` |
| **Actual Date** | `td.SD` with `data-num="4"` | MM/DD/YYYY or "——" | `data-edid="85"`, class `AUTOCOMPLETE` |
| Completion % | `td.SP` | "0%" or "100%" | Class `COMPLETE` when done |
| Contact | `td.TC` | Assigned contact span | `data-cid`, `data-bid`, `data-bname`, `data-tpid` |
| Warning Icon | `td.TW` | Image | Visual indicator |
| (empty) | `td` | — | — |
| Note Count | `td.SN` | "(n)" | Number of notes on this milestone |

### Date Columns Key

| `data-num` | `data-edid` | Meaning |
|---|---|---|
| 1 | 83 | Baseline Date |
| 2 | 84 | Projected Date |
| 3 | 156 | Projected Alt. Date |
| 4 | 85 | Actual Date |
| 0 | 0 | No date column (empty) |

---

## Extracted Data — All 53 Milestones

### Phase 1: Evaluation (bn=789808) — 4 milestones, all complete

| Milestone | Baseline | Projected | Proj. Alt. | Actual | % | Notes |
|---|---|---|---|---|---|---|
| Project Identified | 09/01/2021 | 09/01/2021 | — | 09/01/2021 | 100% | |
| Preliminary Site Plan Received | 09/29/2021 | 09/02/2021 | — | 09/02/2021 | 100% | |
| Preliminary Estimate Completed | 12/29/2021 | 10/08/2021 | — | 10/08/2021 | 100% | |
| Project Approval Received | 02/16/2022 | 04/08/2025 | 12/14/2021 | 04/08/2025 | 100% | "original approval March 2022" |

### Phase 2: Real Estate (bn=789809) — 15 milestones (13 complete, 1 open, 2 comment-only)

| Milestone | Baseline | Projected | Proj. Alt. | Actual | % | Notes |
|---|---|---|---|---|---|---|
| Comments | — | — | — | — | — | |
| Opportunity / Risk | — | — | — | — | — | |
| Access Agreement Executed | 10/27/2021 | 12/03/2024 | — | 12/03/2024 | 100% | |
| PSA Signed | 11/24/2021 | 12/03/2024 | — | 12/03/2024 | 100% | |
| Title Commitment Ordered | 12/01/2021 | 05/01/2025 | — | 05/01/2025 | 100% | |
| Title Commitment Received | 12/29/2021 | 05/23/2025 | — | 05/23/2025 | 100% | "per real estate" |
| ALTA Survey Requested | 12/01/2021 | 05/28/2025 | — | 05/28/2025 | 100% | |
| ALTA Survey Received | 12/29/2021 | 08/20/2025 | — | 08/20/2025 | 100% | "per Galloway" |
| Title Objection Letter Sent | 01/05/2022 | 06/12/2025 | — | 06/12/2025 | 100% | |
| Project Submitted to Capital Committee | 01/05/2022 | 04/01/2025 | — | 04/01/2025 | 100% | |
| Due Diligence Period Expired | 02/22/2022 | 12/09/2025 | — | 12/09/2025 | 100% | "180 day expiration" |
| Zoning / Use Approved | 05/23/2022 | 01/16/2026 | — | 01/16/2026 | 100% | |
| Final Municipal Site Plan Approved | 05/23/2022 | 01/16/2026 | — | 01/16/2026 | 100% | |
| Property Closed | 06/20/2022 | 06/12/2025 | — | 06/12/2025 | 100% | "Ground Lease signed per Real Estate" |
| **Possession Received** | 07/20/2022 | **04/24/2026** | 04/24/2026 | — | **0%** | "in review" |

### Phase 3: Due Diligence / Entitlements (bn=789801) — 10 milestones, all complete

| Milestone | Baseline | Projected | Actual | % |
|---|---|---|---|---|
| Due Diligence Started | 10/27/2021 | 06/23/2021 | 06/23/2021 | 100% |
| Phase 1 Environmental Completed | 12/08/2021 | 01/17/2025 | 01/17/2025 | 100% |
| Geotechnical Study Completed | 12/22/2021 | 02/17/2025 | 02/17/2025 | 100% |
| Phase 2 Environmental Completed | 01/19/2022 | 02/19/2025 | 02/19/2025 | 100% |
| Environmental Due Diligence Completed | 01/25/2022 | 02/19/2025 | 02/19/2025 | 100% |
| Due Diligence Completed | 03/30/2022 | 07/16/2025 | 07/16/2025 | 100% |
| Revised Final Fixture Plan Received | 03/16/2022 | 06/05/2025 | 06/05/2025 | 100% |
| Final Fixture Plan Reviewed (FM Only) | 03/09/2022 | 06/16/2023 | 06/16/2023 | 100% |
| Permits Received | 08/24/2022 | 02/16/2026 | 02/16/2026 | 100% |

### Phase 4: Fixture Plan Development (bn=789802) — 2 milestones, all complete

### Phase 5: Design Development (bn=789803) — 4 milestones, all complete

### Phase 6: Internal Approval (bn=789804) — 6 milestones, all complete

### Phase 7: Construction (bn=789805) — 12 milestones (3 complete, 9 open)

Key upcoming milestones:
- Fixtures Ordered: Projected 06/07/2026
- Roof Completed: Projected 06/11/2026
- Colored Slab Poured: Projected 07/13/2026
- Building Shell Completed: Projected 07/20/2026
- Permanent Utilities Completed: Projected 06/29/2026
- TCO Received: Projected 02/12/2027
- Construction Completed: Projected 02/12/2027

### Phase 8: Fixturing (bn=789806) — 5 milestones, all open

- Fixturing Started: Projected 01/18/2027, Proj. Alt. 12/07/2026
- Merchandising Started: Projected 02/22/2027
- Safety Assured: Projected 03/19/2027
- Project Completed: Projected 04/09/2027

### Phase 9: Project Close-Out (bn=789807) — 1 milestone

- **Grand Opening**: Baseline 05/24/2023, Projected **04/21/2027**

---

## DOM Selectors for Parsing

```
Schedule table:
  table#tblScheduleDates > tbody#tbScheduleDates

Phase headers:
  tr.CAT → data-id = phase bn ID
  td.SC → phase name text

Milestone rows:
  tr.MSC → data-id = milestone ID
  td.ST → milestone name
  td.SD[data-num="1"] → Baseline date
  td.SD[data-num="2"] → Projected date
  td.SD[data-num="3"] → Projected Alt. date
  td.SD[data-num="4"] → Actual date
  td.SP → completion percentage
  td.SN → note count "(n)"
  tr.MSC.COMPLETE → milestone is 100% done

Milestone notes:
  tr.MSCN (immediately after tr.MSC)
  div.BY → date + author initials
  div.NOTE → note text

Contact assignment:
  td.TC > span.CONTACT → data-cid, data-bid, data-bname, data-tpid
```

---

## Gantt Chart URLs

The page context menu reveals **3 Gantt view types**:

| Gantt Type | URL |
|---|---|
| Executive Program Gantt | `/Kroger/Gantt.sf?idProject=131317&idfilter=0&gantt=19` |
| Executive Project Gantt | `/Kroger/Gantt.sf?idProject=131317&idfilter=0&gantt=20` |
| Project Gantt | `/Kroger/Gantt.sf?idProject=131317&idfilter=0&gantt=10` |

---

## JS Initialization

```javascript
Schedule.initialize(8252, "MM/dd/yyyy", true, true, 83709, "ge", "", "", "");
// params: enterpriseId, dateFormat, editable?, ?, memberId, initials, ...
```

Date format is `MM/dd/yyyy`. Enterprise ID 8252, member ID 83709 (Gheiath).

---

## What's Useful Here

### High Value
1. **Complete milestone schedule** — 53 milestones across 8 phases with 4 date columns each (Baseline, Projected, Projected Alt., Actual). This is the most granular schedule data in SiteFolio.
2. **Baseline vs. Actual variance** — Compare original Baseline dates (set in 2021-2022) against Actual dates (mostly 2025-2026) to calculate schedule slippage. This project slipped ~3 years from original baseline.
3. **Completion status** — Each milestone has a % complete. Can calculate phase-level and project-level completion from this.
4. **Milestone notes** — Some milestones have notes from PMs explaining delays or context (e.g., "180 day expiration", "per Galloway", "original approval March 2022").
5. **Phase-specific `bn` IDs** — Confirmed mapping of phase names to `bn` values for URL construction.

### Medium Value
6. **Schedule template identification** — "New Store Default" template. Can compare across projects to see which template is used.
7. **Gantt chart URLs** — 3 levels of Gantt views accessible programmatically.
8. **Contact assignments** — `data-cid` and `data-bid` on milestone rows could link milestones to responsible contacts.

---

## Relationships to Other Pages

| From this page... | To... | How |
|---|---|---|
| Phase-filtered view | `Scheduling.sf?idProject=131317&bn={phaseId}` | Filter to single phase |
| Gantt views | `Gantt.sf?idProject=131317&gantt={10|19|20}` | Visual Gantt chart |
| Back to Overview | `ProjectOverviewView.sf?idProject=131317` | Project nav OVERVIEW tab |

---

## Notes

- All schedule data is **server-rendered in the initial HTML** — no ASMX calls needed to get milestone data. A single page fetch gives us the entire schedule.
- The 4-date-column structure (Baseline, Projected, Projected Alt., Actual) is consistent across all milestones, though some milestones only use 2 columns (Baseline + Actual) depending on the milestone type.
- `data-num` values on `td.SD` cells identify which date column it is: 1=Baseline, 2=Projected, 3=Projected Alt., 4=Actual. `data-num="0"` means no date for that column.
- The `——` value means "no date set" (dash-dash). The parser should treat this as null/empty.
- Milestone note rows (`tr.MSCN`) are **sibling rows** immediately after their parent `tr.MSC` — they share the milestone ID by proximity, not by a direct `data-id` reference.
- This project's schedule shows massive baseline-to-actual variance: original baseline had Grand Opening in 05/2023, current projected is 04/2027 — a ~4-year delay driven by real estate/lease negotiation timeline.
- The schedule template at the bottom ("New Store Default") confirms this is a standardized milestone set. WIW, MC, and other project types will have different templates with different milestone names.

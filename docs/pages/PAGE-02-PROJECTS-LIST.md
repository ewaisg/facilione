# SiteFolio Page Analysis — Page 2: Contact Projects List

**URL:** `/Kroger/ViewContactProjects.sf?idContact={contactId}&idBusiness=8252`
**Page Title:** Kroger (Directory > Kroger > Contacts > [Contact] > Projects tab)
**Type:** Project list for a specific contact

---

## What This Page Is

This is the "Projects" tab on any contact's profile page. It lists every project assigned to a specific person — both active and completed. This is the **canonical source** for "what projects does this PM manage?" and the entry point for discovering all project IDs, numbers, types, phases, and store locations for a given contact.

---

## Navigation Context

Same two-tier navigation as Page 1 (Contact Profile):

**Business tabs:** General | **Contacts** (active) | Locations | Diversity | Qualifications
**Contact tabs:** General | **Projects** (active)

---

## Data Found on This Page

### "Current Projects" WebPart

Despite the title "Current Projects," this section lists **all projects assigned to the contact — including completed ones.**

**Container:** `div.WEBPART` with title "Current Projects" → `table[id$="tblCurrentProjects"].WP_DATATABLE`

The table uses an **alternating row pattern** — store header rows followed by one or more project detail rows:

**Row Type 1 — Store Header:**
- Selector: `td[colspan="3"]` with `font-weight:bold; text-decoration:underline`
- Content pattern: `{storeNumber} {storeName}, {city}, {state} - {locationName} Kroger`
- No links, no IDs — purely display grouping

**Row Type 2 — Project Detail:**
- Selector: `td` containing `a[href*="ProjectOverviewView"]`
- Link text pattern: `{projectNumber} {year} {description}, {phase}, {projectType}`
- Link href: `/Kroger/ProjectOverviewView.sf?idProject={sfProjectId}`
- Trailing text after `</a>`: ` Role: {role}`
- A single store can have **multiple** project detail rows beneath it

### Extracted Data — PM's Projects (contactId=83709, Gheiath Ewais)

6 projects, all in active phases:

| Store | Project # | Year | Description | Phase | Type | SF ID |
|---|---|---|---|---|---|---|
| 620-00012 KS-012 Pueblo, CO | 620-00012-03 | 2026 | WIW | Bidding | Within-the-Walls Remodel | 39679 |
| 620-00028 KS-028 Boulder, CO | 620-00028-11 | 2026 | Floor & Decor | Final Planning | Minor Remodel | 185816 |
| 620-00052 KS-052 Aurora, CO | 620-00052-13 | 2026 | MC Consultation Room Addition | Conceptual | Minor Capital | 195337 |
| 620-00096 KS-096 Greenwood Village | 620-00096-19 | 2026 | MC-RX Modification | Conceptual | Minor Capital | 163513 |
| 620-00118 KS-118 Broomfield, CO | 620-00118-19 | 2027 | WIW | Final Planning | Within-the-Walls Remodel | 185821 |
| 620-00164 Windsor, CO | 620-00164-01 | 2028 | New Store | Bidding | New Store-Net New | 167633 |

### Extracted Data — Coworker's Projects (contactId=74745, Evyn Sprenkel)

27 projects across 22 stores, spanning 2023–2027, including 14 completed:

| Store | Project # | Year | Description | Phase | Type | SF ID |
|---|---|---|---|---|---|---|
| 620-00003 KS-003 Arvada, CO | 620-00003-11 | 2024 | Starbucks Reclad | Completed | Minor Capital | 172115 |
| 620-00006 KS-006 Colorado Springs, CO | 620-00006-14 | 2026 | WIW | Construction Planning | Within-the-Walls Remodel | 165043 |
| 620-00020 KS-020 Wheatridge, CO | 620-00020-10 | 2025 | WIW | Open | Within-the-Walls Remodel | 162284 |
| 620-00020 KS-020 Wheatridge, CO | 620-00020-12 | 2025 | Starbucks | Completed | Minor Capital | 188576 |
| 620-00024 KS-024 Thornton, CO | 620-00024-12 | 2023 | Maint. Meat/Seafood Case Replacements | Open | Minor Capital | 158792 |
| 620-00024 KS-024 Thornton, CO | 620-00024-13 | 2025 | MC Remerch/Floor | Under Construction | Minor Capital | 192491 |
| 620-00028 KS-028 Boulder, CO | 620-00028-09 | 2024 | Starbucks Reclad | Completed | Minor Capital | 172117 |
| 620-00050 KS-050 Littleton, CO | 620-00050-15 | 2023 | Maint. Restroom Remodel | Completed | Minor Capital | 162232 |
| 620-00057 KS-057 Wheatridge, CO | 620-00057-10 | 2024 | WIW | Completed | Within-the-Walls Remodel | 153203 |
| 620-00058 KS-058 | 620-00058-15 | 2023 | Maint. Restroom Remodel at C-Store | Completed | Minor Capital | 164856 |
| 620-00065 KS-065 Englewood, CO | 620-00065-10 | 2025 | Remerch/Floors Remodel | Under Construction | Minor Remodel | 166827 |
| 620-00073 Fort Collins, CO | 620-00073-11 | 2025 | Maint. Condenser Replacements | Completed | Minor Capital | 151123 |
| 620-00077 KS-077 Colorado Springs, CO | 620-00077-16 | 2024 | Starbucks Replacement | Completed | Minor Capital | 171522 |
| 620-00092 Commerce City, CO | 620-00092-12 | 2024 | MWIW | Completed | Minor Capital | 170449 |
| 620-00098 KS-098 Colorado Springs, CO | 620-00098-10 | 2023 | Maint. Fuel Paving | Open | Minor Capital | 161471 |
| 620-00102 KS-102 Longmont, CO | 620-00102-12 | 2024 | Starbucks Replacement | Completed | Minor Capital | 167793 |
| 620-00121 KS-121 Arvada, CO | 620-00121-11 | 2025 | Starbucks | Completed | Minor Capital | 172483 |
| 620-00126 Parker, CO | 620-00126-15 | — | Available | Conceptual | Minor Capital | 185526 |
| 620-00128 KS-128 Aurora, CO | 620-00128-18 | 2024 | Starbucks Replacement | Open | Minor Capital | 167796 |
| 620-00131 KS-131 Littleton, CO | 620-00131-10 | 2027 | WIW | Due Diligence / Estimating | Within-the-Walls Remodel | 185822 |
| 620-00133 KS-133 Colorado Springs, CO | 620-00133-16 | 2025 | WIW | Open | Within-the-Walls Remodel | 162282 |
| 620-00152 KS-152 Lone Tree, CO | 620-00152-01 | 2027 | New Store | Under Construction | New Store-Net New | 131317 |
| 620-00401 CM-401 Grand Junction, CO | 620-00401-12 | 2025 | Starbucks Replacement | Completed | Minor Capital | 167797 |
| 620-00421 CM-421 Durango, CO | 620-00421-09 | 2024 | Starbucks Reclad | Completed | Minor Capital | 172116 |
| 620-00425 CM-425 Grand Junction, CO | 620-00425-10 | 2026 | WIW | Construction Planning | Within-the-Walls Remodel | 165064 |
| 620-00431 CM-431 Woodland Park, CO | 620-00431-08 | 2026 | Decor with Remerch | Construction Documents | Minor Remodel | 153212 |
| 620-00445 CM-445 Pagosa Springs, CO | 620-00445-07 | 2025 | Decor | Completed | Minor Capital | 162979 |
| 620-00445 CM-445 Pagosa Springs, CO | 620-00445-08 | 2025 | MC Starbucks | Completed | Minor Capital | 185527 |

### Phase Values Observed (full lifecycle)

| Phase | Count (combined) | Lifecycle Position |
|---|---|---|
| Conceptual | 3 | Early |
| Due Diligence / Estimating | 1 | Early |
| Final Planning | 2 | Planning |
| Construction Documents | 1 | Planning |
| Construction Planning | 2 | Planning |
| Bidding | 2 | Procurement |
| Under Construction | 3 | Execution |
| Open | 4 | Post-construction |
| Completed | 14 | Closed |

### Role Values Observed

- `FE Project Manager` (most common)
- `FE Project Manager 2` (secondary PM role)
- `Maintenance Engineer`

### Store Prefix Patterns

- `KS-xxx` = King Soopers stores
- `CM-xxx` = City Market stores (same division, different brand)

---

## DOM Selectors for Parsing

```
Container:
  Find div.TITLE containing text "Current Projects"
  → parent .WEBPART
  → child .WP_BODYCONTAINER
  → table.WP_DATATABLE

Store header rows:
  tr > td[colspan="3"] with bold/underline text
  → text().trim() → parse: "{storeNumber} {storeName}, {location} Kroger"

Project detail rows:
  tr > td containing a[href*="ProjectOverviewView"]
  → link href → extract idProject from query param
  → link text → parse: "{projNum} {year} {desc}, {phase}, {type}"
  → text after </a> → parse: "Role: {role}"
```

### Parsing Notes

- Store header and project detail rows **alternate** but are NOT nested — they're sibling `<tr>` elements in the same flat table
- A store can have **multiple** project rows under it (e.g., KS-020 has 2, KS-024 has 2, CM-445 has 2)
- The store header has `colspan="3"` — that's the distinguishing selector
- Project detail rows have 3 `<td>` elements: spacer, content (with link + role), and sometimes empty
- The `idProject` value in the link href is the **SiteFolio project ID** — this is the key for fetching all other project pages (Overview, Schedule, Team, Budget, etc.)
- Some link text contains **embedded newlines** (`\n`) mid-description (e.g., "2025 Starbucks\n, Completed"). The parser must strip/normalize whitespace before splitting.

---

## URL Pattern

```
/Kroger/ViewContactProjects.sf?idContact={contactId}&idBusiness={businessId}
```

Works for **any** contact. Swapping `idContact` shows that person's full project list — including completed projects. This means we can enumerate projects for any PM, CM, or team member, and access historical data by querying coworkers' project lists.

---

## What's Useful Here

### High Value
1. **Complete project list (active + completed)** — This page lists ALL projects a person is assigned to, across all phases including "Completed." This is the primary source for both current workload and project history.
2. **SF Project IDs** — The `idProject` values are the keys for fetching Overview, Schedule, Team, and Budget pages for each project.
3. **Project type and phase** — Extracted directly from link text. Tells us what kind of project it is and where it is in its lifecycle.
4. **Store info** — Store number, name, city/state from the header rows. This is the physical store location.
5. **Role** — Confirms the person's role on each project (FE Project Manager, FE Project Manager 2, Maintenance Engineer).

### Medium Value
6. **Historical/completed project access** — By fetching this page for coworkers' `contactId` values, we get SF project IDs for completed projects. We can then fetch their Overview, Schedule, and Budget pages to build a historical comparison database (durations, budgets, team compositions from past projects).
7. **Multi-contact querying** — By fetching this page for different `contactId` values, we can build a complete mapping of who's assigned to what across the division.

---

## Relationships to Other Pages

| From this page... | To... | How |
|---|---|---|
| Each project link | `ProjectOverviewView.sf?idProject={id}` | Click project → Overview page (next to analyze) |
| Contact "General" tab | `ViewContactInformation.sf?idContact={id}` | Back to contact profile (Page 1) |

**This page is the bridge between "who is this person" (Page 1) and "what does each project look like" (subsequent pages).**

---

## Notes

- The "Current Projects" title is misleading — it includes completed projects, not just active ones. The coworker's list shows 14 completed projects alongside 13 active ones.
- The page structure is simple — a single flat table, no lazy loading, no ASMX calls. All data is fully server-rendered in the initial HTML.
- The link text packs a lot of info into one string. Parsing requires splitting on commas and spaces, but the pattern is consistent across all rows.
- Some link text contains embedded newlines (`\n`) in the middle of descriptions. The parser must strip/normalize whitespace.
- A store can have multiple project rows — the parser must track which store header a project falls under.
- By fetching this page for multiple `contactId` values (other PMs, CMs), we can build a historical dataset of completed projects with their SF IDs, enabling us to pull Overview/Schedule/Budget data from completed projects for comparison and benchmarking.
- Year range observed: 2023–2028 across both lists. Multiple years of history accessible from a single page fetch.

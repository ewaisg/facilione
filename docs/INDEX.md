# FaciliOne — Project Documentation Index

**Location in repo:** `docs/`

All AI agents must reference these documents. This is the single source of truth for what to build, what data is available, and how to extract it.

---

## Folder Structure

```
docs/
├── INDEX.md                          ← You are here
├── agents/
│   └── AGENT-DEFINITIONS.md          ← 7 agent roles, file ownership, rules
├── architecture/
│   ├── APP-MODULE-TREE.md            ← Canonical module/route/component tree
│   ├── BUILD-PLAN.md                 ← 10-phase build plan with task checklists
│   ├── MASTER-DATA-INVENTORY.md      ← All data domains, 29 endpoints, ID mappings
│   └── APP-BRAINSTORM-SCRATCHPAD.md  ← Feature requirements, workflows, tech stack
└── pages/
    ├── PAGE-01-CONTACT-PROFILE.md        ← Contact name, title, email, vCard endpoint
    ├── PAGE-02-PROJECTS-LIST.md          ← All projects per contact, SF project IDs
    ├── PAGE-03-PROJECT-OVERVIEW.md       ← Address, comments, team, milestones, photos
    ├── PAGE-04-SCHEDULE.md               ← 53 milestones, 4 date columns, phase bn IDs
    ├── PAGE-05-PROJECT-DIRECTORY.md      ← AJAX team directory, 11 categories
    ├── PAGE-06-REQUESTS-ASI.md           ← ASMX search endpoint, 2 statuses
    ├── PAGE-07-REQUESTS-PR.md            ← ASMX search endpoint, 3 statuses
    ├── PAGE-08-REQUESTS-RFI.md           ← ASMX search endpoint, 4 statuses
    ├── PAGE-09-BUDGET.md                 ← Hierarchical line items, versions, 3 exports
    ├── PAGE-10-CONTRACTS.md              ← SOV table, attachments endpoint
    ├── PAGE-11-BIDDING.md                ← Bid packages, Detail Analysis
    ├── PAGE-12-FILES-TEXT-DOCUMENTS.md   ← Folder tree, 7+ ASMX methods, uploads
    ├── PAGE-13-CLASSIFICATION.md         ← CA numbers, metadata, 30+ custom fields
    ├── PAGE-14-DESIGN-ATTRIBUTES.md      ← Building areas, fuel specs, construction methods
    ├── PAGE-15-CONSTRUCTION-STATUS-REPORT.md ← 58 active projects bulk XLSX download
    └── PAGE-16-AUDIT-REPORT.md           ← 229 projects completeness audit XLSX
```

---

## Quick Reference for Agents

| I need to...                                | Read this                          |
|---------------------------------------------|------------------------------------|
| Know what modules/routes to build           | `architecture/APP-MODULE-TREE.md`  |
| Know what phase to work on next             | `architecture/BUILD-PLAN.md`       |
| Find an API endpoint or data field          | `architecture/MASTER-DATA-INVENTORY.md` |
| Understand a feature requirement            | `architecture/APP-BRAINSTORM-SCRATCHPAD.md` |
| Know which files I own and my rules         | `agents/AGENT-DEFINITIONS.md`      |
| Parse a specific SiteFolio page             | `pages/PAGE-{NN}-*.md`            |
| Build the project list / dashboard          | `pages/PAGE-15-*` + `pages/PAGE-16-*` |
| Build the bid review feature                | `pages/PAGE-11-*` + `architecture/APP-BRAINSTORM-SCRATCHPAD.md` |
| Build schedule views                        | `pages/PAGE-04-*`                  |
| Build budget views                          | `pages/PAGE-09-*`                  |
| Wire up SiteFolio API calls                 | `architecture/MASTER-DATA-INVENTORY.md` (Section 2) |

---

## SiteFolio Constants (for quick reference)

```
Base URL:        https://www.sitefolio.net
Enterprise ID:   8252 (Kroger)
Team ID:         1077
Team Page Group: 22
Member ID:       83709 (Gheiath Ewais)
```

---

## Tech Stack

| Layer       | Choice                        |
|-------------|-------------------------------|
| Framework   | Next.js 15 (App Router)       |
| UI          | shadcn/ui + Tailwind CSS v4   |
| Auth / DB   | Firebase (Auth, Firestore, Storage) |
| Hosting     | Vercel                        |
| AI          | Anthropic Claude API          |
| SiteFolio   | Playwright auth → Firestore cookies → Vercel proxy |

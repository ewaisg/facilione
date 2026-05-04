# FaciliOne App — Module Tree

**Version:** 1.0 (April 13, 2026)
**Stack:** Next.js (App Router) + shadcn/ui + Tailwind v4 + Firebase + Vercel + Claude API

---

## Global Layout

```
┌─────────────────────────────────────────────────────────────┐
│  TOP BAR                                                    │
│  [☰ Mobile Toggle]  [App Logo / Name]     [🔔 Alerts] [👤] │
│                                            badge    Avatar  │
│                                                    + Name   │
├────────┬────────────────────────────────────────────────────┤
│ SIDE   │                                                    │
│ NAV    │  MAIN CONTENT AREA                                 │
│        │                                                    │
│ 📊 Da… │  (Rendered based on active route)                  │
│ 📁 Pr… │                                                    │
│ 📈 Re… │                                                    │
│ 📚 Re… │                                                    │
│ 🤖 Co… │                                                    │
│        │                                                    │
│        │                                                    │
│        │                                                    │
│ ⚙️ Se… │                                                    │
│(bottom)│                                                    │
├────────┴────────────────────────────────────────────────────┤
│  [💬 Copilot Floating Button — always visible, bottom-right]│
└─────────────────────────────────────────────────────────────┘
```

**Responsive:** Side nav collapses to hamburger on mobile. Copilot floating button persists on all breakpoints.

**Top Bar Elements:**
- Left: App logo/name (clickable → Dashboard)
- Right: Notification bell (badge count for alerts), Profile avatar + name (click → dropdown: Profile, Settings, Logout)

---

## Module Tree

```
FaciliOne
│
├── 1. Dashboard (/dashboard)
│   ├── 1.1 Portfolio Summary
│   │   ├── Project counts by phase (horizontal bar or pipeline visual)
│   │   ├── Filter chips: by project type (NS, WIW, MC, ER, FC, F&D)
│   │   └── Total active projects, total budget, total under construction
│   │
│   ├── 1.2 My Projects (cards or compact table)
│   │   ├── Each card: project #, store name, phase badge, next milestone + date
│   │   ├── Days until next gate (color-coded: green/yellow/red)
│   │   └── Click → navigates to Projects > Detail
│   │
│   ├── 1.3 Alerts & Action Items
│   │   ├── Overdue milestones (projected date < today, no actual date)
│   │   ├── Upcoming deadlines (bid close dates, permit deadlines)
│   │   ├── Missing SiteFolio data flags (from Audit Report)
│   │   ├── Pending RFIs past response deadline
│   │   └── Badge count feeds Top Bar notification bell
│   │
│   ├── 1.4 Schedule Variance
│   │   ├── Heatmap or ranked list: projects with largest baseline-to-projected drift
│   │   └── Click any project → Projects > Detail > Schedule
│   │
│   └── 1.5 Data Freshness
│       ├── Last SiteFolio sync timestamp
│       ├── Last report download timestamp
│       └── Manual refresh button
│
├── 2. Projects (/projects)
│   ├── 2.1 Project List (/projects)
│   │   ├── Table view (shadcn DataTable): sortable, filterable, searchable
│   │   ├── Columns: Project #, Store, City, Type, Phase, PM, GC, Size, Opening Date
│   │   ├── Filters: project type, phase, PM, year, status
│   │   ├── Search: by project #, store name, city
│   │   ├── Data source: Construction Status Report (P15) + Audit Report (P16)
│   │   └── Row click → Project Detail
│   │
│   ├── 2.2 Project Detail (/projects/[id])
│   │   ├── Header: Project # + Store name + City + Phase badge + Type badge
│   │   │
│   │   ├── 2.2.1 Overview (default tab)
│   │   │   ├── Address + Google Maps link
│   │   │   ├── Project status / current phase
│   │   │   ├── Key team contacts (PM, GC PM, Architect — summary)
│   │   │   ├── Latest general comment
│   │   │   ├── Upcoming milestones (next 5–7)
│   │   │   ├── CA Numbers + Amounts (Land/Site/Building/Fixturing/Equipment)
│   │   │   ├── Quick stats: size, décor, building type
│   │   │   └── Data source: P3 (Overview) + P13 (Classification) + P15 (Status Report)
│   │   │
│   │   ├── 2.2.2 Schedule
│   │   │   ├── Milestone table: 4-date columns (Baseline, Projected, Proj Alt, Actual)
│   │   │   ├── Phase grouping with expand/collapse
│   │   │   ├── Variance highlighting (color-coded: on track / slipping / overdue)
│   │   │   ├── Completion % per milestone
│   │   │   ├── Milestone notes (expandable)
│   │   │   ├── Gantt-style timeline visual (optional)
│   │   │   └── Data source: P4 (Schedule)
│   │   │
│   │   ├── 2.2.3 Budget
│   │   │   ├── Hierarchical line items (CSI divisions, expandable tree)
│   │   │   ├── Version selector (Import → Under Dev → Commitment → Reconcile → Publish)
│   │   │   ├── Budget-to-Actuals comparison view
│   │   │   ├── Version history timeline
│   │   │   ├── Export buttons (Versions XLSX, Actuals XLSX, Baseline XLSX)
│   │   │   └── Data source: P9 (Budget)
│   │   │
│   │   ├── 2.2.4 Bidding
│   │   │   ├── Bid package list (number, status, name, due date)
│   │   │   ├── Bid package detail: scope, participants, bid events
│   │   │   ├── Bid analysis: GC comparison table (base bid, exclusions, rank)
│   │   │   ├── Detail Analysis: CSI line-item SOV per GC
│   │   │   ├── AI Bid Review integration (one-click analysis from Copilot)
│   │   │   └── Data source: P11 (Bidding) + bid page HTML tabs
│   │   │
│   │   ├── 2.2.5 Contracts
│   │   │   ├── Contract list with SOV summary
│   │   │   ├── Per contract: sum, approved changes, % complete, retainage
│   │   │   ├── Contract attachments download
│   │   │   └── Data source: P10 (Contracts)
│   │   │
│   │   ├── 2.2.6 Requests
│   │   │   ├── Sub-tabs: ASI | PR | RFI
│   │   │   ├── Each: searchable list with status filters
│   │   │   ├── ASI statuses: Issued, Voided
│   │   │   ├── PR statuses: Not Issued, Issued, Void
│   │   │   ├── RFI statuses: Submitted, Under Review, Final, Under Clarification
│   │   │   └── Data source: P6 (ASI), P7 (PR), P8 (RFI)
│   │   │
│   │   ├── 2.2.7 Documents
│   │   │   ├── Folder tree browser (lazy-loaded)
│   │   │   ├── File list per folder with download links
│   │   │   ├── File search across project
│   │   │   ├── Markup viewer link (25+ file types)
│   │   │   └── Data source: P12 (Files)
│   │   │
│   │   ├── 2.2.8 Team
│   │   │   ├── Directory by category (Owner, Consultant, Contractor, Sub, etc.)
│   │   │   ├── Contact cards: name, role, company, phone, email
│   │   │   ├── Click email → compose in Copilot or mail client
│   │   │   └── Data source: P5 (Directory) + P3 (Overview team summary)
│   │   │
│   │   └── 2.2.9 Photos
│   │       ├── Library browser (grouped by upload date/library name)
│   │       ├── Thumbnail grid view
│   │       ├── Photo count per library
│   │       └── Data source: P3 (PhotoLibrary ASMX)
│   │
│   ├── 2.3 Project Comparison (/projects/compare)
│   │   ├── Select 2+ projects side-by-side
│   │   ├── Compare: schedule milestones, budget totals, team size
│   │   └── Data source: P4, P9, P15
│   │
│   └── 2.4 Portfolio Timeline (/projects/timeline)
│       ├── Multi-project Gantt: key milestones across all active projects
│       ├── Filter by type, PM, year
│       └── Data source: P15 (Construction Status Report)
│
├── 3. Reports (/reports)
│   ├── 3.1 Division Status (/reports/division-status)
│   │   ├── Interactive table from Construction Status Report (P15)
│   │   ├── Filterable by project type, phase, PM, year
│   │   ├── Sortable columns
│   │   ├── Section views: New Store, Expansion, Interior Remodel, Fuel
│   │   ├── Refresh button (re-download from SiteFolio)
│   │   └── Export: XLSX, PDF
│   │
│   ├── 3.2 Data Completeness (/reports/completeness)
│   │   ├── Dashboard from Audit Report (P16)
│   │   ├── Completeness score per project (% of X checks filled)
│   │   ├── Heatmap: which SiteFolio sections are most neglected
│   │   ├── Filter by PM, project type
│   │   └── Drill-down: click project → see which specific fields are missing
│   │
│   ├── 3.3 SiteFolio Reports (/reports/sitefolio)
│   │   ├── Direct download links for native SiteFolio reports:
│   │   │   ├── Project Update Report (PUR) — per project
│   │   │   ├── Change Order Log — per project (PDF/XLSX)
│   │   │   ├── Project Directory Report — per project (PDF/XLSX)
│   │   │   ├── Project Notification History — per project (XLSX)
│   │   │   ├── GC Bidder for eSourcing — per project (XLSM)
│   │   │   └── Bid Package Detail Analysis — per bid package (XLSM)
│   │   ├── Project selector dropdown to generate links
│   │   └── Data source: report URL patterns from P3, P5, P9, P10, P11
│   │
│   └── 3.4 Custom Reports (/reports/custom)
│       ├── AI-generated analysis (powered by Copilot):
│       │   ├── Schedule variance analysis across portfolio
│       │   ├── Budget trend analysis
│       │   ├── PM workload distribution
│       │   └── Historical comparison (completed projects benchmark)
│       └── Export: XLSX, PDF
│
├── 4. Resources (/resources)
│   ├── 4.1 Knowledge Base (/resources/knowledge-base)
│   │   ├── SOPs & PM Guides (the docs we built — all 5 project types)
│   │   ├── Interactive flowcharts (HTML)
│   │   ├── Categorized by project type: NS, WIW, ER, FC, MC, F&D
│   │   ├── Searchable
│   │   └── Versioned (track updates)
│   │
│   ├── 4.2 Procedures (/resources/procedures)
│   │   ├── Bid review meeting procedure
│   │   ├── Contract routing process
│   │   ├── RFI/ASI/PR workflow
│   │   ├── Weekly status update process
│   │   └── PM onboarding checklist
│   │
│   ├── 4.3 System Guides (/resources/system-guides)
│   │   ├── SiteFolio transaction walkthroughs
│   │   ├── Coupa transaction walkthroughs
│   │   ├── Oracle / KAM module walkthroughs
│   │   └── Bluebeam Revu guides
│   │
│   ├── 4.4 Templates (/resources/templates)
│   │   ├── Email templates:
│   │   │   ├── Bid rejection letter
│   │   │   ├── Round 2 notification (with scope questions)
│   │   │   ├── RFI response
│   │   │   ├── Status update
│   │   │   └── Meeting request
│   │   ├── Document templates:
│   │   │   ├── Bid review prep XLSX
│   │   │   ├── Per-GC PPTX (Bernard's 7-slide template)
│   │   │   └── Meeting agenda
│   │   └── Checklists:
│   │       ├── Pre-bid meeting checklist
│   │       ├── Construction start checklist
│   │       └── Project closeout checklist
│   │
│   └── 4.5 Contacts Directory (/resources/contacts)
│       ├── Searchable directory of all SiteFolio contacts
│       ├── Filter by company, role, project
│       ├── Contact card: name, title, company, phone, email
│       ├── vCard export
│       └── Data source: P1 (Contact Profile) + P5 (Directory)
│
├── 5. Copilot (/copilot)
│   │
│   │   ACCESS MODES:
│   │   ├── Full-page: /copilot route (side nav) — complex multi-step tasks
│   │   └── Floating panel: slide-over drawer from any page (persistent button)
│   │
│   ├── 5.1 Chat Interface
│   │   ├── Message input with paste support (emails, context)
│   │   ├── Conversation history (per session)
│   │   ├── Suggested prompts / quick actions
│   │   └── Output: text, tables, downloadable files (XLSX, PPTX, PDF)
│   │
│   ├── 5.2 Bid Review Assistant
│   │   ├── Input: paste bid notification email or select project + bid package
│   │   ├── Actions:
│   │   │   ├── Fetch SOV data from SiteFolio Bidding page
│   │   │   ├── Analyze: missing scope, extra scope, variances, duration, alternates
│   │   │   ├── Generate bid review prep XLSX
│   │   │   └── Generate per-GC PPTX (slides 4 & 5 auto-populated)
│   │   ├── Post-meeting:
│   │   │   ├── Input: paste Bernard's notes email
│   │   │   ├── Generate rejection letters (per non-selected GC)
│   │   │   ├── Generate Round 2 notification (with scope questions + areas to improve)
│   │   │   └── Draft review email to CM before sending
│   │   └── Data source: P11 (Bidding), P12 (Files), P5 (Team contacts)
│   │
│   ├── 5.3 Email Drafter
│   │   ├── Bid rejection letters
│   │   ├── Round 2 notifications
│   │   ├── RFI / ASI / PR responses
│   │   ├── Status update emails
│   │   ├── Meeting requests
│   │   └── Uses templates from Resources + project context from SiteFolio
│   │
│   ├── 5.4 Schedule Analyzer
│   │   ├── "Show me projects at risk"
│   │   ├── "What's the variance on KS-028?"
│   │   ├── "Which projects are behind on permits?"
│   │   └── Data source: P4 (Schedule), P15 (Status Report)
│   │
│   ├── 5.5 Meeting Prep
│   │   ├── "Prep me for the KS-012 bid review"
│   │   ├── "What do I need for the biweekly on KS-164?"
│   │   ├── Pulls: schedule, budget, comments, team, open RFIs, recent photos
│   │   └── Data source: all project-level pages (P3–P14)
│   │
│   ├── 5.6 Project Briefing
│   │   ├── "Tell me everything about project 620-00164-01"
│   │   ├── Full project summary: status, timeline, team, budget, open items
│   │   ├── Useful for: PM onboarding, handoff prep, executive briefings
│   │   └── Data source: all project-level pages + P15 Status Report
│   │
│   └── 5.7 SiteFolio Navigator
│       ├── "Find the trade proposals for KS-012"
│       ├── "Download the bid report for 620-00164-01"
│       ├── Navigates to correct SiteFolio folder/page, provides direct links
│       └── Data source: P12 (Files), P11 (Bidding)
│
└── 6. Settings (/settings) — pinned to bottom of side nav
    ├── 6.1 Profile (/settings/profile)
    │   ├── Name, email, role, title
    │   ├── Avatar upload
    │   ├── Notification preferences (email, in-app)
    │   └── PM initials mapping (for report data matching)
    │
    ├── 6.2 Projects Management (/settings/projects)
    │   ├── Quick Create (add project manually)
    │   ├── Import from SiteFolio (bulk sync)
    │   ├── Project archive/hide
    │   └── PM assignment overrides
    │
    ├── 6.3 SiteFolio Connection (/settings/sitefolio)
    │   ├── Auth status indicator (connected / expired / error)
    │   ├── Session health check
    │   ├── Manual re-auth trigger (Playwright flow)
    │   ├── Last successful auth timestamp
    │   └── Connection log
    │
    ├── 6.4 Data Sync (/settings/sync)
    │   ├── Auto-refresh schedule (daily, weekly, manual)
    │   ├── Manual sync trigger (per report or per project)
    │   ├── Sync history log (timestamp, status, records updated)
    │   └── Error log
    │
    ├── 6.5 App Preferences (/settings/preferences)
    │   ├── Theme: light (default) / dark
    │   ├── Default landing page
    │   ├── Table density (compact / comfortable)
    │   ├── Date format (MM/DD/YYYY default)
    │   └── Sidebar collapsed/expanded default
    │
    └── 6.6 AI Settings (/settings/ai)
        ├── Claude API key management
        ├── Model preference (Sonnet / Opus)
        ├── Copilot behavior: response length, formality, auto-suggestions on/off
        └── Token usage tracking
```

---

## Data Source Mapping

| Module | Primary Data Source | Refresh Strategy |
|---|---|---|
| Dashboard | P15 (Status Report) + P16 (Audit) | Auto-download on schedule |
| Projects > List | P15 + P16 | Auto-download on schedule |
| Projects > Detail | P3–P14 (per-project pages) | On-demand when user opens project |
| Reports > Division | P15 (Status Report XLSX) | On-demand + scheduled |
| Reports > Completeness | P16 (Audit Report XLS) | On-demand + scheduled |
| Reports > SiteFolio | Direct download URLs | On-demand per click |
| Resources | Static files (Firebase Storage) | Manual upload |
| Copilot | All sources (P1–P16) + Claude API | Real-time per query |
| Settings | Firebase Auth + Firestore | Real-time |

---

## Route Structure (Next.js App Router)

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── layout.tsx
├── (app)/
│   ├── layout.tsx              ← Side nav + Top bar + Copilot floating button
│   ├── dashboard/page.tsx
│   ├── projects/
│   │   ├── page.tsx            ← Project list
│   │   ├── compare/page.tsx    ← Comparison view
│   │   ├── timeline/page.tsx   ← Portfolio timeline
│   │   └── [id]/
│   │       ├── page.tsx        ← Project detail (tabbed)
│   │       └── layout.tsx
│   ├── reports/
│   │   ├── page.tsx            ← Reports hub
│   │   ├── division-status/page.tsx
│   │   ├── completeness/page.tsx
│   │   ├── sitefolio/page.tsx
│   │   └── custom/page.tsx
│   ├── resources/
│   │   ├── page.tsx            ← Resources hub
│   │   ├── knowledge-base/page.tsx
│   │   ├── procedures/page.tsx
│   │   ├── system-guides/page.tsx
│   │   ├── templates/page.tsx
│   │   └── contacts/page.tsx
│   ├── copilot/page.tsx        ← Full-page copilot
│   └── settings/
│       ├── page.tsx            ← Settings hub
│       ├── profile/page.tsx
│       ├── projects/page.tsx
│       ├── sitefolio/page.tsx
│       ├── sync/page.tsx
│       ├── preferences/page.tsx
│       └── ai/page.tsx
└── api/
    ├── sitefolio/              ← Proxy routes for SiteFolio calls
    ├── reports/                ← Report download + parse routes
    ├── copilot/                ← Claude API routes
    └── sync/                   ← Background sync triggers
```

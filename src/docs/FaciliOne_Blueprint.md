# FaciliOne — Blueprint v3.3
**Comprehensive Platform Plan · Revised Navigation · Smart Tools · Full Automation · Customizable**

> **Status:** Phase 1 complete and deployed. FaciliTools migration (Steps 1–4) complete and deployed. Admin panel and settings deployed. Phase 2 ready to start.
> Works alongside Oracle · Coupa · SiteFolio — not instead of them.

<!-- ============================================================
     CHANGE LOG — v3.2 → v3.3 (March 27, 2026)
     ============================================================

     All changes from v3.2 are marked inline with:
       [v3.3 ADDED]    — New content added
       [v3.3 UPDATED]  — Existing content modified
       [v3.3 MOVED]    — Content relocated from future phase to current

     SUMMARY OF CHANGES:
     1. Section 1 — Added FaciliTools migration context
     2. Section 9 — Added mermaid, exceljs, xlsx to Tech Stack
     3. Section 10 — Updated folder structure with all new files
     4. Section 11 — Added /estimates, /kb/sops, /kb/flowcharts,
                      /userPreferences collections; added F&D to ProjectType
     5. Section 12 — Phase 1 notes expanded; new "Phase 1.5" section for
                      FaciliTools migration + admin/settings/performance work
     6. Section 13 — Migration tasks tracker added; admin/settings tasks added;
                      Phase 4 ST-01 Estimator moved to complete
     7. Section 15 — Open items O-01 through O-05 status updated
     ============================================================ -->

---

## Locked-In Decisions

| # | Decision | Answer |
|---|---|---|
| P-01 | Repo | **New GitHub repo — clean slate** |
| P-02 | Users | **Multi-user — full Facility Engineering Division team** |
| P-02 | Visibility | PMs → assigned projects · CMs → all managed projects · Directors/RDs → read-only analytics |
| P-03 | Auth | **Firebase email/password only** — Admin creates users, no self-signup |
| P-03 | Login UI | Login + Forgot Password only — no signup visible |
| P-04 | Oracle reports | KAM PA report catalog confirmed (see Section 7) |
| P-05 | Coupa reports | **Deferred — not a priority for initial launch** |
| P-06 | Project naming | TBD — to be confirmed (O-01) |
| P-11 | App name | **"FaciliOne" placeholder** — fully customizable via Admin → Branding |
| P-12 | Notifications | **In-app only** for initial launch |
| P-13 | Domain | **Vercel default URL** for now |
| P-14 | FaciliTools deployment | **Separate Vercel project** — FaciliTools stays at facilitools.vercel.app, FaciliOne at facilione.vercel.app | <!-- [v3.3 ADDED] -->
| P-15 | Project types | **6 types: NS, ER, WIW, FC, MC, F&D** — F&D (Floor & Decor) uses MC schedule template via TEMPLATE_ALIAS | <!-- [v3.3 ADDED] -->
| P-16 | Estimates | **Per-project AND per-user** — Firestore schema has both userId and projectId fields | <!-- [v3.3 ADDED] -->
| P-17 | Estimate form | **Two selectors:** Project Type (6 types) + Funding Source (Division Funded, GO Merchandising, GO Retail Ops, Other) | <!-- [v3.3 ADDED] -->
| P-18 | localStorage migration | **Clean slate** — no existing localStorage data to migrate | <!-- [v3.3 ADDED] -->

> Non-negotiable: No references to "Colorado Division" or any specific division anywhere in the UI, data, labels, or defaults. FaciliOne is for the **entire Facility Engineering Division**.

---

## Table of Contents

1. [Platform Philosophy](#1-platform-philosophy)
2. [Navigation Architecture](#2-navigation-architecture)
3. [Authentication & User Management](#3-authentication--user-management)
4. [Module Specifications](#4-module-specifications)
5. [Smart Tools](#5-smart-tools)
6. [AI Copilot Layer](#6-ai-copilot-layer)
7. [Import / Export Engine](#7-import--export-engine)
8. [Customization Platform](#8-customization-platform)
9. [Technology Stack](#9-technology-stack)
10. [Folder / File Structure](#10-folder--file-structure)
11. [Firestore Data Model](#11-firestore-data-model)
12. [Build Phases & Steps](#12-build-phases--steps)
13. [Master To-Do Tracker](#13-master-to-do-tracker)
14. [Reference Files Inventory](#14-reference-files-inventory)
15. [Open Items](#15-open-items)

---

## 1. Platform Philosophy

FaciliOne is a **web-first, AI-powered PM command center** for Facility Engineering Project Managers and Construction Managers. It does not replace any enterprise system. It is where the PM prepares, plans, tracks, automates, and makes decisions — then exports outputs into those systems or imports their reports back for analysis.

<!-- [v3.3 ADDED] -->
### FaciliTools Migration Context

FaciliOne incorporates all functionality from the FaciliTools suite (5 standalone HTML tools previously at facilitools.vercel.app). The migration converted each tool into integrated Next.js routes with Firestore persistence, role-based access, and the FaciliOne app shell. FaciliTools remains deployed separately as a fallback but is no longer the primary toolset.

| FaciliTools Page | FaciliOne Route | Status |
|---|---|---|
| sop.html | /resources/sops | Deployed |
| flowcharts.html | /resources/flowcharts | Deployed |
| estimate.html | /smart-tools/estimator | Deployed |
| tracker.html | Merged into /projects/[id] Schedule tab | Deployed |
| index.html (hub) | Not migrated — sidebar nav replaces it | N/A |

### What FaciliOne owns
- All project planning, scheduling, and phase sequencing
- Budget building, tracking, and forecasting (analysis layer — not Oracle)
- Document management and AI-assisted review
- Meetings, agendas, minutes, and action item tracking
- Every structured task a PM does manually (estimates, bid comparisons, look-ahead schedules, pay app reviews, close-out kits, etc.)
- AI copilot grounded in SOPs, templates, and project data
- Knowledge Base: all SOPs, templates, forms, estimating guides, reference tables
- Historical project data for benchmarking and AI suggestions

### What stays in enterprise systems

| System | Stays There | FaciliOne Role |
|---|---|---|
| Oracle Cloud | Financial records, project accounting, asset register | Import Oracle reports → analyze in FaciliOne |
| Coupa | Requisitions, PO creation/approval, invoicing | Deferred — Coupa report import in later phase |
| SiteFolio | Official RFIs, submittals, COPs, document filing | Filing path reference + SOP guidance only |
| CARS / SharePoint | CA entry and formal approval routing | CA Prep Guide — preparation only, no routing |
| Capital Committee | Formal budget approvals | Checklist + readiness check only |

---

## 2. Navigation Architecture

### Top-Level Navigation (10 items)

| # | Nav Item | Type | Purpose |
|---|---|---|---|
| 1 | Dashboard | Universal | Portfolio overview, KPIs, alerts, action items |
| 2 | Projects | Universal | All project management — create, track, manage |
| 3 | Analytics | Universal | Budget/schedule analytics, historical benchmarks |
| 4 | Team | Universal | Directory, contacts, assignments, workload |
| 5 | Calendar | Universal | Portfolio-wide milestones, meetings, SWPPP, SPG |
| 6 | Copilot | AI | Full-page AI assistant with document Q&A |
| 7 | Smart Tools | FE + Universal | Automated structured tools for all PM tasks |
| 8 | Resources & KB | Universal + FE | SOPs, templates, forms, reference guides |
| 9 | Admin | Platform | Branding, nav builder, module config, users/roles |
| 10 | Settings | Universal | Profile, notifications, display, shortcuts |

All navigation items are user-customizable via Admin → Nav Builder — reorderable, renameable, hideable per role.

<!-- [v3.3 UPDATED] -->
**Deployed sub-navigation:**
- Resources & KB expands to show: SOP Reference, Flowcharts (when parent is active in sidebar)
- Smart Tools hub page links to: Estimator (live), plus placeholder cards for future tools

---

### Sub-Navigation Detail

#### 1. Dashboard
- Portfolio overview (all active projects at a glance)
- My active projects (filtered to logged-in PM)
- Upcoming gates (next 30 days across all projects)
- Open action items (aggregated from all meetings and tasks)
- Alert feed (smart alerts from automation engine)
- Recent imports (last Oracle file imported — date, file name, project link)

#### 2. Projects
- All projects (full list — filters: type, status, phase, store #, PM)
- By type (NS / ER / WIW / FC / MC / F&D tabs) <!-- [v3.3 UPDATED] added F&D -->
- + New project wizard

**Inside each project — horizontal tab bar:**

| Tab | FE-Specific | Visibility |
|---|---|---|
| Overview | No | All project types |
| Sequence & Gates | Yes | All project types |
| Schedule / Gantt | No | All project types |
| Budget & Financials | No | All project types |
| Documents | No | All project types |
| Meetings | No | All project types |
| Tasks | No | All project types |
| SWPPP / Compliance | Yes | NS, ER, FC only |
| Risks | No | All project types |
| Reports | No | All project types |

<!-- [v3.3 ADDED] -->
**Deployed in Schedule tab:** SiteFolio Schedule Panel — auto-calculated milestone dates using weeks-to-open model (NS/ER/WIW/FC) and day-offset model (MC/F&D), with actual date tracking and status indicators.

SPG Gate section inside Compliance tab: FC projects only.

#### 3. Analytics
- Portfolio summary, Budget vs. actual, Schedule health, Resource utilization, Vendor performance, Historical data, Export reports

#### 4. Team
- Team directory, Project assignments, Workload view, GC/vendor contacts, Stakeholder log, Display case contacts

#### 5. Calendar
- All events (portfolio-wide), Milestones/gates, Meetings scheduled, SWPPP inspections, SPG gate windows, Three-week look-ahead, Export to .ics

#### 6. Copilot
- Full-page chat, Document Q&A, SOP lookup, Draft communications, Proposals/suggestions, Session history

#### 7. Smart Tools
ST-01 Estimator · ST-02 Bid Comparison · ST-03 Plan Request Builder · ST-04 Meeting Builder · ST-05 Three-Week Look-Ahead · ST-06 Pay App Reviewer · ST-07 Change Order Log · ST-08 Close-Out Kit · ST-09 CA Prep Guide · ST-10 Display Case Order · ST-11 Procurement Planner · ST-12 IPECC Builder

#### 8. Resources & KB
SOP library · Schedule templates · Meeting templates · Forms & checklists · Estimating guides · Oracle reference (KAM PA reports, parent projects) · GC PO item numbers · Document standards · AI-powered search

<!-- [v3.3 UPDATED] -->
#### 9. Admin
**Deployed (4-tab layout):**
- **Users tab:** Create user (Firebase Admin SDK → temp password), list all users, edit role/name, delete user
- **Projects tab:** Quick-create form (minimal fields), "Create via Wizard" button linking to /projects/new, list all projects, edit details, delete project
- **Seed Data tab:** One-click buttons for POST /api/seed-sops and POST /api/seed-flowcharts
- **System tab:** Health check, Firestore index info

**Future:** Organization settings, Branding, Nav builder, Module config, Import/export hub, Data & history

<!-- [v3.3 UPDATED] -->
#### 10. Settings
**Deployed:** Profile display (name, email, role, org) + Change password form
**Future:** Notifications, Display preferences, Shortcuts

---

## 3. Authentication & User Management

### Auth Model (locked in — P-03)
- Firebase Auth with **Email/Password only**
- No Google SSO, no other providers
- No self-signup — users cannot register themselves
- No domain restrictions

### Login UI
- Login page: Email + Password + "Forgot password?" only
- No "Sign up" or "Create account" anywhere in the UI
- Password reset: Firebase sends reset email to user's address

### Admin User Creation Flow (Admin → Users)
1. Admin fills in: name, email, role (PM / CM / Director / Admin)
2. System calls Firebase Admin SDK → creates user in Firebase Auth
3. System generates temporary password
4. System creates user document in Firestore `/users/{uid}`
5. Admin sees temporary password (one-time display)
6. Admin shares temp password with new user out-of-band
7. New user logs in → prompted to set new password (force change on first login)

### Role-Based Access

| Role | Project Access | Capabilities |
|---|---|---|
| PM | Assigned projects only | All modules, Smart Tools, KB, Copilot |
| CM | All projects for managed PMs | All modules + PM workload view |
| Director / RD | All projects (read-only) | Dashboard, Analytics, Reports |
| Admin | All projects | Everything including Admin panel |

---

## 4. Module Specifications

### Dashboard
KPI cards: Active projects · Total committed budget · Gates due this week · % projects on schedule
Project health table: status pill, type badge, current phase, next gate, GO date
Upcoming gates: 30-day lookahead · Open action items aggregated · Alert feed · Recent imports

<!-- [v3.3 UPDATED] -->
### Project Creation Wizard (5 steps)
1. Project type (NS / ER / WIW / FC / MC / F&D) — **F&D uses MC template via TEMPLATE_ALIAS**
2. Store number, name, address, city, state
3. Target GO date → all phase dates auto-calculated from template week offsets
4. Assign PM and CM · Oracle parent project · Initial budget estimate
5. Review and confirm → project created with full phase structure seeded

<!-- [v3.3 ADDED] -->
**Quick-create alternative (Admin panel):** Minimal fields (store#, name, city, state, type, budget, GO date) without full wizard flow. Available in Admin → Projects tab.

**Auto-seeding on creation:**
- All phases and milestones from correct XLS schedule template
- Phase target dates from GO date + week offsets
- Meeting schedule auto-created (pre-bid, pre-con, kickoff, weekly)
- Task list from SOP sequence checklist
- SWPPP flag for NS, ER, FC
- SPG gate schedule added to Calendar for FC
- Oracle parent project shown based on project type

### Schedule / Gantt
- Interactive Gantt — bars per phase, milestone diamonds
- Zoom: week / month / quarter
- Baseline vs. actual (yellow = 1–3 weeks behind, red = 3+ weeks)
- Week-offset reference column
- Custom milestones, drag-to-adjust, critical path highlight
- Export PDF or PNG
- Moving GO date recalculates all downstream dates

<!-- [v3.3 ADDED] -->
**SiteFolio Schedule Panel (deployed):** Displays auto-calculated SiteFolio milestone dates inside each project's Schedule tab. Two calculation models: weeks-to-open (NS/ER/WIW/FC — backward from GO date) and day-offset (MC/F&D — forward cascade from Project Identified). Actual dates can be entered per milestone. Status indicators: on-time, at-risk, overdue, complete.

### Budget & Financials
**Columns:** Description · Coupa Item # · Budget · Committed · Actual · Forecast · Variance
**Grouping:** Site Work / Building Leasehold / Fixtures / Direct Buy / Soft Costs / Other
**POC vs. Full PO Accrual (auto-set):**
- NS, ER: POC · WIW >$750K: POC · WIW ≤$750K: Full PO · MC: Full PO

**Calculated:** Variance · EAC · % spent
**Charts:** Budget vs. actual by category · Forecast trend
**Exports:** Excel matching Budget_Store_Project_Cost_by_Line_Item.xlsx · SOV · PDF

### Documents
- Upload all file types · Auto-tag by type · SiteFolio path reference per type
- Version history · Bulk ZIP download · Photo log + site photo PDF report
- AI Document Reviewer (upload PDF → ask questions in copilot)

### Meetings
**Types:** Pre-bid · Pre-construction · Project kickoff · Store kickoff · Weekly PM · Jobsite
- Create from template (auto-populate project fields)
- Agenda builder (drag-and-drop) · Minutes capture
- Inline action items (owner + due date) · Carry forward to next meeting
- Three-week look-ahead auto-added to jobsite/weekly meetings
- Export: Word (.docx) matching Kroger templates · PDF

### Tasks
- Personal + project task lists · Kanban (Backlog / In Progress / Done) · List view
- Auto-create from phase checklist · Recurring tasks · Weekly digest

### SWPPP / Compliance (NS, ER, FC only)
**NOI decision:** ≥1 acre disturbed or permit required → NOI required or not
**Inspection log fields:** Date · Inspector · Precipitation event · Conditions · Deficiencies · Corrective actions
**Auto-schedule:** 7-day rolling · After 0.25"+ precipitation · 28-day PM audit
**SPG Gates (FC only):**

| Gate | Week Offset |
|---|---|
| SPG Concept Review | Wk ~57 |
| SPG Prelim Site Plan Approval | Wk ~46 |
| SPG Final Approval | Wk ~34 |

**Exports:** SWPPP inspection log → Excel or PDF

### Risks
Fields: Title · Description · Category · Probability (1–5) · Impact (1–5) · Score (auto)
5x5 matrix visualization · Mitigation plan · Owner · Status: Open/Mitigating/Closed
Export to Excel or PDF

### Reports
Weekly status (AI-drafted) · Budget variance (post-import, AI-narrated) · Schedule deviation · Site photo report · Close-out package
Formats: PDF (branded) or Word (.docx)

---

## 5. Smart Tools

<!-- [v3.3 UPDATED] — ST-01 marked as DEPLOYED -->
### ST-01: Estimator — DEPLOYED
**Purpose:** Preliminary and final estimates — comparison or take-off method.
**Route:** /smart-tools/estimator
**Implementation:** Full React page with dynamic sections, Firestore persistence, ExcelJS export.
**Features deployed:**
- Project info header with Project Type selector (6 types) + Funding Source selector (4 options)
- 13 preset sections (Soft Costs, Contractor, 7 departments, Refrigeration, Equipment/Misc, Shipping/Freight)
- Dynamic add/remove rows per section, custom sections
- Contingency % calculation per section
- CSV/XLSX import into any section (Coupa export mapping preserved)
- ExcelJS formatted XLSX export (Summary sheet + detail sheet per section)
- Save to / Load from Firestore (per user, optionally linked to project)
- Real-time grand total with section breakdown summary card

**Comparison (future):** Pull 3 comparable projects from historical data, line-by-line comparison. AI suggests comparables.
**Take-off (future):** Import F1 CSV → estimate extension → line-item breakdown by department.
**Outputs:** `StorePreliminaryStandardEstimate.xlsx` · `StoreFinalStandardEstimate.xlsx`
**Source refs:** `New_Construction_Estimating_training.docx` · `NewConstruction_Estimating_comparison.docx` · `Creating_an_Estimate.pdf`

### ST-02: Bid Comparison
**Purpose:** Compare GC Trade Proposals across bidders.
**What it does:** Side-by-side line-item comparison with delta column · AI flags outlier bids · Best-value summary
**Outputs:** `StoreBidComparisonSOV.xlsx` · `StoreProjectCompSOV.xlsx`

### ST-03: Plan Request Builder
**Purpose:** Step-by-step guide for plan request submission.
**What it does:** Auto-fills store number (format-validated), PM, project type · SiteFolio filing path walkthrough · Required plan type checklist
**Output:** Form matching `Plan_Request_Form_ver_1.xls`
**Source refs:** `plan_request_form_step_by_step.docx` · Plan Request Form Examples

### ST-04: Meeting Builder
**Purpose:** Generate any meeting type fully auto-populated.
**Types:** Pre-bid · Pre-construction · Store kickoff · Weekly PM · Jobsite
**What it does:** Correct template selected · All project fields auto-filled · Three-week look-ahead added for weekly/jobsite · AI generates agenda from phase + open tasks
**Output:** Word (.docx) · PDF

### ST-05: Three-Week Look-Ahead
**Purpose:** Structured 3-week construction schedule (PM hands printed to GC at each jobsite meeting per SOP).
**What it does:** Week-by-week breakdown · Flags overdue items · Formats for printing · Links to meeting agenda
**Output:** Printable PDF · Embeds in weekly/jobsite meeting export

### ST-06: Pay Application Reviewer
**Purpose:** Structured checklist for reviewing GC monthly pay applications.
**Required items (per SOP from `generalConditions.pdf`):**
- Summary Page with signatures (Contractor, PM, CM)
- Detail Schedule of Values
- Affidavits and Lien Releases
- Refrigerant Management Form (if applicable)
- Construction Waste Report with manifests

**What it does:** Checklist interface · Flags missing items · Pay app history log · Running total vs. contract
**Output:** Pay app review record (PDF)

### ST-07: Change Order Log (COP / CO)
**Purpose:** Track all Change Order Proposals and Change Orders.
**Fields:** COP # · Description · Date submitted · GC cost · Approved cost · Status · SiteFolio ref · Notes
**KPIs:** COP priced within 2 weeks (alert if > 14 days) · Running CO total vs. contingency · % consumed
**Status values:** Submitted / Under Review / Approved / Rejected / Pending Info

### ST-08: Close-Out Kit
**Purpose:** Automate close-out checklist (within 3–4 periods of completion per `PM_Project_CloseOut.docx`).
**Required items:**
- Money Reviews completed
- All CAs identified and closed
- Receiving cleanup complete
- Oracle project set to complete
- As-built drawings in SiteFolio
- Warranties and O&M manuals filed
- Refrigerant Management docs filed (if applicable)
- Close-Out Request Form signed (PM and CM)
- Submitted to Cost Control Lead
- Receiving Audit Report filed (7-year retention)

**Output:** Close-out package ZIP · Close-Out Request Form PDF

### ST-09: CA Prep Guide
**Purpose:** Preparation walkthrough before CARS entry — no routing, advisory only.
**Routing rules shown:**
- Pre-Con ≤ $250K → Division President local
- Pre-Con > $250K → CARS required
- Any Supplemental → CARS regardless of amount
- Total > $2M → Capital Committee flag
- FC: SPG Final Approval must be confirmed before Capital Committee flag

**Source refs:** `Pre-construction_CA_Approvals_Required.docx` · `Equipment_Pre-Order_Capital_Appropriation__CA__Policy_pdf.docx`

### ST-10: Display Case Order Form
**Purpose:** Fillable refrigerated equipment order request form.
**Auto-populated:** Store number (format-validated) · Project type · PM name
**Contact routing:**
- King Soopers Western: Jill Vanfleet — jill.vanfleet@kroger.com — 513-562-5065
- Eastern: Brittnie Fitzgerald — brittnie.fitzgerald@kroger.com — 513-530-7894

> Warning displayed: **"Do NOT save the form before transmitting — attachments will detach"**

**Output:** Completed form PDF
**Source refs:** `Display_Case_Ordering_Procedure.docx` · `Display_Case_Ordering_ProcedureOct2025.pdf`

### ST-11: Procurement Planner
**Fields:** Item · Vendor · Lead time (weeks) · Required-on-site date · Order-by date (auto) · Status · PO # · Notes
**Flags:** Red if order-by < today and not ordered · Equipment Pre-Order CA if lead time > 6 months + cost < $750K + construction start within 12 months
**Source ref:** `Equipment_Pre-Order_Capital_Appropriation__CA__Policy_pdf.docx`

### ST-12: IPECC Builder
**Purpose:** Build and track IPECC capital submissions.
**Formats:** MC (KS136) · NS (KS189)
**What it does:** Import from IPECC example files · Manual entry · AI suggests line items from scope and historical data · Export Oracle-ready
**Source refs:** `IPECC_example.xlsx` · `IPECC_example_MC_KS136.xlsx` · `IPECC_example_NS_KS189.xlsx`

### ST-13: RFI & Submittal Tracker (inside project)
> SiteFolio is system of record. This is a local reference tracker only.
**Fields:** RFI # · Description · Submitted to · Response due · Actual response · Status · SiteFolio ref
**Alert:** Overdue response

---

## 6. AI Copilot Layer

Two modes: **Dedicated Copilot page** (full-screen) and **Inline panel** (right sidebar, always available).

**Non-negotiable rules:**
- Every process answer must cite source document and section
- No general construction knowledge — only uploaded SOPs, templates, and project data
- If no SOP covers the question: stop and say so, do not fabricate
- AI never approves, routes, or transacts — advisory only

### AI Feature 1: SOP Process Q&A
Ask any procedural question → cited answer from SOP Library.

### AI Feature 2: Next-Action Assistant
Current phase + completed steps + open tasks + gates → 3–5 prioritized actions with SOP references.

### AI Feature 3: Document Reviewer
Upload PDF (drawing, spec, geotech, permit) → ask questions. Cross-references against KB.

### AI Feature 4: Communication Drafter
Draft any project communication. Auto-fills all known fields. No placeholders — asks before drafting if info is missing. Output: text or Word (.docx).

### AI Feature 5: Historical Data Search & Proposals
Search historical project data for comparable projects. Outputs comparison table for Estimator tool.

### AI Feature 6: Budget Variance Analysis
Auto-triggered after any Oracle import. Scans for over-budget items, variances, uncommitted balances. Plain-language narrative with citations.

### AI Feature 7: Schedule Deviation Alerts
Compares actuals vs. template offsets. Flags float consumed, GO risk. Suggests recovery per SOP.

### AI Feature 8: Gate Compliance Check
"Am I ready for Phase 4?" → pass/fail per gate condition with specific gaps and SOP citations.

---

## 7. Import / Export Engine

### Oracle Reports (P-04 confirmed)
Priority reports — to be documented in KB as "favorites" for easy access:

| Report Name | FaciliOne Use |
|---|---|
| KAM PA Capital Estimation Extension | Estimator: estimate data |
| KAM PA CA Approved | CA Log: approved CA reference |
| KAM PA Capital Commitments | Budget: committed amounts |
| KAM PA Project Cost Details Report | Budget: actuals |
| KAM PA Oracle Projects Estimates and Actuals to Sitefolio Report | Budget: combined estimate/actual |
| KAM PA Commitment/Actual Details - Actuals | Budget: actuals detail |
| KAM PA CA Budget Changes Report by Line of Business | Analytics: budget changes |
| KAM PA CA Budget Changes Report for Project Manager | Budget: PM-level changes |
| KAM PA Project Variance | Analytics: variance |
| KAM PA Update Supplier Name on Items | Reference only |

Oracle Project catalog sections (documented in KB for PM exploration):
Dashboards · Project Budget · Project Cost · Project Financials · Project Plan · Project Performance Reporting · Project Resource Management · and more.

### Import Mapping

| Format | Source | Maps To |
|---|---|---|
| XLS/CSV | KAM PA Capital Commitments | Budget → committed column |
| XLS/CSV | KAM PA Project Cost Details | Budget → actuals |
| XLS/CSV | KAM PA Project Variance | Analytics → variance view |
| XLS/CSV | KAM PA Estimates and Actuals | Budget → combined view |
| XLS/CSV | KAM PA CA Approved | CA Log → approved reference |
| XLS | PAS FA Asset Register | Budget → actuals |
| XLS | MASK Liability Mismatch | Budget → flagged accrual items |
| XLS | Receiving Audit Report | Budget → receipt reconciliation |
| XLS | IPECC budget data | Budget → line item seed |
| CSV | F1 Fixture Plan | Estimator → take-off |
| XLS | GC Trade Proposal | Bid Comparison tool |
| XLS | Project schedule template | Project → phase auto-seed |
| PDF | Drawings, specs, geotech, permits | Documents → AI Q&A |
| JPG/PNG | Site photos | Documents → photo log |

> Coupa imports: Deferred per P-05.

**Import workflow:**
1. Select report type → upload file → preview with field mapping → confirm → write to Firestore → AI variance analysis triggered (financial imports) → import logged

### Export Mapping

| Format | Output | Matches |
|---|---|---|
| XLS | Budget line-item | `Budget_Store_Project_Cost_by_Line_Item.xlsx` |
| XLS | SOV | `StoreProjectCompSOV.xlsx` |
| XLS | Bid comparison SOV | `StoreBidComparisonSOV.xlsx` |
| XLS | Preliminary estimate | `StorePreliminaryStandardEstimate.xlsx` |
| XLS | Final estimate | `StoreFinalStandardEstimate.xlsx` |
| XLS | Project schedule | `[Type]_project_schedule_template.xls` |
| DOC | Meeting minutes | Kroger meeting templates |
| DOC | Close-out request form | `PM_Project_CloseOut.docx` format |
| PDF | Project status report | Branded, AI-drafted |
| PDF | Site photo report | Photos + captions by phase/date |
| PDF | SWPPP inspection log | Inspection record |
| PDF | Risk register | Standard format |
| ZIP | Close-out package | Budget + docs + photos + sign-offs |

---

## 8. Customization Platform

"FaciliOne" is a placeholder name. The entire app identity is configurable from Admin → Branding.

### 8A. Custom Branding
- Upload custom logo · Custom app name · Primary color picker · Custom favicon
- Custom footer on all exported documents · Custom division/team label (optional)

### 8B. Navigation Builder (Admin → Nav Builder)
- Reorder main nav by drag-and-drop · Rename any item · Hide/show per role
- Add custom sub-nav items · Assign icons · Apply per user or per org

### 8C. Module Config (Admin → Module Config)
- Enable/disable modules per project type
- Configure which project detail tabs show per type
- Add custom fields to project forms
- Create custom project types (beyond NS/ER/WIW/FC/MC/F&D) <!-- [v3.3 UPDATED] -->
- Configure which Smart Tools appear per project type
- Custom close-out checklist items · Custom alert rules

### 8D. Custom Forms
- Drag-and-drop field builder (text, number, date, dropdown, checkbox, conditional logic)
- Upload custom Excel template → app exports in that format
- Custom report templates

### 8E. User Roles & Permissions

| Role | Access |
|---|---|
| PM | All modules, Smart Tools, KB, Copilot — assigned projects only |
| CM | All modules + PM workload — all managed projects |
| Director / RD | Read-only: Dashboard, Analytics, Reports |
| Admin | Everything including Admin panel |

Custom roles with granular permissions per module.

### 8F. Preset Configurations
- **FE PM (single user):** Full FE module set, neutral defaults
- **FE Team (multi-user):** Shared portfolio, role-based access, team directory
- **Generic PM:** No FE modules, clean universal setup
- **Minimal:** Dashboard + Projects + Smart Tools only

---

## 9. Technology Stack

<!-- [v3.3 UPDATED] — added mermaid, exceljs, xlsx -->
### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15 (App Router) | Framework |
| React | 19 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Styling |
| shadcn/ui | Latest | Component library |
| Mermaid | ^10.9.1 | Flowchart rendering (project workflow diagrams) |
| Tanstack Query | v5 | Server state + caching |
| Recharts | Latest | Charts |
| react-beautiful-dnd | Latest | Drag-and-drop |

### Backend
| Technology | Purpose |
|---|---|
| Next.js API Routes | Endpoints, AI proxy, import/export |
| Node.js 20 LTS | Runtime |
| Firebase Admin SDK | Server-side Auth user creation, Firestore, Storage |
| Firebase Cloud Functions 2nd gen | Background jobs, automation triggers |

### Database & Storage
| Technology | Purpose |
|---|---|
| Firestore | Primary database — real-time, offline-capable |
| Firebase Storage | Documents, drawings, photos |

### Authentication (locked in — P-03)
| Technology | Purpose |
|---|---|
| Firebase Auth (Email/Password) | Email + password only |
| Firebase Admin SDK | Admin creates users server-side |
| Firestore security rules | Role-based data access |

### AI
| Technology | Purpose |
|---|---|
| Anthropic Claude API | Copilot, Q&A, drafting, analysis |
| claude-sonnet-4-5 | Primary model |
| Streaming responses | Real-time chat |
| PDF + image input | Document review |
| Tool use (JSON) | Structured AI outputs |
| RAG via Firestore | KB Q&A grounded in SOPs |

<!-- [v3.3 UPDATED] — added exceljs, xlsx -->
### Import / Export Libraries
| Library | Purpose |
|---|---|
| SheetJS (xlsx) | ^0.18.5 — Excel and CSV read/write (import) |
| ExcelJS | ^4.4.0 — Excel write with formatting (export) |
| jsPDF | PDF generation |
| docx | Word document generation |
| JSZip | Bundle packages |

### Deployment (locked in — P-01, P-13)
| Technology | Purpose |
|---|---|
| Vercel | Hosting, CI/CD, preview deployments |
| GitHub (new private repo: `facilione`) | Source control |
| Vercel Environment Variables | API keys, Firebase config |
| PWA | Installable, offline-capable |

### Notifications (locked in — P-12)
- Initial launch: In-app notification feed only
- Later phase: Browser push + email digest

---

## 10. Folder / File Structure

<!-- [v3.3 UPDATED] — reflects all deployed files -->
```
facilione/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx               # Login + Forgot Password only — no signup
│   │   ├── (app)/
│   │   │   ├── layout.tsx                 # Shell: sidebar + topbar + copilot panel [v3.3: skeleton loading]
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx               # [v3.3: cached user, simplified loading]
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx               # Role-filtered list [v3.3: F&D in filter bar]
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx           # Creation wizard [v3.3: F&D + TEMPLATE_ALIAS]
│   │   │   │   └── [id]/
│   │   │   │       ├── layout.tsx         # Project tab bar
│   │   │   │       └── page.tsx           # Overview [v3.3: + SfSchedulePanel in Schedule tab]
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx               # Stub
│   │   │   ├── team/
│   │   │   │   └── page.tsx               # Stub
│   │   │   ├── calendar/
│   │   │   │   └── page.tsx               # Stub
│   │   │   ├── copilot/
│   │   │   │   └── page.tsx               # Stub
│   │   │   ├── smart-tools/
│   │   │   │   ├── page.tsx               # [v3.3 NEW] Smart Tools hub
│   │   │   │   └── estimator/
│   │   │   │       └── page.tsx           # [v3.3 NEW] Full Estimator page
│   │   │   ├── resources/
│   │   │   │   ├── page.tsx               # [v3.3 NEW] Hub page with live links
│   │   │   │   ├── sops/
│   │   │   │   │   └── page.tsx           # [v3.3 NEW] Full SOP Reference page
│   │   │   │   └── flowcharts/
│   │   │   │       └── page.tsx           # [v3.3 NEW] Flowcharts page with pan/zoom
│   │   │   ├── admin/
│   │   │   │   └── page.tsx               # [v3.3 NEW] 4-tab admin (Users, Projects, Seed Data, System)
│   │   │   └── settings/
│   │   │       └── page.tsx               # [v3.3 NEW] Profile display + change password
│   │   └── api/
│   │       ├── admin/
│   │       │   ├── users/
│   │       │   │   ├── list/route.ts      # [v3.3 NEW] GET list all users
│   │       │   │   └── [uid]/route.ts     # [v3.3 NEW] PATCH + DELETE user
│   │       │   └── projects/
│   │       │       ├── list/route.ts      # [v3.3 NEW] GET list all projects
│   │       │       ├── create/route.ts    # [v3.3 NEW] POST quick-create project
│   │       │       └── [id]/route.ts      # [v3.3 NEW] PATCH + DELETE project
│   │       ├── seed-sops/route.ts         # [v3.3 NEW] Seed SOPs into Firestore
│   │       ├── seed-flowcharts/route.ts   # [v3.3 NEW] Seed flowcharts into Firestore
│   │       ├── seed-templates/route.ts    # Seed schedule templates
│   │       └── health/route.ts            # Health check
│   ├── components/
│   │   ├── layout/
│   │   │   └── sidebar.tsx                # [v3.3 UPDATED] Sub-nav for Resources
│   │   ├── schedule/
│   │   │   └── sf-schedule-panel.tsx       # [v3.3 NEW] SiteFolio schedule display component
│   │   └── ui/                            # shadcn/ui components
│   ├── lib/
│   │   ├── firebase/
│   │   │   ├── auth-context.tsx           # [v3.3 UPDATED] sessionStorage cache + background refresh
│   │   │   ├── estimates.ts               # [v3.3 NEW] Firestore CRUD for estimates
│   │   │   ├── firestore.ts              # Project CRUD, subscriptions
│   │   │   └── firebase-admin.ts         # Admin SDK config
│   │   ├── schedule/
│   │   │   ├── seed-phases.ts            # Phase seeding from templates
│   │   │   ├── sf-schedule.ts            # [v3.3 NEW] SiteFolio auto-calc engine
│   │   │   ├── get-template.ts           # Template loader
│   │   │   └── templates.json            # 5 parsed schedule templates
│   │   └── utils/
│   │       └── index.ts                  # [v3.3 UPDATED] F&D color added
│   ├── types/
│   │   ├── project.ts                    # [v3.3 UPDATED] F&D in ProjectType union
│   │   ├── sop.ts                        # [v3.3 NEW] SOP data interfaces
│   │   ├── estimate.ts                   # [v3.3 NEW] Estimate data types
│   │   ├── user.ts
│   │   └── index.ts                      # [v3.3 UPDATED] SOP + estimate re-exports
│   ├── constants/
│   │   ├── project-types.ts              # [v3.3 UPDATED] F&D, TEMPLATE_ALIAS, FUNDING_SOURCES
│   │   ├── sop-data.ts                   # [v3.3 NEW] Barrel export for all SOP data
│   │   ├── sop-data-ns-er.ts             # [v3.3 NEW] NS + ER SOP data
│   │   ├── sop-data-wiw-fc-mc.ts         # [v3.3 NEW] WIW + FC + MC SOP data
│   │   ├── sop-data-appendices.ts        # [v3.3 NEW] 4 appendices
│   │   ├── flowchart-data.ts             # [v3.3 NEW] 5 Mermaid chart definitions + legend
│   │   ├── estimate-presets.ts           # [v3.3 NEW] 13 preset sections
│   │   ├── sf-schedule-data.ts           # [v3.3 NEW] SiteFolio milestone definitions (6 types)
│   │   ├── oracle-parents.ts
│   │   ├── oracle-reports.ts
│   │   ├── po-item-numbers.ts            # Placeholder
│   │   └── sitefolio-paths.ts            # Placeholder
│   └── hooks/
├── firestore.rules
├── firestore-rules-additions.txt          # [v3.3 NEW] Security rules for /estimates/ + /userPreferences/
└── package.json                          # [v3.3 UPDATED] +mermaid, +exceljs, +xlsx
```

---

## 11. Firestore Data Model

### Collections

<!-- [v3.3 UPDATED] — F&D added to projectType, new collections added -->
```
/users/{userId}
  name, email, role ('pm'|'cm'|'director'|'admin')
  assignedProjectIds[], managedUserIds[]
  createdAt, createdBy (admin uid), forcePasswordChange (bool)

/organizations/{orgId}
  appName (default: "FaciliOne"), primaryColor, logoUrl, faviconUrl, divisionLabel

/projects/{projectId}
  storeNumber, storeName, storeAddress, storeCity, storeState
  projectType ('NS'|'ER'|'WIW'|'FC'|'MC'|'F&D')          # [v3.3: F&D added]
  status, grandOpeningDate, constructionStartDate
  pmUserId, cmUserId, orgId
  oracleParentProject, oracleProjectNumber
  currentPhaseIndex, totalBudget, committedCost, forecastCost
  healthStatus ('green'|'yellow'|'red')
  notes                                                     # [v3.3: added for quick-create]
  createdAt, updatedAt

/projects/{projectId}/phases/{phaseId}
/projects/{projectId}/tasks/{taskId}
/projects/{projectId}/budget/{lineItemId}
/projects/{projectId}/documents/{docId}
/projects/{projectId}/meetings/{meetingId}
  /action-items/{itemId}
/projects/{projectId}/photos/{photoId}
/projects/{projectId}/risks/{riskId}
/projects/{projectId}/swppp/{inspectionId}
/projects/{projectId}/spg-gates/{gateId}
/projects/{projectId}/ca-log/{caId}
/projects/{projectId}/rfis/{rfiId}
/projects/{projectId}/change-orders/{coId}
/projects/{projectId}/pay-apps/{payAppId}

# [v3.3 NEW] — Estimates collection
/estimates/{estimateId}
  userId, projectId (nullable)
  projectInfo { store, name, pm, date, projectType, fundingSource, oracle, parent, budget }
  sections[] { id, name, columns[], rows[], hasContingency, contPct, collapsed, rowCounter }
  createdAt, updatedAt

/kb/sops/{sopId}                           # [v3.3: now populated via /api/seed-sops]
/kb/sops/types/{projectType}               # [v3.3 NEW] — 5 types + 4 appendices
/kb/flowcharts/types/{projectType}         # [v3.3 NEW] — 5 Mermaid definitions
/kb/templates/{templateId}

# [v3.3 NEW] — User preferences
/userPreferences/{userId}
  theme, defaultPmName, other settings

/ai-sessions/{sessionId}
  /messages/{messageId}

/imports/{importId}
/notifications/{notificationId}

/customization/{orgId}
  /nav-config
  /branding
  /module-config
```

---

## 12. Build Phases & Steps

> No timeframes. Each phase delivers fully usable features. Phases are ordered by dependency.

---

### Phase 1 — Foundation ✅ COMPLETE

**Goal:** Working app, authenticated, project creation, schedule auto-seeding. Deployable to Vercel.

1. ✅ Create new GitHub private repository named `facilione`
2. ✅ Initialize Next.js 15 + TypeScript + Tailwind v4 + ESLint + Prettier
3. ✅ Install and configure shadcn/ui
4. ✅ Create Firebase project — enable Firestore, Storage, Auth (Email/Password only), Functions
5. ✅ Configure Firebase Auth — Email/Password provider only, disable all other sign-in methods
6. ✅ Write Firestore security rules:
   - PM: read/write only projects where `pmUserId == auth.uid`
   - CM: read/write projects where PM is in their `managedUserIds`
   - Director: read-only all projects in org
   - Admin: full access
7. ✅ Build base layout shell (left sidebar with 10 nav stubs, topbar, content area, right panel slot)
8. ✅ Build Login page — Email + Password + "Forgot password?" only, no signup visible
9. ⬜ Configure Firebase password reset email template *(manual — Firebase Console)*
10. ✅ Parse all 5 XLS schedule templates into structured JSON → seed Firestore as `kb/templates/{type}`
11. ✅ Build project list page with role-based filtering (PM = assigned, CM = managed, Director = all read-only)
12. ✅ Build project creation wizard (5 steps, all 5 project types)
13. ✅ Implement schedule seeding logic: GO date + week offsets → calendar dates for all phases
14. ✅ Implement Firestore project write with all seeded phases on wizard confirm
15. ✅ Build basic project overview page
16. ✅ Build Admin → Users page: create user form → Firebase Admin SDK → Firestore write → temp password displayed to Admin
17. ✅ Connect new GitHub repo to Vercel (new project in Vercel)
18. ✅ Set Vercel environment variables (Firebase config, Anthropic API key) <!-- [v3.3 UPDATED] was ⬜ -->
19. ✅ Deploy Phase 1 to Vercel and verify end-to-end

**Phase 1 implementation notes:**
- All 5 XLS schedule templates parsed: NS (8 phases, 37 milestones), ER (8 phases, 53 milestones), WIW (7 phases, 38 milestones), FC (7 phases, 37 milestones), MC (1 phase, 8 milestones)
- Firebase client + admin SDKs use lazy initialization to prevent build-time errors when env vars are absent
- Auth context builds a minimal AppUser from Firebase Auth record if the Firestore `users/{uid}` doc doesn't exist yet, preventing login loops
- All pages (dashboard, projects list, project detail, creation wizard) use live Firestore data — zero mock values
- Vercel production URL: `https://facilione.vercel.app`

---

<!-- [v3.3 ADDED] — Entire section is new -->
### Phase 1.5 — FaciliTools Migration + Admin + Performance ✅ COMPLETE

**Goal:** Migrate all 5 FaciliTools into FaciliOne as integrated routes with Firestore persistence. Build admin panel and settings. Optimize performance.

**Migration Steps:**

| Step | Description | Status | Files Created/Modified |
|---|---|---|---|
| Step 1 | SOP Reference → /resources/sops | ✅ Deployed | sop.ts, sop-data-*.ts (4 files), sops/page.tsx, seed-sops/route.ts |
| Step 2 | Flowcharts → /resources/flowcharts | ✅ Deployed | flowchart-data.ts, flowcharts/page.tsx, seed-flowcharts/route.ts |
| Step 3 | Estimator → /smart-tools/estimator | ✅ Deployed | estimate.ts, estimate-presets.ts, estimates.ts, estimator/page.tsx, smart-tools/page.tsx |
| Step 4 | Tracker → /projects/[id] Schedule tab | ✅ Deployed | sf-schedule-data.ts, sf-schedule.ts, sf-schedule-panel.tsx |
| Step 5 | Cleanup (remove static HTML) | ⬜ Optional | FaciliTools is separate Vercel project |
| Step 6 | Theme (next-themes wiring) | ⬜ Not started | Wire next-themes into Providers |

**Cross-cutting changes deployed:**
- F&D (Floor & Decor) added as 6th project type across all type maps, wizard, filters, and constants
- TEMPLATE_ALIAS system: F&D resolves to MC schedule template
- FUNDING_SOURCES constant: Division Funded, GO Merchandising, GO Retail Ops, Other
- Sidebar updated with sub-navigation under Resources & KB
- Resources hub page with live links to SOP Reference and Flowcharts

**Admin panel deployed (4 tabs):**
- Users: Create (Firebase Admin SDK), list, edit, delete
- Projects: Quick-create form + "Create via Wizard" link + list/edit/delete
- Seed Data: One-click POST /api/seed-sops and POST /api/seed-flowcharts
- System: Health check and index info

**Settings page deployed:** Profile display + change password

**Performance optimizations deployed:**
- Auth context: sessionStorage cache for user profile with background refresh
- App layout: Skeleton layout instead of full-screen spinner during auth loading
- Dashboard: Renders from cached user immediately, no full-screen loading state

**NPM dependencies added:** mermaid@^10.9.1, exceljs@^4.4.0, xlsx@^0.18.5

**API routes added:**
- POST /api/seed-sops — Seeds SOP data into Firestore /kb/sops/types/{key}
- POST /api/seed-flowcharts — Seeds flowchart data into Firestore /kb/flowcharts/types/{key}
- GET /api/admin/users/list — List all Firebase Auth users
- PATCH|DELETE /api/admin/users/[uid] — Edit or delete user
- GET /api/admin/projects/list — List all projects
- POST /api/admin/projects/create — Quick-create project (minimal fields)
- PATCH|DELETE /api/admin/projects/[id] — Edit or delete project

**Pending manual tasks:**
- ⬜ Run POST /api/seed-sops (can be done from Admin → Seed Data tab)
- ⬜ Run POST /api/seed-flowcharts (can be done from Admin → Seed Data tab)
- ⬜ Add Firestore security rules from firestore-rules-additions.txt to firestore.rules and deploy
- ⬜ Create Firestore composite indexes if prompted (userId + updatedAt desc for estimates, projects)

---

### Phase 2 — Core PM Modules

**Goal:** Full project management — schedule, budget, documents, meetings, tasks, calendar.

1. Build Gantt chart (zoom, baseline/actual, milestone diamonds, week-offset column, drag-adjust)
2. Build budget tracker (line-item table, categories, variance, EAC, POC/Full PO flag, bar chart)
3. Build document upload (Firebase Storage, type tags, version history, SiteFolio path ref, ZIP download)
4. Build meetings module (6 types, auto-populate, agenda builder, minutes, action items, carry-forward, Word export)
5. Build task manager (Kanban + list, auto-create from checklist, recurring)
6. Build Calendar (portfolio-wide, filters, 3-week look-ahead)
7. Wire all modules to Firestore real-time listeners
8. Wire all project detail tabs with conditional visibility (SWPPP/Compliance = NS/ER/FC only)

---

### Phase 3 — FE Modules + Project Sequence

**Goal:** All FE-specific features and project sequence tracker.

1. Parse sequence XLS files into Firestore structured checklists
2. Build Project Sequence Tracker (phase accordion, step checklist, gate indicators, progress bars, PDF export)
3. Build SWPPP Tracker (NOI flow, inspection log, date calculator, overdue alerts, export)
4. Build SPG Gate Tracker (FC only, inside Compliance tab, 3-gate structure, display-only rules)
5. Build CA Log (entry form, routing rules display, Capital Committee flag)
6. Build PO Reference Tool (lookup table filtered by type/state, copy to clipboard)
7. Build Smart Tools: CA Prep Guide, Display Case Order Form, Procurement Planner

---

### Phase 4 — Knowledge Base + Smart Tools + Import Engine

**Goal:** Full KB operational, all Smart Tools functional, full import/export engine.

1. Build KB home (full-text search, tag filters)
2. Upload all SOPs to Firebase Storage + index in Firestore with metadata
3. Build SOP Library viewer (PDF embed, version history)
4. Build Schedule Templates, Meeting Templates, Forms, Estimating, Oracle Reference sections
5. Build fillable web forms (Plan Request, Close-Out, Phase Gate Checklists — auto-fill from project)
6. Build Import Engine:
   - SheetJS parsers for each Oracle KAM PA report + PAS, MASK, Receiving Audit, IPECC, F1 CSV
   - Field mapping preview UI (user confirms before import)
   - Auto-trigger AI analysis on financial imports
   - Import log in Firestore
7. Build Export Engine (all formats matching Kroger templates)
8. Build Smart Tools: ~~Estimator~~, Bid Comparison, Plan Request Builder, Meeting Builder, Three-Week Look-Ahead, Pay App Reviewer, Change Order Log, Close-Out Kit, IPECC Builder <!-- [v3.3 UPDATED] Estimator struck — already deployed -->

---

### Phase 5 — AI Copilot + Analytics

**Goal:** Full AI copilot with all 8 features, KB RAG pipeline, portfolio analytics.

1. Set up Claude API client in `lib/ai/`
2. Build Copilot full-page interface (streaming, session management)
3. Build inline copilot panel (right sidebar, project-context aware)
4. Implement project context injection (type, phase, open items, imports, gates)
5. Build KB RAG pipeline (chunk SOPs → store in Firestore → retrieve on query → inject as context)
6. Enforce citation requirement in system prompt
7. Build all 8 AI features (see Section 6)
8. Build Analytics: portfolio summary, budget vs. actual, schedule health, resource utilization, vendor performance, historical data + AI benchmarks

---

### Phase 6 — Customization, Automation & Mobile

**Goal:** Full Admin platform, automation engine, in-app notifications, mobile PWA.

1. Build Admin panel: Organization, Branding (logo/name/color — replaces FaciliOne placeholder), Nav Builder, Module Config, Custom form builder
2. Build Team module (directory, contacts, assignment matrix, workload view)
3. Build Automation Engine (Firebase Cloud Functions):
   - Project creation triggers (auto-create tasks, meeting schedule, alert rules)
   - Schedule drift detection (periodic)
   - SWPPP overdue detection (daily)
   - Close-out overdue reminder (GO date + 3 periods)
   - Equipment lead time flag (weekly)
   - CA status stale alert (30-day no-update)
4. Build in-app notification center (bell icon, alert feed, dismiss/snooze)
5. Build Risk Register module
6. Mobile / PWA (bottom nav bar < 768px, camera upload, PWA manifest + service worker)
7. Full QA pass + performance optimization

---

## 13. Master To-Do Tracker

### Status Legend
| Symbol | Meaning |
|---|---|
| ⬜ | Not started |
| 🟡 | In progress |
| ✅ | Done |
| 🔴 | Blocked |
| ⏭️ | Deferred |

---

### Phase 1 — Foundation ✅ COMPLETE

| # | Task | Status | Notes |
|---|---|---|---|
| 1.01 | Create new GitHub private repo: `facilione` | ✅ | `github.com/ewaisg/facilione` |
| 1.02 | Initialize Next.js 15 + TypeScript + Tailwind v4 + Prettier | ✅ | `.prettierrc` + `.prettierignore` added |
| 1.03 | Install and configure shadcn/ui | ✅ | Full component library installed |
| 1.04 | Create Firebase project (Firestore, Storage, Auth, Functions) | ✅ | Firebase project configured |
| 1.05 | Configure Firebase Auth — Email/Password only, disable all other providers | ✅ | Per P-03 |
| 1.06 | Write Firestore security rules (PM/CM/Director/Admin roles) | ✅ | `firestore.rules` + `storage.rules` + `firebase.json` |
| 1.07 | Build base layout shell (sidebar 10 nav stubs, topbar, content, right panel slot) | ✅ | Right panel slot for Phase 5 copilot |
| 1.08 | Build Login page (login + forgot password — no signup) | ✅ | Per P-03 |
| 1.09 | Configure Firebase password reset email | ⬜ | Manual — Firebase Console setting |
| 1.10 | Parse all 5 XLS schedule templates → JSON → seed in Firestore | ✅ | `templates.json` + `POST /api/seed-templates` · NS: 8 phases/37 milestones · ER: 8/53 · WIW: 7/38 · FC: 7/37 · MC: 1/8 |
| 1.11 | Build project list (role-filtered: PM assigned, CM managed, Director read-only) | ✅ | Real-time Firestore subscription via `subscribeToProjects()` |
| 1.12 | Build project creation wizard (5 steps, all 5 types) | ✅ | Writes to Firestore via `createProjectWithPhases()` |
| 1.13 | Implement schedule seeding logic (GO date + week offsets) | ✅ | `seedPhasesFromTemplate()` in `lib/schedule/seed-phases.ts` |
| 1.14 | Implement Firestore project write with seeded phases | ✅ | Batch write: project doc + all phase subcollection docs |
| 1.15 | Build project overview page | ✅ | Live Firestore data — phase structure displayed |
| 1.16 | Build Admin → Users: create user → Firebase Admin SDK → Firestore → temp password | ✅ | Full UI + API at `/api/admin/users` |
| 1.17 | Connect GitHub repo → Vercel (new Vercel project) | ✅ | Auto-deploy on push to `main` |
| 1.18 | Set Vercel environment variables | ✅ | <!-- [v3.3 UPDATED] was ⬜ --> |
| 1.19 | Deploy Phase 1 to Vercel — verify end-to-end | ✅ | `facilione.vercel.app` |

<!-- [v3.3 ADDED] — Entire section is new -->
### Phase 1.5 — FaciliTools Migration + Admin + Performance ✅ COMPLETE

| # | Task | Status | Notes |
|---|---|---|---|
| 1.5.01 | Migrate SOP Reference → /resources/sops | ✅ | 7 new files, complete SOP data for 5 types + 4 appendices |
| 1.5.02 | Migrate Flowcharts → /resources/flowcharts | ✅ | Mermaid rendering with pan/zoom, 5 chart definitions |
| 1.5.03 | Migrate Estimator → /smart-tools/estimator | ✅ | 13 presets, Firestore save/load, ExcelJS export, CSV/XLSX import |
| 1.5.04 | Migrate Tracker → /projects/[id] Schedule tab | ✅ | SiteFolio schedule auto-calc engine, both calc models |
| 1.5.05 | Add F&D project type across all type maps | ✅ | ProjectType union, labels, colors, wizard, filter bar |
| 1.5.06 | Add TEMPLATE_ALIAS (F&D → MC) | ✅ | Used in wizard + schedule preview |
| 1.5.07 | Add FUNDING_SOURCES constant | ✅ | 4 options in estimate form |
| 1.5.08 | Update sidebar with Resources sub-nav | ✅ | SOP Reference + Flowcharts expand under Resources & KB |
| 1.5.09 | Build Resources hub page | ✅ | Cards linking to SOP Reference + Flowcharts |
| 1.5.10 | Build Smart Tools hub page | ✅ | Estimator card (live) + placeholder cards for future tools |
| 1.5.11 | Build Admin panel (4 tabs) | ✅ | Users CRUD, Projects CRUD + quick-create, Seed Data, System |
| 1.5.12 | Build Settings page | ✅ | Profile display + change password |
| 1.5.13 | Build admin API routes | ✅ | 7 new API routes for user/project CRUD |
| 1.5.14 | Performance: auth context caching | ✅ | sessionStorage cache with background refresh |
| 1.5.15 | Performance: skeleton loading | ✅ | Skeleton layout instead of full-screen spinner |
| 1.5.16 | Install mermaid, exceljs, xlsx | ✅ | Added to package.json |
| 1.5.17 | Run POST /api/seed-sops | ⬜ | Via Admin → Seed Data tab |
| 1.5.18 | Run POST /api/seed-flowcharts | ⬜ | Via Admin → Seed Data tab |
| 1.5.19 | Deploy Firestore security rules for /estimates/ + /userPreferences/ | ⬜ | Rules in firestore-rules-additions.txt |
| 1.5.20 | Create Firestore composite indexes | ⬜ | Create when prompted (userId + updatedAt desc) |
| 1.5.21 | Static HTML cleanup (remove from /public/) | ⏭️ | Optional — FaciliTools is separate Vercel project |
| 1.5.22 | Wire next-themes into Providers | ⬜ | Dark/light mode toggle |

### Phase 2 — Core PM Modules

| # | Task | Status | Notes |
|---|---|---|---|
| 2.01 | Build Gantt chart component | ⬜ | |
| 2.02 | Gantt: zoom controls (week/month/quarter) | ⬜ | |
| 2.03 | Gantt: baseline vs. actual toggle | ⬜ | |
| 2.04 | Gantt: week-offset reference column | ⬜ | |
| 2.05 | Gantt: drag-to-adjust with confirmation | ⬜ | |
| 2.06 | Build budget tracker page | ⬜ | |
| 2.07 | Budget: line-item table with category grouping | ⬜ | |
| 2.08 | Budget: variance + EAC calculations | ⬜ | |
| 2.09 | Budget: bar chart (Recharts) | ⬜ | |
| 2.10 | Budget: POC / Full PO Accrual flag per project type | ⬜ | |
| 2.11 | Build document upload module (Firebase Storage + type tagging + version history) | ⬜ | |
| 2.12 | Documents: SiteFolio path reference per document type | ⬜ | |
| 2.13 | Documents: bulk ZIP download | ⬜ | |
| 2.14 | Build meetings module (6 types) | ⬜ | |
| 2.15 | Meetings: agenda builder (drag-and-drop) | ⬜ | |
| 2.16 | Meetings: minutes capture + inline action items | ⬜ | |
| 2.17 | Meetings: action items carry forward | ⬜ | |
| 2.18 | Meetings: Word (.docx) export | ⬜ | |
| 2.19 | Build task manager (Kanban + list) | ⬜ | |
| 2.20 | Tasks: auto-create from phase checklist on project creation | ⬜ | |
| 2.21 | Build Calendar (portfolio-wide + 3-week look-ahead) | ⬜ | |
| 2.22 | Wire all modules to Firestore real-time | ⬜ | |
| 2.23 | Wire all project detail tabs (conditional visibility per project type) | ⬜ | |

### Phase 3 — FE Modules

| # | Task | Status | Notes |
|---|---|---|---|
| 3.01 | Parse sequence XLS files into Firestore checklists | ⬜ | |
| 3.02 | Build Project Sequence Tracker (phase accordion + step checklist) | ⬜ | |
| 3.03 | Sequence: gate indicators between phases | ⬜ | |
| 3.04 | Sequence: progress bars + AI next-action button | ⬜ | |
| 3.05 | Sequence: PDF export | ⬜ | |
| 3.06 | Build SWPPP Tracker (NOI flow + inspection log + date calculator + overdue alerts + export) | ⬜ | |
| 3.07 | Build SPG Gate Tracker (FC only — 3-gate structure, display-only rules) | ⬜ | |
| 3.08 | Build CA Log (entry form + routing rules display + Capital Committee flag) | ⬜ | |
| 3.09 | Build PO Reference Tool (lookup by type/state + copy to clipboard) | ⬜ | |
| 3.10 | Build Smart Tool: CA Prep Guide | ⬜ | |
| 3.11 | Build Smart Tool: Display Case Order Form | ⬜ | |
| 3.12 | Build Smart Tool: Procurement Planner | ⬜ | |

### Phase 4 — KB + Smart Tools + Import Engine

| # | Task | Status | Notes |
|---|---|---|---|
| 4.01 | Build KB home (full-text search + tag filters) | ⬜ | |
| 4.02 | Upload all SOPs to Firebase Storage + index in Firestore | ⬜ | |
| 4.03 | Build SOP Library viewer (PDF embed + version history) | ⬜ | |
| 4.04 | Build Schedule Templates, Meeting Templates, Forms, Estimating, Oracle Reference sections | ⬜ | |
| 4.05 | Build fillable web forms (auto-fill from project + export) | ⬜ | |
| 4.06 | Build Import Engine — Oracle KAM PA reports (parsers for each) | ⬜ | Needs O-03 samples |
| 4.07 | Build Import Engine — PAS, MASK, Receiving Audit, IPECC, F1 CSV | ⬜ | |
| 4.08 | Import: field mapping preview UI | ⬜ | |
| 4.09 | Import: auto-trigger AI analysis on financial imports | ⬜ | |
| 4.10 | Build Export Engine (all Kroger-formatted outputs) | ⬜ | |
| 4.11 | Build Smart Tool: Estimator | ✅ | <!-- [v3.3 UPDATED] Moved to Phase 1.5 --> Deployed in Phase 1.5 migration |
| 4.12 | Build Smart Tool: Bid Comparison | ⬜ | |
| 4.13 | Build Smart Tool: Plan Request Builder | ⬜ | |
| 4.14 | Build Smart Tool: Meeting Builder (all 5 types) | ⬜ | |
| 4.15 | Build Smart Tool: Three-Week Look-Ahead | ⬜ | |
| 4.16 | Build Smart Tool: Pay Application Reviewer | ⬜ | |
| 4.17 | Build Smart Tool: Change Order Log | ⬜ | |
| 4.18 | Build Smart Tool: Close-Out Kit | ⬜ | |
| 4.19 | Build Smart Tool: IPECC Builder | ⬜ | |

### Phase 5 — AI Copilot + Analytics

| # | Task | Status | Notes |
|---|---|---|---|
| 5.01 | Set up Claude API client in lib/ai/ | ⬜ | |
| 5.02 | Build Copilot full-page interface (streaming) | ⬜ | |
| 5.03 | Build inline copilot panel (right sidebar) | ⬜ | |
| 5.04 | Implement project context injection | ⬜ | |
| 5.05 | Build KB RAG pipeline (chunk → store → retrieve → inject) | ⬜ | |
| 5.06 | Enforce citation requirement in system prompt | ⬜ | |
| 5.07 | Build AI: Next-Action Assistant | ⬜ | |
| 5.08 | Build AI: Document Reviewer (PDF Q&A) | ⬜ | |
| 5.09 | Build AI: Communication Drafter | ⬜ | |
| 5.10 | Build AI: Historical Data Search + Proposals | ⬜ | |
| 5.11 | Build AI: Budget Variance Analysis (post-import) | ⬜ | |
| 5.12 | Build AI: Schedule Deviation Alerts | ⬜ | |
| 5.13 | Build AI: Gate Compliance Check | ⬜ | |
| 5.14 | Build Analytics: Portfolio summary + budget charts + schedule health | ⬜ | |
| 5.15 | Build Analytics: Resource utilization + vendor performance + historical benchmarks | ⬜ | |

### Phase 6 — Customization, Automation & Mobile

| # | Task | Status | Notes |
|---|---|---|---|
| 6.01 | Build Admin: Branding (app name override, logo, color — replaces FaciliOne placeholder) | ⬜ | Per P-11 |
| 6.02 | Build Admin: Organization settings + Nav Builder + Module Config + Custom form builder | ⬜ | |
| 6.03 | Build Team module | ⬜ | |
| 6.04 | Build Automation Engine (Firebase Cloud Functions — all 6 triggers) | ⬜ | |
| 6.05 | Build in-app notification center (bell icon + feed + dismiss/snooze) | ⬜ | Per P-12 |
| 6.06 | Build Risk Register module | ⬜ | |
| 6.07 | Mobile optimization (bottom nav < 768px, camera upload) | ⬜ | |
| 6.08 | PWA manifest + service worker | ⬜ | |
| 6.09 | Full QA pass + performance optimization | ⬜ | |

---

## 14. Reference Files Inventory

### Schedule Templates (Phase 1)
| File | Available | Purpose |
|---|---|---|
| `New_store_project_schedule_template.xls` | ✅ | NS phase seeding |
| `Expansion_Remodel_project_schedule_template.xls` | ✅ | ER phase seeding |
| `Withinthewalls_project_schedule_template.xls` | ✅ | WIW phase seeding |
| `Fuel_Center_project_schedule_template.xls` | ✅ | FC phase seeding |
| `Minor_Capital_project_schedule_template.xlsx` | ✅ | MC phase seeding (also used for F&D via TEMPLATE_ALIAS) | <!-- [v3.3 UPDATED] -->

### Project Sequence Files (Phase 3)
| File | Available | Purpose |
|---|---|---|
| `New_store_project_sequance.xls` | ✅ | NS step checklist |
| `Expansion_remodel_project_sequance.xls` | ✅ | ER step checklist |
| `WithintheWalls_Project_Sequence.xls` | ✅ | WIW step checklist |
| `Fuel_Center_Project_Sequence.xls` | ✅ | FC step checklist |
| `Project_Manager_Task_List.xlsm` | ✅ | PM task list seed |

### Estimating & Budget Templates (Phase 4)
| File | Available | Purpose |
|---|---|---|
| `StorePreliminaryStandardEstimate.xlsx` | ✅ | Estimator preliminary output |
| `StoreFinalStandardEstimate.xlsx` | ✅ | Estimator final output |
| `StoreBidComparisonSOV.xlsx` | ✅ | Bid Comparison output |
| `StoreProjectCompSOV.xlsx` | ✅ | SOV export format |
| `Budget_Store_Project_Cost_by_Line_Item.xlsx` | ✅ | Budget export format |
| `IPECC_example.xlsx` | ✅ | IPECC Builder reference |
| `IPECC_example_MC_KS136.xlsx` | ✅ | IPECC MC format |
| `IPECC_example_NS_KS189.xlsx` | ✅ | IPECC NS format |
| `PAS_Template_FA_Asset_Register_Report.xlsx` | ✅ | Oracle PAS parser template |

### Oracle Report Samples Needed (Phase 4)
| Report | Available | Purpose |
|---|---|---|
| KAM PA Capital Commitments — export sample | 🔴 Needed | Import parser for committed column |
| KAM PA Project Cost Details — export sample | 🔴 Needed | Import parser for actuals |
| KAM PA Project Variance — export sample | 🔴 Needed | Import parser for analytics |
| KAM PA Estimates and Actuals to SiteFolio — sample | 🔴 Needed | Combined estimate/actual parser |
| KAM PA CA Approved — export sample | 🔴 Needed | CA log import parser |

> Anonymized exports with blank financial data are fine — column headers and structure is all that's needed.

### Plan Request Forms (Phase 3)
| File | Available | Purpose |
|---|---|---|
| `Plan_Request_Form_ver_1.xls` | ✅ | Plan Request output format |
| `Plan_Request_Form_Example_CM421.xls` | ✅ | Example reference |
| `Plan_Request_Form_Example_KS135.xls` | ✅ | Example reference |
| `Plan_Request_Form_Example_KS98.xls` | ✅ | Example reference |
| `plan_request_form_step_by_step.docx` | ✅ | Plan Request step logic |

### Meeting Templates (Phase 4)
| File | Available | Purpose |
|---|---|---|
| `Pre-bid_Meeting_Agenda_template.docx` | ✅ | Pre-bid meeting builder |
| `Pre-construction_Meeting_Agenda_Minutes_template.docx` | ✅ | Pre-con meeting builder |
| `Store_Project_Kick_Off_Meeting_Agenda_template.docx` | ✅ | Kickoff meeting builder |
| `weekly_Project_Meeting_Agenda_Minutes_Template.docx` | ✅ | Weekly meeting builder |
| `Typical_Project_Meeting_Minutes.docx` | ✅ | Minutes format reference |
| `Construction_Project_Meeting_Tips.docx` | ✅ | Jobsite meeting reference |
| `Construction_Project_jobsite_Meeting_Tips.docx` | ✅ | Jobsite tips reference |

### SOP & Process Documents (Phase 4 — KB + AI RAG)
| File | Available | Purpose |
|---|---|---|
| `Kroger_PM_SOP_Library_v1.docx` | ✅ | Primary SOP source |
| `SWPPP_Sequence_for_the_Kroger_PM.docx` | ✅ | SWPPP Tracker + AI |
| `Pre-construction_CA_Approvals_Required.docx` | ✅ | CA Prep Guide + AI |
| `Equipment_Pre-Order_Capital_Appropriation__CA__Policy_pdf.docx` | ✅ | Procurement Planner + AI |
| `BP_for_GC_Contract_Purchase_Order.docx` | ✅ | PO Reference Tool |
| `PO_Liability_Policy.docx` | ✅ | KB reference |
| `PO_Transfer_and_Mass_Transfer.docx` | ✅ | KB reference |
| `Auto-Receiving_of_Capital_Items_Purchased_-_Instruction_Document.docx` | ✅ | KB reference |
| `Receiving_Audit_Report.docx` | ✅ | Import engine + KB |
| `MASK_Report-_Liability_Mismatch_Corrections.docx` | ✅ | Import engine + KB |
| `PM_Project_CloseOut.docx` | ✅ | Close-Out Kit |
| `Capitalized_Interest.docx` | ✅ | Budget module + AI |
| `Cancel_an_Oracle_Project.docx` | ✅ | KB reference |
| `Regional_Construction_s_Plan_Review_Procedure.docx` | ✅ | KB reference |
| `Remodel_phasing_presentation.docx` | ✅ | ER/WIW sequencing |
| `Display_Case_Ordering_Procedure.docx` | ✅ | Display Case Order Form |
| `Display_Case_Ordering_ProcedureOct2025.pdf` | ✅ | Display Case Order Form (current) |

### Oracle & Coupa Reference (Phase 4)
| File | Available | Purpose |
|---|---|---|
| `Oracle_Retail_Division_Guidance.docx` | ✅ | Oracle parent project reference |
| `Oracle-Coupa_Reports_.docx` | ✅ | Oracle report structure reference |
| `Oracle_coupa_User_Guide_Presentation.docx` | ✅ | KB: Oracle/Coupa guide |
| `PAS_Oracle_Report_Guide_.docx` | ✅ | Import: PAS structure |
| `Coupa_P2P_FAQ.docx` | ✅ | KB: Coupa FAQ |
| `Coupa_additional_info.docx` | ✅ | KB reference |
| `Coupa_Presentation_72622.pdf` | ✅ | KB reference |

### Training & Estimating Guides (Phase 4)
| File | Available | Purpose |
|---|---|---|
| `New_Construction_Estimating_training.docx` | ✅ | Estimator logic + KB |
| `NewConstruction_Estimating_comparison.docx` | ✅ | Estimator comparison method |
| `Creating_an_Estimate.pdf` | ✅ | Estimator guide + KB |
| `Environmental_Due_Diligence_Training.pdf` | ✅ | KB reference |
| `Plan_Review_training.pdf` | ✅ | KB reference |
| `Tools_Presentation.pdf` | ✅ | KB reference |
| `2025_PM_Training_SP_and_Design_Presentation.pdf` | ✅ | KB: Store Planning |
| `2025_PM_Training_Mel__SP__D_PM_Presentation.pdf` | ✅ | KB: PM training |
| `Sitefolio_User_Guide.pdf` | ✅ | KB: SiteFolio reference |
| `generalConditions.pdf` | ✅ | Pay App Reviewer + KB |

---

## 15. Open Items

None of these block Phase 2. Items marked with the phase they must be resolved before.

<!-- [v3.3 UPDATED] — Status updates on existing items -->
| # | Item | Needed Before | Status |
|---|---|---|---|
| O-01 | Project naming/ID convention — how are projects internally identified? (store number format, SiteFolio job #, Oracle project #, or combination?) | Phase 1 complete | 🔴 Pending |
| O-02 | Oracle parent project list — confirm current list is complete and correct | Phase 3 | 🔴 Pending |
| O-03 | Oracle KAM PA report export samples (5 reports — anonymized OK) | Phase 4 | 🔴 Pending |
| O-04 | Display case contacts — confirm Jill Vanfleet and Brittnie Fitzgerald details | Phase 3 | 🔴 Pending |
| O-05 | F1 fixture plan CSV sample — check project files first; provide if not found | Phase 4 | 🔴 Pending |
| O-06 | Coupa report formats — deferred; define scope when ready for import | Post-launch | ⏭️ Deferred |
| O-07 | Custom features — discuss in later session | Post-Phase 1 | ⏭️ Deferred |
| O-08 | Final app name / branding — customizable from day one, decide at any time | Any time | ⏭️ Deferred |

---

*End of FaciliOne Blueprint v3.3*
*Last updated: March 27, 2026 — Phase 1 + Phase 1.5 (FaciliTools migration, admin, settings, performance) complete and deployed*
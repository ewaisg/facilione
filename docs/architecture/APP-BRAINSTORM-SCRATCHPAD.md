# App Brainstorm Scratchpad

Running collection of feature ideas, real-world use cases, and notes for the new app. Add to this as things come up — no need to organize yet. When we sit down to define features and modules, this is the starting point.

---

## Ideas & Use Cases

### 1. AI Bid Review Assistant (April 13, 2026)
**Trigger:** Jacob Coday emailed asking Gheiath to download 4 GC Trade Proposals + Bid Package Detail Analysis from SiteFolio for project 620-00012-03 (KS-012 WIW Remodel, Pueblo), review them, and prep for a bid review meeting.

**What the app should do:**
- User pastes email or describes the task in copilot
- AI parses context: identifies project number, document types, SiteFolio locations
- App navigates SiteFolio, finds the files, downloads them
- AI reads the XLSX bid documents and generates a bid leveling comparison:
  - Missing scope per GC
  - Extra scope (GC pricing things not in the bid package)
  - Schedule duration comparison
  - Major subs listed by each GC
  - Alternates offered
  - Price variances and outliers
- Output: structured bid comparison report ready for the meeting
- Knowledge base: bid review meeting procedures, what to look for, how decisions get made

**Reference material to collect:**
- [ ] Record an actual bid review meeting on Teams and share the recording
- [ ] Collect any existing bid review templates or checklists from coworkers (Nick, Zak, Lowell)
- [ ] Save example Bid Package Detail Analysis and Trade Proposal files as reference

**GCs on this bid (KS-012):** CBA Construction, C.N.C. Construction, Mark Young Construction, Ktk General Contracting Limited

**Proven workflow (tested April 13, 2026 on KS-012):**
We actually did this manually today and confirmed the full data pipeline works. Here's exactly what the app should automate:

1. **Input:** User pastes Jacob's email (or any bid review request)
2. **Parse:** AI extracts project # (620-00012-03), identifies it's a bid review task
3. **Fetch from SiteFolio:** Navigate to `$ > Bidding > {bid package}` — the Scope, Bid Package Analysis, and Detail Analysis are ALL in a single server-rendered HTML page (3 jQuery UI tabs: `#tabs-scope`, `#tabs-bidanalysis`, `#tabs-detailanalysis`). One fetch gets everything.
4. **Extract from HTML:**
   - Scope tab: bid package name, status, cost sheet type, participants (GC names + contacts + business IDs), RFCs, addenda, alternates, bid events timeline
   - Bid Package Analysis tab: base bid totals per GC, budget, exclusions, duration, rank, "Select Bid" status, attachments per GC
   - Detail Analysis tab: full CSI line-item SOV with budget (base + exclusions + bid budget) and each GC's bid per line item. Data is in `data-A_1` attributes on `td._BP_ANALYSIS_INIT` elements. Hierarchical rows with `_virtual`, `_indent`, `_prowid`, `_rowid` attributes.
5. **Analyze:** AI generates 5-part analysis matching what CM/PM discuss in meetings:
   - **Missing scope:** GC bid $0 on lines where budget > $0 or other GCs priced it
   - **Extra scope:** GC priced items where budget = $0 and no other GC priced it
   - **Schedule duration:** Extract from duration row (all 4 GCs submitted 0 days on KS-012 — flag as data gap)
   - **Major subs:** NOT in the SOV HTML — must download Trade Proposal XLSX files from Text Documents folder separately
   - **Alternates:** Check alternates section on Scope tab
   - **Key variances:** Flag line items with largest spread between highest and lowest GC
6. **Output:** Generate XLSX with tabs: Bid Summary, Missing Scope, Extra Scope, Key Variances, Open Items — each with Notes column for PM/CM to annotate

**Key SiteFolio IDs for bidding pages:**
- URL: `/Kroger/BidPackageView.sf?idProject={sfId}&idBP={bidPackageId}&idSubtype=1&bn=5010`
- JS init params: `ScopeUI.init({ enterpriseID, projectID, bpID, subtypeID, openStatusID: 2, closedStatusID: 3, memberID, contactName, contactID, email, businessName, businessID })`
- Bid Package Detail Analysis XLSM report: `/reports/idProject!{id}|idBP!{bpId}|idSubtype!1|bn!5010|reportname!sR/BidPackageDetailAnalysis|idcurrententerprise!8252|format!14|.../BidPackageDetailAnalysis.xlsm`

**Meeting context (learned April 13, 2026):**
- Bid review has Round 1 and Round 2, with GC clarifications between rounds
- Attendees: CM (Rebecca Mullenix), ACM (Jacob Coday), PM (Gheiath), Sourcing Lead from corporate (Ashwini Govindraj / Bernard Kirkland depending on project)
- Sourcing department (Enterprise Sourcing) manages the bid process in Coupa, uploads bid data to SiteFolio, and participates in reviews to ensure fairness/no favoritism in GC selection
- Day 1: Coupa Bid Report to CM. Day 2: Trade Proposals + SOV data uploaded to SiteFolio, notice sent to PMs
- PM is expected to download files, review, and come prepared with observations
- A separate 30-min meeting with Sourcing Lead may be required (as seen on KS-164)
- Nick, Zak, Lowell are colleagues who have done this before — ask about procedure

**Reference material to collect:**
- [ ] Record an actual bid review meeting on Teams and share the recording
- [ ] Collect any existing bid review templates or checklists from coworkers (Nick, Zak, Lowell)
- [ ] Save example Bid Package Detail Analysis and Trade Proposal files as reference
- [x] KS-012 bid review prep XLSX created (KS-012_Bid_Review_Prep.xlsx) — use as template for future bids

**Complete Bid Review Flow (confirmed from KS-164 email chain + PPTXs, April 13 2026):**

The full pipeline from bid receipt to award, with roles:

1. **Day 1:** Ashwini (Sourcing/Enablement) sends Coupa Bid Report to CM only
2. **Day 2:** Ashwini uploads Trade Proposals + Bid Report to SiteFolio Text Documents + SOV data to Bidding module. Sends notification to PM, CM, ACM.
3. **PM schedules 30-min meeting** with Sourcing Lead for Round 1 review (per Ashwini's email instructions)
4. **Round 1 Bid Review Meeting:** Sourcing Lead (Bernard Kirkland) + CM (Rebecca) + PM review the SOV data together. Bernard writes per-GC notes identifying:
   - Line items with $0 where scope should exist ("no quote — are you covered", "no quote — break out")
   - Items needing definition ("Define scope of work required")
   - Items that should be deferred ("Should this bid later")
   - "Areas to Improve" — CSI divisions where this GC is X% over the best bidder, with dollar amounts
5. **Bernard creates a PPTX per GC** from a standard 7-slide template:
   - Slide 1: Title (Kroger + project # + GC name)
   - Slide 2: Objectives (always same 4 bullets: clarifying questions, VE ideas, pricing feedback, next steps)
   - Slide 3: Standard questions (supply chain issues, zero waste compliance, sub list request, VE ideas)
   - Slide 4: **GC-specific scope issues** (unique per GC — the review notes become this slide)
   - Slide 5: **Areas for Improvement** (dollar amounts + % over best bidder per CSI division)
   - Slide 6: Next Steps (resubmit through Coupa, schedule: Open/Close/Award dates)
   - Slide 7: Appendix (empty placeholder)
6. **Individual calls with each GC** — walk through the PPTX, GC explains/clarifies flagged items, provides sub lists, discusses VE
7. **Round 2 opens** — GCs resubmit refined bids through Coupa
8. **Round 2 closes** — Ashwini uploads Round 2 data same way as Round 1
9. **Final review + award**

**Post-meeting email step (added from real KS-012 experience, April 13 2026):**

Between steps 6 and 7 (or after step 4 for accelerated bids with no presentations):
- **Bernard sends notes to CM** — scope questions per winning GC + rejection letter text per losing GC + Round 2 schedule
- **CM forwards to PM:** "Send drafts for review. These need to go out today."
- **PM drafts emails:** 1 Round 2 notification to winner + N rejection letters to losers
- **PM sends drafts to CM for review**
- **CM approves → PM sends to GCs**
- For accelerated bids (like KS-012), there are no GC presentations — goes straight from Round 1 review to Round 2 open

**App feature: Auto-generate the per-GC PPTX from bid review analysis.**
The bid review prep XLSX we built for KS-012 contains exactly the data that goes into slides 4 and 5. The app could:
- Take the SOV analysis output (missing scope, extra scope, variances)
- Auto-populate the standard PPTX template per GC
- Slide 4: GC-specific issues from Missing Scope + Extra Scope sheets
- Slide 5: Areas for Improvement calculated from Detail Analysis (% over lowest bidder per CSI division)
- Slides 1-3, 6-7: Template content with project # and GC name swapped in

**Roles confirmed:**
- Ashwini Govindraj — Enablement Services, Enterprise Sourcing (uploads data, sends notifications)
- Bernard Kirkland — Sr Analyst, Enterprise Sourcing (Sourcing Lead — reviews bids, creates PPTX, runs GC calls)
- Rebecca Mullenix — CM (participates in review, validates scope questions)
- Jacob Coday — ACM (participates, delegates prep to PM)
- PM (Gheiath) — downloads files, reviews, preps for meeting, attends

**KS-164 specific data:**
- Project: 620-00164-01 KS-164 New Store, Windsor, CO
- 3 GCs: Mark Young Construction, Roche Constructors, R.G. Brinkmann Company
- Bid type: General Construction > Site (not F&D like KS-012)
- Round 1 review done ~3/27/2026, Round 2 opened 3/30, closed 4/7, award ~4/10
- PPTX files saved as reference templates

**Post-Bid Review: Auto-Generate Emails (confirmed April 13, 2026 — KS-012):**

After the bid review meeting, Bernard sends notes + rejection letter text to the CM. CM forwards to PM and says "send drafts for review." PM must produce:

1. **Rejection letters** — one per non-selected GC. Bernard provides the exact language (boilerplate with GC name swapped in). PM drafts, sends to CM for review, then sends to GCs.
2. **Round 2 notification to winning GC** — includes:
   - Subject line must contain "Please Provide Answers to All Questions" (or similar per CM direction)
   - Round 2 schedule (Open/Close/Award dates)
   - Bernard's scope clarification questions (CSI-organized, per line item)
   - "Areas to Improve" with dollar amounts and % over best bidder
   - Instruction to resubmit through Coupa by close date

**What the app should automate:**
- Input: Bernard's email with notes + rejection text (pasted or forwarded)
- AI parses: identifies winner, losers, scope questions, areas to improve, schedule
- Auto-generates all emails (rejections + Round 2 notification)
- PM reviews in-app, optionally sends to CM for approval, then sends to GCs
- Email subject lines configurable (CM may have specific preferences)

**Real example — KS-012 post-review (April 13, 2026):**
- Winner: CBA Construction Inc. → Round 2 (accelerated, no presentations)
- Rejected: Mark Young Construction, CnC Construction Inc., KTK General Contracting Limited
- Schedule: Open 4/13, Close 4/16 (7:00 PM), Award 4/20
- Bernard's notes had 6 scope questions across Div 03, 05, 09, 12 + 6 areas to improve
- Rebecca said "send drafts for review, these need to go out today" — time pressure is real
- PM needed GC contact emails from SiteFolio project directory

**This is a direct extension of the Bid Review Assistant** — same pipeline, just the output side. The full automated flow becomes:
1. Bid data uploaded → app fetches and analyzes (pre-meeting prep)
2. Meeting happens → Bernard sends notes
3. App generates all post-meeting emails (rejections + Round 2)
4. PM reviews → CM approves → emails sent

---

### 2. AI Copilot (General Pattern)
The bid review assistant is one instance of a broader pattern: user gives the AI context (email, question, task description) → AI uses SiteFolio access + knowledge base → returns actionable output.

Other potential copilot tasks (to brainstorm later):
- Schedule analysis / variance flagging
- Budget review and comparison
- RFI/ASI/PR drafting or review
- Weekly status update drafting from schedule + comments
- Meeting prep (pull relevant data for any upcoming meeting)
- New PM onboarding — "here's everything about project X"

---

### 3. Division-Level Reports as Bulk Data Source (April 13, 2026)

Two reports found under REGIONS > King Soopers/City Market > LINKS > Reports. Both download directly (no page scraping needed).

**Report A: Division Construction Status Report (PDF)**
- URL: `https://www.sitefolio.net/RunReport.aspx?parameters=reportname!Kroger/ConstStatus_Divisional|idcurrententerprise!8252|format!2|Parameters!Region^Midcentral$ReportName^MidCentral_ConstStatus$_idCurrentMember^0$BusinessUnit^3`
- Format: PDF (format!2), 7 pages
- Content: **Every active project** in the division, organized by project type (New Store, Expansion Remodel, Interior Remodel, Fuel Center) and opening year (2026–2028)
- Per-project fields: Store/Project #, PM initials, Size (sqft), New Store Type, 15–22 milestone dates (type-specific), Opening Date, GC name, Architect, CA Numbers, CA Amounts (L/S/B/F/E), Décor type, and a free-text status comment
- ~45+ active projects across all types
- **This is the master portfolio view** — eliminates need to scrape individual project overview pages for basic pipeline data
- Key limitation: PDF format requires parsing (not structured data). Could request format!3 (XLSX) if SiteFolio supports it for this report.
- **CONFIRMED: Changing format!2 to format!3 produces XLSX.** 375 rows x 112 columns. Structured, parseable data.
- XLSX URL: same URL with `format!3` instead of `format!2`
- XLSX structure: Each project spans ~5-6 rows (project #, city, revision count, GC name, status comment on separate rows). 4 sections with different column layouts per project type:
  - New Store: 22 milestone columns + CA/décor
  - Expansion Remodel: 20 milestone columns + existing/expansion sqft
  - Interior Remodel (WIW/MR): 18 milestone columns + architect name + décor
  - Fuel Center: 15 milestone columns + FC type + dispenser layout
- **58 active projects** total across all sections
- Status comment is in the last row of each project block, format: `{Phase} // {comment} // {CA notes}`

**Report B: Projects Audit Report on Use of Web Pages (XLS)**
- URL: `https://www.sitefolio.net/reports/reportname!Kroger/sf_AuditReport|idcurrententerprise!8252|format!3|parameters!Region^3$ReportName^sf_AuditReport$_idCurrentMember^0/sf_AuditReport.xls`
- Format: XLS (actually XLSX inside), 229 rows, 26 columns
- Content: **Every project** in the division (active + completed), with:
  - PM initials, Project Type, Store #, Project Status/Phase
  - Last general comment date, Photo on overview (Y/N), F1 fixture plan (Y/N)
  - Last "Actual" schedule date entered
  - Check marks (X) for: Kroger contacts, Architect/Eng, Testing/Inspection, GC/Bidders, Contracts, Direct Buy Letters, Bidding Docs, Cost Summary, GC Const Docs, Two Week Look Ahead, Prelim Drawings, Refr Drawings, Fuel Center Plans, 65% Review Set, 100% Review Set, Bid Set, Photos, Notes
- **229 projects total** — the largest project list we've found
- Structured data (XLSX) — easy to parse programmatically
- Use cases: master project list, data completeness tracking, identifying projects with missing SiteFolio data

**App features these enable:**
- **Portfolio dashboard**: Auto-download Construction Status Report, parse it, and display the full division pipeline with milestones, GCs, budgets
- **Data completeness tracker**: Use Audit Report to flag projects with missing team contacts, drawings, photos, etc.
- **Project list seed**: The 229-project list from the Audit Report can seed the app's project database, with SF project IDs fetched from page 2 (Projects List) for each PM
- **Periodic refresh**: Both reports can be re-downloaded on a schedule to keep the app's data current

---

### 4. App Layout & Module Structure (April 13, 2026)

**Side Navigation (top to bottom):**
1. Dashboard
2. Projects
3. Reports
4. Resources
5. Copilot
6. Settings (pinned to bottom)

**Top Bar:** Profile avatar + name (right side)

**UI Defaults:** Light mode default. Responsive — web-first, mobile-second. shadcn/ui handles responsive breakpoints.

**Settings absorbs old Admin:** Profile settings, project management (Quick Create, etc.), system config, user preferences all move here.

**Suggested Sub-Modules:**

**1. Dashboard**
- Portfolio overview — project counts by phase (Conceptual → Completed), filterable by project type (NS, WIW, MC, ER, FC, F&D)
- My Projects — cards or table for the PM's active projects with status, next milestone, days until next gate
- Alerts/Action Items — overdue milestones, missing SiteFolio data (from Audit Report), pending RFIs, upcoming bid deadlines
- Schedule variance heatmap — projects with largest baseline-to-projected drift
- Quick stats — total active projects, total budget, projects in construction, projects in bidding
- Data freshness indicator — last sync time for SiteFolio reports

**2. Projects**
- Project list (table view, filterable/sortable by type, phase, PM, store #, year)
- Project detail view (single project deep dive):
  - Overview tab — address, status, team contacts, latest comment, phase badge
  - Schedule tab — milestone table with 4-date columns (Baseline/Projected/Proj Alt/Actual), variance highlighting, Gantt-style visual
  - Budget tab — hierarchical line items, version history, budget-to-actuals
  - Bidding tab — bid packages, GC comparison, Detail Analysis integration
  - Requests tab — ASI/PR/RFI lists with status filters
  - Documents tab — folder tree browser, file download, search
  - Team tab — directory by category (Owner, Consultant, Contractor, Sub, etc.)
  - Photos tab — library browser with thumbnails
- Project comparison view — side-by-side schedule/budget comparison across 2+ projects
- Project timeline — visual timeline of key milestones across multiple projects (portfolio Gantt)

**3. Reports**
- Division Construction Status Report — auto-download, parse, display as interactive table
- Audit Report — data completeness dashboard, flag projects with missing sections
- SiteFolio native reports — PUR, Change Order Log, Project Directory, etc. (direct download links)
- Custom reports — AI-generated analysis (schedule variance, budget trends, PM workload distribution)
- Export — generate XLSX/PDF from any report view

**4. Resources**
- Knowledge base — SOPs, PM Guides, flowcharts (the docs we already built)
- Bid review procedures — meeting format, what to look for, template PPTX
- System guides — SiteFolio, Coupa, Oracle transaction walkthroughs
- Templates — email templates (rejection letters, Round 2 notifications, etc.), checklists
- Contacts directory — searchable team directory pulled from SiteFolio
- Document library — reference documents, standards, company policies

**5. Copilot**
- **Two access modes:**
  - Full-page experience via side nav (dedicated Copilot page for complex multi-step tasks)
  - Floating slide-over panel accessible from ANY page via persistent icon (quick tasks without losing context)
- Chat interface — paste email/context, AI analyzes and takes action
- Bid Review Assistant — full pipeline: fetch SOV data → analyze → generate prep XLSX → generate post-meeting emails
- Email Drafter — rejection letters, Round 2 notifications, RFI responses, status updates
- Schedule Analyzer — "show me projects at risk" or "what's the variance on KS-028"
- Meeting Prep — "prep me for the KS-012 bid review" → pulls all relevant data
- New PM Onboarding — "tell me everything about project 620-00164-01"
- Weekly Status Drafting — pull latest schedule + comments → draft weekly update
- SiteFolio Navigator — "find the trade proposals for KS-012" → navigates to the right folder/page

**6. Settings**
- Profile — name, email, role, avatar, notification preferences
- Project Management — Quick Create, project import, bulk operations
- SiteFolio Connection — auth status, session health, manual re-auth trigger
- Data Sync — refresh schedule, manual sync trigger, sync history/logs
- App Preferences — theme (light/dark), default views, table density, date format
- AI Settings — Claude API key, model preference, copilot behavior tuning
- User Management — (future: multi-user support, roles, permissions)

---

### 5. (Next idea goes here)


---

*Last updated: April 13, 2026 (bid review workflow added)*

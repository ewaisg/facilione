# FaciliOne — Build Plan

**Version:** 1.0 (April 13, 2026)
**Stack:** Next.js 15 (App Router) + shadcn/ui + Tailwind v4 + Firebase + Vercel + Claude API

---

## Phase 0: Project Init
**Agent:** Architect
**Duration:** 1 session

- [ ] `npx create-next-app@latest facilione` (TypeScript, App Router, Tailwind, ESLint)
- [ ] Initialize shadcn/ui: `npx shadcn@latest init`
- [ ] Install core shadcn components: Button, Card, Table, Tabs, Sheet, Dialog, Input, Form, Select, Badge, Skeleton, Alert, Avatar, DropdownMenu, Separator, ScrollArea, Command, Tooltip
- [ ] Set up Firebase: `npm install firebase firebase-admin`
- [ ] Create `firebase.ts` (client config), `firebase-admin.ts` (server config)
- [ ] Create `.env.example` with all required env vars
- [ ] Create route group structure: `app/(auth)/`, `app/(app)/`
- [ ] Create placeholder `page.tsx` for every route in `APP-MODULE-TREE.md`
- [ ] Set up Vercel project, link repo, configure env vars
- [ ] First deploy: verify blank app loads at `facilione.vercel.app`
- [ ] Copy all reference docs into `docs/` folder in repo
- [ ] **QA:** Build succeeds, deploys, all routes return 200

---

## Phase 1: Shell & Navigation
**Agents:** UI Builder + Architect
**Duration:** 1–2 sessions

- [ ] Build app layout (`app/(app)/layout.tsx`):
  - [ ] Side navigation (collapsible, 6 modules, Settings pinned bottom)
  - [ ] Top bar (app logo, notification bell with badge, profile avatar + name + dropdown)
  - [ ] Main content area
  - [ ] Responsive: hamburger menu on mobile
- [ ] Build auth layout + login page (`app/(auth)/`)
  - [ ] Firebase Google auth
  - [ ] Auth middleware (redirect unauthenticated users to login)
- [ ] Build Copilot floating button + Sheet (empty chat shell, renders on all pages)
- [ ] Light mode default, dark mode toggle in top bar or Settings
- [ ] Navigation: active state highlighting, route transitions
- [ ] **QA:** Nav works on mobile + desktop, auth flow works, all routes accessible, responsive breakpoints correct

---

## Phase 2: Data Layer Foundation
**Agents:** Backend Builder + Architect
**Duration:** 2–3 sessions

- [ ] Set up Firestore collections and TypeScript types:
  - [ ] `projects` — project metadata (number, store, city, type, phase, PM, size, GC, opening date)
  - [ ] `schedules` — milestone data per project
  - [ ] `contacts` — team directory entries
  - [ ] `sync_logs` — sync history
  - [ ] `user_preferences` — per-user settings
  - [ ] `sitefolio_sessions` — auth cookies (already exists from prior work)
- [ ] Build SiteFolio proxy layer:
  - [ ] `lib/sitefolio/client.ts` — cookie-authenticated fetch wrapper
  - [ ] `lib/sitefolio/auth.ts` — read cookies from Firestore, attach to requests
  - [ ] `/api/sitefolio/page/[type]/route.ts` — generic page fetch proxy
  - [ ] `/api/sitefolio/asmx/route.ts` — ASMX POST proxy
- [ ] Build report parsers:
  - [ ] `lib/parsers/construction-status.ts` — parse P15 XLSX into typed project objects
  - [ ] `lib/parsers/audit-report.ts` — parse P16 XLS into typed audit objects
  - [ ] `/api/reports/download/route.ts` — download + parse + return JSON
- [ ] Build data sync:
  - [ ] `/api/sync/reports/route.ts` — download both reports, parse, upsert to Firestore
  - [ ] Manual trigger from Settings page
- [ ] Seed Firestore with initial report data (run sync once)
- [ ] **QA:** API routes return correct data shapes, Firestore populated, types compile

---

## Phase 3: Dashboard
**Agents:** UI Builder + Backend Builder
**Duration:** 1–2 sessions

- [ ] Portfolio Summary widget:
  - [ ] Project counts by phase (pipeline visual or horizontal bar)
  - [ ] Filter chips by project type
  - [ ] Quick stats cards: total active, total budget, in construction, in bidding
- [ ] My Projects widget:
  - [ ] Cards or compact table: project #, store, phase badge, next milestone, days to gate
  - [ ] Click → navigate to project detail
- [ ] Alerts & Action Items widget:
  - [ ] Overdue milestones (calculated from schedule data)
  - [ ] Upcoming bid deadlines
  - [ ] Missing data flags (from audit report)
  - [ ] Badge count → feeds top bar notification bell
- [ ] Schedule Variance widget:
  - [ ] Ranked list: projects with largest drift
  - [ ] Click → project detail schedule tab
- [ ] Data Freshness indicator:
  - [ ] Last sync timestamp
  - [ ] Refresh button
- [ ] **QA:** Dashboard loads with real data, responsive, all links work

---

## Phase 4: Projects Module
**Agents:** UI Builder + Backend Builder
**Duration:** 3–4 sessions

### 4a: Project List
- [ ] DataTable with columns: Project #, Store, City, Type, Phase, PM, GC, Size, Opening
- [ ] Filters: type, phase, PM, year
- [ ] Search: project #, store name, city
- [ ] Data source: Firestore `projects` collection (seeded from P15/P16)
- [ ] Row click → project detail

### 4b: Project Detail — Overview Tab
- [ ] Header: project # + store + city + phase badge + type badge
- [ ] Address + map link
- [ ] Latest general comment
- [ ] Key team contacts (PM, GC, Architect — summary cards)
- [ ] Upcoming milestones (next 5)
- [ ] CA numbers + amounts
- [ ] Data source: on-demand fetch from SiteFolio P3 (Overview) + P13 (Classification)
- [ ] Cache fetched data in Firestore

### 4c: Project Detail — Schedule Tab
- [ ] Milestone table: phase grouping, 4 date columns, completion %, variance highlighting
- [ ] Expand/collapse by phase
- [ ] Color coding: green (on track), yellow (slipping <2 weeks), red (overdue)
- [ ] Milestone notes expandable inline
- [ ] Data source: on-demand fetch from P4 (Schedule)

### 4d: Project Detail — Bidding Tab
- [ ] Bid package list
- [ ] Bid comparison table (GC totals, rank, exclusions, duration)
- [ ] Detail Analysis: CSI line-item grid per GC
- [ ] "Analyze with Copilot" button → launches bid review assistant
- [ ] Data source: on-demand fetch from P11 (Bidding page HTML)

### 4e: Project Detail — Remaining Tabs (Budget, Contracts, Requests, Documents, Team, Photos)
- [ ] Budget: hierarchical tree, version selector, export buttons — P9
- [ ] Contracts: SOV table, attachments download — P10
- [ ] Requests: sub-tabs ASI/PR/RFI, status filters — P6/P7/P8
- [ ] Documents: folder tree, file list, download links — P12
- [ ] Team: category-grouped directory, contact cards — P5
- [ ] Photos: library grid, thumbnails — P3 (PhotoLibrary ASMX)

### 4f: Project Comparison + Portfolio Timeline
- [ ] Comparison: select 2+ projects, side-by-side schedule/budget
- [ ] Timeline: multi-project Gantt with key milestones

- [ ] **QA:** All tabs load with real data, navigation between tabs works, responsive

---

## Phase 5: Reports Module
**Agents:** UI Builder + Backend Builder
**Duration:** 1–2 sessions

- [ ] Division Status: interactive DataTable from P15 data, section filter, export
- [ ] Data Completeness: audit dashboard from P16 data, completeness scores, heatmap
- [ ] SiteFolio Reports: project selector → generate direct download URLs for native reports
- [ ] Custom Reports: placeholder for AI-generated reports (wired in Phase 7)
- [ ] **QA:** Reports load, filters work, exports download correctly

---

## Phase 6: Resources Module
**Agents:** UI Builder
**Duration:** 1–2 sessions

- [ ] Knowledge Base: file browser for SOPs/guides, categorized by project type, searchable
- [ ] Procedures: structured procedure pages (bid review, contract routing, etc.)
- [ ] System Guides: SiteFolio/Coupa/Oracle walkthroughs
- [ ] Templates: downloadable email templates, XLSX templates, checklists
- [ ] Contacts Directory: searchable table, filter by company/role/project
- [ ] Data source: Firebase Storage for static files, Firestore for contacts
- [ ] **QA:** All resources accessible, search works, downloads work

---

## Phase 7: Copilot
**Agents:** Copilot Builder + Backend Builder
**Duration:** 3–4 sessions

### 7a: Chat Infrastructure
- [ ] Claude API route (`/api/copilot/chat/route.ts`)
- [ ] Streaming chat UI (Vercel AI SDK)
- [ ] System prompt with PM context, project list, role
- [ ] Full-page copilot (`/copilot`)
- [ ] Floating panel (Sheet component, shared chat engine)
- [ ] Suggested prompts / quick actions

### 7b: Bid Review Assistant Tool
- [ ] Tool: `bid_review` — accepts project # + bid package
- [ ] Fetches SOV data via backend API
- [ ] Analyzes: missing scope, extra scope, variances, duration, alternates
- [ ] Generates comparison output (table in chat + downloadable XLSX)

### 7c: Email Drafter Tool
- [ ] Tool: `draft_email` — accepts context (email paste, task type)
- [ ] Generates: rejection letters, Round 2 notifications, RFI responses, status updates
- [ ] Output: formatted email in chat with copy button

### 7d: Remaining Copilot Tools
- [ ] `analyze_schedule` — variance queries, at-risk projects
- [ ] `prep_meeting` — pull all relevant data for a specific meeting
- [ ] `brief_project` — comprehensive project summary
- [ ] `navigate_sitefolio` — find documents/pages

### 7e: Custom Reports via Copilot
- [ ] Wire Copilot into Reports > Custom: user describes what they want → AI generates analysis
- [ ] Export AI-generated reports as XLSX/PDF

- [ ] **QA:** All tools work with real data, streaming works, floating panel and full-page share state

---

## Phase 8: Settings Module
**Agents:** UI Builder + Backend Builder
**Duration:** 1 session

- [ ] Profile: edit name, avatar upload, notification preferences
- [ ] Projects Management: manual project create, import trigger
- [ ] SiteFolio Connection: status indicator, re-auth trigger, health check
- [ ] Data Sync: schedule config, manual trigger, sync log viewer
- [ ] App Preferences: theme toggle, default page, table density, date format
- [ ] AI Settings: API key management, model preference, token usage
- [ ] **QA:** All settings save and persist, SiteFolio status accurate

---

## Phase 9: Polish & Deploy
**Agents:** All
**Duration:** 1–2 sessions

- [ ] Performance: lazy load heavy components, optimize bundle size
- [ ] Loading states: Skeleton components on every data-fetching page
- [ ] Error states: error.tsx for every route, Alert components for API failures
- [ ] Empty states: meaningful messages when no data (new user, no projects, etc.)
- [ ] Mobile polish: test all pages at 375px, fix any overflow/layout issues
- [ ] Accessibility: keyboard nav, screen reader, color contrast
- [ ] Docs Writer: finalize README, ARCHITECTURE, CHANGELOG, all inline docs
- [ ] Final QA pass: full regression across all modules
- [ ] Production deploy to Vercel
- [ ] **QA:** Full regression pass, Lighthouse scores, mobile testing

---

## Build Order Rationale

| Phase | Why This Order |
|---|---|
| 0 (Init) | Can't build anything without scaffolding |
| 1 (Shell) | Navigation and auth must exist before any pages |
| 2 (Data) | Backend and data layer must exist before UI can display real data |
| 3 (Dashboard) | First thing users see — validates the data pipeline end-to-end |
| 4 (Projects) | Core module, most complex — benefits from established patterns |
| 5 (Reports) | Leverages same data layer as Dashboard, relatively simple UI |
| 6 (Resources) | Static content, low risk, can be built in parallel |
| 7 (Copilot) | Most ambitious feature — needs all other data sources working first |
| 8 (Settings) | Low priority for MVP, but needed for production use |
| 9 (Polish) | Final pass only makes sense when all features exist |

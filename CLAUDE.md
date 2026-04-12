# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FaciliOne is a web-first, AI-powered PM command center for Facility Engineering Project Managers and Construction Managers. It consolidates project planning, scheduling, budgeting, document management, and AI-assisted tools into a single platform. It works alongside Oracle, Coupa, and SiteFolio — it does not replace them.

The full product blueprint lives at `src/docs/FaciliOne_Blueprint.md`.

## Tech Stack

- **Framework:** Next.js 15 (App Router) with React 19, TypeScript, Tailwind CSS v4
- **Backend/DB:** Firebase (Firestore, Auth, Storage) — Firebase Admin SDK for API routes
- **UI:** Radix UI primitives + shadcn/ui pattern (`src/components/ui/`), Lucide icons
- **AI:** OpenAI-compatible client (`src/lib/ai/client.ts`) with runtime config
- **Other:** ExcelJS/XLSX for spreadsheet I/O, Mermaid for flowcharts, Zod for validation, react-hook-form

## Commands

```bash
npm run dev          # Dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint (next/core-web-vitals + next/typescript)
npm run format       # Prettier format all src files
npm run format:check # Prettier check without writing
```

No test framework is configured.

## Architecture

### Route Groups

- `src/app/(app)/` — Authenticated app shell (sidebar + topbar layout). All main pages live here.
- `src/app/(auth)/` — Login and forgot-password pages (no app shell).
- `src/app/api/` — Next.js API routes for admin operations, AI endpoints, seeding, and health checks.

### Auth & Access Control

- Firebase email/password auth only — no self-signup, admin creates users.
- `AuthProvider` (`src/lib/firebase/auth-context.tsx`) wraps the app, provides `useAuth()` hook returning `AppUser`.
- Four roles: `admin`, `cm` (Construction Manager), `pm` (Project Manager), `director`.
- Client-side route guarding in `src/app/(app)/layout.tsx` via `canAccessPath()` from `src/lib/access-control.ts`.
- API routes authenticate via `__session` cookie using Firebase Admin (`src/lib/firebase-admin/request-auth.ts`).

### Key Directories

- `src/lib/firebase/` — Client-side Firebase (auth, Firestore, storage helpers)
- `src/lib/firebase-admin/` — Server-side Firebase Admin SDK
- `src/lib/schedule/` — Schedule/Gantt logic, SiteFolio import parsers, template engine
- `src/lib/ai/` — AI client, runtime config, comparison/historical analysis
- `src/lib/cost-review/` — Cost review export logic
- `src/types/` — All TypeScript types (barrel-exported from `src/types/index.ts`)
- `src/constants/` — Domain data: project types, SOP content, Oracle report definitions, estimate presets, schedule data
- `src/components/ui/` — Reusable shadcn/ui components
- `src/components/layout/` — Sidebar and topbar

### Firestore Collections

Key collections: `users`, `organizations`, `projects` (with subcollections), `estimates`, `costReviews`, `costReviewImports`, `costReviewInputs`, `costReviewSettings`, `kb` (knowledge base: SOPs/flowcharts), `ai-sessions`, `notifications`, `imports`, `userPreferences`, `customization`. Security rules are in `firestore.rules`.

### Project Types

Six types: NS (New Store), ER (Existing Remodel), WIW (Walk-In Walk-Out), FC (Fixture Changeout), MC (Maintenance/Capital), F&D (Floor & Decor). Defined in `src/constants/project-types.ts`.

## Conventions

- Path alias: `@/` maps to `src/`
- Formatting: Prettier configured in `.prettierrc`
- ESLint: unused vars prefixed with `_` are allowed
- UI toast notifications use `sonner` (`toast()` from `"sonner"`)
- Deployment target: Vercel (facilione.vercel.app)
- Firebase project: `facilione` (see `.firebaserc`)

# MAP: Authentication & Access Control

Scan date: 2026-04-11

---

## Module Tree

```
src/
├── middleware.ts                           Edge middleware — redirects unauthenticated users to /login
├── lib/
│   ├── access-control.ts                  Route and nav access control functions
│   └── firebase/
│       └── auth-context.tsx               AuthProvider + useAuth() hook
├── lib/firebase-admin/
│   ├── index.ts                           Admin SDK (adminAuth, adminDb)
│   └── request-auth.ts                    API route auth (requireAppUser, requireRoles)
├── app/(auth)/
│   ├── layout.tsx                         Auth layout (centered, no sidebar)
│   ├── login/page.tsx                     Login page
│   └── forgot-password/page.tsx           Password reset page
└── app/(app)/layout.tsx                   App shell with auth guard
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /login | src/app/(auth)/login/page.tsx | Client | No | All (unauthenticated) |
| /forgot-password | src/app/(auth)/forgot-password/page.tsx | Client | No | All (unauthenticated) |

## Components

| File | Used By | Props | Client/Server |
|---|---|---|---|
| src/components/providers.tsx | src/app/layout.tsx | children | Client |

## Types & Interfaces

| Type Name | File | Fields | Used By |
|---|---|---|---|
| UserRole | src/types/user.ts | "admin" \| "cm" \| "pm" | Throughout codebase |
| AppUser | src/types/user.ts | uid, email, displayName, role, assignedProjectIds, managedUserIds, orgId, forcePasswordChange, createdAt, createdBy, avatarUrl? | Throughout codebase |
| AuthContextType | src/lib/firebase/auth-context.tsx | user, firebaseUser, loading, signIn, signOut, sendResetEmail, updateUserPassword | Internal to AuthProvider |

## Key Exports

| File | Exports |
|---|---|
| src/lib/access-control.ts | canAccessPath(role, pathname): boolean, canSeeNavItem(role, allowedRoles?): boolean |
| src/lib/firebase/auth-context.tsx | AuthProvider (component), useAuth() (hook) |
| src/lib/firebase-admin/request-auth.ts | requireAppUser(req), requireRoles(req, roles[]) |
| src/middleware.ts | middleware(request), config |

## Role-Based Access

| Action | admin | cm | pm |
|---|---|---|---|
| Access /login | Yes | Yes | Yes |
| Access /forgot-password | Yes | Yes | Yes |
| Access /admin | Yes | No | No |
| Access all other app routes | Yes | Yes | Yes |

## Auth Flow

1. Edge middleware (src/middleware.ts) checks `__session` cookie; redirects to /login if missing
2. App layout (src/app/(app)/layout.tsx) uses `useAuth()` to verify user; redirects to /login if null
3. App layout calls `canAccessPath()` for role-based route guarding (only /admin is restricted)
4. API routes use `requireAppUser()` or `requireRoles()` to verify `__session` cookie or Bearer token via Firebase Admin

## Session Cookie

- Name: `__session`
- Set by: `auth-context.tsx` on sign-in and token refresh via `onIdTokenChanged`
- Max age: 7 days
- Verified by: Firebase Admin SDK (both session cookie and ID token verification attempted)

## Route Access Rules

Only one rule defined in `src/lib/access-control.ts`:
- `/admin` prefix: restricted to `["admin"]`
- All other routes: open to any authenticated user

## Firestore Collections

| Collection Path | Read By | Written By |
|---|---|---|
| users/{userId} | auth-context.tsx (profile fetch) | Admin API routes |

## Dependencies

- Imports from: @/types, @/lib/firebase, @/lib/firebase-admin
- Imported by: Every page/component via useAuth(), every API route via request-auth
- External: firebase/auth, firebase/firestore, firebase-admin/app, firebase-admin/auth

## Status

Fully implemented. All auth flows are operational.

## Discrepancies Found

- CLAUDE.md lists four roles including "director" but UserRole type in code only defines "admin" | "cm" | "pm". No director role exists anywhere in code.

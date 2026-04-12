# MAP: Profile

Scan date: 2026-04-11

---

## Module Tree

```
src/app/(app)/profile/page.tsx
```

## Pages & Routes

| Path | File | Client/Server | Auth Required | Allowed Roles |
|---|---|---|---|---|
| /profile | src/app/(app)/profile/page.tsx | Client | Yes | admin, cm, pm |

## Key Features

1. **Account Information**: Avatar, display name, role badge, email, organization ID
2. **Change Password**: Re-authenticates with current password, then updates via Firebase Auth
3. **Sign Out**: Signs out and redirects to /login

## Role Labels (defined inline)

- admin -> "Administrator"
- cm -> "Construction Manager"
- pm -> "Project Manager"

## Dependencies

- Imports from: @/lib/firebase/auth-context, @/components/ui/*, firebase/auth (EmailAuthProvider, reauthenticateWithCredential)
- External: lucide-react, next/navigation, sonner

## Firestore Collections

None accessed directly. User data comes from useAuth() hook (cached from users/{uid}).

## Status

Fully implemented.

## Discrepancies Found

None.

# MAP: Notifications

Scan date: 2026-04-11

---

## Module Tree

```
(No dedicated files)
```

## Firestore Collections

| Collection Path | Security Rules | Client Code |
|---|---|---|
| notifications/{notificationId} | Read: owner only. Create/Delete: admin. Update: owner. | None |

## UI Presence

- Bell icon button in Topbar (src/components/layout/topbar.tsx) — renders a static Bell icon with no click handler or notification count
- No notification fetching, display, or management code exists

## Status

Rules-only. No implementation exists beyond the Firestore security rules and a static bell icon in the topbar.

## Discrepancies Found

- Firestore security rules define a full notifications collection with read/write rules, but no code reads or writes this collection.
- Topbar bell icon is purely decorative — no onClick handler, no badge count, no dropdown.

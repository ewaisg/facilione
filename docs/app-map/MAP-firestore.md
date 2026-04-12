# MAP: Firestore

Scan date: 2026-04-11

---

## Module Tree

```
firestore.rules                             Security rules
firestore.indexes.json                      Composite indexes
src/lib/firebase/
├── index.ts                                Client SDK init (auth, db, storage)
├── firestore.ts                            Project/Phase/WeeklyUpdate DAL
├── estimates.ts                            Estimate DAL
├── ai-sessions.ts                          AI session/message DAL
└── storage.ts                              Firebase Storage helpers
src/lib/firebase-admin/
├── index.ts                                Admin SDK (adminAuth, adminDb)
└── request-auth.ts                         API auth middleware
```

## Collections

### users/{userId}
| Field | Type | Notes |
|---|---|---|
| uid | string | Same as document ID |
| email | string | |
| displayName | string | |
| role | UserRole | "admin" \| "cm" \| "pm" |
| orgId | string | Default: "default" |
| assignedProjectIds | string[] | |
| managedUserIds | string[] | CMs manage PMs |
| forcePasswordChange | boolean | |
| createdAt | string | ISO date |
| createdBy | string | |
| avatarUrl | string? | Optional |

**Rules**: Read by self, admin, or CM managing the user. Write by admin only.
**Read by**: auth-context.tsx, admin users tab, team page
**Written by**: admin users API routes

### organizations/{orgId}
**Rules**: Read by authenticated users in same org. Write by admin in same org.
**Read/Written by**: No code currently reads or writes this collection.

### customization/{orgId}/{document=**}
**Rules**: Read by authenticated users in same org. Write by admin in same org.
**Read/Written by**: No code currently reads or writes this collection. Placeholder for Phase 6.

### projects/{projectId}
| Field | Type | Notes |
|---|---|---|
| id | string | Document ID |
| storeNumber | string | |
| storeName | string | |
| storeAddress | string | |
| storeCity | string | |
| storeState | string | |
| projectType | ProjectType | "NS"\|"ER"\|"WIW"\|"FC"\|"MC"\|"F&D" |
| status | ProjectStatus | "planning"\|"active"\|"on-hold"\|"complete"\|"cancelled" |
| healthStatus | HealthStatus | "green"\|"yellow"\|"red" |
| grandOpeningDate | string \| null | |
| constructionStartDate | string \| null | |
| pmUserId | string | Assigned PM |
| cmUserId | string \| null | Assigned CM |
| orgId | string | |
| oracleParentProject | string | |
| oracleProjectNumber | string \| null | |
| currentPhaseIndex | number | |
| totalBudget | number | |
| committedCost | number | |
| actualCost | number | |
| forecastCost | number | |
| notes | string | |
| tags | string[] | |
| sfSchedule | SfMilestoneState[]? | Stored as untyped field |
| createdAt | string | |
| updatedAt | string | |

**Rules**: Read by admin, assigned PM, or managing CM. Create by admin/PM/CM. Update by admin/PM/CM. Delete by admin only.
**Read by**: Dashboard, Projects, Project Detail, Team, Estimator
**Written by**: Admin project APIs, project detail page (sfSchedule updates)

### projects/{pid}/phases/{phaseId}
| Field | Type | Notes |
|---|---|---|
| id | string | |
| projectId | string | |
| phaseNumber | number | |
| name | string | |
| targetStartWeekOffset | number \| null | |
| targetEndWeekOffset | number \| null | |
| targetStartDate | string \| null | |
| targetEndDate | string \| null | |
| actualStartDate | string \| null | |
| actualEndDate | string \| null | |
| status | PhaseStatus | |
| checklistItems | ChecklistItem[] | |
| sopReference | string \| null | |
| notes | string | |

**Rules**: Same as parent project.
**Read by**: Project detail (subscribeToPhases)
**Written by**: Admin project create (batch seed), project detail (updateMilestoneDate)

### projects/{pid}/weeklyUpdates/{updateId}
| Field | Type | Notes |
|---|---|---|
| id | string | Document ID (format: `{weekStart}_{userId}`) |
| projectId | string | |
| weekStart | string | ISO date (Monday) |
| comment | string | |
| createdBy | string | userId |
| createdByName | string | |
| createdAt | string | |
| updatedAt | string | |

**Rules**: Same as parent project (wildcard sub-collection rule).
**Read by**: Dashboard (getLatestProjectWeeklyUpdate)
**Written by**: firestore.ts (upsertProjectWeeklyUpdate), admin parsing apply route

### ai-sessions/{sessionId}
| Field | Type | Notes |
|---|---|---|
| id | string | |
| userId | string | |
| title | string | |
| projectId | string? | Optional |
| projectType | ProjectType? | Optional |
| createdAt | string | |
| updatedAt | string | |

**Rules**: Read by owner or admin. Write/create by owner.
**Read by**: FE Copilot page, inline panel
**Written by**: FE Copilot page, inline panel

### ai-sessions/{sid}/messages/{messageId}
| Field | Type | Notes |
|---|---|---|
| id | string | |
| role | "user" \| "assistant" | |
| content | string | |
| citations | string[]? | Optional |
| timestamp | string | |

### estimates/{estimateId}
| Field | Type | Notes |
|---|---|---|
| id | string | |
| userId | string | |
| projectId | string \| null | |
| projectInfo | EstimateProjectInfo | |
| sections | EstimateSection[] | |
| comparisonContext | EstimateComparisonContext? | Optional |
| createdAt | string | |
| updatedAt | string | |

**Rules**: Read by admin, owner, or project PM. Create by any authenticated. Update/delete by admin or owner.
**Read by**: Estimator page, historical-comparisons.ts
**Written by**: Estimator page (saveEstimate)

### costReviews/{id}
**Rules**: Read by admin, project PM, managing CM. Create by admin/PM/CM. Update by admin/PM/CM. Delete by admin.
**Read by**: historical-comparisons.ts
**Written by**: No client code yet (future cost review tool)

### costReviewImports/{id}, costReviewInputs/{id}, costReviewSettings/{id}
**Rules**: See firestore.rules.
**Read/Written by**: No client code yet.

### kb/{collection}/{docId} (sops, flowcharts, templates)
**Rules**: Read by any authenticated. Write by admin only.
**Written by**: Seed routes (seed-sops, seed-flowcharts, seed-templates)
**Read by**: SOP and flowchart pages read from constants (not Firestore). Templates read from templates.json.

### imports/{importId}
**Rules**: Read by any authenticated. Create by any. Update/delete by admin.
**Written by**: admin parsing apply route

### notifications/{notificationId}
**Rules**: Read by owner. Create/delete by admin. Update by owner.
**Read/Written by**: No client code.

### userPreferences/{userId}
**Rules**: Read/write by self. Read by admin.
**Read/Written by**: No client code.

### systemSettings/ai
**Rules**: No explicit rule (falls through to deny).
**Read/Written by**: runtime-config.ts (read via adminDb), admin AI config route (read/write via adminDb)

### comparisonSnapshots/{id}
**Rules**: No explicit rule (falls through to deny).
**Written by**: comparison-snapshots import API route (via adminDb)
**Read by**: historical-comparisons.ts (via adminDb)

### estimateComparisonForms/{id}
**Rules**: No explicit rule (falls through to deny).
**Written by**: estimate-comparison-forms import API route (via adminDb)
**Read by**: historical-comparisons.ts (via adminDb)

### sitefolio_sessions/current
**Rules**: Read by admin. Write by server only (false for client).
**Read/Written by**: session-store.ts (via adminDb)

## Composite Indexes

| Collection | Fields | Query Scope |
|---|---|---|
| projects | pmUserId ASC, updatedAt DESC | COLLECTION |
| projects | orgId ASC, updatedAt DESC | COLLECTION |
| costReviews | projectId ASC, reviewDate DESC | COLLECTION |
| costReviewImports | costReviewId ASC, importedAt DESC | COLLECTION |

## Status

Security rules: Comprehensive. 15 top-level collection rules defined.
Client DAL: Implemented for projects, phases, weeklyUpdates, estimates, ai-sessions.
Admin DAL: All via adminDb (no client-side write for admin operations).

## Discrepancies Found

- `systemSettings` collection has no security rule in firestore.rules. It is only accessed via Firebase Admin SDK, so client access would be denied by default (no matching rule). This is safe but should be documented.
- `comparisonSnapshots` and `estimateComparisonForms` have no security rules. Accessed only via Admin SDK.
- `organizations` and `customization` collections have security rules but no code reads or writes them.
- `notifications` and `userPreferences` collections have security rules but no client code uses them.
- `costReviews`, `costReviewImports`, `costReviewInputs`, `costReviewSettings` have security rules and indexes but minimal client usage (only historical-comparisons reads costReviews).
- KB documents (sops, flowcharts, templates) are seeded to Firestore but the pages read from constants/JSON files, not from Firestore.

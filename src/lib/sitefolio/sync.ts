import { adminDb } from "@/lib/firebase-admin"
import { sfPageFetch } from "@/lib/sitefolio/fetch"
import { parseProjectsList } from "@/lib/sitefolio/parsers"
import { parseOverview } from "@/lib/sitefolio/parsers"
import { parseSchedule } from "@/lib/sitefolio/parsers"
import type { SiteFolioSyncMeta } from "@/types/sitefolio"

// ---------------------------------------------------------------------------
// SiteFolio URL helpers
// ---------------------------------------------------------------------------

/**
 * Build the SiteFolio projects-list URL for a given contact/business pair.
 */
export function buildProjectsListUrl(
  contactId: number,
  businessId: number,
): string {
  return `/Kroger/ViewContactProjects.sf?idContact=${contactId}&idBusiness=${businessId}`
}

const SF_OVERVIEW = (id: number) =>
  `/Kroger/ProjectOverviewView.sf?idProject=${id}&idfilter=0`

const SF_SCHEDULE = (id: number) =>
  `/Kroger/Scheduling.sf?idProject=${id}&idfilter=0`

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SyncResult {
  totalFound: number
  synced: number
  skipped: number
  errors: { projectNumber: string; error: string }[]
}

// ---------------------------------------------------------------------------
// syncAllProjects — full sweep
// ---------------------------------------------------------------------------

export async function syncAllProjects(
  contactId?: number,
  businessId?: number,
): Promise<SyncResult> {
  // Resolve contact/business IDs — use provided values or fall back to session
  let cid = contactId
  let bid = businessId
  if (!cid || !bid) {
    const { getStoredSession } = await import("@/lib/sitefolio/session-store")
    const session = await getStoredSession()
    if (session) {
      cid = cid || session.memberId
      bid = bid || session.enterpriseId
    }
  }
  if (!cid || !bid) {
    throw new Error(
      "No contactId/businessId provided and no active SiteFolio session",
    )
  }

  const html = await sfPageFetch(buildProjectsListUrl(cid, bid))
  const sfProjects = parseProjectsList(html)

  const result: SyncResult = {
    totalFound: sfProjects.length,
    synced: 0,
    skipped: 0,
    errors: [],
  }

  for (const sfProject of sfProjects) {
    // Try to find matching FaciliOne project
    let facilOneProjectId: string | null = null

    // First try: match by sfProjectId
    const byIdSnap = await adminDb
      .collection("projects")
      .where("sfProjectId", "==", sfProject.sfProjectId)
      .limit(1)
      .get()

    if (!byIdSnap.empty) {
      facilOneProjectId = byIdSnap.docs[0].id
    }

    // Fallback: match by storeNumber
    if (!facilOneProjectId && sfProject.storeNumber) {
      const byStoreSnap = await adminDb
        .collection("projects")
        .where("storeNumber", "==", sfProject.storeNumber)
        .limit(1)
        .get()

      if (!byStoreSnap.empty) {
        facilOneProjectId = byStoreSnap.docs[0].id
      }
    }

    if (!facilOneProjectId) {
      result.skipped++
      continue
    }

    try {
      await syncProject(sfProject.sfProjectId, facilOneProjectId, {
        storeNumber: sfProject.storeNumber,
        storeName: sfProject.storeName,
        storeLocation: sfProject.storeLocation,
        description: sfProject.description,
        projectType: sfProject.projectType,
      })
      result.synced++
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown sync error"
      result.errors.push({
        projectNumber: sfProject.projectNumber || String(sfProject.sfProjectId),
        error: message,
      })
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// syncProject — single project sync
// ---------------------------------------------------------------------------

interface SfListMeta {
  storeNumber?: string
  storeName?: string
  storeLocation?: string
  description?: string
  projectType?: string
}

export async function syncProject(
  sfProjectId: number,
  facilOneProjectId: string,
  listMeta?: SfListMeta,
): Promise<void> {
  const sfRef = adminDb
    .collection("projects")
    .doc(facilOneProjectId)
    .collection("sitefolio")

  const syncedPages: string[] = []
  let lastSyncError: string | undefined

  // --- Overview page ---
  try {
    const overviewHtml = await sfPageFetch(SF_OVERVIEW(sfProjectId))
    const { overview, comments, teamContacts, upcomingMilestones, reportLinks } =
      parseOverview(overviewHtml)

    await sfRef.doc("overview").set(
      { ...overview, upcomingMilestones },
      { merge: true },
    )
    await sfRef.doc("comments").set({ items: comments }, { merge: true })
    await sfRef.doc("team").set({ items: teamContacts }, { merge: true })
    await sfRef.doc("reports").set({ items: reportLinks }, { merge: true })

    syncedPages.push("overview")
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Overview fetch/parse failed"
    lastSyncError = message
  }

  // --- Schedule page ---
  try {
    const scheduleHtml = await sfPageFetch(SF_SCHEDULE(sfProjectId))
    const { phases, milestones, scheduleTemplate } =
      parseSchedule(scheduleHtml)

    await sfRef.doc("schedule").set(
      { phases, milestones, template: scheduleTemplate },
      { merge: true },
    )

    syncedPages.push("schedule")
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Schedule fetch/parse failed"
    lastSyncError = lastSyncError
      ? `${lastSyncError}; ${message}`
      : message
  }

  // --- Determine sync status ---
  let lastSyncStatus: SiteFolioSyncMeta["lastSyncStatus"]
  if (syncedPages.length === 2) {
    lastSyncStatus = "success"
  } else if (syncedPages.length > 0) {
    lastSyncStatus = "partial"
  } else {
    lastSyncStatus = "error"
  }

  // --- Write sync-meta ---
  const syncMeta: SiteFolioSyncMeta = {
    lastSyncAt: new Date().toISOString(),
    lastSyncStatus,
    syncedPages,
    ...(lastSyncError ? { lastSyncError } : {}),
  }

  await sfRef.doc("sync-meta").set(syncMeta, { merge: true })

  // --- Update the main project doc with overview data and sfProjectId ---
  const projectDoc = await adminDb
    .collection("projects")
    .doc(facilOneProjectId)
    .get()

  if (projectDoc.exists) {
    const existing = projectDoc.data() || {}
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (!existing.sfProjectId) {
      updates.sfProjectId = sfProjectId
    }

    // Backfill from SiteFolio project list metadata
    if (listMeta) {
      if (listMeta.storeNumber && !existing.storeNumber) {
        updates.storeNumber = listMeta.storeNumber
      }
      if (listMeta.storeName && !existing.storeName) {
        updates.storeName = listMeta.storeName
      }
    }

    // Read the overview we just synced to backfill address fields
    const overviewSnap = await sfRef.doc("overview").get()
    if (overviewSnap.exists) {
      const ov = overviewSnap.data() as {
        address?: string
        city?: string
        state?: string
        zip?: string
      }

      if (ov.address && !existing.storeAddress) {
        updates.storeAddress = ov.address
      }
      if (ov.city && !existing.storeCity) {
        updates.storeCity = ov.city
      }
      if (ov.state && !existing.storeState) {
        updates.storeState = ov.state
      }
    }

    if (Object.keys(updates).length > 1) {
      await adminDb
        .collection("projects")
        .doc(facilOneProjectId)
        .update(updates)
    }
  }
}

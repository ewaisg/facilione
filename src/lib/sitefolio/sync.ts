import { adminDb } from "@/lib/firebase-admin"
import { sfPageFetch } from "@/lib/sitefolio/fetch"
import { parseProjectsList } from "@/lib/sitefolio/parsers"
import { parseOverview } from "@/lib/sitefolio/parsers"
import { parseSchedule } from "@/lib/sitefolio/parsers"
import type { SiteFolioSyncMeta } from "@/types/sitefolio"

// ---------------------------------------------------------------------------
// SiteFolio URL constants
// ---------------------------------------------------------------------------

const SF_PROJECTS_LIST =
  "/Kroger/ViewContactProjects.sf?idContact=83709&idBusiness=8252"

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

export async function syncAllProjects(): Promise<SyncResult> {
  const html = await sfPageFetch(SF_PROJECTS_LIST)
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
      await syncProject(sfProject.sfProjectId, facilOneProjectId)
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

export async function syncProject(
  sfProjectId: number,
  facilOneProjectId: string,
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

  // --- Stamp sfProjectId on the main project doc if not already set ---
  const projectDoc = await adminDb
    .collection("projects")
    .doc(facilOneProjectId)
    .get()

  if (projectDoc.exists && !projectDoc.data()?.sfProjectId) {
    await adminDb
      .collection("projects")
      .doc(facilOneProjectId)
      .update({ sfProjectId })
  }
}

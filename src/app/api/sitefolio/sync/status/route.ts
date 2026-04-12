import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { adminDb } from "@/lib/firebase-admin"

export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireRoles(req, ["admin"])
  if (!auth.ok) return auth.response

  try {
    // Query all projects that have an sfProjectId set
    const projectsSnap = await adminDb
      .collection("projects")
      .where("sfProjectId", "!=", null)
      .get()

    const projects: {
      projectId: string
      storeNumber: string
      storeName: string
      sfProjectId: number
      syncMeta: Record<string, unknown> | null
    }[] = []

    let lastGlobalSync: string | null = null

    for (const doc of projectsSnap.docs) {
      const data = doc.data()

      // Read the sync-meta subcollection doc
      const metaSnap = await adminDb
        .collection("projects")
        .doc(doc.id)
        .collection("sitefolio")
        .doc("sync-meta")
        .get()

      const syncMeta = metaSnap.exists
        ? (metaSnap.data() as Record<string, unknown>)
        : null

      // Track the most recent sync across all projects
      if (syncMeta?.lastSyncAt && typeof syncMeta.lastSyncAt === "string") {
        if (!lastGlobalSync || syncMeta.lastSyncAt > lastGlobalSync) {
          lastGlobalSync = syncMeta.lastSyncAt
        }
      }

      projects.push({
        projectId: doc.id,
        storeNumber: data.storeNumber || "",
        storeName: data.storeName || "",
        sfProjectId: data.sfProjectId,
        syncMeta,
      })
    }

    return NextResponse.json({ projects, lastGlobalSync })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch sync status"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

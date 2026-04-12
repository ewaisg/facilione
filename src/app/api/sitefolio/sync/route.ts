import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { adminDb } from "@/lib/firebase-admin"
import { syncAllProjects, syncProject } from "@/lib/sitefolio/sync"

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireRoles(req, ["admin"])
  if (!auth.ok) return auth.response

  try {
    const body = await req.json().catch(() => ({}))

    // Single project sync by FaciliOne project ID
    if (body.projectId && typeof body.projectId === "string") {
      const projectDoc = await adminDb
        .collection("projects")
        .doc(body.projectId)
        .get()

      if (!projectDoc.exists) {
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        )
      }

      const sfProjectId = projectDoc.data()?.sfProjectId
      if (!sfProjectId || typeof sfProjectId !== "number") {
        return NextResponse.json(
          { error: "Project has no sfProjectId linked" },
          { status: 400 },
        )
      }

      await syncProject(sfProjectId, body.projectId)
      return NextResponse.json({ ok: true, result: { synced: 1 } })
    }

    // Direct sync by sfProjectId + facilOneProjectId pair
    if (
      typeof body.sfProjectId === "number" &&
      typeof body.facilOneProjectId === "string"
    ) {
      await syncProject(body.sfProjectId, body.facilOneProjectId)
      return NextResponse.json({ ok: true, result: { synced: 1 } })
    }

    // Full sync — all projects
    const result = await syncAllProjects()
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to sync SiteFolio data"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

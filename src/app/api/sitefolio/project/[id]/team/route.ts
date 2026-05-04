import { NextRequest, NextResponse } from "next/server"
import { requireAppUser } from "@/lib/firebase-admin/request-auth"
import { adminDb } from "@/lib/firebase-admin"
import { sfPageFetch, SFSessionExpiredError, SFNoSessionError } from "@/lib/sitefolio/fetch"
import { parseTeamDirectory } from "@/lib/sitefolio/parsers/team"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = await requireAppUser(req)
  if (!auth.ok) return auth.response

  const { id } = await params

  try {
    // Look up the FaciliOne project to get sfProjectId
    const projectDoc = await adminDb.collection("projects").doc(id).get()
    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const sfProjectId = projectDoc.data()?.sfProjectId
    if (!sfProjectId || typeof sfProjectId !== "number") {
      return NextResponse.json(
        { error: "Project has no SiteFolio ID linked" },
        { status: 400 },
      )
    }

    // Check cache freshness — skip re-fetch if synced within the last hour
    const useCache = req.nextUrl.searchParams.get("refresh") !== "1"
    if (useCache) {
      const teamDoc = await adminDb
        .collection("projects")
        .doc(id)
        .collection("sitefolio")
        .doc("team-directory")
        .get()

      if (teamDoc.exists) {
        const cached = teamDoc.data()
        const age = Date.now() - new Date(cached?.fetchedAt || 0).getTime()
        if (age < 60 * 60 * 1000) {
          return NextResponse.json({
            companies: cached?.companies ?? [],
            fetchedAt: cached?.fetchedAt,
            cached: true,
          })
        }
      }
    }

    // Fetch from SiteFolio AJAX directory endpoint
    const html = await sfPageFetch(
      `/Kroger/Directory2/Directory/Index?cache=false&projectID=${sfProjectId}&pdetID=0&enterpriseFilterID=0&directoryEntryFilterID=`,
    )

    const companies = parseTeamDirectory(html)
    const fetchedAt = new Date().toISOString()

    // Cache in Firestore under sitefolio/team-directory
    await adminDb
      .collection("projects")
      .doc(id)
      .collection("sitefolio")
      .doc("team-directory")
      .set({ companies, fetchedAt }, { merge: false })

    return NextResponse.json({ companies, fetchedAt, cached: false })
  } catch (err) {
    if (err instanceof SFSessionExpiredError || err instanceof SFNoSessionError) {
      return NextResponse.json(
        { error: err.message, code: err.name },
        { status: 401 },
      )
    }
    const message = err instanceof Error ? err.message : "Failed to fetch team directory"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { adminDb } from "@/lib/firebase-admin"
import { sfPageFetch } from "@/lib/sitefolio/fetch"
import { parseProjectsList } from "@/lib/sitefolio/parsers"
import { getStoredSession } from "@/lib/sitefolio/session-store"
import { buildProjectsListUrl } from "@/lib/sitefolio/sync"
import type { SiteFolioProject } from "@/types/sitefolio"

export interface PreviewProject extends SiteFolioProject {
  existsInApp: boolean
  facilOneProjectId: string | null
}

/**
 * GET /api/sitefolio/import/preview?contactId=NNNNN&businessId=NNNNN
 *
 * Fetches the SiteFolio projects list for the given contact, checks which
 * ones already exist in FaciliOne, and returns a preview.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = await requireRoles(req, ["admin"])
  if (!auth.ok) return auth.response

  try {
    const url = new URL(req.url)
    let contactId = Number(url.searchParams.get("contactId")) || 0
    let businessId = Number(url.searchParams.get("businessId")) || 0

    // Fall back to session memberId / enterpriseId
    if (!contactId || !businessId) {
      const session = await getStoredSession()
      if (session) {
        contactId = contactId || session.memberId
        businessId = businessId || session.enterpriseId
      }
    }

    if (!contactId || !businessId) {
      return NextResponse.json(
        {
          error:
            "contactId and businessId are required (or an active SiteFolio session)",
        },
        { status: 400 },
      )
    }

    // Fetch and parse SiteFolio projects list
    const html = await sfPageFetch(buildProjectsListUrl(contactId, businessId))
    const sfProjects = parseProjectsList(html)

    // Check which ones already exist in FaciliOne
    const projects: PreviewProject[] = []
    let alreadyLinked = 0

    for (const sfp of sfProjects) {
      let existsInApp = false
      let facilOneProjectId: string | null = null

      // Match by sfProjectId
      const byIdSnap = await adminDb
        .collection("projects")
        .where("sfProjectId", "==", sfp.sfProjectId)
        .limit(1)
        .get()

      if (!byIdSnap.empty) {
        existsInApp = true
        facilOneProjectId = byIdSnap.docs[0].id
      }

      // Fallback: match by storeNumber
      if (!existsInApp && sfp.storeNumber) {
        const byStoreSnap = await adminDb
          .collection("projects")
          .where("storeNumber", "==", sfp.storeNumber)
          .limit(1)
          .get()

        if (!byStoreSnap.empty) {
          existsInApp = true
          facilOneProjectId = byStoreSnap.docs[0].id
        }
      }

      if (existsInApp) alreadyLinked++

      projects.push({ ...sfp, existsInApp, facilOneProjectId })
    }

    return NextResponse.json({ projects, alreadyLinked })
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to preview SiteFolio projects"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

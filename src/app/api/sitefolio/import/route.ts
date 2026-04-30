import { NextRequest, NextResponse } from "next/server"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { adminDb } from "@/lib/firebase-admin"
import { sfPageFetch } from "@/lib/sitefolio/fetch"
import { parseProjectsList } from "@/lib/sitefolio/parsers"
import { getStoredSession } from "@/lib/sitefolio/session-store"
import { buildProjectsListUrl, syncProject } from "@/lib/sitefolio/sync"
import type { SiteFolioProject } from "@/types/sitefolio"
import type { ProjectType } from "@/types/project"

// ---------------------------------------------------------------------------
// Map SiteFolio project type strings to FaciliOne ProjectType enum
// ---------------------------------------------------------------------------

function mapSfProjectType(sfType: string): ProjectType {
  const t = (sfType || "").toLowerCase()
  if (t.includes("new store")) return "NS"
  if (t.includes("remodel") || t.includes("expansion")) return "ER"
  if (t.includes("walk") || t.includes("wiw") || t.includes("within"))
    return "WIW"
  if (t.includes("fuel")) return "FC"
  if (t.includes("floor") || t.includes("f&d") || t.includes("decor"))
    return "F&D"
  return "MC"
}

// ---------------------------------------------------------------------------
// POST /api/sitefolio/import
// ---------------------------------------------------------------------------

/**
 * Import SiteFolio projects into FaciliOne.
 *
 * Body: { contactId?: number, businessId?: number, selectedSfProjectIds?: number[] }
 *
 * - Fetches and parses the SiteFolio projects list for the contact
 * - Creates FaciliOne project docs for new projects (or only selected ones)
 * - Syncs overview + schedule for all (existing and newly created) projects
 * - Returns { found, created, synced, skipped, errors }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireRoles(req, ["admin"])
  if (!auth.ok) return auth.response

  try {
    const body = await req.json().catch(() => ({}))

    let contactId: number = typeof body.contactId === "number" ? body.contactId : 0
    let businessId: number =
      typeof body.businessId === "number" ? body.businessId : 0

    // Fall back to session
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

    // Optional: only import specific SF projects
    const selectedSfProjectIds: number[] | null = Array.isArray(
      body.selectedSfProjectIds,
    )
      ? body.selectedSfProjectIds
      : null

    // Fetch and parse SiteFolio projects list
    const html = await sfPageFetch(buildProjectsListUrl(contactId, businessId))
    const sfProjects = parseProjectsList(html)

    // Filter to selected projects if provided
    const projectsToProcess: SiteFolioProject[] = selectedSfProjectIds
      ? sfProjects.filter((p) => selectedSfProjectIds.includes(p.sfProjectId))
      : sfProjects

    // Get the creator's org ID
    const userSnap = await adminDb.collection("users").doc(auth.uid).get()
    const creatorOrgId =
      String(userSnap.data()?.orgId || "default").trim() || "default"

    const result = {
      found: sfProjects.length,
      created: 0,
      synced: 0,
      skipped: 0,
      errors: [] as { projectNumber: string; error: string }[],
    }

    for (const sfProject of projectsToProcess) {
      let facilOneProjectId: string | null = null

      // Check if project already exists — match by sfProjectId
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

      // If not found, create a new project
      if (!facilOneProjectId) {
        try {
          const now = new Date().toISOString()
          const projectRef = adminDb.collection("projects").doc()

          const projectData = {
            storeNumber: sfProject.storeNumber,
            storeName: sfProject.storeName,
            storeAddress: "",
            storeCity: "",
            storeState: "",
            projectType: mapSfProjectType(sfProject.projectType),
            status: "planning",
            healthStatus: "green",
            grandOpeningDate: null,
            constructionStartDate: null,
            pmUserId: auth.uid,
            cmUserId: null,
            orgId: creatorOrgId,
            oracleParentProject: "",
            oracleProjectNumber: sfProject.projectNumber || null,
            sfProjectId: sfProject.sfProjectId,
            currentPhaseIndex: 0,
            totalBudget: 0,
            committedCost: 0,
            actualCost: 0,
            forecastCost: 0,
            notes: sfProject.description || "",
            tags: [],
            createdAt: now,
            updatedAt: now,
          }

          await projectRef.set(projectData)
          facilOneProjectId = projectRef.id
          result.created++
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to create project"
          result.errors.push({
            projectNumber:
              sfProject.projectNumber || String(sfProject.sfProjectId),
            error: `Create failed: ${message}`,
          })
          continue
        }
      }

      // Sync overview + schedule for the project
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
          projectNumber:
            sfProject.projectNumber || String(sfProject.sfProjectId),
          error: `Sync failed: ${message}`,
        })
      }
    }

    result.skipped = sfProjects.length - projectsToProcess.length

    return NextResponse.json(result)
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to import SiteFolio projects"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

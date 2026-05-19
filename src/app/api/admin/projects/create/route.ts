import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"
import { requireRoles } from "@/lib/firebase-admin/request-auth"
import { buildAdminProjectPayload } from "@/lib/admin/project-validation"

/**
 * POST /api/admin/projects/create
 * Quick-create a project with minimal fields.
 * Optionally seeds phases if grandOpeningDate and projectType are provided.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireRoles(req, ["admin"])
    if (!auth.ok) return auth.response

    const body = await req.json()
    const userSnap = await adminDb.collection("users").doc(auth.uid).get()
    const creatorOrgId = String(userSnap.data()?.orgId || "default").trim() || "default"

    let projectData
    try {
      projectData = buildAdminProjectPayload(body, {
        defaultPmUserId: auth.uid,
        defaultOrgId: creatorOrgId,
      })
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid project payload" },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()
    const projectRef = adminDb.collection("projects").doc()
    const projectRecord = {
      ...projectData,
      createdAt: now,
      updatedAt: now,
    }

    await projectRef.set(projectRecord)

    return NextResponse.json({
      success: true,
      id: projectRef.id,
      storeNumber: projectRecord.storeNumber,
      storeName: projectRecord.storeName,
      projectType: projectRecord.projectType,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create project"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

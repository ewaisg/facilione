import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase-admin"

/**
 * PATCH /api/admin/projects/[id]
 * Update project fields
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const body = await req.json()

    // Only allow specific fields to be updated
    const allowed = [
      "storeNumber", "storeName", "storeAddress", "storeCity", "storeState",
      "projectType", "status", "healthStatus", "grandOpeningDate",
      "oracleParentProject", "oracleProjectNumber", "totalBudget", "notes",
    ]
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    updates.updatedAt = new Date().toISOString()
    await adminDb.collection("projects").doc(id).update(updates)

    return NextResponse.json({ success: true, id, updates })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update project"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/projects/[id]
 * Delete project and all sub-collections
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    // Delete sub-collections first (phases)
    const phasesSnap = await adminDb.collection("projects").doc(id).collection("phases").get()
    const batch = adminDb.batch()
    phasesSnap.docs.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()

    // Delete project document
    await adminDb.collection("projects").doc(id).delete()

    return NextResponse.json({ success: true, id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete project"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
